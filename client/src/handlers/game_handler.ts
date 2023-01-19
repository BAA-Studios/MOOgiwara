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

  playerTrashArea: Phaser.GameObjects.Container;
  opponentTrashArea: Phaser.GameObjects.Container;

  playerLeaderArea: Phaser.GameObjects.Container;
  opponentLeaderArea: Phaser.GameObjects.Container;

  playerDonArea: Phaser.GameObjects.Container;
  opponentDonArea: Phaser.GameObjects.Container;

  playerLifeArea: Phaser.GameObjects.Container;
  opponentLifeArea: Phaser.GameObjects.Container;

  playerDonDeckArea: Phaser.GameObjects.Container;
  opponentDonDeckArea: Phaser.GameObjects.Container;

  playableCharacterArea: Phaser.GameObjects.Graphics; // This is the location of the character area in a rectangle
  playableCharacterAreaHitBox: Phaser.GameObjects.Rectangle; // This is the hitbox of the character area

  constructor(scene: GameBoard, player: Player, opponent: Player, client: any) {
    this.player = player;
    this.opponent = opponent;
    this.scene = scene;
    this.client = client;
    // Each container represents an area on the board, we can use to render cards and other game objects
    // TODO: separate all coordinates to a constant file
    this.playerCharacterArea = this.scene.add.container(720, 555);
    this.opponentCharacterArea = this.scene.add.container(720, 392);

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

    // This is the location of the character area in a rectangle
    this.playableCharacterArea = this.scene.add.graphics();
    this.playableCharacterArea.fillStyle(0x00ff00, 0.3);
    this.playableCharacterArea.fillRoundedRect(717, 552, 519, 141, 18);
    this.playableCharacterArea.setVisible(false);

    // Used to do hit detection
    this.playableCharacterAreaHitBox = this.scene.add.rectangle(717, 552, 519, 141, 0x000000);
    this.playableCharacterAreaHitBox.setOrigin(0, 0);
    this.playableCharacterAreaHitBox.setVisible(false);

    this.scene.children.bringToTop(this.playerDonArea);
    // render the hand above the leader area
    this.scene.children.bringToTop(this.playerHandArea);

    // Render the card back on deck area for both sides
    const cardBack = new Card(this.player, this.scene, 'optcg_card_back')
      .setScale(0.16)
      .setOrigin(0, 0);
    this.playerDeckArea.add(cardBack);
    
    // Display deck count
    cardBack.setInteractive();
    cardBack.on('pointerover', () => {
      cardBack.setTint(0xbebebe);
      this.player.client.emit('deckCount', {}, (cardsInDeck: number) => {
        cardBack.textOnCard.setVisible(true);
        cardBack.textOnCard.setText(cardsInDeck.toString());
        cardBack.textOnCard.setFontFamily("Merriweather");
        console.log(cardBack.textOnCard.)
        cardBack.textOnCard.setFontSize(50);
        let cardCenterX = this.playerDeckArea.x + (cardBack.displayWidth / 2);
        let cardCenterY = this.playerDeckArea.y + (cardBack.displayHeight / 2);
        cardBack.textOnCard.setOrigin(0.5, 0.5);
        cardBack.textOnCard.setPosition(cardCenterX, cardCenterY);
        console.log('Cards in Deck:', cardsInDeck);
      });
    });

    cardBack.on('pointerout', () => {
      cardBack.textOnCard.setVisible(false);
      cardBack.clearTint();
    });



    const oppCardBack = new Card(this.opponent, this.scene, 'optcg_card_back')
      .setScale(0.16)
      .setOrigin(0, 0);
    oppCardBack.flipY = true;
    oppCardBack.flipX = true;
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
    oppDonCardBack.flipX = true;
    this.opponentDonDeckArea.add(oppDonCardBack);
    
    // Render both player's Leader cards
    if (this.player.leader && this.opponent.leader) {
      this.playerLeaderArea.add(this.player.leader);
      // Render the opponent's cards upside down
      this.opponent.leader.flipY = true;
      this.opponent.leader.flipX = true;
      this.opponentLeaderArea.add(this.opponent.leader);
    }
  }

  // Listens to game events from the server
  initListeners() {
    this.client.on('updateCardList', (data: any) => {
      this.updateCardList(data.cards, data.type);
    });

    // CURRENTLY DOES NOTHING
    this.client.on("drawCard", (data: any) => {
      this.player.handleDrawCard(data.card);
    });

    // CURRENTLY DOES NOTHING
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
      this.player.requestDrawCard(this.scene, 5, () => {
        this.mulligan(data);
      });
    });

    this.client.on('playCard', (data: any) => {
      console.log(data);
    });

    // Opponent rendering related events ---------------------------------------
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

        donCard.indexInHand = this.opponent.donArea.length-1;
        donCard.setPosition(donCard.indexInHand*75, 0);
        this.opponentDonArea.add(donCard);

        if (this.opponentDonArea.length === 10) {
          this.opponentDonDeckArea.removeAll(true);
        }
      }
    });

    this.client.on("opponentUpdateCharacterArea", (data: any) => {
      this.opponentCharacterArea.removeAll(true);
      for (let i = 0; i < data.cards.i; i++) {
        const card = new Card(this.opponent, this.scene, data.cards.W[i].id);
        card.setOrigin(0, 0);
        card.setScale(0.16);
        card.flipY = true;
        card.flipX = true;
        card.setInteractive();
        card.initInteractables(false);
        card.indexInHand = i;
        card.setPosition(card.calculatePositionInHand(), 0);
        this.opponentCharacterArea.add(card);
        if (data.cards.W[i].isResting) {
          card.rest();
        }
      }
    });

    this.client.on("opponentUpdateDonArea", (data: any) => {
      this.opponentDonArea.removeAll(true);
      for (let i = 0; i < data.cards.i; i++) {
        const card = new Card(this.opponent, this.scene, data.cards.W[i].id);
        card.setOrigin(0, 0);
        card.setScale(0.16);
        card.flipY = true;
        card.flipX = true;
        card.setInteractive();
        card.initInteractables(false);
        card.indexInHand = i;
        card.setPosition(card.calculatePositionInHand(), 0);
        this.opponentDonArea.add(card);
        if (data.cards.W[i].isResting) {
          card.rest();
        }
      }
    });
  }

  changeTurn(data: any) {
    if (data.personToChangeTurnTo === this.player.getUniqueId()) {
      // REFRESH PHASE
      this.player.playerState = PlayerState.REFRESH_PHASE;
      this.player.requestRefreshPhase();
      // Set all character cards summoning sickness to false
      this.player.characterArea.forEach((card: Card) => {
        card.summoningSickness = false;
      });

      // DRAW PHASE
      if (data.turnNumber !== 0) { // The player going first on their first turn does not draw a card for their turn
        this.player.playerState = PlayerState.DRAW_PHASE;
        this.player.requestDrawCard(this.scene);
      }

      // DON PHASE
      let donAmountToDraw = 2;
      if (data.turnNumber === 0) { // first turn for the person going first only gains one Don!!
        donAmountToDraw--;
      }
      this.player.playerState = PlayerState.DON_PHASE;
      this.player.requestDrawDon(donAmountToDraw);

      // MAIN PHASE
      this.player.playerState = PlayerState.MAIN_PHASE;
      // Reset the end turn button
      this.scene.uiHandler.endTurnButton.buttonText.setText("END TURN");
      this.scene.uiHandler.endTurnButton.buttonText.setFontSize(34);
    } else {
      this.player.playerState = PlayerState.OPPONENTS_TURN;
      this.scene.uiHandler.endTurnButton.buttonText.setText("OPPONENT'S TURN");
      this.scene.uiHandler.endTurnButton.buttonText.setFontSize(34);
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
      case 'characterArea':
        this.player.updateCharacterArea(this.scene, cards);
        break;
    }
  }

  highlightValidZones(card: Card) {
    if (card.isCharacterCard()) {
      // For some reason, setting alpha anything that isn't 0 doesn't work
      if (this.playableCharacterArea.visible) {
        return;
      }
      this.playableCharacterArea.setVisible(true);
    }
  }

  unHighlightValidZones(card: Card) {
    if (card.isCharacterCard()) {
      this.playableCharacterArea.setVisible(false);
    }
  }

  checkIfCardWasDroppedInValidZone(card: Card) {
    if (card.isCharacterCard()) {
      // Check if the card is currently within the playableCharacterArea, assuming both are rectangles
      if (Phaser.Geom.Rectangle.Overlaps(card.getBounds(), this.playableCharacterAreaHitBox.getBounds())) {
          return true;
      }
    }
    return false;
  }
}
