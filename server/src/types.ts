export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type MainTopic = 
  | 'Data Structures'
  | 'Algorithms'
  | 'Operating Systems'
  | 'Computer Networks';

export interface Question {
  id: string;
  topic: MainTopic;
  subtopic: string;
  difficulty: Difficulty;
  stem: string;
  codeSnippet?: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  discrimination: number; // IRT discrimination parameter (a)
  difficultyValue: number; // IRT difficulty parameter (b, -2 to +2)
  estimatedTimeSeconds: number;
}

export interface AnswerSubmission {
  questionId: string;
  selectedOptionIndex: number;
  timeSpentSeconds: number;
}

export interface QuestionResult {
  questionId: string;
  topic: MainTopic;
  subtopic: string;
  difficulty: Difficulty;
  stem: string;
  codeSnippet?: string;
  options: string[];
  selectedOptionIndex: number;
  correctOptionIndex: number;
  isCorrect: boolean;
  timeSpentSeconds: number;
  explanation: string;
  pointsAwarded: number;
}

export interface TopicMastery {
  topic: MainTopic;
  totalQuestions: number;
  correctQuestions: number;
  accuracy: number; // 0 to 100 percentage
  masteryLevel: 'Mastered' | 'Developing' | 'Weak';
  subtopics: {
    [subtopicName: string]: {
      total: number;
      correct: number;
      accuracy: number;
    };
  };
}

export interface BadgeEarned {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface DiagnosticReport {
  sessionId: string;
  studentName: string;
  completedAt: string;
  totalQuestions: number;
  correctQuestions: number;
  overallAccuracy: number;
  totalScore: number;
  maxPossibleScore: number;
  totalTimeSpentSeconds: number;
  averageTimePerQuestion: number;
  estimatedAbilityTheta: number; // IRT score typically -3.0 to +3.0
  cohortPercentile: number; // 0 to 100 percentile rank
  difficultyDistribution: {
    Easy: { attempted: number; correct: number };
    Medium: { attempted: number; correct: number };
    Hard: { attempted: number; correct: number };
  };
  topicMasteries: TopicMastery[];
  weakTopics: string[]; // Topics or subtopics below threshold (e.g. < 60%)
  strongTopics: string[];
  badges: BadgeEarned[];
  highestStreak: number;
  solutionBreakdown: QuestionResult[];
  recommendations: string[];
}

export interface QuizSession {
  sessionId: string;
  studentName: string;
  selectedTopics: MainTopic[];
  totalQuestionsTarget: number;
  currentQuestionIndex: number;
  currentDifficulty: Difficulty;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  currentStreak: number;
  highestStreak: number;
  totalScore: number;
  timeRemainingSeconds: number;
  totalDurationSeconds: number;
  startTime: number;
  lastUpdated: number;
  status: 'in_progress' | 'completed' | 'expired';
  askedQuestionIds: string[];
  topicDistributionCount: Record<MainTopic, number>;
  submissions: QuestionResult[];
  report?: DiagnosticReport;
}

export interface CohortBenchmark {
  topic: MainTopic;
  cohortAverageAccuracy: number;
  top10PercentAccuracy: number;
  sampleSize: number;
}
