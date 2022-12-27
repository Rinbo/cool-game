import Brick from './brick';
import Game from './game';
import { properties } from './properties';

const COLORS = ['#aaa', '#0a0', '#00a', '#a0a', '#a00', '#aa0', '#0aa'];

const range = (upperLimit: number) => {
  return [...Array(upperLimit).keys()];
};

const getColor = (level: number) => {
  return COLORS[level % COLORS.length];
};

const createLevelDesign = (): number[][] => {
  const { bricksPerRow, rows } = properties.game;

  return range(rows).map(_ => range(bricksPerRow).map(_ => Math.round(Math.random())));
};

export const createLevel = (game: Game, level: number): Array<Brick> => {
  const { width: canvasWidth, height: canvasHeight } = properties.canvas;
  const { bricksPerRow, brickHeightRatio, brickTopRowHeight } = properties.game;
  const baseHeight = canvasHeight * brickTopRowHeight;
  const brickHeight = canvasHeight * brickHeightRatio;
  const brickWidth = canvasWidth / bricksPerRow;

  return createLevelDesign().flatMap((row: number[], outerIndex: number) =>
    row.map(
      (shouldDraw, index) =>
        new Brick(
          game,
          { x: index * brickWidth, y: baseHeight + outerIndex * brickHeight },
          { width: brickWidth, height: brickHeight },
          getColor(level),
          shouldDraw === 1
        )
    )
  );
};
