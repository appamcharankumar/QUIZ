import { QuestionClient, QuestionResult, DiagnosticReport, MainTopic, CohortBenchmark } from './types';

// Cloud-ready API endpoint: uses VITE_API_URL if provided, otherwise defaults to relative /api
const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

export async function fetchTopics() {
  const res = await fetch(`${API_BASE}/quiz/topics`);
  if (!res.ok) throw new Error('Failed to load topics');
  return res.json();
}

export async function startQuizSession(params: {
  studentName: string;
  selectedTopics: MainTopic[];
  totalQuestions: number;
  durationMinutes: number;
}) {
  const res = await fetch(`${API_BASE}/quiz/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Failed to start quiz');
  return res.json();
}

export async function fetchActiveSession(sessionId: string) {
  const res = await fetch(`${API_BASE}/quiz/active/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch active session');
  return res.json();
}

export async function fetchNextQuestion(sessionId: string) {
  const res = await fetch(`${API_BASE}/quiz/next-question/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch next question');
  return res.json();
}

export async function submitQuestionAnswer(params: {
  sessionId: string;
  questionId: string;
  selectedOptionIndex: number;
  timeSpentSeconds: number;
}) {
  const res = await fetch(`${API_BASE}/quiz/submit-answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Failed to submit answer');
  return res.json();
}

export async function finishQuizEarly(sessionId: string) {
  const res = await fetch(`${API_BASE}/quiz/finish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId })
  });
  if (!res.ok) throw new Error('Failed to finish quiz');
  return res.json();
}

export async function generateRemedialDrillApi(weakTopics: string[]) {
  const res = await fetch(`${API_BASE}/quiz/remedial`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weakTopics })
  });
  if (!res.ok) throw new Error('Failed to generate remedial drill');
  return res.json();
}

export async function fetchAttemptHistory() {
  const res = await fetch(`${API_BASE}/reports/attempts`);
  if (!res.ok) throw new Error('Failed to load attempt history');
  return res.json();
}

export async function fetchAttemptReport(sessionId: string) {
  const res = await fetch(`${API_BASE}/reports/attempts/${sessionId}`);
  if (!res.ok) throw new Error('Failed to load report');
  return res.json();
}

export async function fetchBenchmarks() {
  const res = await fetch(`${API_BASE}/reports/benchmarks`);
  if (!res.ok) throw new Error('Failed to load benchmarks');
  return res.json();
}
