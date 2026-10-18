import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onReturnTitle: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenTutorial: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onReturnTitle,
  isMuted,
  onToggleMute,
  onOpenTutorial,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="relative w-full max-w-sm p-6 rounded-xl bg-stone-900 border border-stone-800 shadow-2xl text-stone-100 flex flex-col items-center text-center">
        <h2 className="text-xl font-bold uppercase tracking-wider text-stone-200 mb-1">
          Tactical Pause
        </h2>
        <p className="text-xs text-stone-400 font-mono mb-6">
          King Gaurav and his royal forces are halted
        </p>

        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={() => {
              soundManager.playButton();
              onResume();
            }}
            className="w-full py-3 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold tracking-wider uppercase text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume (Esc)</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButton();
              onOpenTutorial();
            }}
            className="w-full py-2.5 px-4 rounded-lg bg-stone-800 hover:bg-stone-700 text-cyan-300 text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span className="w-3.5 h-3.5 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-400 flex items-center justify-center font-bold text-[9px]">?</span>
            <span>How to Play / Tutorial</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButton();
              onRestart();
            }}
            className="w-full py-2.5 px-4 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Match (R)</span>
          </button>

          <button
            onClick={onToggleMute}
            className="w-full py-2.5 px-4 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            <span>{isMuted ? 'Unmute Audio' : 'Mute Audio'}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButton();
              onReturnTitle();
            }}
            className="w-full py-2.5 px-4 rounded-lg border border-stone-800 hover:bg-stone-800/80 text-stone-400 hover:text-stone-200 text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
