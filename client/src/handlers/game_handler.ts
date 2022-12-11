import Phaser from 'phaser';
import { Socket } from 'socket.io-client';
import Player from "../game/player";

export default class GameHandler {
  player: Player;
  opponent: Player;
  client: Socket;

  scene: Phaser.Scene;

  playerCharacterArea: Phaser.GameObjects.Rectangle;
  opponentCharacterArea: Phaser.GameObjects.Rectangle;

  playerHandArea: Phaser.GameObjects.Rectangle;
  opponentHandArea: Phaser.GameObjects.Rectangle;

  playerDeckArea: Phaser.GameObjects.Rectangle;
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

  constructor(
    scene: Phaser.Scene,
    player: Player,
    opponent: Player,
    client: any
  ) {
    this.player = player;
    this.opponent = opponent;
    this.scene = scene;
    this.client = client;
    // Each retangle represents an area on the board, we can use to render cards and other game objects
    // TODO: separate all coordinates to a constant file
    // this.playerCharacterArea = this.scene.add.rectangle(0, 0, 0, 0, 0x000000);
    // this.opponentCharacterArea = this.scene.add.rectangle(0, 0, 0, 0, 0x000000);

    // this.playerHandArea = this.scene.add.rectangle(0, 0, 0, 0, 0x000000);
    // this.opponentHandArea = this.scene.add.rectangle(0, 0, 0, 0, 0x000000);

    // this.playerDeckArea = this.scene.add.rectangle(0, 0, 0, 0, 0x000000);
    // this.opponentDeckArea = this.scene.add.rectangle(0, 0, 0, 0, 0x000000);

    // this.playerTrashArea = this.scene.add.rectangle(0, 0, 0, 0, 0x000000);
    // this.opponentTrashArea = this.scene.add.rectangle(0, 0, 0, 0, 0x000000);

    // this.playerLeaderArea = this.scene.add.rectangle(0, 0, 0, 0, 0x000000);
    // this.opponentLeaderArea = this.scene.add.rectangle(0, 0, 0, 0, 0x000000);

    // this.playerDonArea = this.scene.add.rectangle(0, 0, 0, 0, 0x000000);
    // this.opponentDonArea = this.scene.add.rectangle(0, 0, 0, 0, 0x000000);

    // this.playerDonDeckArea = this.scene.add.rectangle(0, 0, 0, 0, 0x000000);
    // this.opponentDonDeckArea = this.scene.add.rectangle(0, 0, 0, 0, 0x000000);

    // this.playerLifeArea = this.scene.add.rectangle(0, 0, 0, 0, 0x000000);
    // this.opponentLifeArea = this.scene.add.rectangle(0, 0, 0, 0, 0x000000);
  }

  startGame() {}
}
