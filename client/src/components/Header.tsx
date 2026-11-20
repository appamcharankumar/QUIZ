import React from 'react';
import { Difficulty } from '../types';
import { Zap, Clock, Flame, Award, History, BookOpen } from 'lucide-react';

interface HeaderProps {
  currentDifficulty?: Difficulty;
  timeRemaining?: number;
  currentStreak?: number;
  totalScore?: number;
  onNavigateHistory?: () => void;
  onNavigateHome?: () => void;
  isTestActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentDifficulty,
  timeRemaining,
  currentStreak = 0,
  totalScore = 0,
  onNavigateHistory,
  onNavigateHome,
  isTestActive = false
}) => {
  // Format seconds to mm:ss
  const formatTime = (seconds?: number) => {
    if (seconds === undefined || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemaining !== undefined && timeRemaining <= 60 && timeRemaining > 0;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div 
          onClick={onNavigateHome}
          className="flex items-center gap-3 cursor-pointer group transition-transform active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all">
            <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent">
                QuizQuake
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-900/70 text-blue-300 border border-blue-700/50">
                BrainStorm
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Computerized Adaptive Testing Arena</p>
          </div>
        </div>

        {/* Live Quiz HUD (when test is in progress) */}
        {isTestActive ? (
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Live Difficulty Pill */}
            {currentDifficulty && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all animate-pulse shadow-sm"
                style={{
                  backgroundColor: currentDifficulty === 'Hard' ? 'rgba(239, 68, 68, 0.15)' :
                    currentDifficulty === 'Medium' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  borderColor: currentDifficulty === 'Hard' ? '#ef4444' :
                    currentDifficulty === 'Medium' ? '#f59e0b' : '#10b981',
                  color: currentDifficulty === 'Hard' ? '#fca5a5' :
                    currentDifficulty === 'Medium' ? '#fde68a' : '#86efac'
                }}
                title="Adaptive Engine: Ascends to Hard after 2 consecutive correct answers; descends upon 1 incorrect answer."
              >
                <span className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: currentDifficulty === 'Hard' ? '#ef4444' :
                      currentDifficulty === 'Medium' ? '#f59e0b' : '#10b981'
                  }}
                />
                <span>Tier: {currentDifficulty}</span>
              </div>
            )}

            {/* Streak Counter */}
            {currentStreak > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-bounce" />
                <span>{currentStreak}x Streak</span>
              </div>
            )}

            {/* Score */}
            <div className="hidden md:flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              <Award className="w-3.5 h-3.5 text-blue-400" />
              <span>{totalScore} pts</span>
            </div>

            {/* Synchronized Timer */}
            {timeRemaining !== undefined && (
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border transition-colors ${
                isLowTime 
                  ? 'bg-red-500/20 text-red-300 border-red-500 animate-pulse'
                  : 'bg-slate-800/90 text-blue-300 border-blue-600/40'
              }`}>
                <Clock className={`w-3.5 h-3.5 ${isLowTime ? 'text-red-400' : 'text-blue-400'}`} />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            )}

          </div>
        ) : (
          /* Navigation buttons when not in active test */
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onNavigateHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors"
            >
              <History className="w-4 h-4 text-slate-400" />
              <span>Attempt History</span>
            </button>
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/25 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>New Assessment</span>
            </button>
          </div>
        )}

      </div>
    </header>
  );
};
