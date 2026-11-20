import React, { useState, useEffect } from 'react';
import { fetchAttemptHistory, fetchAttemptReport } from '../api';
import { DiagnosticReport } from '../types';
import { 
  History, 
  ArrowLeft, 
  Calendar, 
  Target, 
  TrendingUp, 
  Award, 
  ArrowRight,
  BrainCircuit,
  AlertCircle,
  FileText
} from 'lucide-react';

interface AttemptSummary {
  sessionId: string;
  studentName: string;
  completedAt: string;
  totalQuestions: number;
  correctQuestions: number;
  overallAccuracy: number;
  totalScore: number;
  estimatedAbilityTheta: number;
  cohortPercentile: number;
  weakTopicsCount: number;
}

interface HistoryViewProps {
  onBack: () => void;
  onSelectReport: (report: DiagnosticReport) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onBack, onSelectReport }) => {
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await fetchAttemptHistory();
        if (data.success && data.attempts) {
          setAttempts(data.attempts);
        }
      } catch (err) {
        console.error('Error fetching attempts:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOpenReport = async (sessionId: string) => {
    try {
      setLoadingSessionId(sessionId);
      const data = await fetchAttemptReport(sessionId);
      if (data.success && data.report) {
        onSelectReport(data.report);
      }
    } catch (err) {
      console.error('Error opening report:', err);
    } finally {
      setLoadingSessionId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              <span>Assessment History Logger</span>
            </h2>
            <p className="text-xs text-slate-500">
              Track your conceptual accuracy improvement and IRT ability scaling across time
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
        >
          Take New Test
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent mx-auto" />
          <p className="text-xs text-slate-500">Loading historical attempts records...</p>
        </div>
      ) : attempts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center space-y-4 border border-slate-200 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <History className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No Assessment Attempts Logged Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Complete your first computerized adaptive quiz session to view historical mastery trends, ability theta progress, and weakness diagnoses.
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
          >
            Launch First Quiz
          </button>
        </div>
      ) : (
        /* Historical records list */
        <div className="space-y-3">
          {attempts.map((att, idx) => {
            const dateStr = new Date(att.completedAt).toLocaleDateString();
            const timeStr = new Date(att.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={att.sessionId}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:border-blue-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-900">{att.studentName}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{dateStr} at {timeStr}</span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      {att.totalQuestions} Questions Attempted
                    </span>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap text-xs pt-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Target className="w-3.5 h-3.5 text-blue-600" />
                      <span>Accuracy: {att.overallAccuracy}% ({att.correctQuestions}/{att.totalQuestions})</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-medium text-purple-700">
                      <BrainCircuit className="w-3.5 h-3.5" />
                      <span>IRT Ability: {att.estimatedAbilityTheta > 0 ? `+${att.estimatedAbilityTheta}` : att.estimatedAbilityTheta}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-medium text-emerald-700">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{att.cohortPercentile}th Percentile</span>
                    </div>

                    {att.weakTopicsCount > 0 ? (
                      <div className="flex items-center gap-1 text-rose-600 font-semibold text-[11px]">
                        <AlertCircle className="w-3 h-3" />
                        <span>{att.weakTopicsCount} Weak Area(s)</span>
                      </div>
                    ) : (
                      <span className="text-emerald-600 text-[11px] font-semibold">Zero Deficiencies</span>
                    )}
                  </div>
                </div>

                {/* Open full report */}
                <button
                  onClick={() => handleOpenReport(att.sessionId)}
                  disabled={loadingSessionId === att.sessionId}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0 self-stretch md:self-auto justify-center"
                >
                  {loadingSessionId === att.sessionId ? (
                    <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      <span>View Full Scorecard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
