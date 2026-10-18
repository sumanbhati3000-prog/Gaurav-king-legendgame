import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, Difficulty, GameStats } from './types/game';
import { TitleScreen } from './components/TitleScreen';
import { GameCanvas3D } from './components/GameCanvas3D';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { PauseModal } from './components/PauseModal';
import { TutorialModal } from './components/TutorialModal';
import { VirtualControls } from './components/VirtualControls';
import { soundManager } from './audio/soundManager';

export default function App() {
  const [status, setStatus] = useState<GameStatus>('TITLE');
  const [difficulty, setDifficulty] = useState<Difficulty>('standard');
  const [stats, setStats] = useState<GameStats | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getIsMuted());
  const [matchSeed, setMatchSeed] = useState<number>(0);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);

  // Virtual mobile controls
  const [virtualInput, setVirtualInput] = useState<{ x: number; y: number; dash: boolean }>({
    x: 0,
    y: 0,
    dash: false,
  });

  const mobileAttackRef = useRef<(() => void) | null>(null);

  const handleToggleMute = useCallback(() => {
    const nextMuted = soundManager.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  const handleStartGame = useCallback(() => {
    setShowTutorial(false);
    setMatchSeed((prev) => prev + 1);
    setStatus('PLAYING');
  }, []);

  const handleStartTraining = useCallback(() => {
    setDifficulty('training');
    setShowTutorial(false);
    setMatchSeed((prev) => prev + 1);
    setStatus('PLAYING');
  }, []);

  const handleRestart = useCallback(() => {
    setMatchSeed((prev) => prev + 1);
    setStatus('PLAYING');
  }, []);

  const handleGameOver = useCallback((finalStats: GameStats) => {
    setStats(finalStats);
    setStatus('GAME_OVER');
  }, []);

  const handleVictory = useCallback((finalStats: GameStats) => {
    setStats(finalStats);
    setStatus('VICTORY');
  }, []);

  const handlePause = useCallback(() => {
    setStatus('PAUSED');
  }, []);

  const handleResume = useCallback(() => {
    setStatus('PLAYING');
  }, []);

  const handleReturnTitle = useCallback(() => {
    setShowTutorial(false);
    setStatus('TITLE');
  }, []);

  // Global Key Handler for quick restart (R), Pause (Escape), and Start (Enter/Space on title)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to pause/resume
      if (e.key === 'Escape') {
        if (showTutorial) {
          setShowTutorial(false);
          return;
        }
        if (status === 'PLAYING') {
          handlePause();
        } else if (status === 'PAUSED') {
          handleResume();
        }
      }

      // R key to restart match
      if (e.key.toLowerCase() === 'r' && !showTutorial) {
        if (status === 'GAME_OVER' || status === 'VICTORY' || status === 'PAUSED' || status === 'PLAYING') {
          soundManager.playButton();
          handleRestart();
        }
      }

      // Space or Enter on Title Screen
      if (status === 'TITLE' && !showTutorial && (e.code === 'Space' || e.code === 'Enter')) {
        soundManager.playButton();
        handleStartGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, showTutorial, handlePause, handleResume, handleRestart, handleStartGame]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 font-sans select-none">
      {status === 'TITLE' ? (
        <TitleScreen
          onStart={handleStartGame}
          difficulty={difficulty}
          onSelectDifficulty={setDifficulty}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenTutorial={() => setShowTutorial(true)}
        />
      ) : (
        <>
          {/* Main 60fps 3D Simulation Canvas */}
          <GameCanvas3D
            key={matchSeed}
            difficulty={difficulty}
            status={status}
            onGameOver={handleGameOver}
            onVictory={handleVictory}
            onPause={handlePause}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            virtualInput={virtualInput}
            onMobileAttackRef={mobileAttackRef}
          />

          {/* Virtual Mobile Joystick, Knife Attack and Dash Buttons */}
          {status === 'PLAYING' && (
            <VirtualControls
              onVectorChange={(vec) => setVirtualInput((prev) => ({ ...prev, x: vec.x, y: vec.y }))}
              onDash={(active) => setVirtualInput((prev) => ({ ...prev, dash: active }))}
              onAttack={() => {
                if (mobileAttackRef.current) {
                  mobileAttackRef.current();
                }
              }}
            />
          )}

          {/* Pause Modal */}
          {status === 'PAUSED' && (
            <PauseModal
              onResume={handleResume}
              onRestart={handleRestart}
              onReturnTitle={handleReturnTitle}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              onOpenTutorial={() => setShowTutorial(true)}
            />
          )}

          {/* Defeat Modal */}
          {status === 'GAME_OVER' && stats && (
            <GameOverModal
              stats={stats}
              onRestart={handleRestart}
              onReturnTitle={handleReturnTitle}
            />
          )}

          {/* Victory Modal */}
          {status === 'VICTORY' && stats && (
            <VictoryModal
              stats={stats}
              onRestart={handleRestart}
              onReturnTitle={handleReturnTitle}
            />
          )}
        </>
      )}

      {/* Tutorial / Field Guide Modal */}
      {showTutorial && (
        <TutorialModal
          onClose={() => setShowTutorial(false)}
          onStartTraining={handleStartTraining}
          onStartGame={handleStartGame}
        />
      )}
    </div>
  );
}
