import React, { useState } from 'react';
import { DiagnosticReport as DiagnosticReportType } from '../types';
import { RadarChart } from './RadarChart';
import { CohortBenchmarkChart } from './CohortBenchmarkChart';
import { 
  Award, 
  Target, 
  Flame, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Download, 
  RotateCcw, 
  Sparkles, 
  ArrowRight, 
  HelpCircle,
  FileText,
  BarChart3,
  Zap,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';

interface DiagnosticReportProps {
  report: DiagnosticReportType;
  onRetake: () => void;
  onStartRemedial: (weakTopics: string[]) => void;
  onViewSolutions: () => void;
  onPrintScorecard: () => void;
}

export const DiagnosticReport: React.FC<DiagnosticReportProps> = ({
  report,
  onRetake,
  onStartRemedial,
  onViewSolutions,
  onPrintScorecard
}) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'cohort'>('radar');

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  const hasWeakTopics = report.weakTopics && report.weakTopics.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* Hero Diagnostic Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Assessment Completed • Diagnostic Evaluation Ready</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Diagnostic Diagnostic Scorecard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-4 flex-wrap">
              <span>Candidate: <strong className="text-white">{report.studentName}</strong></span>
              <span>•</span>
              <span>Completed: {new Date(report.completedAt).toLocaleDateString()} {new Date(report.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span>•</span>
              <span>Duration: {formatDuration(report.totalTimeSpentSeconds)}</span>
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={onPrintScorecard}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <FileText className="w-4 h-4 text-blue-300" />
              <span>Faculty PDF Scorecard</span>
            </button>
            <button
              onClick={onRetake}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Quiz</span>
            </button>
          </div>
        </div>

        {/* 4 Primary KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10">
          
          {/* Accuracy */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-xs text-blue-200 font-medium flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-blue-400" />
              <span>Overall Accuracy</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {report.overallAccuracy}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {report.correctQuestions} of {report.totalQuestions} questions correct
            </div>
          </div>

          {/* Heuristic IRT Ability Theta */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-xs text-purple-200 font-medium flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
              <span>IRT Ability (&theta;)</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-200 mt-1">
              {report.estimatedAbilityTheta > 0 ? `+${report.estimatedAbilityTheta}` : report.estimatedAbilityTheta}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Scale: -3.0 (novice) to +3.0 (expert)
            </div>
          </div>

          {/* Cohort Percentile Benchmark */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-xs text-emerald-200 font-medium flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cohort Percentile</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 mt-1">
              {report.cohortPercentile}th
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Top {100 - report.cohortPercentile}% among 1,240 peers
            </div>
          </div>

          {/* Points & Streak */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-xs text-amber-200 font-medium flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Total Score & Streak</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 mt-1">
              {report.totalScore} <span className="text-xs font-normal text-slate-400">pts</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Peak combo: {report.highestStreak}x consecutive
            </div>
          </div>

        </div>

      </div>

      {/* Critical Weak Topics Alert Banner */}
      {hasWeakTopics ? (
        <div className="rounded-2xl p-5 bg-rose-50 border-2 border-rose-200 text-rose-950 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600 shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-rose-900">
                Critical Conceptual Deficiencies Detected ({report.weakTopics.length})
              </h3>
              <p className="text-xs text-rose-700 leading-relaxed max-w-2xl">
                The adaptive engine identified mastery scores below 60% in:{' '}
                <strong>{report.weakTopics.join(', ')}</strong>.
              </p>
            </div>
          </div>

          {/* 1-Click Remedial Drill Button */}
          <button
            onClick={() => onStartRemedial(report.weakTopics)}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-rose-600/30 transition-all flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-center"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Launch 1-Click Remedial Drill</span>
          </button>
        </div>
      ) : (
        <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">
            Outstanding performance! No critical knowledge deficiencies detected (all evaluated topics &ge; 60% accuracy).
          </span>
        </div>
      )}

      {/* Interactive Visualizations: Radar Chart & Cohort Benchmark */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart Container */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Visual Analytics Engine</span>
              </h3>
              <p className="text-xs text-slate-500">
                Compare multi-axis topic mastery percentages and peer distribution curves.
              </p>
            </div>

            {/* Toggle Tabs */}
            <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('radar')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'radar' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Weak-Topic Radar
              </button>
              <button
                onClick={() => setActiveTab('cohort')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'cohort' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cohort Benchmark
              </button>
            </div>
          </div>

          {activeTab === 'radar' ? (
            <div>
              <RadarChart topicMasteries={report.topicMasteries} />
              <p className="text-center text-[11px] text-slate-400 mt-2">
                🔴 Red vertices denote critical deficiency zones (&lt;60%). 🟢 Green denotes solid mastery (&ge;80%).
              </p>
            </div>
          ) : (
            <div>
              <CohortBenchmarkChart topicMasteries={report.topicMasteries} />
              <p className="text-center text-[11px] text-slate-400 mt-2">
                Direct comparative calibration against n=1,240 simulated batch participants.
              </p>
            </div>
          )}

        </div>

        {/* Detailed Topic Mastery Breakdown Table & Subtopics */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center justify-between">
            <span>Domain Mastery Breakdown</span>
            <span className="text-xs font-normal text-slate-400">Evaluated Domains</span>
          </h3>

          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {report.topicMasteries.map((tm) => {
              const badgeStyle =
                tm.masteryLevel === 'Mastered'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : tm.masteryLevel === 'Weak'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200';

              return (
                <div key={tm.topic} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{tm.topic}</h4>
                      <span className="text-[10px] text-slate-500">
                        {tm.correctQuestions}/{tm.totalQuestions} items correct
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badgeStyle}`}>
                        {tm.accuracy}% • {tm.masteryLevel}
                      </span>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        tm.accuracy >= 80 ? 'bg-emerald-500' : tm.accuracy < 60 ? 'bg-rose-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${tm.accuracy}%` }}
                    />
                  </div>

                  {/* Subtopics Pills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {Object.entries(tm.subtopics).map(([subName, subData]) => (
                      <span
                        key={subName}
                        className={`text-[9px] px-1.5 py-0.5 rounded font-medium border ${
                          subData.accuracy < 60
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        {subName}: {subData.accuracy}%
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Difficulty Tier Calibrations */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-600 mb-2">Difficulty Tier Distribution</h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                <span className="block font-bold text-emerald-800">Easy</span>
                <span className="text-slate-600 text-[11px]">
                  {report.difficultyDistribution.Easy.correct} / {report.difficultyDistribution.Easy.attempted}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-100">
                <span className="block font-bold text-amber-800">Medium</span>
                <span className="text-slate-600 text-[11px]">
                  {report.difficultyDistribution.Medium.correct} / {report.difficultyDistribution.Medium.attempted}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-rose-50 border border-rose-100">
                <span className="block font-bold text-rose-800">Hard</span>
                <span className="text-slate-600 text-[11px]">
                  {report.difficultyDistribution.Hard.correct} / {report.difficultyDistribution.Hard.attempted}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Gamified Badges Earned Section */}
      {report.badges && report.badges.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-800">Earned Achievement Badges</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {report.badges.map((badge) => (
              <div
                key={badge.id}
                className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                  <Flame className="w-4 h-4 fill-amber-500" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{badge.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer Callouts */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Comprehensive Solution Breakdown Available</h4>
          <p className="text-xs text-slate-500">
            Review detailed question-by-question rationales, your submitted choices, and time spent metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onViewSolutions}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Open Solution Review</span>
          </button>
        </div>
      </div>

    </div>
  );
};
