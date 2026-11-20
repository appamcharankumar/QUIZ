import { Router, Request, Response } from 'express';
import { loadAttempts, COHORT_BENCHMARKS } from '../database/db';
import fs from 'fs';
import path from 'path';

export const reportRouter = Router();

// 1. Get all past attempts history
reportRouter.get('/attempts', (req: Request, res: Response) => {
  try {
    const attempts = loadAttempts();
    const summary = attempts.map((a) => ({
      sessionId: a.sessionId,
      studentName: a.studentName,
      completedAt: a.completedAt,
      totalQuestions: a.totalQuestions,
      correctQuestions: a.correctQuestions,
      overallAccuracy: a.overallAccuracy,
      totalScore: a.totalScore,
      estimatedAbilityTheta: a.estimatedAbilityTheta,
      cohortPercentile: a.cohortPercentile,
      weakTopicsCount: a.weakTopics.length
    }));

    res.json({ success: true, count: summary.length, attempts: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Get specific attempt detailed diagnostic report
reportRouter.get('/attempts/:sessionId', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const attempts = loadAttempts();
    const report = attempts.find((a) => a.sessionId === sessionId);

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Get cohort benchmarks
reportRouter.get('/benchmarks', (req: Request, res: Response) => {
  res.json({
    success: true,
    benchmarks: COHORT_BENCHMARKS,
    cohortDistribution: {
      mean: 62.0,
      stdDev: 14.0,
      totalEvaluatedStudents: 1240
    }
  });
});
