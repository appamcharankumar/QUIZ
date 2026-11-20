import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { MainTopic, QuizSession, Difficulty, QuestionResult, Question } from '../types';
import { loadQuestions, saveSession, getSession, deleteSession, saveAttempt } from '../database/db';
import {
  calculateNextDifficulty,
  selectAdaptiveQuestion,
  computeScore,
  generateDiagnosticReport,
  generateRemedialDrill
} from '../engine/adaptiveEngine';

export const quizRouter = Router();

// Available core engineering topics
const AVAILABLE_TOPICS: { name: MainTopic; description: string; count: number }[] = [
  { name: 'Data Structures', description: 'Arrays, Linked Lists, BSTs, Heaps, Hash Tables & Graphs', count: 16 },
  { name: 'Algorithms', description: 'Sorting, Searching, Dynamic Programming, Greedy & Graph Traversal', count: 16 },
  { name: 'Operating Systems', description: 'Concurrency, Memory Paging, Deadlocks, Scheduling & File Systems', count: 16 },
  { name: 'Computer Networks', description: 'OSI/TCP Stack, Routing, Congestion Control, DNS & Protocols', count: 16 }
];

// 1. Get available topics
quizRouter.get('/topics', (req: Request, res: Response) => {
  res.json({ success: true, topics: AVAILABLE_TOPICS });
});

// 2. Start a new adaptive quiz session
quizRouter.post('/start', (req: Request, res: Response) => {
  try {
    const { studentName, selectedTopics, totalQuestions = 10, durationMinutes = 10 } = req.body;

    const topics: MainTopic[] = Array.isArray(selectedTopics) && selectedTopics.length > 0
      ? selectedTopics
      : ['Data Structures', 'Algorithms', 'Operating Systems', 'Computer Networks'];

    const sessionId = uuidv4();
    const durationSeconds = (durationMinutes || 10) * 60;

    const initialDistribution: Record<MainTopic, number> = {
      'Data Structures': 0,
      'Algorithms': 0,
      'Operating Systems': 0,
      'Computer Networks': 0
    };

    const session: QuizSession = {
      sessionId,
      studentName: (studentName || 'Student').trim(),
      selectedTopics: topics,
      totalQuestionsTarget: Math.min(25, Math.max(3, Number(totalQuestions) || 10)),
      currentQuestionIndex: 0,
      currentDifficulty: 'Medium', // Standard baseline start
      consecutiveCorrect: 0,
      consecutiveIncorrect: 0,
      currentStreak: 0,
      highestStreak: 0,
      totalScore: 0,
      timeRemainingSeconds: durationSeconds,
      totalDurationSeconds: durationSeconds,
      startTime: Date.now(),
      lastUpdated: Date.now(),
      status: 'in_progress',
      askedQuestionIds: [],
      topicDistributionCount: initialDistribution,
      submissions: []
    };

    saveSession(session);

    res.json({
      success: true,
      sessionId,
      studentName: session.studentName,
      totalQuestions: session.totalQuestionsTarget,
      durationSeconds: session.totalDurationSeconds,
      initialDifficulty: session.currentDifficulty
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Fetch active session state (for page refresh recovery)
quizRouter.get('/active/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const session = getSession(sessionId);

  if (!session) {
    return res.status(404).json({ success: false, error: 'Session not found or expired' });
  }

  // Calculate elapsed time
  const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
  const remaining = Math.max(0, session.totalDurationSeconds - elapsed);
  session.timeRemainingSeconds = remaining;

  if (remaining === 0 && session.status === 'in_progress') {
    session.status = 'expired';
    const report = generateDiagnosticReport(session);
    session.report = report;
    saveAttempt(report);
  }

  saveSession(session);

  res.json({
    success: true,
    session: {
      sessionId: session.sessionId,
      studentName: session.studentName,
      currentQuestionIndex: session.currentQuestionIndex,
      totalQuestionsTarget: session.totalQuestionsTarget,
      currentDifficulty: session.currentDifficulty,
      currentStreak: session.currentStreak,
      totalScore: session.totalScore,
      timeRemainingSeconds: session.timeRemainingSeconds,
      status: session.status,
      submissionsCount: session.submissions.length,
      report: session.report || null
    }
  });
});

// 4. Get next adaptive question
quizRouter.get('/next-question/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const session = getSession(sessionId);

  if (!session) {
    return res.status(404).json({ success: false, error: 'Session not found' });
  }

  if (session.status !== 'in_progress') {
    return res.json({
      success: true,
      isFinished: true,
      status: session.status,
      report: session.report || null
    });
  }

  // Check if reached target questions
  if (session.submissions.length >= session.totalQuestionsTarget) {
    session.status = 'completed';
    const report = generateDiagnosticReport(session);
    session.report = report;
    saveAttempt(report);
    saveSession(session);
    return res.json({
      success: true,
      isFinished: true,
      status: 'completed',
      report
    });
  }

  const allQuestions = loadQuestions();
  const nextQ = selectAdaptiveQuestion(session, allQuestions);

  if (!nextQ) {
    // If questions run out, finalize
    session.status = 'completed';
    const report = generateDiagnosticReport(session);
    session.report = report;
    saveAttempt(report);
    saveSession(session);
    return res.json({
      success: true,
      isFinished: true,
      status: 'completed',
      report
    });
  }

  // Censor answers and rationales for client integrity
  const clientQuestion = {
    id: nextQ.id,
    topic: nextQ.topic,
    subtopic: nextQ.subtopic,
    difficulty: nextQ.difficulty,
    stem: nextQ.stem,
    codeSnippet: nextQ.codeSnippet,
    options: nextQ.options,
    estimatedTimeSeconds: nextQ.estimatedTimeSeconds,
    questionNumber: session.submissions.length + 1,
    totalQuestions: session.totalQuestionsTarget
  };

  res.json({
    success: true,
    isFinished: false,
    question: clientQuestion,
    currentDifficulty: session.currentDifficulty,
    currentStreak: session.currentStreak,
    totalScore: session.totalScore
  });
});

// 5. Submit answer for current question
quizRouter.post('/submit-answer', (req: Request, res: Response) => {
  try {
    const { sessionId, questionId, selectedOptionIndex, timeSpentSeconds = 30 } = req.body;
    const session = getSession(sessionId);

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    if (session.status !== 'in_progress') {
      return res.status(400).json({ success: false, error: 'Quiz session is no longer active' });
    }

    const allQuestions = loadQuestions();
    const question = allQuestions.find((q) => q.id === questionId);

    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    const isCorrect = question.correctOptionIndex === Number(selectedOptionIndex);

    // Compute points and streak
    const scoreResult = computeScore(
      question.difficulty,
      isCorrect,
      session.currentStreak,
      timeSpentSeconds,
      question.estimatedTimeSeconds
    );

    session.totalScore += scoreResult.points;
    session.currentStreak = scoreResult.newStreak;
    if (session.currentStreak > session.highestStreak) {
      session.highestStreak = session.currentStreak;
    }

    // Adaptive difficulty calculation (Hackathon logic: 2 consecutive correct to scale up, 1 wrong drops)
    const diffUpdate = calculateNextDifficulty(
      session.currentDifficulty,
      isCorrect,
      session.consecutiveCorrect,
      session.consecutiveIncorrect
    );

    const previousDifficulty = session.currentDifficulty;
    session.currentDifficulty = diffUpdate.nextDifficulty;
    session.consecutiveCorrect = diffUpdate.newConsecutiveCorrect;
    session.consecutiveIncorrect = diffUpdate.newConsecutiveIncorrect;

    // Record submission
    const resultRecord: QuestionResult = {
      questionId: question.id,
      topic: question.topic,
      subtopic: question.subtopic,
      difficulty: question.difficulty,
      stem: question.stem,
      codeSnippet: question.codeSnippet,
      options: question.options,
      selectedOptionIndex: Number(selectedOptionIndex),
      correctOptionIndex: question.correctOptionIndex,
      isCorrect,
      timeSpentSeconds: Number(timeSpentSeconds),
      explanation: question.explanation,
      pointsAwarded: scoreResult.points
    };

    session.submissions.push(resultRecord);
    session.askedQuestionIds.push(question.id);
    session.topicDistributionCount[question.topic] = (session.topicDistributionCount[question.topic] || 0) + 1;
    session.currentQuestionIndex = session.submissions.length;

    // Check if finished
    const isFinished = session.submissions.length >= session.totalQuestionsTarget;
    let report: any = null;

    if (isFinished) {
      session.status = 'completed';
      report = generateDiagnosticReport(session);
      session.report = report;
      saveAttempt(report);
    }

    saveSession(session);

    res.json({
      success: true,
      isCorrect,
      correctOptionIndex: question.correctOptionIndex,
      explanation: question.explanation,
      pointsAwarded: scoreResult.points,
      currentStreak: session.currentStreak,
      totalScore: session.totalScore,
      previousDifficulty,
      nextDifficulty: session.currentDifficulty,
      isFinished,
      report
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Finalize quiz manually or on timer expiration
quizRouter.post('/finish', (req: Request, res: Response) => {
  const { sessionId } = req.body;
  const session = getSession(sessionId);

  if (!session) {
    return res.status(404).json({ success: false, error: 'Session not found' });
  }

  session.status = 'completed';
  const report = generateDiagnosticReport(session);
  session.report = report;
  saveAttempt(report);
  saveSession(session);

  res.json({
    success: true,
    report
  });
});

// 7. Targeted Remedial Drill Generator (Stretch feature)
quizRouter.post('/remedial', (req: Request, res: Response) => {
  try {
    const { weakTopics } = req.body;
    const weakList = Array.isArray(weakTopics) ? weakTopics : [];

    const remedialQuestions = generateRemedialDrill(weakList);

    res.json({
      success: true,
      totalQuestions: remedialQuestions.length,
      questions: remedialQuestions.map((q) => ({
        id: q.id,
        topic: q.topic,
        subtopic: q.subtopic,
        difficulty: q.difficulty,
        stem: q.stem,
        codeSnippet: q.codeSnippet,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        explanation: q.explanation,
        estimatedTimeSeconds: q.estimatedTimeSeconds
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
