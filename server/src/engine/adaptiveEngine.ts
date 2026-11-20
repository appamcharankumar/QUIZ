import { Question, Difficulty, MainTopic, QuizSession, QuestionResult, DiagnosticReport, TopicMastery, BadgeEarned } from '../types';
import { loadQuestions, COHORT_BENCHMARKS } from '../database/db';

/**
 * Calculates next difficulty tier based on consecutive performance.
 * Rule from Hackathon Problem Brief:
 * - Oscillations prevented: Require 2 consecutive correct answers to ascend to Hard.
 * - Single incorrect answer drops tier down.
 */
export function calculateNextDifficulty(
  currentDifficulty: Difficulty,
  isCorrect: boolean,
  consecutiveCorrect: number,
  consecutiveIncorrect: number
): { nextDifficulty: Difficulty; newConsecutiveCorrect: number; newConsecutiveIncorrect: number } {
  let nextDifficulty = currentDifficulty;
  let newConsecutiveCorrect = isCorrect ? consecutiveCorrect + 1 : 0;
  let newConsecutiveIncorrect = isCorrect ? 0 : consecutiveIncorrect + 1;

  if (currentDifficulty === 'Medium') {
    if (isCorrect) {
      if (newConsecutiveCorrect >= 2) {
        nextDifficulty = 'Hard';
        newConsecutiveCorrect = 0; // reset counter after tier transition
      }
    } else {
      nextDifficulty = 'Easy';
      newConsecutiveIncorrect = 0;
    }
  } else if (currentDifficulty === 'Easy') {
    if (isCorrect) {
      if (newConsecutiveCorrect >= 2) {
        nextDifficulty = 'Medium';
        newConsecutiveCorrect = 0;
      }
    } else {
      nextDifficulty = 'Easy';
    }
  } else if (currentDifficulty === 'Hard') {
    if (!isCorrect) {
      nextDifficulty = 'Medium';
      newConsecutiveIncorrect = 0;
    } else {
      nextDifficulty = 'Hard';
    }
  }

  return { nextDifficulty, newConsecutiveCorrect, newConsecutiveIncorrect };
}

/**
 * Selects the next topic in a balanced round-robin manner,
 * prioritizing active topics that have been asked least frequently.
 */
export function selectNextTopic(
  selectedTopics: MainTopic[],
  topicDistributionCount: Record<MainTopic, number>
): MainTopic {
  if (selectedTopics.length === 0) {
    return 'Data Structures';
  }

  // Find minimum count among selected topics
  let minCount = Infinity;
  let candidates: MainTopic[] = [];

  for (const topic of selectedTopics) {
    const count = topicDistributionCount[topic] || 0;
    if (count < minCount) {
      minCount = count;
      candidates = [topic];
    } else if (count === minCount) {
      candidates.push(topic);
    }
  }

  // Randomly pick among tied candidates to avoid deterministic repetition
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}

/**
 * Retrieves the optimal question matching the desired topic and difficulty,
 * avoiding any previously asked questions in the session.
 */
export function selectAdaptiveQuestion(
  session: QuizSession,
  allQuestions: Question[]
): Question | null {
  const targetTopic = selectNextTopic(session.selectedTopics, session.topicDistributionCount);
  const targetDifficulty = session.currentDifficulty;

  const askedSet = new Set(session.askedQuestionIds);

  // 1. Ideal candidate: Target topic + target difficulty
  let candidates = allQuestions.filter(
    (q) => !askedSet.has(q.id) && q.topic === targetTopic && q.difficulty === targetDifficulty
  );

  // 2. Fallback 1: Target topic + any difficulty (closest to target)
  if (candidates.length === 0) {
    const fallbackTiers: Difficulty[] = targetDifficulty === 'Hard' ? ['Medium', 'Easy'] :
      targetDifficulty === 'Easy' ? ['Medium', 'Hard'] : ['Hard', 'Easy'];
    
    for (const altTier of fallbackTiers) {
      candidates = allQuestions.filter(
        (q) => !askedSet.has(q.id) && q.topic === targetTopic && q.difficulty === altTier
      );
      if (candidates.length > 0) break;
    }
  }

  // 3. Fallback 2: Any selected topic with target difficulty
  if (candidates.length === 0) {
    candidates = allQuestions.filter(
      (q) => !askedSet.has(q.id) && session.selectedTopics.includes(q.topic) && q.difficulty === targetDifficulty
    );
  }

  // 4. Fallback 3: Any unasked question from selected topics
  if (candidates.length === 0) {
    candidates = allQuestions.filter(
      (q) => !askedSet.has(q.id) && session.selectedTopics.includes(q.topic)
    );
  }

  // 5. Ultimate fallback: Any unasked question in repository
  if (candidates.length === 0) {
    candidates = allQuestions.filter((q) => !askedSet.has(q.id));
  }

  if (candidates.length === 0) {
    return null; // All questions exhausted
  }

  // Pick random candidate among suitable ones
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  return chosen;
}

/**
 * Calculates score for a submitted answer based on tier, streak multiplier, and time spent.
 */
export function computeScore(
  difficulty: Difficulty,
  isCorrect: boolean,
  currentStreak: number,
  timeSpentSeconds: number,
  estimatedTimeSeconds: number
): { points: number; newStreak: number; multiplier: number } {
  if (!isCorrect) {
    return { points: 0, newStreak: 0, multiplier: 1.0 };
  }

  const newStreak = currentStreak + 1;

  // Streak Multiplier: 1 = 1x, 2 = 1.2x, 3 = 1.5x, 4+ = 2.0x
  let multiplier = 1.0;
  if (newStreak === 2) multiplier = 1.2;
  else if (newStreak === 3) multiplier = 1.5;
  else if (newStreak >= 4) multiplier = 2.0;

  // Base tier points
  let basePoints = 100;
  if (difficulty === 'Medium') basePoints = 200;
  else if (difficulty === 'Hard') basePoints = 350;

  // Speed bonus if answered in less than 50% of estimated time
  let speedMultiplier = 1.0;
  if (timeSpentSeconds <= estimatedTimeSeconds * 0.5) {
    speedMultiplier = 1.2;
  }

  // Hard difficulty achievement bonus
  const hardBonus = difficulty === 'Hard' ? 50 : 0;

  const points = Math.round((basePoints * multiplier * speedMultiplier) + hardBonus);

  return { points, newStreak, multiplier };
}

/**
 * Computes heuristic Item Response Theory (IRT) Theta parameter (-3.0 to +3.0)
 */
export function estimateAbilityTheta(submissions: QuestionResult[]): number {
  if (submissions.length === 0) return 0.0;

  let weightedScore = 0;
  let totalWeight = 0;

  submissions.forEach((sub) => {
    const tierMultiplier = sub.difficulty === 'Hard' ? 1.5 : sub.difficulty === 'Medium' ? 1.0 : 0.6;
    totalWeight += tierMultiplier;
    if (sub.isCorrect) {
      weightedScore += tierMultiplier;
    }
  });

  const accuracy = totalWeight > 0 ? weightedScore / totalWeight : 0.5;
  // Convert accuracy to logit approximation
  const clampedP = Math.max(0.05, Math.min(0.95, accuracy));
  const logit = Math.log(clampedP / (1 - clampedP));

  // Scale logit to roughly [-3.0, +3.0]
  const theta = Math.max(-3.0, Math.min(3.0, Number((logit * 1.35).toFixed(2))));
  return theta;
}

/**
 * Calculates cohort percentile rank using standard normal CDF approximation
 */
export function calculateCohortPercentile(accuracy: number): number {
  // Cohort baseline: Mean = 62%, StdDev = 14%
  const mean = 62;
  const stdDev = 14;
  const z = (accuracy - mean) / stdDev;

  // Error function approximation for standard normal CDF
  const t = 1.0 / (1.0 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (z > 0) p = 1.0 - p;

  const percentile = Math.min(99, Math.max(1, Math.round(p * 100)));
  return percentile;
}

/**
 * Generates the complete Diagnostic Report upon quiz completion
 */
export function generateDiagnosticReport(session: QuizSession): DiagnosticReport {
  const submissions = session.submissions;
  const totalQuestions = submissions.length;
  const correctQuestions = submissions.filter((s) => s.isCorrect).length;
  const overallAccuracy = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0;

  const totalTimeSpentSeconds = submissions.reduce((sum, s) => sum + s.timeSpentSeconds, 0);
  const averageTimePerQuestion = totalQuestions > 0 ? Math.round(totalTimeSpentSeconds / totalQuestions) : 0;

  // Difficulty tier distribution
  const difficultyDistribution = {
    Easy: { attempted: 0, correct: 0 },
    Medium: { attempted: 0, correct: 0 },
    Hard: { attempted: 0, correct: 0 }
  };

  submissions.forEach((s) => {
    difficultyDistribution[s.difficulty].attempted++;
    if (s.isCorrect) difficultyDistribution[s.difficulty].correct++;
  });

  // Topic & Subtopic masteries
  const topicMap = new Map<MainTopic, { total: number; correct: number; subtopics: Record<string, { total: number; correct: number }> }>();

  session.selectedTopics.forEach((t) => {
    topicMap.set(t, { total: 0, correct: 0, subtopics: {} });
  });

  submissions.forEach((s) => {
    if (!topicMap.has(s.topic)) {
      topicMap.set(s.topic, { total: 0, correct: 0, subtopics: {} });
    }
    const topicData = topicMap.get(s.topic)!;
    topicData.total++;
    if (s.isCorrect) topicData.correct++;

    if (!topicData.subtopics[s.subtopic]) {
      topicData.subtopics[s.subtopic] = { total: 0, correct: 0 };
    }
    topicData.subtopics[s.subtopic].total++;
    if (s.isCorrect) topicData.subtopics[s.subtopic].correct++;
  });

  const topicMasteries: TopicMastery[] = [];
  const weakTopics: string[] = [];
  const strongTopics: string[] = [];
  const recommendations: string[] = [];

  topicMap.forEach((data, topic) => {
    const accuracy = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
    let masteryLevel: 'Mastered' | 'Developing' | 'Weak' = 'Developing';

    if (accuracy >= 80) {
      masteryLevel = 'Mastered';
      strongTopics.push(topic);
    } else if (accuracy < 60) {
      masteryLevel = 'Weak';
      weakTopics.push(topic);
    }

    const subtopicResults: TopicMastery['subtopics'] = {};
    for (const [stName, stData] of Object.entries(data.subtopics)) {
      const stAcc = stData.total > 0 ? Math.round((stData.correct / stData.total) * 100) : 0;
      subtopicResults[stName] = {
        total: stData.total,
        correct: stData.correct,
        accuracy: stAcc
      };
      if (stAcc < 60 && !weakTopics.includes(`${topic}: ${stName}`)) {
        weakTopics.push(`${topic}: ${stName}`);
      }
    }

    topicMasteries.push({
      topic,
      totalQuestions: data.total,
      correctQuestions: data.correct,
      accuracy,
      masteryLevel,
      subtopics: subtopicResults
    });
  });

  // Recommendations formulation
  if (weakTopics.length === 0) {
    recommendations.push('Exceptional mastery demonstrated across all evaluated topics! Proceed to advanced competitive problem sets.');
  } else {
    recommendations.push(`Priority focus required in detected weak conceptual areas: ${weakTopics.slice(0, 3).join(', ')}.`);
    recommendations.push('Launch the 1-Click Targeted Remedial Drill to practice 5 curated questions covering your weak topics.');
  }

  if (averageTimePerQuestion > 50) {
    recommendations.push('Work on time management techniques: your average time per question is higher than the recommended 45s threshold.');
  }

  // Badges Earned
  const badges: BadgeEarned[] = [];

  // Streak badge
  if (session.highestStreak >= 4) {
    badges.push({
      id: 'badge-streak-4',
      title: 'Unstoppable Flow',
      description: `Maintained a consecutive answer streak of ${session.highestStreak}!`,
      icon: 'Flame',
      tier: 'gold'
    });
  } else if (session.highestStreak >= 2) {
    badges.push({
      id: 'badge-streak-2',
      title: 'Double Spark',
      description: 'Scored 2+ consecutive correct answers to scale difficulty.',
      icon: 'Zap',
      tier: 'bronze'
    });
  }

  // Hard Hitter badge
  if (difficultyDistribution.Hard.correct >= 2) {
    badges.push({
      id: 'badge-hard-hitter',
      title: 'Hard Tier Titan',
      description: `Conquered ${difficultyDistribution.Hard.correct} Hard difficulty challenges!`,
      icon: 'ShieldAlert',
      tier: 'platinum'
    });
  }

  // Speed Demon badge
  const fastCorrect = submissions.some((s) => s.isCorrect && s.timeSpentSeconds <= 20);
  if (fastCorrect) {
    badges.push({
      id: 'badge-speed-demon',
      title: 'Lightning Reflex',
      description: 'Answered a question accurately in under 20 seconds.',
      icon: 'Clock',
      tier: 'silver'
    });
  }

  // Master Mind badge
  if (overallAccuracy >= 80) {
    badges.push({
      id: 'badge-master-mind',
      title: 'BrainStorm Master Mind',
      description: `Achieved ${overallAccuracy}% overall conceptual accuracy!`,
      icon: 'Award',
      tier: 'gold'
    });
  }

  const estimatedAbilityTheta = estimateAbilityTheta(submissions);
  const cohortPercentile = calculateCohortPercentile(overallAccuracy);

  // Maximum possible score estimation (assuming all hard questions + multipliers)
  const maxPossibleScore = totalQuestions * 450;

  return {
    sessionId: session.sessionId,
    studentName: session.studentName || 'Student Learner',
    completedAt: new Date().toISOString(),
    totalQuestions,
    correctQuestions,
    overallAccuracy,
    totalScore: session.totalScore,
    maxPossibleScore,
    totalTimeSpentSeconds,
    averageTimePerQuestion,
    estimatedAbilityTheta,
    cohortPercentile,
    difficultyDistribution,
    topicMasteries,
    weakTopics,
    strongTopics,
    badges,
    highestStreak: session.highestStreak,
    solutionBreakdown: submissions,
    recommendations
  };
}

/**
 * Creates a targeted 5-question remedial drill exclusively focused on weak topics
 */
export function generateRemedialDrill(weakTopicsList: string[]): Question[] {
  const allQuestions = loadQuestions();
  const selected: Question[] = [];
  const selectedIds = new Set<string>();

  // Extract pure topic/subtopic keywords from weak list
  const cleanKeywords = weakTopicsList.map((w) => {
    if (w.includes(':')) {
      return w.split(':')[1].trim().toLowerCase();
    }
    return w.trim().toLowerCase();
  });

  // Filter questions matching weak keywords
  const matchedQuestions = allQuestions.filter((q) => {
    const topicMatch = cleanKeywords.some((kw) => q.topic.toLowerCase().includes(kw));
    const subtopicMatch = cleanKeywords.some((kw) => q.subtopic.toLowerCase().includes(kw));
    return topicMatch || subtopicMatch;
  });

  // Sort candidates by difficulty: Easy and Medium first for remedial learning
  matchedQuestions.sort((a, b) => {
    const order: Record<Difficulty, number> = { Easy: 1, Medium: 2, Hard: 3 };
    return order[a.difficulty] - order[b.difficulty];
  });

  for (const q of matchedQuestions) {
    if (selected.length >= 5) break;
    if (!selectedIds.has(q.id)) {
      selected.push(q);
      selectedIds.add(q.id);
    }
  }

  // If fewer than 5 matched, fill with other foundational Easy/Medium questions
  if (selected.length < 5) {
    const filler = allQuestions.filter((q) => !selectedIds.has(q.id) && q.difficulty !== 'Hard');
    for (const q of filler) {
      if (selected.length >= 5) break;
      selected.push(q);
      selectedIds.add(q.id);
    }
  }

  return selected.slice(0, 5);
}
