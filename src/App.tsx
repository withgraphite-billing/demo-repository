import { useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';

export function App() {
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<'idle' | 'playing'>('idle');

  return (
    <div className="game-container">
      <GameCanvas onScoreChange={setScore} onStatusChange={setStatus} />
      <HUD score={score} status={status} />
    </div>
  );
}
