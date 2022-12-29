import React from 'react';
import './App.css';
import Game from './game/game';
import { properties } from './game/properties';
import { useWindowSize } from './hooks/useWindowSize';

const FPS = 60;

function App() {
  const game = React.useRef<Game>();
  const [width, height] = useWindowSize();

  React.useEffect(() => {
    const canvas = document.getElementById('game-board') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    game.current = new Game(ctx, isTouchEnabled());

    const interval = setInterval(() => gameLoop(), 1000 / FPS);

    return () => clearInterval(interval);
  }, []);

  console.log("I'm re-rerendering");

  React.useEffect(() => {
    properties.canvas.width = width;
    properties.canvas.height = height;

    game.current?.restore();
  }, [width, height]);

  function isTouchEnabled() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  const gameLoop = React.useCallback((): void => game.current!.tick(), []);

  const paddleRight = () => game.current!.getPaddle().moveRight();
  const paddleLeft = () => game.current!.getPaddle().moveLeft();
  const paddleStop = () => game.current!.getPaddle().stop();
  const startGame = () => game.current!.init();

  return (
    <div>
      <canvas style={{ border: '1px solid grey', borderRadius: 10 }} id="game-board" width={width} height={height} />
      <div style={{ position: 'absolute', left: 0, bottom: 0, width: '50vw', height: '30vh' }} onTouchStart={paddleLeft} onTouchEnd={paddleStop} />
      <div style={{ position: 'absolute', right: 0, bottom: 0, width: '50vw', height: '30vh' }} onTouchStart={paddleRight} onTouchEnd={paddleStop} />
      <div style={{ position: 'absolute', right: 0, top: '40vh', width: '100vw', height: '20vh' }} onTouchStart={startGame} />
    </div>
  );
}

export default App;
