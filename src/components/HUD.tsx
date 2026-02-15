interface HUDProps {
  score: number;
  status: 'idle' | 'playing';
}

export function HUD({ score, status }: HUDProps) {
  return (
    <div className="hud">
      {status === 'playing' && (
        <div className="score">Pancakes: {score}</div>
      )}
      {status === 'idle' && (
        <div className="overlay">
          <h1 className="title">Pancake Catcher!</h1>
          <p className="subtitle">Press Space to Start</p>
          <p className="controls">Use arrow keys to move</p>
        </div>
      )}
    </div>
  );
}
