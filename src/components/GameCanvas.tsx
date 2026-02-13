import { useEffect, useRef } from 'react';
import { GameEngine } from '../game/GameEngine';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../game/types';

interface GameCanvasProps {
  onScoreChange: (score: number) => void;
  onStatusChange: (status: 'idle' | 'playing') => void;
}

export function GameCanvas({ onScoreChange, onStatusChange }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onScoreChange, onStatusChange });
  callbacksRef.current = { onScoreChange, onStatusChange };

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, (score, status) => {
      callbacksRef.current.onScoreChange(score);
      callbacksRef.current.onStatusChange(status);
    });

    engine.init();
    return () => engine.destroy();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="game-canvas"
    />
  );
}
