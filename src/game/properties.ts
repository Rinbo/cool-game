import { GameState } from './game';
export const properties = {
  game: {
    lives: 3,
    maxLevel: 20,
    bricksPerRow: 8,
    rows: 4,
    brickHeightRatio: 1 / 20, // as percentage of canvas height
    brickTopRowHeight: 1 / 4, // as a percentage of canvas height
    ballStartVelocity: {
      x: 8,
      y: -8
    }
  },
  canvas: {
    width: 800,
    height: 600,
    color: '#050505',
    padding: 8
  },
  paddle: {
    color: '#0ff',
    width: 150,
    height: 20,
    hoverHeight: 10,
    maxSpeed: 16,
    minWidth: 60,
    levelDecrementValue: 20
  },
  ball: {
    color: '#fff',
    radius: 10,
    position: {
      x: 50,
      y: 300
    }
  },
  brick: {
    color: '#f00',
    width: 80,
    height: 20
  }
};

export type Properties = typeof properties;

export type Position = { x: number; y: number };
export type Size = { width: number; height: number };
export type PaddleProps = { hoverHeight: number } & Size;
export type Velocity = { x: number; y: number };

export type StateTranstion = (newState: GameState) => void;

export interface GameObject {
  draw: (ctx: CanvasRenderingContext2D) => void;
  update: () => void;
}
