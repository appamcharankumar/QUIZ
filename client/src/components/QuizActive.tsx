import React, { useState, useEffect } from 'react';
import { QuestionClient, Difficulty } from '../types';
import { 
  Clock, 
  Flame, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Lightbulb, 
  ShieldCheck,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface QuizActiveProps {
  question: QuestionClient;
  currentDifficulty: Difficulty;
  currentStreak: number;
  totalScore: number;
  onSubmitAnswer: (selectedOptionIndex: number, timeSpentSeconds: number) => Promise<{
    isCorrect: boolean;
    correctOptionIndex: number;
    explanation: string;
    pointsAwarded: number;
    previousDifficulty: Difficulty;
    nextDifficulty: Difficulty;
    isFinished: boolean;
  }>;
  onAdvanceNext: () => void;
  onEarlyFinish: () => void;
}

export const QuizActive: React.FC<QuizActiveProps> = ({
  question,
  currentDifficulty,
  currentStreak,
  totalScore,
  onSubmitAnswer,
  onAdvanceNext,
  onEarlyFinish
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [secondsOnQuestion, setSecondsOnQuestion] = useState<number>(0);

  // Result state after submission
  const [submittedResult, setSubmittedResult] = useState<{
    isCorrect: boolean;
    correctOptionIndex: number;
    explanation: string;
    pointsAwarded: number;
    previousDifficulty: Difficulty;
    nextDifficulty: Difficulty;
    isFinished: boolean;
  } | null>(null);

  // Reset timer on question change
  useEffect(() => {
    setSelectedOption(null);
    setSubmittedResult(null);
    setStartTime(Date.now());
    setSecondsOnQuestion(0);

    const interval = setInterval(() => {
      setSecondsOnQuestion((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [question.id]);

  const handleSubmit = async () => {
    if (selectedOption === null || isSubmitting) return;

    setIsSubmitting(true);
    const timeSpent = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    try {
      const res = await onSubmitAnswer(selectedOption, timeSpent);
      setSubmittedResult(res);
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case 'Easy':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-300',
          badge: 'bg-emerald-600 text-white',
          dot: 'bg-emerald-500'
        };
      case 'Medium':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-300',
          badge: 'bg-amber-600 text-white',
          dot: 'bg-amber-500'
        };
      case 'Hard':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-300',
          badge: 'bg-rose-600 text-white',
          dot: 'bg-rose-500'
        };
    }
  };

  const diffStyle = getDifficultyColor(currentDifficulty);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Test Progress & Live Scaling HUD */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Question {question.questionNumber} of {question.totalQuestions}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              {question.topic}
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              ({question.subtopic})
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Calibrated Difficulty Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${diffStyle.bg}`}>
              <span className={`w-2 h-2 rounded-full ${diffStyle.dot} animate-ping`} />
              <span>Calibrated Tier: {currentDifficulty}</span>
            </div>

            {/* Streak Counter */}
            {currentStreak > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-bounce" />
                <span>{currentStreak}x Combo</span>
              </div>
            )}
          </div>

        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(question.questionNumber / question.totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
        
        {/* Question Header & Stem */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Time on item: {secondsOnQuestion}s</span>
              <span className="text-slate-400">(Est: {question.estimatedTimeSeconds}s)</span>
            </div>
            <div className="text-slate-500 font-medium">
              Score: <strong className="text-slate-800">{totalScore}</strong> pts
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {question.stem}
          </h2>

          {/* Optional Code Snippet */}
          {question.codeSnippet && (
            <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs sm:text-sm text-emerald-400 overflow-x-auto shadow-inner border border-slate-800">
              <pre>{question.codeSnippet}</pre>
            </div>
          )}
        </div>

        {/* Radio Options Grid */}
        <div className="space-y-3">
          {question.options.map((optionText, idx) => {
            const isSelected = selectedOption === idx;
            
            // Post-submission styling
            let optionClasses = 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-800';
            
            if (submittedResult) {
              if (idx === submittedResult.correctOptionIndex) {
                optionClasses = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold shadow-xs';
              } else if (isSelected && !submittedResult.isCorrect) {
                optionClasses = 'border-rose-500 bg-rose-50 text-rose-900 line-through';
              } else {
                optionClasses = 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-60';
              }
            } else if (isSelected) {
              optionClasses = 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold shadow-sm ring-1 ring-blue-600';
            }

            const letter = String.fromCharCode(65 + idx);

            return (
              <div
                key={idx}
                onClick={() => {
                  if (!submittedResult && !isSubmitting) {
                    setSelectedOption(idx);
                  }
                }}
                className={`flex items-start gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition-all ${optionClasses}`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  submittedResult && idx === submittedResult.correctOptionIndex
                    ? 'bg-emerald-600 text-white'
                    : submittedResult && isSelected && !submittedResult.isCorrect
                    ? 'bg-rose-600 text-white'
                    : isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {letter}
                </div>
                <div className="flex-1 text-sm leading-relaxed pt-0.5">
                  {optionText}
                </div>
                {submittedResult && idx === submittedResult.correctOptionIndex && (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 self-center" />
                )}
                {submittedResult && isSelected && !submittedResult.isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 self-center" />
                )}
              </div>
            );
          })}
        </div>

        {/* Action Controls / Submission */}
        {!submittedResult ? (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 flex-wrap gap-3">
            <button
              onClick={onEarlyFinish}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
            >
              End Assessment & View Current Report
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null || isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-blue-600/25 transition-all flex items-center gap-2 ml-auto"
            >
              {isSubmitting ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Submit Answer</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ) : (
          /* Post-submission Adaptive Feedback Card */
          <div className="pt-4 border-t border-slate-100 space-y-4 animate-fadeIn">
            
            {/* Transition Alert Banner */}
            <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              submittedResult.isCorrect
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/80 border-rose-200 text-rose-900'
            }`}>
              {submittedResult.isCorrect ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 text-xs sm:text-sm space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-1 font-bold">
                  <span>
                    {submittedResult.isCorrect 
                      ? `Correct! +${submittedResult.pointsAwarded} Points Awarded` 
                      : 'Incorrect Answer Recorded'}
                  </span>
                  
                  {/* Adaptive Difficulty Scaling Feedback */}
                  {submittedResult.previousDifficulty !== submittedResult.nextDifficulty && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-white/80 shadow-xs">
                      {submittedResult.nextDifficulty === 'Hard' ? (
                        <span className="text-purple-700 flex items-center gap-0.5">
                          <TrendingUp className="w-3.5 h-3.5" /> Scaled UP to Hard Tier!
                        </span>
                      ) : (
                        <span className="text-amber-700 flex items-center gap-0.5">
                          <TrendingDown className="w-3.5 h-3.5" /> Adjusted to {submittedResult.nextDifficulty} Tier
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-slate-700 pt-1 leading-relaxed text-xs">
                  <strong className="text-slate-900">Explanation Rationale:</strong> {submittedResult.explanation}
                </div>
              </div>
            </div>

            {/* Next Question / Finish Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={onAdvanceNext}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-blue-600/30 transition-all flex items-center gap-2"
              >
                <span>{submittedResult.isFinished ? 'View Diagnostic Report' : 'Proceed to Next Adaptive Question'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
