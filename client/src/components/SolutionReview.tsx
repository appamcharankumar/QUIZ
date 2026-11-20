import React, { useState } from 'react';
import { QuestionResult, Difficulty } from '../types';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowLeft, 
  Filter, 
  Check, 
  AlertCircle,
  Lightbulb
} from 'lucide-react';

interface SolutionReviewProps {
  solutions: QuestionResult[];
  weakTopics: string[];
  onBackToReport: () => void;
}

export const SolutionReview: React.FC<SolutionReviewProps> = ({
  solutions,
  weakTopics,
  onBackToReport
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'correct' | 'incorrect' | 'weak'>('all');

  const filteredSolutions = solutions.filter((item) => {
    if (filterMode === 'correct') return item.isCorrect;
    if (filterMode === 'incorrect') return !item.isCorrect;
    if (filterMode === 'weak') {
      const match = weakTopics.some(
        (wt) => item.topic.toLowerCase().includes(wt.toLowerCase()) || item.subtopic.toLowerCase().includes(wt.toLowerCase())
      );
      return match || !item.isCorrect;
    }
    return true;
  });

  const getTierColor = (diff: Difficulty) => {
    switch (diff) {
      case 'Easy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Hard':
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToReport}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Return to Scorecard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Solution Rationale & Review</h2>
            <p className="text-xs text-slate-500">
              Examining {filteredSolutions.length} of {solutions.length} questions
            </p>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold self-stretch sm:self-auto overflow-x-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterMode === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({solutions.length})
          </button>
          <button
            onClick={() => setFilterMode('correct')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterMode === 'correct' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Correct ({solutions.filter((s) => s.isCorrect).length})
          </button>
          <button
            onClick={() => setFilterMode('incorrect')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterMode === 'incorrect' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Incorrect ({solutions.filter((s) => !s.isCorrect).length})
          </button>
          <button
            onClick={() => setFilterMode('weak')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterMode === 'weak' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weak Areas
          </button>
        </div>
      </div>

      {/* Solutions list */}
      <div className="space-y-5">
        {filteredSolutions.map((item, index) => {
          return (
            <div
              key={item.questionId || index}
              className={`bg-white rounded-2xl p-6 shadow-sm border-2 space-y-4 ${
                item.isCorrect ? 'border-emerald-200' : 'border-rose-200'
              }`}
            >
              {/* Item Top Metadata */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-white ${
                    item.isCorrect ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="font-bold text-slate-700">{item.topic}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{item.subtopic}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${getTierColor(item.difficulty)}`}>
                    {item.difficulty} Tier
                  </span>
                  <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{item.timeSpentSeconds}s</span>
                  </span>
                  {item.pointsAwarded > 0 && (
                    <span className="font-bold text-emerald-600 text-[11px]">
                      +{item.pointsAwarded} pts
                    </span>
                  )}
                </div>
              </div>

              {/* Stem */}
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {item.stem}
              </h3>

              {/* Code Snippet if present */}
              {item.codeSnippet && (
                <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800">
                  <pre>{item.codeSnippet}</pre>
                </div>
              )}

              {/* Options Breakdown */}
              <div className="space-y-2 pt-1">
                {item.options.map((optText, optIdx) => {
                  const isUserSelection = item.selectedOptionIndex === optIdx;
                  const isCorrectAnswer = item.correctOptionIndex === optIdx;

                  let optClass = 'border-slate-100 bg-slate-50/50 text-slate-600';
                  if (isCorrectAnswer) {
                    optClass = 'border-emerald-400 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-400';
                  } else if (isUserSelection && !item.isCorrect) {
                    optClass = 'border-rose-400 bg-rose-50 text-rose-900 font-semibold ring-1 ring-rose-400';
                  }

                  const letter = String.fromCharCode(65 + optIdx);

                  return (
                    <div
                      key={optIdx}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-xs sm:text-sm ${optClass}`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] shrink-0 ${
                        isCorrectAnswer
                          ? 'bg-emerald-600 text-white'
                          : isUserSelection && !item.isCorrect
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {letter}
                      </div>

                      <div className="flex-1">{optText}</div>

                      {isCorrectAnswer && (
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 shrink-0">
                          Correct Answer
                        </span>
                      )}

                      {isUserSelection && !isCorrectAnswer && (
                        <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 shrink-0">
                          Your Choice
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Detailed Rationale Card */}
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-900">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <span>Conceptual Rationale & Explanation</span>
                </div>
                <p className="leading-relaxed text-blue-900/90 pl-5">
                  {item.explanation}
                </p>
              </div>

            </div>
          );
        })}
      </div>

      {/* Return button */}
      <div className="text-center pt-4">
        <button
          onClick={onBackToReport}
          className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Diagnostic Scorecard</span>
        </button>
      </div>

    </div>
  );
};
