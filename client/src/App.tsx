import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  MainTopic, 
  QuestionClient, 
  Difficulty, 
  DiagnosticReport as DiagnosticReportType 
} from './types';
import { 
  startQuizSession, 
  fetchNextQuestion, 
  submitQuestionAnswer, 
  finishQuizEarly,
  fetchActiveSession
} from './api';
import { Header } from './components/Header';
import { QuizSetup } from './components/QuizSetup';
import { QuizActive } from './components/QuizActive';
import { DiagnosticReport } from './components/DiagnosticReport';
import { SolutionReview } from './components/SolutionReview';
import { HistoryView } from './components/HistoryView';
import { PDFScorecard } from './components/PDFScorecard';
import { RemedialModal } from './components/RemedialModal';

export const App: React.FC = () => {
  type ViewMode = 'setup' | 'quiz' | 'report' | 'solutions' | 'history' | 'pdf';
  const [view, setView] = useState<ViewMode>('setup');

  // Quiz state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string>('Alex Morgan');
  const [currentQuestion, setCurrentQuestion] = useState<QuestionClient | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('Medium');
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(600);
  const [report, setReport] = useState<DiagnosticReportType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Remedial modal
  const [remedialWeakTopics, setRemedialWeakTopics] = useState<string[] | null>(null);

  // Synchronized countdown timer reference
  const timerRef = useRef<any>(null);

  // Session recovery from sessionStorage on page load
  useEffect(() => {
    const savedSessionId = sessionStorage.getItem('quizquake_session_id');
    if (savedSessionId) {
      recoverSession(savedSessionId);
    }
  }, []);

  const recoverSession = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await fetchActiveSession(id);
      if (data.success && data.session) {
        setSessionId(id);
        setStudentName(data.session.studentName);
        setCurrentDifficulty(data.session.currentDifficulty);
        setCurrentStreak(data.session.currentStreak);
        setTotalScore(data.session.totalScore);
        setTimeRemaining(data.session.timeRemainingSeconds);

        if (data.session.status === 'completed' && data.session.report) {
          setReport(data.session.report);
          setView('report');
        } else if (data.session.status === 'in_progress') {
          // Fetch next question
          const qData = await fetchNextQuestion(id);
          if (qData.success) {
            if (qData.isFinished && qData.report) {
              setReport(qData.report);
              setView('report');
            } else {
              setCurrentQuestion(qData.question);
              setView('quiz');
            }
          }
        }
      }
    } catch (err) {
      console.warn('Could not restore session, starting fresh:', err);
      sessionStorage.removeItem('quizquake_session_id');
    } finally {
      setIsLoading(false);
    }
  };

  // Synchronized Timer interval
  useEffect(() => {
    if (view === 'quiz' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimeExpiry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [view, timeRemaining]);

  const handleTimeExpiry = async () => {
    if (!sessionId) return;
    try {
      const data = await finishQuizEarly(sessionId);
      if (data.success && data.report) {
        setReport(data.report);
        setView('report');
        sessionStorage.removeItem('quizquake_session_id');
      }
    } catch (err) {
      console.error('Error handling time expiry:', err);
    }
  };

  // Start Quiz
  const handleStartQuiz = async (params: {
    studentName: string;
    selectedTopics: MainTopic[];
    totalQuestions: number;
    durationMinutes: number;
  }) => {
    try {
      setIsLoading(true);
      const startData = await startQuizSession(params);
      if (startData.success) {
        setSessionId(startData.sessionId);
        setStudentName(startData.studentName);
        setCurrentDifficulty(startData.initialDifficulty);
        setTimeRemaining(startData.durationSeconds);
        setCurrentStreak(0);
        setTotalScore(0);
        sessionStorage.setItem('quizquake_session_id', startData.sessionId);

        // Fetch first question
        const qData = await fetchNextQuestion(startData.sessionId);
        if (qData.success && qData.question) {
          setCurrentQuestion(qData.question);
          setView('quiz');
        }
      }
    } catch (err) {
      console.error('Failed to start quiz:', err);
      alert('Failed to connect to backend server. Make sure server is running on port 5000.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Answer
  const handleSubmitAnswer = async (selectedOptionIndex: number, timeSpentSeconds: number) => {
    if (!sessionId || !currentQuestion) {
      throw new Error('No active session');
    }

    const data = await submitQuestionAnswer({
      sessionId,
      questionId: currentQuestion.id,
      selectedOptionIndex,
      timeSpentSeconds
    });

    if (data.success) {
      setCurrentStreak(data.currentStreak);
      setTotalScore(data.totalScore);
      setCurrentDifficulty(data.nextDifficulty);

      if (data.isFinished && data.report) {
        setReport(data.report);
      }
    }

    return data;
  };

  // Advance to Next Question or Finalize
  const handleAdvanceNext = async () => {
    if (!sessionId) return;

    if (report) {
      // Quiz finished
      setView('report');
      sessionStorage.removeItem('quizquake_session_id');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      return;
    }

    try {
      setIsLoading(true);
      const qData = await fetchNextQuestion(sessionId);
      if (qData.success) {
        if (qData.isFinished && qData.report) {
          setReport(qData.report);
          setView('report');
          sessionStorage.removeItem('quizquake_session_id');
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } else if (qData.question) {
          setCurrentQuestion(qData.question);
        }
      }
    } catch (err) {
      console.error('Error fetching next question:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Early finish
  const handleEarlyFinish = async () => {
    if (!sessionId) return;
    if (window.confirm('Are you sure you want to conclude the quiz early and generate your diagnostic report?')) {
      try {
        setIsLoading(true);
        const data = await finishQuizEarly(sessionId);
        if (data.success && data.report) {
          setReport(data.report);
          setView('report');
          sessionStorage.removeItem('quizquake_session_id');
        }
      } catch (err) {
        console.error('Error concluding quiz:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRetake = () => {
    sessionStorage.removeItem('quizquake_session_id');
    setSessionId(null);
    setReport(null);
    setCurrentQuestion(null);
    setView('setup');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      
      {/* Universal Header */}
      <Header
        currentDifficulty={currentDifficulty}
        timeRemaining={timeRemaining}
        currentStreak={currentStreak}
        totalScore={totalScore}
        isTestActive={view === 'quiz'}
        onNavigateHistory={() => setView('history')}
        onNavigateHome={() => setView('setup')}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {view === 'setup' && (
          <QuizSetup onStartQuiz={handleStartQuiz} isLoading={isLoading} />
        )}

        {view === 'quiz' && currentQuestion && (
          <QuizActive
            question={currentQuestion}
            currentDifficulty={currentDifficulty}
            currentStreak={currentStreak}
            totalScore={totalScore}
            onSubmitAnswer={handleSubmitAnswer}
            onAdvanceNext={handleAdvanceNext}
            onEarlyFinish={handleEarlyFinish}
          />
        )}

        {view === 'report' && report && (
          <DiagnosticReport
            report={report}
            onRetake={handleRetake}
            onStartRemedial={(weakList) => setRemedialWeakTopics(weakList)}
            onViewSolutions={() => setView('solutions')}
            onPrintScorecard={() => setView('pdf')}
          />
        )}

        {view === 'solutions' && report && (
          <SolutionReview
            solutions={report.solutionBreakdown}
            weakTopics={report.weakTopics}
            onBackToReport={() => setView('report')}
          />
        )}

        {view === 'history' && (
          <HistoryView
            onBack={() => setView('setup')}
            onSelectReport={(selectedReport) => {
              setReport(selectedReport);
              setView('report');
            }}
          />
        )}

        {view === 'pdf' && report && (
          <PDFScorecard
            report={report}
            onClose={() => setView('report')}
          />
        )}
      </main>

      {/* Targeted Remedial Drill Modal (Stretch Feature) */}
      {remedialWeakTopics && (
        <RemedialModal
          weakTopics={remedialWeakTopics}
          onClose={() => setRemedialWeakTopics(null)}
        />
      )}

      {/* Global Footer */}
      <footer className="print:hidden border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        QuizQuake: BrainStorm Arena • Computerized Adaptive Testing & Weak-Topic Diagnostic Report Platform
      </footer>

    </div>
  );
};
