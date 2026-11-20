import React, { useState, useEffect } from 'react';
import { generateRemedialDrillApi } from '../api';
import { 
  Zap, 
  X, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Check, 
  Sparkles, 
  RotateCcw,
  Lightbulb
} from 'lucide-react';

interface RemedialModalProps {
  weakTopics: string[];
  onClose: () => void;
}

interface RemedialQuestion {
  id: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  stem: string;
  codeSnippet?: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export const RemedialModal: React.FC<RemedialModalProps> = ({ weakTopics, onClose }) => {
  const [questions, setQuestions] = useState<RemedialQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [answers, setAnswers] = useState<{ isCorrect: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    async function loadRemedial() {
      try {
        setIsLoading(true);
        const data = await generateRemedialDrillApi(weakTopics);
        if (data.success && data.questions) {
          setQuestions(data.questions);
        }
      } catch (err) {
        console.error('Error fetching remedial drill:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRemedial();
  }, [weakTopics]);

  const handleOptionSelect = (idx: number) => {
    if (!hasSubmitted) {
      setSelectedOption(idx);
    }
  };

  const handleCheck = () => {
    if (selectedOption === null) return;
    const currentQ = questions[currentIndex];
    const isCorrect = selectedOption === currentQ.correctOptionIndex;
    setAnswers([...answers, { isCorrect }]);
    setHasSubmitted(true);
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasSubmitted(false);
    } else {
      setIsFinished(true);
    }
  };

  const currentQ = questions[currentIndex];
  const correctCount = answers.filter((a) => a.isCorrect).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
              <Zap className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Targeted Remedial Drill (5 Items)
              </h3>
              <p className="text-xs text-slate-500">
                Targeting identified weak topics: {weakTopics.slice(0, 2).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-rose-600 border-t-transparent mx-auto" />
            <p className="text-xs font-semibold text-slate-600">
              Curating targeted drill questions for your knowledge gaps...
            </p>
          </div>
        ) : isFinished ? (
          /* Finished Drill Summary */
          <div className="text-center py-8 space-y-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-2xl font-extrabold text-slate-900">Remedial Drill Completed!</h4>
              <p className="text-sm text-slate-600">
                You correctly answered <strong>{correctCount}</strong> out of <strong>{questions.length}</strong> targeted remedial items.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-sm mx-auto text-xs text-slate-700">
              {correctCount >= 4 ? (
                <span className="text-emerald-700 font-bold">
                  🟢 Remediation Successful! Conceptual deficiencies in targeted weak topics have been reinforced.
                </span>
              ) : (
                <span className="text-amber-700 font-bold">
                  🟡 Good effort! Recommended to review detailed solution rationales before attempting another arena test.
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all"
            >
              Done & Return to Report
            </button>
          </div>
        ) : currentQ ? (
          /* Active Remedial Question */
          <div className="space-y-5">
            {/* Step indicator */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Drill Question {currentIndex + 1} of {questions.length}</span>
              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                {currentQ.topic} ({currentQ.subtopic})
              </span>
            </div>

            {/* Question Stem */}
            <h4 className="text-base font-bold text-slate-900 leading-snug">
              {currentQ.stem}
            </h4>

            {currentQ.codeSnippet && (
              <div className="rounded-xl bg-slate-950 p-3 font-mono text-xs text-emerald-400 overflow-x-auto">
                <pre>{currentQ.codeSnippet}</pre>
              </div>
            )}

            {/* Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                let optStyle = 'border-slate-200 hover:border-slate-300 text-slate-800 bg-white';

                if (hasSubmitted) {
                  if (idx === currentQ.correctOptionIndex) {
                    optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                  } else if (isSelected) {
                    optStyle = 'border-rose-500 bg-rose-50 text-rose-950 line-through';
                  } else {
                    optStyle = 'border-slate-100 bg-slate-50 opacity-50';
                  }
                } else if (isSelected) {
                  optStyle = 'border-rose-500 bg-rose-50/50 text-rose-950 font-semibold ring-1 ring-rose-500';
                }

                return (
                  <div
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-xs sm:text-sm flex items-center justify-between ${optStyle}`}
                  >
                    <span>{opt}</span>
                    {hasSubmitted && idx === currentQ.correctOptionIndex && (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    )}
                    {hasSubmitted && isSelected && idx !== currentQ.correctOptionIndex && (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Immediate explanation if submitted */}
            {hasSubmitted && (
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1 animate-fadeIn">
                <div className="flex items-center gap-1 font-bold">
                  <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
                  <span>Reinforcement Insight:</span>
                </div>
                <p>{currentQ.explanation}</p>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-end pt-3">
              {!hasSubmitted ? (
                <button
                  onClick={handleCheck}
                  disabled={selectedOption === null}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
                >
                  Confirm Choice
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>{currentIndex + 1 < questions.length ? 'Next Drill Item' : 'View Drill Results'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
};
