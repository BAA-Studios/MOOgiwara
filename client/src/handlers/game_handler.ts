import Phaser from 'phaser';
import { Socket } from 'socket.io-client';
import Player from "../game/player";
import { PlayerState } from '../game/player';
import GameBoard from '../scenes/game_board';
import { displayMulliganSelection } from '../scenes/game_board_pop_ups';

export default class GameHandler {
  player: Player;
  opponent: Player;
  client: Socket;

  scene: GameBoard;

  playerCharacterArea: Phaser.GameObjects.Container;
  opponentCharacterArea: Phaser.GameObjects.Container;

  playerHandArea: Phaser.GameObjects.Container;
  opponentHandArea: Phaser.GameObjects.Container;

  playerDeckArea: Phaser.GameObjects.Container;
  opponentDeckArea: Phaser.GameObjects.Rectangle;

  playerTrashArea: Phaser.GameObjects.Rectangle;
  opponentTrashArea: Phaser.GameObjects.Rectangle;

  playerLeaderArea: Phaser.GameObjects.Rectangle;
  opponentLeaderArea: Phaser.GameObjects.Rectangle;

  playerDonArea: Phaser.GameObjects.Rectangle;
  opponentDonArea: Phaser.GameObjects.Rectangle;

  playerLifeArea: Phaser.GameObjects.Rectangle;
  opponentLifeArea: Phaser.GameObjects.Rectangle;

  playerDonDeckArea: Phaser.GameObjects.Rectangle;
  opponentDonDeckArea: Phaser.GameObjects.Rectangle;

  constructor(scene: GameBoard, player: Player, opponent: Player, client: any) {
    this.player = player;
    this.opponent = opponent;
    this.scene = scene;
    this.client = client;
    // Each container represents an area on the board, we can use to render cards and other game objects
    // TODO: separate all coordinates to a constant file
    this.playerCharacterArea = this.scene.add.container(720, 555);
    this.opponentCharacterArea = this.scene.add.container(720, 400);

    this.playerHandArea = this.scene.add.container(576, 996).setInteractive();
    this.opponentHandArea = this.scene.add.container(576, 89);

    this.playerDeckArea = this.scene.add.container(1255, 703);
    // this.opponentDeckArea = this.scene.add.container();

    // this.playerTrashArea = this.scene.add.container();
    // this.opponentTrashArea = this.scene.add.container();

    // this.playerLeaderArea = this.scene.add.container();
    // this.opponentLeaderArea = this.scene.add.container();

    // this.playerDonArea = this.scene.add.container();
    // this.opponentDonArea = this.scene.add.container();

    // this.playerDonDeckArea = this.scene.add.container();
    // this.opponentDonDeckArea = this.scene.add.container();

    // this.playerLifeArea = this.scene.add.container();
    // this.opponentLifeArea = this.scene.add.container();
  }

  // Listens to game events from the server
  initListeners() {
    this.client.on('changeTurn', (data: any) => {
      this.changeTurn(data);
    });

    this.client.on('mulligan', (data: any) => {
      this.mulligan(data);
    });
  }

  changeTurn(data: any) {
    if (data.personToChangeTurnTo === this.player.getUniqueId()) {
      this.player.playerState = PlayerState.MAIN_PHASE;
    } else {
      this.player.playerState = PlayerState.OPPONENTS_TURN;
    }
  }

  mulligan(data: any) {
    this.player.playerState = PlayerState.MULLIGAN;
    displayMulliganSelection(this.scene);
  }
}
