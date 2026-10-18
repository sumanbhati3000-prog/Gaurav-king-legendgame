import React from 'react';
import { Difficulty } from '../types/game';
import { Shield, Skull, Zap, Volume2, VolumeX, Play, Flame } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface TitleScreenProps {
  onStart: () => void;
  difficulty: Difficulty;
  onSelectDifficulty: (d: Difficulty) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenTutorial: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  difficulty,
  onSelectDifficulty,
  isMuted,
  onToggleMute,
  onOpenTutorial,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-10 select-none bg-stone-950 text-stone-100 overflow-y-auto">
      {/* Ambient background dungeon lighting / ember backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-red-950/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-cyan-950/25 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-amber-950/15 blur-3xl" />
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between text-xs font-mono text-stone-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="tracking-widest uppercase text-stone-300">Royal Castle Infiltration</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playButton();
              onOpenTutorial();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-stone-900 border border-stone-800 hover:border-cyan-500/50 text-stone-300 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <span className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-500/60 text-cyan-400 flex items-center justify-center font-bold text-[10px]">?</span>
            <span>Tutorial</span>
          </button>
          <button
            onClick={onToggleMute}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-stone-900 border border-stone-800 hover:border-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{isMuted ? 'Muted' : 'Audio On'}</span>
          </button>
        </div>
      </div>

      {/* Hero Centerpiece: Bespoke SVG Title Lockup */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto max-w-2xl">
        {/* Bespoke Royal Crown & Skull SVG Badge */}
        <div className="mb-4 relative">
          <svg className="w-24 h-24 drop-shadow-[0_0_25px_rgba(239,68,68,0.5)]" viewBox="0 0 100 100" fill="none">
            {/* Crown */}
            <path
              d="M20 65 L28 35 L42 48 L50 22 L58 48 L72 35 L80 65 Z"
              fill="#dc2626"
              stroke="#fbbf24"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Jewel points */}
            <circle cx="28" cy="35" r="3" fill="#fef08a" />
            <circle cx="50" cy="22" r="3.5" fill="#fef08a" />
            <circle cx="72" cy="35" r="3" fill="#fef08a" />
            <circle cx="50" cy="48" r="4" fill="#991b1b" stroke="#f59e0b" strokeWidth="1.5" />
            {/* Crown Rim Base */}
            <rect x="20" y="65" width="60" height="8" rx="2" fill="#b45309" stroke="#f59e0b" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Bespoke Title Lockup */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase mb-2">
          Escape From <span className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]">King Gaurav</span>
        </h1>

        <p className="text-sm sm:text-base text-stone-400 max-w-lg mb-8 leading-relaxed">
          Trapped in King Gaurav's royal red grounds. Play as <strong className="text-cyan-400">Chutiya</strong> — fire your combat gun to eliminate pursuers, beware of guards respawning at Gaurav's Palace, and slay the King or reach the exit portal!
        </p>

        {/* Threat dossier strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full mb-8 text-left">
          <div className="p-2.5 rounded-lg bg-stone-900/90 border border-red-900/50 flex items-start gap-2">
            <div className="p-1 rounded bg-red-950 text-red-400 mt-0.5">
              <Skull className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-red-300">King Gaurav</div>
              <div className="text-[10px] text-stone-400">5 HP · Crimson aura · Regicide boss</div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-stone-900/90 border border-amber-900/50 flex items-start gap-2">
            <div className="p-1 rounded bg-amber-950 text-amber-400 mt-0.5">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300">Gaurav's Palace</div>
              <div className="text-[10px] text-stone-400">Guards respawn continuously from palace dais</div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-stone-900/90 border border-yellow-900/50 flex items-start gap-2">
            <div className="p-1 rounded bg-yellow-950 text-amber-400 mt-0.5">
              <span className="text-xs">🔫</span>
            </div>
            <div>
              <div className="text-xs font-bold text-yellow-300">Chutiya's Gun</div>
              <div className="text-[10px] text-stone-400">Click / Space / F · 12 Ammo · Reload (R)</div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-stone-900/90 border border-cyan-900/50 flex items-start gap-2">
            <div className="p-1 rounded bg-cyan-950 text-cyan-400 mt-0.5">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-cyan-300">Exit Portal</div>
              <div className="text-[10px] text-stone-400">East sanctum · Escape to win</div>
            </div>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <span className="text-[11px] uppercase tracking-wider text-stone-400 font-mono">Select Difficulty</span>
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-stone-900 rounded-lg border border-stone-800">
            <button
              onClick={() => {
                soundManager.playButton();
                onSelectDifficulty('training');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                difficulty === 'training'
                  ? 'bg-amber-950 border border-amber-600/70 text-amber-200 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Training (Practice AI)
            </button>

            <button
              onClick={() => {
                soundManager.playButton();
                onSelectDifficulty('apprentice');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                difficulty === 'apprentice'
                  ? 'bg-stone-800 text-stone-100 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Apprentice
            </button>

            <button
              onClick={() => {
                soundManager.playButton();
                onSelectDifficulty('standard');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                difficulty === 'standard'
                  ? 'bg-red-950 border border-red-700/60 text-red-200 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Standard (Recommended)
            </button>

            <button
              onClick={() => {
                soundManager.playButton();
                onSelectDifficulty('royal_fury');
              }}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                difficulty === 'royal_fury'
                  ? 'bg-red-900 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Royal Fury
            </button>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              soundManager.playButton();
              onStart();
            }}
            className="group relative px-8 py-3.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold tracking-wider uppercase text-sm sm:text-base shadow-[0_0_25px_rgba(239,68,68,0.4)] transition-all duration-150 flex items-center gap-3 cursor-pointer active:scale-95"
          >
            <Play className="w-4 h-4 fill-current group-hover:translate-x-0.5 transition-transform" />
            <span>Start 3D Infiltration (Enter / Space)</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButton();
              onOpenTutorial();
            }}
            className="px-6 py-3.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-cyan-400/60 text-stone-200 hover:text-cyan-300 font-bold tracking-wider uppercase text-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <span className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-400 flex items-center justify-center font-bold text-[10px]">?</span>
            <span>How to Play</span>
          </button>
        </div>
      </div>

      {/* Flat Control Hint Line */}
      <div className="relative z-10 w-full text-center text-xs text-stone-400 font-mono py-2 border-t border-stone-800/80">
        <span>WASD Move</span>
        <span className="mx-2 text-stone-600">·</span>
        <span>Click / F Knife Attack</span>
        <span className="mx-2 text-stone-600">·</span>
        <span>Space Dash</span>
        <span className="mx-2 text-stone-600">·</span>
        <span>Esc Pause</span>
        <span className="mx-2 text-stone-600">·</span>
        <span>R Reset</span>
      </div>
    </div>
  );
};
