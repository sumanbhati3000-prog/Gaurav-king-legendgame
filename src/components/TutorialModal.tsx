import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Zap,
  Skull,
  Shield,
  Layers,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface TutorialModalProps {
  onClose: () => void;
  onStartTraining?: () => void;
  onStartGame?: () => void;
}

interface TutorialSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  keyPoints: { label: string; text: string }[];
  icon: React.ReactNode;
  accentColor: string;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  onClose,
  onStartTraining,
  onStartGame,
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const slides: TutorialSlide[] = [
    {
      id: 'movement',
      badge: 'Step 1 of 6 · Chutiya\'s Agility',
      title: 'Play as Chutiya — 3D Courtyard Agility',
      subtitle: 'Smooth 360-degree evasion across the red castle grounds',
      description:
        'You play as Chutiya, an agile fugitive breaking through King Gaurav\'s royal red castle courtyard in full 3D. You are swift on your feet, but fragile: a single physical touch from King Gaurav or his guards results in capture!',
      keyPoints: [
        { label: 'Controls', text: 'Use W, A, S, D or Arrow Keys to run in 360 degrees.' },
        { label: 'Rule of Capture', text: 'Zero margin for error — dodge pursuers to keep Chutiya free.' },
        { label: 'Red Courtyard', text: 'Use the pillars and throne room layout to break pursuer sightlines.' },
      ],
      icon: <Compass className="w-5 h-5 text-cyan-400" />,
      accentColor: '#38bdf8',
    },
    {
      id: 'dash',
      badge: 'Step 2 of 6 · Agility Tech',
      title: 'Tactical Dash & Stamina Management',
      subtitle: 'Instant speed burst to slip through enemy encirclement',
      description:
        'When King Gaurav or an elite guard corners Chutiya against a wall, trigger Dash for an explosive speed burst. Dash consumes stamina, which recharges automatically when walking.',
      keyPoints: [
        { label: 'Trigger', text: 'Press Shift (or on-screen DASH button on touch devices).' },
        { label: 'Stamina Cost', text: 'Each dash costs 32% stamina. Watch the top-left cyan gauge.' },
        { label: 'Timing', text: 'Save your dash for evading King Gaurav\'s bursts or tight corners.' },
      ],
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      accentColor: '#fbbf24',
    },
    {
      id: 'gun',
      badge: 'Step 3 of 6 · Combat Gun',
      title: 'Chutiya\'s Combat Gun & Bullet Firing',
      subtitle: 'Fire high-velocity projectiles to gun down pursuers',
      description:
        'Chutiya carries a high-power combat gun! Aim with your mouse cursor and click Left Mouse, or press Space / F / E to shoot high-velocity bullets. Bullets damage enemies, knock them back, and eliminate guards.',
      keyPoints: [
        { label: 'Trigger Fire', text: 'Left Click, Space, F, or E (or on-screen FIRE button).' },
        { label: '12-Round Mag', text: 'Chutiya has 12 rounds per clip. Auto-reloads when empty.' },
        { label: 'Manual Reload', text: 'Press R key anytime during combat to reload your magazine.' },
      ],
      icon: <span className="text-base">🔫</span>,
      accentColor: '#eab308',
    },
    {
      id: 'palace',
      badge: 'Step 4 of 6 · Palace Respawn Hazard',
      title: 'Gaurav\'s Palace & Enemy Respawns',
      subtitle: 'Defeated guards continuously respawn from the palace',
      description:
        'Killing a guard buys you valuable time, but reinforcements are endless! Any guard, scout, or brute slain by Chutiya will respawn after a short countdown directly at Gaurav\'s Palace near the central throne dais.',
      keyPoints: [
        { label: 'Palace Spawns', text: 'Enemies materialize from Gaurav\'s Palace sanctum with a royal warp chime.' },
        { label: 'Temporary Breathing Room', text: 'Gun down pursuers to clear your path, then sprint before they re-emerge!' },
        { label: 'Palace Alarm', text: 'Look out for on-screen alerts warning of newly respawned guards.' },
      ],
      icon: <Shield className="w-5 h-5 text-amber-500" />,
      accentColor: '#f97316',
    },
    {
      id: 'king',
      badge: 'Step 5 of 6 · The Sovereign Boss',
      title: 'King Gaurav & Regicide Victory',
      subtitle: 'The primary predator with a 5 HP boss bar',
      description:
        'King Gaurav hunts Chutiya relentlessly! He has a visible boss health bar at the top of the screen. He moves faster than normal guards and surges with Royal Rage bursts. Chutiya can gun him down for total Regicide Victory!',
      keyPoints: [
        { label: 'Boss Health', text: 'King Gaurav has 5 HP. Pump bullets into him to whittle his health.' },
        { label: 'Royal Rage Burst', text: 'Gaurav roars with a screen shake, surging with +32% speed!' },
        { label: 'Regicide Win', text: 'Slaying King Gaurav instantly wins the match with a glorious Regicide rating!' },
      ],
      icon: <Skull className="w-5 h-5 text-red-500" />,
      accentColor: '#ef4444',
    },
    {
      id: 'portal',
      badge: 'Step 6 of 6 · Victory Paths',
      title: 'Exit Portal or Regicide Victory',
      subtitle: 'Two distinct ways for Chutiya to achieve victory',
      description:
        'Chutiya has two ways to win: either reach the cyan Exit Portal on the east side using your compass, OR gun down King Gaurav directly to claim a triumphant Regicide victory!',
      keyPoints: [
        { label: 'Portal Escape', text: 'Weave past enemies and enter the cyan vortex in the East Sanctum.' },
        { label: 'Regicide Slaying', text: 'Use Chutiya\'s gun to deplete King Gaurav\'s 5 HP to topple the tyrant.' },
        { label: 'Rankings', text: 'Earn S-Rank by escaping fast or eliminating pursuers for maximum score.' },
      ],
      icon: <Sparkles className="w-5 h-5 text-cyan-300" />,
      accentColor: '#38bdf8',
    },
  ];

  // Animated visual preview on canvas for the active slide
  useEffect(() => {
    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.03;
      const canvas = previewCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background grid
      ctx.fillStyle = '#111217';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = '#1e2129';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw custom animated scenario per slide
      if (currentSlide === 0) {
        // Slide 1: Player moving along a curved path around a pillar
        const pillarX = w * 0.5;
        const pillarY = h * 0.5;
        // Pillar
        ctx.fillStyle = '#292524';
        ctx.fillRect(pillarX - 22, pillarY - 22, 44, 44);
        ctx.strokeStyle = '#78716c';
        ctx.lineWidth = 2;
        ctx.strokeRect(pillarX - 18, pillarY - 18, 36, 36);

        // Player orbiting around the pillar
        const px = pillarX + Math.cos(t * 1.5) * 65;
        const py = pillarY + Math.sin(t * 1.5) * 55;

        // Player trail
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pillarX, pillarY, 60, t * 1.5 - 1.2, t * 1.5);
        ctx.stroke();

        // Player dot
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(px, py, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Direction glint
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(px + 4, py, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#38bdf8';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('YOU (FUGITIVE)', px, py - 20);
      } else if (currentSlide === 1) {
        // Slide 2: Dash demonstration
        const cycle = (t * 0.8) % 3;
        const isDashing = cycle > 1.2 && cycle < 1.9;
        const dashProgress = isDashing ? (cycle - 1.2) / 0.7 : cycle < 1.2 ? cycle / 1.2 * 0.3 : 0.7 + (cycle - 1.9) / 1.1 * 0.3;
        const px = 40 + dashProgress * (w - 80);
        const py = h * 0.5;

        // Ghost trails if dashing
        if (isDashing) {
          for (let i = 1; i <= 3; i++) {
            ctx.fillStyle = `rgba(56, 189, 248, ${0.4 - i * 0.1})`;
            ctx.beginPath();
            ctx.arc(px - i * 16, py, 13, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Pursuer chasing behind
        const chaserX = px - (isDashing ? 95 : 55);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(chaserX, py, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fecaca';
        ctx.stroke();

        // Player
        ctx.fillStyle = isDashing ? '#38bdf8' : '#0284c7';
        ctx.shadowColor = isDashing ? '#38bdf8' : 'transparent';
        ctx.shadowBlur = isDashing ? 15 : 0;
        ctx.beginPath();
        ctx.arc(px, py, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(isDashing ? '⚡ DASH ACTIVE (+110% SPD)' : 'WALKING (RECHARGING)', w * 0.5, h - 20);
      } else if (currentSlide === 2) {
        // Slide 3: King Gaurav with Crimson Aura and roar shockwave
        const kx = w * 0.5;
        const ky = h * 0.5;
        const pulse = Math.sin(t * 3) * 8;

        // Crimson radiant aura
        const grad = ctx.createRadialGradient(kx, ky, 10, kx, ky, 55 + pulse);
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.7)');
        grad.addColorStop(0.7, 'rgba(185, 28, 28, 0.3)');
        grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(kx, ky, 55 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Shockwave ripple
        const ripple = (t * 40) % 75;
        ctx.strokeStyle = `rgba(239, 68, 68, ${Math.max(0, 1 - ripple / 75)})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(kx, ky, ripple + 20, 0, Math.PI * 2);
        ctx.stroke();

        // King Body
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(kx, ky, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fecaca';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Crown
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.moveTo(kx - 10, ky - 8);
        ctx.lineTo(kx - 14, ky - 20);
        ctx.lineTo(kx - 5, ky - 13);
        ctx.lineTo(kx, ky - 22);
        ctx.lineTo(kx + 5, ky - 13);
        ctx.lineTo(kx + 14, ky - 20);
        ctx.lineTo(kx + 10, ky - 8);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('KING GAURAV · HIGH VELOCITY', kx, ky + 45);
      } else if (currentSlide === 3) {
        // Slide 4: 4 Guards pinching player
        const cx = w * 0.5;
        const cy = h * 0.5;

        // Player in center
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e0f2fe';
        ctx.stroke();

        // 4 corner guards closing in
        const guardOffset = 65 + Math.sin(t * 2) * 10;
        const guards = [
          { x: cx - guardOffset, y: cy - guardOffset, name: 'Aegis (NW)' },
          { x: cx - guardOffset, y: cy + guardOffset, name: 'Brutus (SW)' },
          { x: cx + guardOffset, y: cy - guardOffset, name: 'Valerie (NE)' },
          { x: cx + guardOffset, y: cy + guardOffset, name: 'Gideon (SE)' },
        ];

        guards.forEach((g) => {
          // Pinch vector
          ctx.strokeStyle = 'rgba(249, 115, 22, 0.4)';
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(g.x, g.y);
          ctx.lineTo(cx, cy);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(g.x, g.y, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fed7aa';
          ctx.lineWidth = 2;
          ctx.stroke();
        });

        ctx.fillStyle = '#f97316';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('4-CORNER PINCH AI: CUT OFF ESCAPE ANGLES', cx, h - 14);
      } else if (currentSlide === 4) {
        // Slide 5: Cyan Exit Portal
        const px = w * 0.5;
        const py = h * 0.5;

        // Swirling vortex rings
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(t);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, 36, 0, Math.PI * 2);
        ctx.stroke();

        ctx.rotate(-t * 1.8);
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Core light
        const grad = ctx.createRadialGradient(px, py, 5, px, py, 50);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#38bdf8');
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, 50, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('EXIT GATE · REACH TO SURVIVE', px, py + 52);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [currentSlide]);

  // Global key bindings for tutorial modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'd') {
        setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        setCurrentSlide((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, onClose]);

  const active = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-xl shadow-2xl overflow-hidden flex flex-col text-stone-100 max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-stone-900 border border-stone-800">
              {active.icon}
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-stone-400">
                {active.badge}
              </div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Survival Field Guide & Tutorial
              </h3>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playButton();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5">
          {/* Animated Mini Preview Canvas */}
          <div className="w-full h-36 rounded-lg border border-stone-800 bg-stone-950 overflow-hidden relative shadow-inner">
            <canvas
              ref={previewCanvasRef}
              width={560}
              height={144}
              className="w-full h-full block"
            />
          </div>

          {/* Title & Description */}
          <div>
            <h4 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <span>{active.title}</span>
            </h4>
            <div className="text-xs text-stone-400 font-mono mb-2">{active.subtitle}</div>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {active.description}
            </p>
          </div>

          {/* Key Tactical Points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {active.keyPoints.map((pt, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-stone-950/80 border border-stone-800 text-left">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 mb-0.5">
                  {pt.label}
                </div>
                <div className="text-xs text-stone-300 leading-snug">
                  {pt.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-stone-800 bg-stone-950/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Step Indicators */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  soundManager.playButton();
                  setCurrentSlide(idx);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx
                    ? 'w-6 bg-cyan-400 shadow-[0_0_8px_#38bdf8]'
                    : 'w-2 bg-stone-700 hover:bg-stone-500'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentSlide > 0 && (
              <button
                onClick={() => {
                  soundManager.playButton();
                  setCurrentSlide((prev) => Math.max(0, prev - 1));
                }}
                className="px-3 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
            )}

            {currentSlide < slides.length - 1 ? (
              <button
                onClick={() => {
                  soundManager.playButton();
                  setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1));
                }}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold tracking-wide flex items-center gap-1 transition-colors cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.3)]"
              >
                <span>Next Guide</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {onStartTraining && (
                  <button
                    onClick={() => {
                      soundManager.playButton();
                      onStartTraining();
                    }}
                    className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold tracking-wide flex items-center gap-1.5 transition-colors cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Practice Run (Slow AI)</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    soundManager.playButton();
                    if (onStartGame) onStartGame();
                    else onClose();
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold tracking-wide flex items-center gap-1.5 transition-colors cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Infiltration</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
