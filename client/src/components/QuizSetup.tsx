import React, { useState } from 'react';
import { MainTopic } from '../types';
import { 
  Cpu, 
  Network, 
  Boxes, 
  Binary, 
  Sparkles, 
  Gauge, 
  Clock, 
  HelpCircle,
  Play,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface QuizSetupProps {
  onStartQuiz: (params: {
    studentName: string;
    selectedTopics: MainTopic[];
    totalQuestions: number;
    durationMinutes: number;
  }) => void;
  isLoading: boolean;
}

interface TopicInfo {
  name: MainTopic;
  icon: React.ReactNode;
  description: string;
  subtopics: string[];
}

const TOPICS_LIST: TopicInfo[] = [
  {
    name: 'Data Structures',
    icon: <Boxes className="w-5 h-5 text-blue-500" />,
    description: 'Arrays, Stacks, Queues, Binary Search Trees, Heaps, Hash Tables & Graphs',
    subtopics: ['BST Rotations', 'Hash Probing', 'Heapify O(n)', 'Floyd Cycle Finding']
  },
  {
    name: 'Algorithms',
    icon: <Binary className="w-5 h-5 text-emerald-500" />,
    description: 'Dynamic Programming, Greedy Strategies, Graph Traversals & NP-Completeness',
    subtopics: ['0/1 Knapsack DP', 'Bellman-Ford', 'KMP Prefix-Suffix', 'Edmonds-Karp']
  },
  {
    name: 'Operating Systems',
    icon: <Cpu className="w-5 h-5 text-purple-500" />,
    description: 'Concurrency, Memory Paging, Deadlocks & Banker Algorithm, CPU Schedulers',
    subtopics: ['Peterson Algorithm', 'Belady Anomaly', 'Banker Safety', 'Priority Inversion']
  },
  {
    name: 'Computer Networks',
    icon: <Network className="w-5 h-5 text-amber-500" />,
    description: 'OSI/TCP Stack, Subnetting, TCP Congestion Control, BGP & TLS Protocols',
    subtopics: ['TCP Fast Recovery', 'BBR Model', 'BGP Path Vectors', 'QUIC Streams']
  }
];

export const QuizSetup: React.FC<QuizSetupProps> = ({ onStartQuiz, isLoading }) => {
  const [studentName, setStudentName] = useState('Alex Morgan');
  const [selectedTopics, setSelectedTopics] = useState<MainTopic[]>([
    'Data Structures',
    'Algorithms',
    'Operating Systems',
    'Computer Networks'
  ]);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [durationMinutes, setDurationMinutes] = useState<number>(10);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleTopic = (topic: MainTopic) => {
    if (selectedTopics.includes(topic)) {
      if (selectedTopics.length === 1) {
        setErrorMsg('Please keep at least one topic selected.');
        return;
      }
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
    setErrorMsg(null);
  };

  const selectAllTopics = () => {
    setSelectedTopics(['Data Structures', 'Algorithms', 'Operating Systems', 'Computer Networks']);
    setErrorMsg(null);
  };

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTopics.length === 0) {
      setErrorMsg('Select at least one engineering domain.');
      return;
    }
    onStartQuiz({
      studentName: studentName.trim() || 'Student Candidate',
      selectedTopics,
      totalQuestions: questionCount,
      durationMinutes
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Hero Header */}
      <div className="text-center mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Heuristic Item Response Theory (IRT) Engine Active
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Adaptive Engineering Assessment
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          QuizQuake dynamically calibrates question difficulty across Easy, Medium, and Hard tiers based on your real-time performance. Discover your precise conceptual weak spots.
        </p>
      </div>

      <form onSubmit={handleStart} className="space-y-6">
        
        {/* Candidate Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            Candidate Information
          </h2>
          <div className="max-w-md">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Full Name / Roll Number
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Alex Morgan / CS2026-042"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium text-slate-800 transition-all"
              required
            />
          </div>
        </div>

        {/* Topic Selection Grid */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                Select Evaluated Domains
              </h2>
              <p className="text-xs text-slate-500">
                The round-robin selector ensures balanced question distribution across selected areas.
              </p>
            </div>
            <button
              type="button"
              onClick={selectAllTopics}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Select All (Recommended)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {TOPICS_LIST.map((topic) => {
              const isSelected = selectedTopics.includes(topic.name);
              return (
                <div
                  key={topic.name}
                  onClick={() => toggleTopic(topic.name)}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white opacity-70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white shadow-xs border border-slate-200">
                      {topic.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-800">{topic.name}</h3>
                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{topic.description}</p>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {topic.subtopics.slice(0, 2).map((st) => (
                          <span
                            key={st}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
                          >
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Test Parameters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Question Count */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-slate-500" />
              Question Sequence Count
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    questionCount === count
                      ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {count} MCQs
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              10 MCQs is optimal for comprehensive IRT ability estimation.
            </p>
          </div>

          {/* Time Duration */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              Synchronized Test Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 15].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    durationMinutes === mins
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {mins} Minutes
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Auto-submits instantly when the countdown hits zero.
            </p>
          </div>

        </div>

        {/* Adaptive Testing Callout Rules Box */}
        <div className="rounded-2xl p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-md flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-white/10 shrink-0">
            <HelpCircle className="w-5 h-5 text-blue-300" />
          </div>
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-sm text-white">How the Adaptive Logic Works</h4>
            <p className="text-blue-200 leading-relaxed">
              • Initial baseline begins at <strong>Medium tier</strong>.<br />
              • <strong>Ascend to Hard:</strong> Requires <strong>2 consecutive correct answers</strong>.<br />
              • <strong>Descend:</strong> A single incorrect answer immediately shifts difficulty down (Hard → Medium, Medium → Easy).<br />
              • <strong>Streak Multiplier:</strong> Consecutive correct answers award up to <strong>2.0x points</strong> plus Hard difficulty bonuses!
            </p>
          </div>
        </div>

        {/* Submit Start Button */}
        <div className="text-center pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto min-w-[280px] px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
          >
            {isLoading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>Launch Adaptive Arena Session</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
