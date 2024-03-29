import { createLevel } from './levels';
import Paddle from './paddle';
import EventHandler from './input';
import { Properties, Velocity, properties } from './properties';
import Ball from './ball';
import Brick from './brick';

export enum GameState {
  DEATH = 'DEATH',
  GAME_COMPLETE = 'GAME_COMPLETE',
  GAME_OVER = 'GAME_OVER',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  NEW_GAME = 'NEW_GAME',
  NEW_LEVEL = 'NEW_LEVEL',
  PAUSED = 'PAUSED',
  RUNNABLE = 'RUNNABLE',
  WAITING = 'WAITING'
}

export default class Game {
  private ctx: CanvasRenderingContext2D;
  private state: GameState;
  private props: Properties;
  private paddle: Paddle;
  private ball: Ball;
  private level: number;
  private lives: number;
  private score: number;
  private bricks: Array<Brick>;
  private heart: HTMLImageElement;
  private isTouch: boolean;

  constructor(ctx: CanvasRenderingContext2D, isTouch: boolean) {
    this.ctx = ctx;
    this.state = GameState.NEW_GAME;
    this.props = properties;
    this.paddle = new Paddle(properties);
    this.ball = new Ball(this, this.paddle);
    this.level = 1;
    this.lives = properties.game.lives;
    this.score = 0;
    this.bricks = [];

    this.heart = new Image();
    this.heart.src = 'lives.png';

    this.isTouch = isTouch;

    EventHandler.initEventHandlers(this, this.paddle);
  }

  init(): void {
    if (this.state === GameState.NEW_GAME) this.start();
  }

  start(): void {
    this.transition(GameState.RUNNABLE);
  }

  reset(): void {
    this.bricks = createLevel(this, this.level);
    this.paddle = new Paddle(this.props);
    this.ball = new Ball(this, this.paddle);
    EventHandler.initEventHandlers(this, this.paddle);
  }

  restore(): void {
    this.ctx.restore();
  }

  togglePause() {
    if (this.state === GameState.RUNNABLE) {
      this.transition(GameState.PAUSED);
    } else if (this.state === GameState.PAUSED) {
      this.transition(GameState.RUNNABLE);
    }
  }

  tick() {
    switch (this.state) {
      case GameState.DEATH:
        this.handleDeath();
        break;
      case GameState.GAME_OVER:
        this.handleGameOver();
        break;
      case GameState.GAME_COMPLETE:
        this.handleGameComplete();
        break;
      case GameState.LEVEL_COMPLETE:
        this.handleLevelComplete();
        break;
      case GameState.NEW_GAME:
        this.handleNewGame();
        break;
      case GameState.NEW_LEVEL:
        this.handleNewLevel();
        break;
      case GameState.PAUSED:
        this.handlePaused();
        break;
      case GameState.RUNNABLE:
        this.run();
        break;
      case GameState.WAITING:
        break;

      default:
        console.error('no valid state found');
    }
  }

  transition(newState: GameState): void {
    if (this.getAllowedTransitions().includes(newState)) {
      this.state = newState;
      return;
    }

    console.warn(`tried to transtion from ${this.state} to ${newState}`);
  }

  getProps(): Properties {
    return this.props;
  }

  getCurrentState(): GameState {
    return this.state;
  }

  getBall(): Ball {
    return this.ball;
  }

  getPaddle(): Paddle {
    return this.paddle;
  }

  getLevel(): number {
    return this.level;
  }

  getLives(): number {
    return this.lives;
  }

  decrementLives(): void {
    this.lives -= 1;
  }

  incrementLives(): void {
    this.lives += 1;
  }

  scorePoint(): void {
    this.score += this.level;
  }

  private run() {
    this.draw();
    this.paddle.update();
    this.ball.update();
    this.bricks.filter(brick => brick.isVisable()).forEach(brick => brick.update());

    if (this.isLevelComplete()) this.handleCompletionStatus();
  }

  private handleCompletionStatus(): void {
    this.level += 1;

    this.level === this.props.game.maxLevel ? this.transition(GameState.GAME_COMPLETE) : this.transition(GameState.LEVEL_COMPLETE);
  }

  private draw() {
    this.drawCanvas();

    this.paddle.draw(this.ctx);
    this.ball.draw(this.ctx);
    this.bricks.forEach(brick => brick.draw(this.ctx));
  }

  private drawCanvas() {
    const { canvas } = this.props;

    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.ctx.fillStyle = canvas.color;
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.drawGameStats();
  }

  private getAllowedTransitions(): Array<GameState> {
    switch (this.state) {
      case GameState.DEATH:
        return [GameState.GAME_OVER, GameState.RUNNABLE, GameState.WAITING];
      case GameState.GAME_OVER:
        return [GameState.WAITING];
      case GameState.GAME_COMPLETE:
        return [GameState.WAITING];
      case GameState.LEVEL_COMPLETE:
        return [GameState.WAITING];
      case GameState.NEW_GAME:
        return [GameState.RUNNABLE];
      case GameState.NEW_LEVEL:
        return [GameState.RUNNABLE];
      case GameState.PAUSED:
        return [GameState.RUNNABLE];
      case GameState.RUNNABLE:
        return [GameState.DEATH, GameState.GAME_COMPLETE, GameState.GAME_OVER, GameState.LEVEL_COMPLETE, GameState.PAUSED];
      case GameState.WAITING:
        return [GameState.NEW_LEVEL, GameState.RUNNABLE, GameState.NEW_GAME];

      default:
        console.warn('no valid transition found for ' + this.state);
        return [];
    }
  }

  private isLevelComplete() {
    return !this.bricks.some(brick => brick.isVisable());
  }

  private handleDeath(): void {
    if (this.lives < 1) {
      this.transition(GameState.GAME_OVER);
      return;
    }

    this.drawCanvas();
    this.paddle.draw(this.ctx);
    this.drawOverlayText('Death!', 'rgba(0,0,0,0.5)');

    this.transition(GameState.WAITING);
    setTimeout(() => this.transition(GameState.RUNNABLE), 1500);
  }

  private handleGameOver(): void {
    this.drawDoubleOverlayText('GAME OVER', 'Your score: ' + this.score, 'rgba(0,0,0,1)');
    this.transition(GameState.WAITING);
    setTimeout(() => this.transition(GameState.NEW_GAME), 2000);
  }

  private handleGameComplete(): void {
    this.drawDoubleOverlayText('GAME COMPLETED! ', 'Your score: ' + this.score, 'rgba(0,0,0,1)');
    this.transition(GameState.WAITING);
    setTimeout(() => this.transition(GameState.NEW_GAME), 4000);
  }

  private handleNewGame() {
    this.props = this.deepCopy(properties);
    this.lives = this.props.game.lives;
    this.score = 0;
    this.level = 1;
    this.reset();
    this.drawOverlayText(this.isTouch ? 'TOUCH HERE TO BEGIN' : 'PRESS SPACE TO BEGIN');
  }

  private handlePaused() {
    this.draw();
    this.drawOverlayText('PAUSED', 'rgba(0,0,0,0.5)');
  }

  private handleLevelComplete(): void {
    this.drawOverlayText('Level ' + this.level, 'rgba(0,0,0,1)');
    this.transition(GameState.WAITING);
    setTimeout(() => this.transition(GameState.NEW_LEVEL), 1500);
  }

  private handleNewLevel() {
    this.incrementBallStartVelocity();

    if (this.level % 2 === 0) {
      this.lives += 1;
      this.decreasePaddleSize();
    }

    this.reset();
    this.start();
  }

  private incrementBallStartVelocity(): void {
    const { x, y }: Velocity = this.props.game.ballStartVelocity;
    this.props.game.ballStartVelocity = { x: x + 1, y: y - 1 };
  }

  private decreasePaddleSize(): void {
    const { width: currentWidth, minWidth, levelDecrementValue } = this.props.paddle;
    if (currentWidth <= minWidth) return;
    this.props.paddle.width -= levelDecrementValue;
  }

  private drawOverlayText(text: string, color: string = 'rgba(20,20,20,1)'): void {
    const { width, height } = this.props.canvas;

    this.ctx.rect(0, 0, width, height);
    this.ctx.fillStyle = color;
    this.ctx.fill();

    this.ctx.font = '30px Arial';
    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(text, width / 2, height / 2);
  }

  private drawDoubleOverlayText(topText: string, subtext: string, color: string = 'rgba(20,20,20,1)'): void {
    const { width, height } = this.props.canvas;

    this.ctx.rect(0, 0, width, height);
    this.ctx.fillStyle = color;
    this.ctx.fill();

    this.ctx.font = '30px Arial';
    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(topText, width / 2, height / 2 - 30);
    this.ctx.fillText(subtext, width / 2, height / 2 + 30);
  }

  private drawGameStats(): void {
    const { width } = this.props.canvas;

    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = 'white';
    this.ctx.fillText('LEVEL ' + this.level, 40, 20);

    this.ctx.font = '22px Arial';
    this.ctx.fillStyle = 'white';
    this.ctx.fillText(this.score.toString(), width / 2, 20);

    this.ctx.font = '20px bold Arial';
    this.ctx.fillStyle = 'white';
    this.ctx.drawImage(this.heart, width - 50, 10, 40, 40);
    this.ctx.fillText('' + this.lives, width - 30, 37);
  }

  private deepCopy(props: Properties): Properties {
    return JSON.parse(JSON.stringify(props));
  }
}
