import React from 'react';
import './App.css';
import Game from './game/game';
import { properties } from './game/properties';

const FPS = 60;

function App() {
  const game = React.useRef<Game>();
  const [lives, setLives] = React.useState<number>(properties.game.lives);
  const [level, setLevel] = React.useState<number>(1);
  const { width, height } = properties.canvas;

  React.useEffect(() => {
    const canvas = document.getElementById('game-board') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    game.current = new Game(ctx);

    const interval = setInterval(() => {
      gameLoop();
    }, 1000 / FPS);

    return () => clearInterval(interval);
  }, []);

  console.log("I'm re-rerendering");

  const gameLoop = React.useCallback((): void => {
    const currentGame = game.current!;
    currentGame.tick();
    setLives(currentGame.getLives());
    setLevel(currentGame.getLevel());
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
