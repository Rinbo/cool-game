import React from 'react';
import './App.css';
import Game from './game/game';
import { properties } from './game/properties';

const MAX_FPS = 60;
const TIME_STEP = 1000 / MAX_FPS;

function App() {
  const game = React.useRef<Game>();
  const lastTimestamp = React.useRef<number>(0);
  const tick = React.useRef<number>(0);
  const [lives, setLives] = React.useState<number>(properties.game.lives);
  const [level, setLevel] = React.useState<number>(1);
  const { width, height } = properties.canvas;

  React.useEffect(() => {
    const canvas = document.getElementById('game-board') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    game.current = new Game(ctx, properties);
    requestAnimationFrame(gameLoop);
  }, []);

  console.log("I'm re-rerendering");

  function executeTick() {
    const currentGame = game.current!;
    currentGame.tick();
    setLives(currentGame.getLives());
    setLevel(currentGame.getLevel());
  }

  const gameLoop = React.useCallback((timestamp: number): void => {
    requestAnimationFrame(gameLoop);

    if (timestamp - lastTimestamp.current < TIME_STEP) return;

    executeTick();
    tick.current = tick.current + 1;
    lastTimestamp.current = timestamp;
  }, []);

  return (
    <div className="App">
      <div>Lives: {lives}</div>
      <div>Level: {level}</div>
      <canvas style={{ border: '1px solid grey', borderRadius: 10 }} id="game-board" width={width} height={height} />
    </div>
  );
}

export default App;
