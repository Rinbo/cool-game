import Game, { GameState } from './game';
import Paddle from './paddle';
import { Velocity, Position, GameObject, Size, PaddleProps, Properties } from './properties';

enum BallCollision {
  CEILING,
  FLOOR,
  LEFT_WALL,
  RIGHT_WALL,
  TOP_OF_PADDLE,
  NO_COLLISION
}

// TODO add rotational energy
export default class Ball implements GameObject {
  private canvas: Size;
  private color: string;
  private paddle: Paddle;
  private position: Position;
  private radius: number;
  private velocity: Velocity;
  private missCount: number;
  private game: Game;

  constructor(paddle: Paddle, game: Game) {
    const props: Properties = game.getProps();

    this.canvas = props.canvas;
    this.color = props.ball.color;
    this.paddle = paddle;
    this.position = { ...props.ball.position };
    this.radius = props.ball.radius;
    this.velocity = { ...props.game.ballStartVelocity };
    this.missCount = 0;
    this.game = game;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.drawBall(ctx);
  }

  update(): void {
    this.handlCollision();

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  reset(): void {
    const { game, ball } = this.game.getProps();

    this.position = { ...ball.position };
    this.velocity = { ...game.ballStartVelocity };
  }

  reverseYVelocity(): void {
    this.velocity.y = this.velocity.y * -1;
  }

  reverseXVelocity(): void {
    this.velocity.x = this.velocity.x * -1;
  }

  getPosition(): Position {
    return this.position;
  }

  getRadius(): number {
    return this.radius;
  }

  getMissCount(): number {
    return this.missCount;
  }

  private getCollisionState(): BallCollision {
    if (this.getTopOfBallY() <= 0) return BallCollision.CEILING;
    if (this.getBottomOfBallY() >= this.canvas.height) return BallCollision.FLOOR;
    if (this.getBallLeftX() <= 0) return BallCollision.LEFT_WALL;
    if (this.getBallRightX() >= this.canvas.width) return BallCollision.RIGHT_WALL;
    if (this.isPaddleHit()) return BallCollision.TOP_OF_PADDLE;
    return BallCollision.NO_COLLISION;
  }

  private handlCollision(): void {
    const collision: BallCollision = this.getCollisionState();

    switch (collision) {
      case BallCollision.CEILING:
        this.reverseYVelocity();
        break;
      case BallCollision.TOP_OF_PADDLE:
        this.onPaddleHit();
        break;
      case BallCollision.FLOOR:
        this.onFloorImpact();
        break;
      case BallCollision.LEFT_WALL:
      case BallCollision.RIGHT_WALL:
        this.reverseXVelocity();
        break;
      default:
    }
  }

  private drawBall(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
    ctx.strokeStyle = this.color;
    ctx.stroke();
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  private onFloorImpact() {
    this.reset();
    this.missCount++;
    this.game.transition(GameState.DEATH);
  }

  private onPaddleHit() {
    this.adjustBallHeight();
    this.reverseYVelocity();
  }

  private getTopOfBallY(): number {
    return this.position.y - this.radius;
  }

  private getBottomOfBallY(): number {
    return this.position.y + this.radius;
  }

  private getBallRightX(): number {
    return this.position.x + this.radius;
  }

  private getBallLeftX(): number {
    return this.position.x - this.radius;
  }

  private isPaddleHit(): boolean {
    const paddleProps: PaddleProps = this.paddle.getProps();
    const paddlePostion: Position = this.paddle.getPosition();

    return (
      this.getBottomOfBallY() >= this.canvas.height - (paddleProps.hoverHeight + paddleProps.height) &&
      this.position.x + this.radius >= paddlePostion.x &&
      this.position.x - this.radius <= paddlePostion.x + paddleProps.width
    );
  }

  private adjustBallHeight(): void {
    this.position.y = this.canvas.height - (this.paddle.getProps().height + this.paddle.getProps().hoverHeight + this.radius);
  }
}
