import Phaser from 'phaser';
import { Socket } from 'socket.io-client';
import Card from '../game/card';
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

  playerLeaderArea: Phaser.GameObjects.Container;
  opponentLeaderArea: Phaser.GameObjects.Container;

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
    this.opponentHandArea = this.scene.add.container(596, -123);

    this.playerDeckArea = this.scene.add.container(1255, 703);
    // this.opponentDeckArea = this.scene.add.container();

    // this.playerTrashArea = this.scene.add.container();
    // this.opponentTrashArea = this.scene.add.container();

    this.playerLeaderArea = this.scene.add.container(947, 704);
    this.opponentLeaderArea = this.scene.add.container(947, 243);

    // this.playerDonArea = this.scene.add.container();
    // this.opponentDonArea = this.scene.add.container();

    // this.playerDonDeckArea = this.scene.add.container();
    // this.opponentDonDeckArea = this.scene.add.container();

    // this.playerLifeArea = this.scene.add.container();
    // this.opponentLifeArea = this.scene.add.container();

    // render the hand above the leader area
    this.scene.children.bringToTop(this.playerHandArea);
    
    // Render both player's Leader cards
    if (this.player.leader && this.opponent.leader) {
      this.playerLeaderArea.add(this.player.leader);
      // Render the opponent's cards upside down
      this.opponent.leader.flipY = true;
      this.opponentLeaderArea.add(this.opponent.leader);
    }
  }

  // Listens to game events from the server
  initListeners() {
    this.client.on('updateCardList', (data: any) => {
      this.updateCardList(data.cards, data.type);
    });

    // The server sends a card to be drawn
    this.client.on("drawCard", (data: any) => {
      this.player.handleDrawCard(data.card);
    });

    this.client.on('changeTurn', (data: any) => {
      this.changeTurn(data);
    });

    this.client.once('mulligan', (data: any) => {
      this.player.requestDrawCard(5);

      // TODO: don't make this a delayed call and instead make it a promise
      this.scene.time.delayedCall(1000, () => {
        this.mulligan(data);
      });
    });

    // Opponent rendering related events
    this.client.on("opponentDrawCard", (data: any) => {
      let amount = data.amount;
      for (let i = 0; i < amount; i++) {
        const blankCard = new Card(this.opponent, this.scene, 'optcg_card_back')
        .setOrigin(0, 0)
        .setScale(0.25);
        blankCard.flipY = true;

        this.opponent.addToHand(blankCard);

        blankCard.indexInHand = this.opponentHandArea.length-1;
        blankCard.setPosition(blankCard.calculatePositionInHand(), 0)

        this.opponentHandArea.add(blankCard);
      }
    });

    this.client.on("opponentRemoveCardFromHand", (data: any) => {
      let amount = data.amount;
      // Remove last card from the opponent's hand
      for (let i = 0; i < amount; i++) {
        this.opponentHandArea.removeAt(this.opponentHandArea.length - 1, true);
      }
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

  updateCardList(cards: string, type: any) {
    switch(type) {
      case 'hand':
        this.player.updateHand(this.scene, cards);
        break;
      // case 'donDeck':
      //   this.player.updateDonDeck(data);
      //   break;
      // case 'trash':
      //   this.player.updateTrash(data);
      //   break;
    }
  }
}
