import Phaser from 'phaser';
import Player from '../game/player';
import GameHandler from '../handlers/game_handler';
import UiHandler from '../handlers/ui_handler';
import ChatHandler from '../handlers/chat_handler';

export default class GameBoard extends Phaser.Scene {
  gameHandler: GameHandler;
  uiHandler: UiHandler;
  player: Player;
  opponent: Player;
  chatHandler: ChatHandler;
  client: any; // socket.io, putting 'any' because the defining the type throw errors

  constructor() {
    super('game-board');
  }

  init(data: any) {
    console.log(data);
    this.player = data.player;
    this.opponent = data.opponent;
    this.client = data.client;
  }

  preload() {
    this.load.image('background', './images/moogiwara_game_board.png');
  }

  create() {
    this.add.image(0, 0, 'background').setOrigin(0, 0);
    // Initialize any UI Here
    this.uiHandler = new UiHandler(this);
    this.uiHandler.initUi();
    // Initialize Chat Box Here
    this.chatHandler = new ChatHandler(this);

    // Initialize Game Handler Here
    // Start game here
    this.gameHandler = new GameHandler(this, this.player, this.opponent, this.client);
    this.gameHandler.startGame();
  }
}
