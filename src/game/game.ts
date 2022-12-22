import { createLevel } from './levels';
import Paddle from './paddle';
import EventHandler from './input';
import { Properties } from './properties';
import Ball from './ball';
import Brick from './brick';

export enum GameState {
  NEW = 'NEW',
  RUNNABLE = 'RUNNABLE',
  DEATH = 'DEATH',
  WAITING = 'WAITING',
  NEW_LEVEL = 'NEW_LEVEL',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE'
}

export default class Game {
  private ctx: CanvasRenderingContext2D;
  private state: GameState;
  private props: Properties;
  private paddle: Paddle;
  private ball: Ball;
  private level: number;
  private bricks: Array<Brick>;

  constructor(ctx: CanvasRenderingContext2D, properties: Properties) {
    this.ctx = ctx;
    this.state = GameState.NEW;
    this.props = properties;
    this.paddle = new Paddle(properties);
    this.ball = new Ball(this.paddle, this);
    this.level = 1;
    this.bricks = [];
    EventHandler.initEventHandlers(this, this.paddle);
  }

  start() {
    this.bricks = createLevel(this, this.level);
    this.ball = new Ball(this.paddle, this);
    this.transition(GameState.RUNNABLE);
  }

  togglePause() {
    if (this.state === GameState.RUNNABLE) {
      this.transition(GameState.PAUSED);
      return;
    }

    this.transition(GameState.RUNNABLE);
  }

  tick() {
    switch (this.state) {
      case GameState.DEATH:
        this.handleDeath();
        break;
      case GameState.GAME_OVER:
        this.drawOverlayText('GAME OVER', 'rgba(0,0,0,0.5)'); // Add handle function
        break;
      case GameState.PAUSED:
        this.handlePaused();
        break;
      case GameState.NEW:
        this.handleNewGame();
        break;
      case GameState.NEW_LEVEL:
        this.handleNewLevel();
        break;
      case GameState.RUNNABLE:
        this.run();
        break;
      case GameState.LEVEL_COMPLETE:
        this.handleLevelComplete();
        break;
      case GameState.WAITING:
        console.log('WAITING');
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

  // Lives has to be set on game level. Everytime ball gets recreated, the lives get reset with current setup
  getLives(): number {
    return this.props.game.lives - this.ball.getMissCount();
  }

  private run() {
    this.draw();
    this.paddle.update();
    this.ball.update();
    this.bricks.filter(brick => brick.isVisable()).forEach(brick => brick.update());
    if (this.levelComplete()) {
      this.level += 1;
      this.transition(GameState.LEVEL_COMPLETE);
    }
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
  }

  private getAllowedTransitions(): Array<GameState> {
    switch (this.state) {
      case GameState.DEATH:
        return [GameState.GAME_OVER, GameState.RUNNABLE, GameState.WAITING];
      case GameState.GAME_OVER:
        return [GameState.NEW];
      case GameState.PAUSED:
        return [GameState.RUNNABLE];
      case GameState.NEW:
        return [GameState.RUNNABLE];
      case GameState.NEW_LEVEL:
        return [GameState.RUNNABLE];
      case GameState.RUNNABLE:
        return [GameState.DEATH, GameState.GAME_OVER, GameState.LEVEL_COMPLETE, GameState.PAUSED];
      case GameState.LEVEL_COMPLETE:
        return [GameState.WAITING];
      case GameState.WAITING:
        return [GameState.RUNNABLE, GameState.NEW_LEVEL];

      default:
        console.warn('no valid transition found for ' + this.state);
        return [];
    }
  }

  private levelComplete() {
    const { bricksPerRow, rows } = this.props.game;
    return this.bricks.filter(brick => !brick.isVisable()).length === rows * bricksPerRow;
  }

  private handleDeath(): void {
    if (this.ball.getMissCount() >= this.props.game.lives) {
      this.transition(GameState.GAME_OVER);
      return;
    }

    this.drawCanvas();
    this.paddle.draw(this.ctx);
    this.drawOverlayText('Death!', 'rgba(0,0,0,0.5)');

    this.transition(GameState.WAITING);
    setTimeout(() => this.transition(GameState.RUNNABLE), 1500);
  }

  private handleNewGame() {
    this.drawOverlayText('PRESS SPACE TO BEGIN');
  }

  private handlePaused() {
    console.log('PAUSED');
    this.draw();
    this.drawOverlayText('PAUSED', 'rgba(0,0,0,0.5)');
  }

  private handleLevelComplete(): void {
    this.drawOverlayText('Level ' + this.level, 'rgba(0,0,0,1)');
    this.transition(GameState.WAITING);
    setTimeout(() => this.transition(GameState.NEW_LEVEL), 1500);
  }

  private handleNewLevel() {
    this.start();
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
}
