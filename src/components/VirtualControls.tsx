import React, { useRef, useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

interface VirtualControlsProps {
  onVectorChange: (vector: { x: number; y: number }) => void;
  onDash: (active: boolean) => void;
  onAttack: () => void;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onVectorChange,
  onDash,
  onAttack,
}) => {
  const joystickRef = useRef<HTMLDivElement | null>(null);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchIdRef = useRef<number | null>(null);

  const radius = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsDragging(true);
    handleTouchMove(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!joystickRef.current) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        const rect = joystickRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = touch.clientX - centerX;
        const dy = touch.clientY - centerY;
        const dist = Math.hypot(dx, dy);

        if (dist === 0) {
          setStickPos({ x: 0, y: 0 });
          onVectorChange({ x: 0, y: 0 });
        } else {
          const clampedDist = Math.min(radius, dist);
          const nx = (dx / dist) * clampedDist;
          const ny = (dy / dist) * clampedDist;
          setStickPos({ x: nx, y: ny });
          onVectorChange({ x: dx / dist, y: dy / dist });
        }
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setIsDragging(false);
        setStickPos({ x: 0, y: 0 });
        onVectorChange({ x: 0, y: 0 });
        break;
      }
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none touch-none flex justify-between items-end p-6 md:hidden">
      {/* Virtual Joystick */}
      <div
        ref={joystickRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="w-28 h-28 rounded-full bg-stone-900/60 border border-stone-700/60 backdrop-blur-sm pointer-events-auto relative flex items-center justify-center shadow-lg"
      >
        <div
          className="w-12 h-12 rounded-full bg-cyan-500/80 border-2 border-cyan-300 shadow-[0_0_10px_#38bdf8] pointer-events-none transition-transform duration-75"
          style={{
            transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
          }}
        />
      </div>

      {/* Action Buttons: Knife & Dash */}
      <div className="flex items-center gap-3">
        {/* Gun Fire Button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onAttack();
          }}
          className="w-16 h-16 rounded-full bg-amber-600/90 active:bg-amber-500 border-2 border-amber-300 text-white shadow-[0_0_20px_rgba(245,158,11,0.5)] pointer-events-auto flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all cursor-pointer"
        >
          <span className="text-base">🔫</span>
          <span className="text-[9px] font-bold tracking-wider uppercase">FIRE</span>
        </button>

        {/* Virtual Dash Button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onDash(true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onDash(false);
          }}
          className="w-20 h-20 rounded-full bg-red-600/80 active:bg-red-500 border-2 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] pointer-events-auto flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
        >
          <Zap className="w-6 h-6 fill-current text-white" />
          <span className="text-[10px] font-bold tracking-wider uppercase">DASH</span>
        </button>
      </div>
    </div>
  );
};

