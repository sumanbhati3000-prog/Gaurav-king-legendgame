import React, { useEffect } from 'react';
import { GameStats } from '../types/game';
import { RotateCcw, Skull, ShieldAlert, Award } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface GameOverModalProps {
  stats: GameStats;
  onRestart: () => void;
  onReturnTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
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

  const isKing = stats.killerName === 'King Gaurav';

  const taunts = isKing
    ? [
        '"Did you truly believe you could outrun my wrath, Chutiya?"',
        '"The throne belongs to me, and so does your fate, Chutiya!"',
        '"Your agile tricks mean nothing against the crown, Chutiya."',
      ]
    : [
        '"You were surrounded before you even took your first step, Chutiya."',
        '"The Royal Guard never permits escape."',
        '"Chutiya apprehended by royal decree."',
      ];

  const randomTaunt = taunts[Math.floor(Math.random() * taunts.length)];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-xl bg-stone-900 border border-red-900/80 shadow-[0_0_50px_rgba(220,38,38,0.3)] text-stone-100 flex flex-col items-center text-center">
        {/* Skull Threat Icon */}
        <div className="p-3.5 rounded-full bg-red-950/80 border border-red-700/60 text-red-500 mb-3 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
          <Skull className="w-8 h-8" />
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-red-500 mb-1">
          {isKing ? 'Chutiya Caught by King Gaurav!' : 'Chutiya Captured!'}
        </h2>

        {/* Killer details */}
        <div className="text-xs text-stone-400 font-mono mb-4">
          Fugitive <strong className="text-cyan-400">Chutiya</strong> brought down by <span className="text-red-400 font-bold">{stats.killerName}</span> ({stats.killerTitle})
        </div>

        {/* King / Guard Taunt */}
        <div className="w-full p-3 rounded-lg bg-stone-950/70 border border-stone-800 text-xs italic text-stone-300 mb-6">
          {randomTaunt}
        </div>

        {/* Performance Statistics Grid */}
        <div className="w-full grid grid-cols-2 gap-2.5 mb-6 text-left">
          <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800">
            <div className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">Survival Time</div>
            <div className="text-lg font-bold font-mono tabular-nums text-stone-200">
              {stats.elapsedTime.toFixed(1)}s
            </div>
          </div>

          <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800">
            <div className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">Closest Call</div>
            <div className="text-lg font-bold font-mono tabular-nums text-amber-400">
              {stats.closestProximity}m
            </div>
          </div>

          <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800">
            <div className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">Paces Fled</div>
            <div className="text-lg font-bold font-mono tabular-nums text-cyan-400">
              {stats.distanceTraveled}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800">
            <div className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">Enemies Slain</div>
            <div className="text-lg font-bold font-mono tabular-nums text-red-400">
              {stats.enemiesKilled || 0} / {stats.totalEnemies || 0}
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
            className="w-full sm:flex-1 py-3 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold tracking-wider uppercase text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again (Press R)</span>
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
          Press <kbd className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-200 border border-stone-700">R</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-200 border border-stone-700">Space</kbd> to retry instantly
        </div>
      </div>
    </div>
  );
};
