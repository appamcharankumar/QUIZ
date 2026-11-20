import fs from 'fs';
import path from 'path';
import { Question, QuizSession, DiagnosticReport, MainTopic, CohortBenchmark } from '../types';

// Locate questions.json across dev (src) and prod (dist) environments
function resolveDataFilePath(filename: string): string {
  const candidates = [
    path.resolve(__dirname, '../data', filename),
    path.resolve(__dirname, '../../src/data', filename),
    path.resolve(process.cwd(), 'src/data', filename),
    path.resolve(process.cwd(), 'dist/data', filename),
    path.resolve(process.cwd(), 'data', filename)
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return c;
    }
  }

  // Fallback to primary candidate and create dir if needed
  const fallback = candidates[0];
  const dir = path.dirname(fallback);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return fallback;
}

// In-memory sessions store (can be restored from/to JSON)
const activeSessions = new Map<string, QuizSession>();
let cachedQuestions: Question[] | null = null;

// Read questions from JSON repository
export function loadQuestions(): Question[] {
  if (cachedQuestions && cachedQuestions.length > 0) {
    return cachedQuestions;
  }

  try {
    const questionsFile = resolveDataFilePath('questions.json');
    if (fs.existsSync(questionsFile)) {
      const data = fs.readFileSync(questionsFile, 'utf-8');
      cachedQuestions = JSON.parse(data) as Question[];
      return cachedQuestions;
    }
  } catch (err) {
    console.error('Error loading questions.json:', err);
  }
  return [];
}

// Load attempts history
export function loadAttempts(): DiagnosticReport[] {
  try {
    const attemptsFile = resolveDataFilePath('attempts.json');
    if (fs.existsSync(attemptsFile)) {
      const raw = fs.readFileSync(attemptsFile, 'utf-8');
      return JSON.parse(raw) as DiagnosticReport[];
    }
  } catch (err) {
    console.error('Error reading attempts.json:', err);
  }
  return [];
}

// Save an attempt report
export function saveAttempt(report: DiagnosticReport): void {
  try {
    const attempts = loadAttempts();
    attempts.unshift(report);
    const trimmed = attempts.slice(0, 100);
    const attemptsFile = resolveDataFilePath('attempts.json');
    fs.writeFileSync(attemptsFile, JSON.stringify(trimmed, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving attempt:', err);
  }
}

// Active session management
export function saveSession(session: QuizSession): void {
  session.lastUpdated = Date.now();
  activeSessions.set(session.sessionId, session);
}

export function getSession(sessionId: string): QuizSession | undefined {
  return activeSessions.get(sessionId);
}

export function deleteSession(sessionId: string): void {
  activeSessions.delete(sessionId);
}

// Simulated cohort benchmark data for all 4 engineering topics
export const COHORT_BENCHMARKS: CohortBenchmark[] = [
  {
    topic: 'Data Structures',
    cohortAverageAccuracy: 64.5,
    top10PercentAccuracy: 91.2,
    sampleSize: 1240
  },
  {
    topic: 'Algorithms',
    cohortAverageAccuracy: 58.2,
    top10PercentAccuracy: 88.5,
    sampleSize: 1240
  },
  {
    topic: 'Operating Systems',
    cohortAverageAccuracy: 61.8,
    top10PercentAccuracy: 89.0,
    sampleSize: 1240
  },
  {
    topic: 'Computer Networks',
    cohortAverageAccuracy: 66.0,
    top10PercentAccuracy: 93.4,
    sampleSize: 1240
  }
];
