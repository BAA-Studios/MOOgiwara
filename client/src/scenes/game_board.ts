import Phaser from 'phaser';
import Player from '../game/player';
import GameHandler from '../handlers/game_handler';
import UiHandler from '../handlers/ui_handler';

export default class GameBoard extends Phaser.Scene {

  gameHandler: GameHandler;
  uiHandler: UiHandler;

  constructor() {
    super('game-board');
    this.gameHandler = new GameHandler(this, new Player(), new Player());
    this.uiHandler = new UiHandler(this);
  }

  preload() {
    this.load.image('background', './images/moogiwara_game_board.png');
  }

  create() {
    this.add.image(0, 0, 'background').setOrigin(0, 0);
    // Initialize any UI Here
    this.uiHandler.initUi();
    // Start game here
    this.gameHandler.startGame();
  }

  // update(time: number, delta: number): void {

  // }
}
