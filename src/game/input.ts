import Paddle from './paddle';
import Game from './game';

export default class EventHandler {
  public static initEventHandlers(game: Game, paddle: Paddle) {
    document.addEventListener('keydown', event => {
      switch (event.code) {
        case 'ArrowLeft':
          paddle.moveLeft();
          break;

        case 'ArrowRight':
          paddle.moveRight();
          break;

        case 'Escape':
          game.togglePause();
          break;

        case 'Space':
          game.init();
          break;
      }
    });

    document.addEventListener('keyup', event => {
      switch (event.key) {
        case 'ArrowLeft':
          if (paddle.getSpeed() < 0) paddle.stop();
          break;

        case 'ArrowRight':
          if (paddle.getSpeed() > 0) paddle.stop();
          break;
      }
    });
  }
}
