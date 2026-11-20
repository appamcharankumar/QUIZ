export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type MainTopic = 
  | 'Data Structures'
  | 'Algorithms'
  | 'Operating Systems'
  | 'Computer Networks';

export interface QuestionClient {
  id: string;
  topic: MainTopic;
  subtopic: string;
  difficulty: Difficulty;
  stem: string;
  codeSnippet?: string;
  options: string[];
  estimatedTimeSeconds: number;
  questionNumber: number;
  totalQuestions: number;
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
  accuracy: number;
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
  estimatedAbilityTheta: number;
  cohortPercentile: number;
  difficultyDistribution: {
    Easy: { attempted: number; correct: number };
    Medium: { attempted: number; correct: number };
    Hard: { attempted: number; correct: number };
  };
  topicMasteries: TopicMastery[];
  weakTopics: string[];
  strongTopics: string[];
  badges: BadgeEarned[];
  highestStreak: number;
  solutionBreakdown: QuestionResult[];
  recommendations: string[];
}

export interface CohortBenchmark {
  topic: MainTopic;
  cohortAverageAccuracy: number;
  top10PercentAccuracy: number;
  sampleSize: number;
}
