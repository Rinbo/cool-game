import React from 'react';
import './App.css';
import Game from './game/game';
import { properties } from './game/properties';

function App() {
  const game = React.useRef<Game>();
  const tick = React.useRef<number>(0);
  const [lives, setLives] = React.useState<number>(3);
  const { width, height } = properties.canvas;

  React.useEffect(() => {
    const canvas = document.getElementById('game-board') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    game.current = new Game(ctx, properties);
    requestAnimationFrame(gameLoop);
  }, []);

  const gameLoop = React.useCallback((timestamp: number): void => {
    tick.current = timestamp;

    game.current!.tick();

    requestAnimationFrame(gameLoop);
  }, []);

  console.log("I'm rerendering");

  return (
    <div className="App">
      <div>Lives: {lives}</div>
      <canvas style={{ border: '1px solid grey', borderRadius: 10 }} id="game-board" width={width} height={height} />
    </div>
  );
}

export default App;
