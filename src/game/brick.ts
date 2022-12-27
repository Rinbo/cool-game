import { GameObject, Position, Size } from './properties';
import Game from './game';
import Ball from './ball';

export default class Brick implements GameObject {
  private game: Game;
  private color: string;
  private size: Size;
  private position: Position;
  private shouldDraw: boolean;

  constructor(game: Game, position: Position, size: Size, color: string, shouldDraw: boolean) {
    this.game = game;
    this.color = color;
    this.size = size;
    this.position = position;
    this.shouldDraw = shouldDraw;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.shouldDraw) {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.position.x, this.position.y, this.size.width, this.size.height);
      ctx.strokeStyle = '#000';
      ctx.strokeRect(this.position.x, this.position.y, this.size.width, this.size.height);
    }
  }

  update() {
    if (this.collisionDetected()) {
      this.game.getBall().reverseYVelocity();
      this.game.scorePoint();
      this.shouldDraw = false;
    }
  }

  isVisable(): boolean {
    return this.shouldDraw;
  }

  private collisionDetected(): boolean {
    const ball: Ball = this.game.getBall();

    const { x: ballX, y: ballY }: Position = ball.getPosition();
    const ballRadius: number = ball.getRadius();

    const { x: brickX, y: brickY }: Position = this.position;
    const { width: brickWidth, height: brickHeight }: Size = this.size;

    let bottomOfBall = ballY + ballRadius;
    let topOfBall = ballY;

    let topOfBrick = brickY;
    let leftSideOfBrick = brickX;
    let rightSideOfBrick = brickX + brickWidth;
    let bottomOfBrick = brickY + brickHeight;

    return bottomOfBall >= topOfBrick && topOfBall <= bottomOfBrick && ballX + ballRadius >= leftSideOfBrick && ballX - ballRadius <= rightSideOfBrick;
  }
}
