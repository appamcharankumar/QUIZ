import React from 'react';
import { DiagnosticReport } from '../types';
import { Printer, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface PDFScorecardProps {
  report: DiagnosticReport;
  onClose: () => void;
}

export const PDFScorecard: React.FC<PDFScorecardProps> = ({ report, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      
      {/* Action Header (Hidden on print) */}
      <div className="print:hidden flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl shadow-md">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>

        <button
          onClick={handlePrint}
          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Scorecard Body */}
      <div className="bg-white border border-slate-300 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8 text-slate-800 print:border-none print:shadow-none print:p-0">
        
        {/* Institutional Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-extrabold text-xs tracking-widest uppercase">
              <span>QuizQuake Adaptive Testing Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1">
              OFFICIAL DIAGNOSTIC SCORECARD
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Computer Science & Engineering Adaptive Mastery Diagnostic Report
            </p>
          </div>

          <div className="text-right text-xs space-y-0.5">
            <div className="font-bold text-slate-900">Session ID: {report.sessionId.slice(0, 13)}</div>
            <div className="text-slate-500">Date: {new Date(report.completedAt).toLocaleDateString()}</div>
            <div className="text-slate-500">Evaluation: Computerized Adaptive Testing (CAT)</div>
          </div>
        </div>

        {/* Candidate Profile & Core Metrics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <div>
            <span className="block text-[11px] font-bold text-slate-500 uppercase">Candidate Name</span>
            <span className="text-base font-extrabold text-slate-900">{report.studentName}</span>
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-500 uppercase">Overall Accuracy</span>
            <span className="text-base font-extrabold text-blue-700">
              {report.overallAccuracy}% ({report.correctQuestions}/{report.totalQuestions})
            </span>
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-500 uppercase">IRT Ability (&theta;)</span>
            <span className="text-base font-extrabold text-purple-700">
              {report.estimatedAbilityTheta > 0 ? `+${report.estimatedAbilityTheta}` : report.estimatedAbilityTheta}
            </span>
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-500 uppercase">Cohort Standing</span>
            <span className="text-base font-extrabold text-emerald-700">{report.cohortPercentile}th Percentile</span>
          </div>
        </div>

        {/* Domain Mastery Matrix */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5">
            Topic Mastery & Conceptual Diagnostic Matrix
          </h2>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Engineering Domain</th>
                  <th className="py-2.5 px-4">Items Attempted</th>
                  <th className="py-2.5 px-4">Accuracy</th>
                  <th className="py-2.5 px-4">Mastery Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {report.topicMasteries.map((tm) => (
                  <tr key={tm.topic} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {tm.topic}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {tm.correctQuestions} correct / {tm.totalQuestions} questions
                    </td>
                    <td className="py-3 px-4 font-bold">
                      {tm.accuracy}%
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                        tm.masteryLevel === 'Mastered'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : tm.masteryLevel === 'Weak'
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        {tm.masteryLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Critical Conceptual Deficiencies & Action Plan */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5">
            Identified Knowledge Gaps & Remedial Action Items
          </h2>

          {report.weakTopics.length > 0 ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>The following areas require immediate remediation:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-rose-900/90 font-medium">
                {report.weakTopics.map((wt, idx) => (
                  <li key={idx}>Critical deficiency flagged in: <strong>{wt}</strong>.</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>No critical conceptual deficiencies detected. Candidate demonstrates balanced proficiency.</span>
            </div>
          )}

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <span className="font-bold text-slate-900">Automated Remedial Recommendations:</span>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              {report.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Faculty Review & Academic Sign-off Section */}
        <div className="pt-8 border-t-2 border-slate-900 space-y-4">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Faculty Evaluation & Recommendation Sign-Off
          </h2>

          <div className="grid grid-cols-2 gap-8 pt-4">
            <div className="space-y-6">
              <div>
                <span className="block text-[11px] font-bold text-slate-500 uppercase">Faculty Reviewer Name</span>
                <div className="border-b border-slate-400 mt-6" />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-slate-500 uppercase">Reviewer Comments / Remediation Directive</span>
                <div className="border-b border-slate-300 mt-6" />
                <div className="border-b border-slate-300 mt-6" />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <span className="block text-[11px] font-bold text-slate-500 uppercase">Authorized Signature</span>
                <div className="border-b border-slate-400 mt-6" />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-slate-500 uppercase">Date of Verification</span>
                <div className="border-b border-slate-400 mt-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono">
          QuizQuake: BrainStorm Arena • Computerized Adaptive Testing Framework • IRT 2PL Heuristic Engine
        </div>

      </div>

    </div>
  );
};
