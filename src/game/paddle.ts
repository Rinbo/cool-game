import { GameObject, Position, Properties, PaddleProps } from './properties';

enum PaddleCollision {
  LEFT_WALL,
  RIGHT_WALL,
  NO_COLLISION
}

export default class Paddle implements GameObject {
  private canvasWidth: number;
  private width: number;
  private height: number;
  private hoverHeight: number;
  private color: string;
  private maxSpeed: number;
  private position: { x: number; y: number };
  private speed: number;

  constructor({ canvas, paddle }: Properties) {
    this.canvasWidth = canvas.width;

    this.width = paddle.width;
    this.height = paddle.height;
    this.hoverHeight = paddle.hoverHeight;
    this.color = paddle.color;

    this.maxSpeed = paddle.maxSpeed;
    this.speed = 0;

    this.position = {
      x: canvas.width / 2 - this.width / 2,
      y: canvas.height - this.height - this.hoverHeight
    };
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.position.x += this.speed;
    this.handlCollision();
  }

  getSpeed() {
    return this.speed;
  }

  moveLeft() {
    this.speed = -this.maxSpeed;
  }

  moveRight() {
    this.speed = this.maxSpeed;
  }

  stop() {
    this.speed = 0;
  }

  getPosition(): Position {
    return this.position;
  }

  getProps(): PaddleProps {
    return { width: this.width, height: this.height, hoverHeight: this.hoverHeight };
  }

  private getCollisionState(): PaddleCollision {
    if (this.position.x <= 0) return PaddleCollision.LEFT_WALL;
    if (this.position.x + this.width >= this.canvasWidth) return PaddleCollision.RIGHT_WALL;
    return PaddleCollision.NO_COLLISION;
  }

  private handlCollision() {
    const collision: PaddleCollision = this.getCollisionState();

    switch (collision) {
      case PaddleCollision.LEFT_WALL:
        this.position.x = 0;
        break;
      case PaddleCollision.RIGHT_WALL:
        this.position.x = this.canvasWidth - this.width;
        break;
      default:
    }
  }
}
