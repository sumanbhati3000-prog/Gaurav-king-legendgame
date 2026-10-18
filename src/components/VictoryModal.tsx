import React, { useEffect } from 'react';
import { GameStats } from '../types/game';
import { RotateCcw, Trophy, Award, Zap, Compass } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface VictoryModalProps {
  stats: GameStats;
  onRestart: () => void;
  onReturnTitle: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stats,
  onRestart,
  onReturnTitle,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r' || e.code === 'Space' || e.code === 'Enter') {
        soundManager.playButton();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  const isRegicide = stats.victoryType === 'regicide';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div
        className={`relative w-full max-w-md p-6 sm:p-8 rounded-xl bg-stone-900 border shadow-2xl text-stone-100 flex flex-col items-center text-center ${
          isRegicide
            ? 'border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.35)]'
            : 'border-cyan-500/80 shadow-[0_0_50px_rgba(56,189,248,0.3)]'
        }`}
      >
        {/* Victory Icon */}
        <div
          className={`p-3.5 rounded-full mb-3 ${
            isRegicide
              ? 'bg-amber-950/90 border border-amber-400 text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)]'
              : 'bg-cyan-950/90 border border-cyan-400 text-cyan-400 shadow-[0_0_25px_rgba(56,189,248,0.5)]'
          }`}
        >
          <Trophy className="w-8 h-8" />
        </div>

        {/* Title */}
        <h2
          className={`text-2xl sm:text-3xl font-black uppercase tracking-tight mb-1 ${
            isRegicide ? 'text-amber-400' : 'text-cyan-400'
          }`}
        >
          {isRegicide ? 'Regicide: Chutiya Slain King Gaurav!' : 'Chutiya Escaped the Castle!'}
        </h2>

        <div className="text-xs text-stone-400 font-mono mb-4">
          {isRegicide
            ? 'Chutiya gunned down the sovereign tyrant and brought the royal court to its knees!'
            : 'Chutiya slipped past King Gaurav and the palace guards to reach the Exit Gate!'}
        </div>

        {/* Rank Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-950/80 border border-stone-800 text-xs font-mono text-stone-300 mb-5">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Combat Grade: <strong className="text-amber-300">Rank {stats.rank}</strong></span>
        </div>

        {/* Victory Performance Stats */}
        <div className="w-full grid grid-cols-2 gap-2.5 mb-6 text-left">
          <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800">
            <div className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">Match Time</div>
            <div className="text-lg font-bold font-mono tabular-nums text-cyan-300">
              {stats.elapsedTime.toFixed(2)}s
            </div>
          </div>

          <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800">
            <div className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">Enemies Slain</div>
            <div className="text-lg font-bold font-mono tabular-nums text-red-400">
              {stats.enemiesKilled || 0} / {stats.totalEnemies || 0}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800">
            <div className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">Final Score</div>
            <div className="text-lg font-bold font-mono tabular-nums text-amber-400">
              {stats.score} pts
            </div>
          </div>

          <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800">
            <div className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">King Gaurav</div>
            <div className="text-lg font-bold font-mono text-stone-200">
              {stats.kingKilled ? '👑 SLAIN' : 'Evaded'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            onClick={() => {
              soundManager.playButton();
              onRestart();
            }}
            className="w-full sm:flex-1 py-3 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold tracking-wider uppercase text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay Arena (Press R)</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButton();
              onReturnTitle();
            }}
            className="w-full sm:w-auto py-3 px-4 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer"
          >
            Title Screen
          </button>
        </div>

        <div className="text-[11px] text-stone-400 font-mono mt-4">
          Press <kbd className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-200 border border-stone-700">R</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-200 border border-stone-700">Space</kbd> to replay instantly
        </div>
      </div>
    </div>
  );
};
