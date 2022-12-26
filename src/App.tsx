import React from 'react';
import './App.css';
import Game from './game/game';
import { properties } from './game/properties';

const FPS = 60;

function App() {
  const game = React.useRef<Game>();
  const [width, setWidth] = React.useState<number>();
  const [height, setHeight] = React.useState<number>();

  React.useEffect(() => {
    const canvas = document.getElementById('game-board') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    setCanvasSizeProperties();

    game.current = new Game(ctx);

    const interval = setInterval(() => {
      gameLoop();
    }, 1000 / FPS);

    return () => clearInterval(interval);
  }, []);

  console.log("I'm re-rerendering");

  const setCanvasSizeProperties = (): void => {
    const { width: maxWidth, height: maxHeight, padding } = properties.canvas;

    const canvasWidth = Math.min(window.innerWidth - padding, maxWidth);
    const canvasHeight = Math.min(window.innerHeight - padding, maxHeight);
    setWidth(canvasWidth);
    setHeight(canvasHeight);
    properties.canvas.width = canvasWidth;
    properties.canvas.height = canvasHeight;
  };

  window.onresize = setCanvasSizeProperties;

  const gameLoop = React.useCallback((): void => {
    const currentGame = game.current!;
    currentGame.tick();
  }, []);

  return (
    <div>
      <canvas style={{ border: '1px solid grey', borderRadius: 10 }} id="game-board" width={width} height={height} />
    </div>
  );
}

export default App;
