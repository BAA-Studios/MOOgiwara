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
  opponentDeckArea: Phaser.GameObjects.Container;

  playerTrashArea: Phaser.GameObjects.Rectangle;
  opponentTrashArea: Phaser.GameObjects.Rectangle;

  playerLeaderArea: Phaser.GameObjects.Container;
  opponentLeaderArea: Phaser.GameObjects.Container;

  playerDonArea: Phaser.GameObjects.Container;
  opponentDonArea: Phaser.GameObjects.Container;

  playerLifeArea: Phaser.GameObjects.Container;
  opponentLifeArea: Phaser.GameObjects.Container;

  playerDonDeckArea: Phaser.GameObjects.Container;
  opponentDonDeckArea: Phaser.GameObjects.Container;

  constructor(scene: GameBoard, player: Player, opponent: Player, client: any) {
    this.player = player;
    this.opponent = opponent;
    this.scene = scene;
    this.client = client;
    // Each container represents an area on the board, we can use to render cards and other game objects
    // TODO: separate all coordinates to a constant file
    this.playerCharacterArea = this.scene.add.container(720, 555);
    this.opponentCharacterArea = this.scene.add.container(720, 400);

    this.playerHandArea = this.scene.add.container(515, 996).setInteractive();
    this.opponentHandArea = this.scene.add.container(596, -123);

    this.playerDeckArea = this.scene.add.container(1253, 704);
    this.opponentDeckArea = this.scene.add.container(1253, 242);

    // this.playerTrashArea = this.scene.add.container();
    // this.opponentTrashArea = this.scene.add.container();

    this.playerLeaderArea = this.scene.add.container(947, 704);
    this.opponentLeaderArea = this.scene.add.container(947, 243);

    this.playerDonArea = this.scene.add.container(630, 858);
    this.opponentDonArea = this.scene.add.container(630, 93);

    this.playerDonDeckArea = this.scene.add.container(722, 705);
    this.opponentDonDeckArea = this.scene.add.container(722, 241);

    this.playerLifeArea = this.scene.add.container(572, 555);
    this.opponentLifeArea = this.scene.add.container(572, 247);

    this.scene.children.bringToTop(this.playerDonArea);
    // render the hand above the leader area
    this.scene.children.bringToTop(this.playerHandArea);

    // Render the card back on deck area for both sides
    const cardBack = new Card(this.player, this.scene, 'optcg_card_back')
      .setScale(0.16)
      .setOrigin(0, 0);
    this.playerDeckArea.add(cardBack);
    const oppCardBack = new Card(this.opponent, this.scene, 'optcg_card_back')
      .setScale(0.16)
      .setOrigin(0, 0);
    oppCardBack.flipY = true;
    this.opponentDeckArea.add(oppCardBack);

    // Render the card back on don deck area for both sides
    const donCardBack = new Card(this.player, this.scene, 'optcg_card_back')
      .setScale(0.16)
      .setOrigin(0, 0);
    this.playerDonDeckArea.add(donCardBack);
    const oppDonCardBack = new Card(this.opponent, this.scene, 'optcg_card_back')
      .setScale(0.16)
      .setOrigin(0, 0);
    oppDonCardBack.flipY = true;
    this.opponentDonDeckArea.add(oppDonCardBack);
    
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

    this.client.on("drawDon", (data: any) => {
      const donCard = new Card(this.player, this.scene, "donCardAltArt");
      donCard.setOrigin(0, 0);
      donCard.setScale(0.16);
      donCard.setInteractive();
      donCard.initInteractables();
      donCard.indexInHand = this.playerDonArea.length;
      // TODO: Animate a card going from the donDeckArea to the donArea in their respective location
      this.playerDonArea.add(donCard);
    });

    this.client.on('changeTurn', (data: any) => {
      this.changeTurn(data);
    });

    this.client.on('mulligan', (data: any) => {
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

    this.client.on("opponentDrawDon", (data: any) => {
      let amount = data.amount;
      for (let i = 0; i < amount; i++) {
        const donCard = new Card(this.opponent, this.scene, 'donCardAltArt')
        .setOrigin(0, 0)
        .setScale(0.16);
        donCard.flipY = true;
        donCard.setInteractive();
        donCard.initInteractables(false);

        this.opponent.donArea.pushBack(donCard);

        donCard.indexInHand = this.opponent.donArea.length;
        this.opponentDonArea.add(donCard);
      }
    });
  }

  changeTurn(data: any) {
    if (data.personToChangeTurnTo === this.player.getUniqueId()) {
      // TODO: REFRESH PHASE

      // DRAW PHASE
      if (data.turnNumber !== 0) { // The player going first on their first turn does not draw a card for their turn
        this.player.requestDrawCard();
      }

      // DON PHASE
      let donAmountToDraw = 2;
      if (data.turnNumber === 0) { // first turn for the person going first
        donAmountToDraw--;
      }
      this.player.requestDrawDon(donAmountToDraw);

      // MAIN PHASE
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
      case 'donArea':
        this.player.updateDonArea(this.scene, cards);
        break;
      // case 'trash':
      //   this.player.updateTrash(data);
      //   break;
    }
  }
}
