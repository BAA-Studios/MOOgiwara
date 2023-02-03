import Phaser, { Data } from 'phaser';
import { Socket } from 'socket.io-client';
import Card from '../game/card';
import Player from "../game/player";
import { PlayerState } from '../game/player';
import GameBoard from '../scenes/game_board';
import { displayMulliganSelection, displayTrash } from '../scenes/game_board_pop_ups';

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
    this.opponentHandArea = this.scene.add.container(515, -123);

    this.playerDeckArea = this.scene.add.container(1253, 704);
    this.opponentDeckArea = this.scene.add.container(1253, 242);

    this.playerTrashArea = this.scene.add.container(1254, 555);
    this.opponentTrashArea = this.scene.add.container(1254, 391);

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
      donCard.indexInContainer = this.playerDonArea.length;
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
        const blankCard = this.scene.add.existing(new Card(this.opponent, this.scene, 'optcg_card_back'))
          .setOrigin(0, 0)
          .setScale(0.16);
        blankCard.flipY = true;
        blankCard.flipX = true;
        const cardBack = new Card(this.opponent, this.scene, 'optcg_card_back')
            .setScale(0.25)
            .setOrigin(0, 0)
            .setVisible(false);
        cardBack.flipY = true;
        cardBack.flipX = true;

        this.opponent.addToHand(cardBack);
        blankCard.indexInContainer = this.opponent.hand.length-1;
        cardBack.indexInContainer = this.opponent.hand.length-1;

        this.opponentHandArea.add(cardBack);
        blankCard.setPosition(blankCard.calculatePositionInHand(), 0);
        cardBack.setPosition(cardBack.calculatePositionInHand(), 0);

        // Animate it going from the deck to the hand
        blankCard.setPosition(this.opponentDeckArea.x, this.opponentDeckArea.y);
        
        this.scene.tweens.add({
          targets: blankCard,
          x: this.opponentHandArea.x + blankCard.calculatePositionInHand(),
          y: this.opponentHandArea.y,
          scale: 0.25,
          duration: 750,
          ease: 'Power1',
          onComplete: () => {
            blankCard.destroy();
            cardBack.setVisible(true);
          }
        });
      }
    });

    this.client.on("opponentRemoveCardFromHand", (data: any) => {
      let amount = data.amount;
      // Remove last card from the opponent's hand
      for (let i = 0; i < amount; i++) {
        this.opponentHandArea.removeAt(this.opponentHandArea.length - 1, true);
        this.opponent.hand.eraseElementByPos(this.opponent.hand.length - 1);
      }
      // Readjust all the card's indexInContainer
      for (let i = 0; i < this.opponent.hand.length; i++) {
        this.opponent.hand.getElementByPos(i).indexInContainer = i;
      }
    });

    this.client.on("opponentDrawDon", (data: any) => {
      let amount = data.amount;
      for (let i = 0; i < amount; i++) {
        const donCard = this.scene.add.existing(new Card(this.opponent, this.scene, 'donCardAltArt'))
         .setOrigin(0, 0)
         .setScale(0.16);
        donCard.flipY = true;
        donCard.flipX = true;
        donCard.setPosition(this.opponentDonDeckArea.x, this.opponentDonDeckArea.y);

        this.opponent.donArea.pushBack(donCard);
        donCard.indexInContainer = this.opponent.donArea.length-1;

        this.scene.tweens.add({
          targets: donCard,
          x: this.opponentDonArea.x + donCard.indexInContainer*75,
          y: this.opponentDonArea.y,
          duration: 750,
          ease: 'Power1',
          onComplete: () => {
            donCard.setPosition(donCard.indexInContainer*75, 0);
            this.opponentDonArea.add(donCard);
            donCard.setInteractive();
            donCard.initInteractables(false);
            if (this.opponentDonArea.length === 10) {
              this.opponentDonDeckArea.removeAll(true);
            }
          }
        });
      }
    });

    this.client.on("opponentUpdateCharacterArea", (data: any) => {
      for (let i = 0; i < this.opponent.characterArea.length; i++) {
        this.opponent.characterArea.getElementByPos(i).boundingBox.destroy();
        this.opponent.characterArea.getElementByPos(i).textOnCard.destroy();
      }
      this.opponentCharacterArea.removeAll(true);
      this.opponent.characterArea.clear();
      for (let i = 0; i < data.cards.i; i++) {
        const card = new Card(this.opponent, this.scene, data.cards.W[i].id);
        card.setOrigin(0, 0);
        card.setScale(0.16);
        card.flipY = true;
        card.flipX = true;
        card.setInteractive();
        card.initInteractables(false);
        card.indexInContainer = i;
        card.setPosition(card.calculatePositionInHand(), 0);
        this.opponentCharacterArea.add(card);
        this.opponent.characterArea.pushBack(card);
        if (data.cards.W[i].isResting) {
          card.rest();
        }
        // Check and populate the card's attachedDon
        if (data.cards.W[i].attachedDonCount > 0) {
          card.highlightBounds(0xff0000);
          for (let j = 0; j < data.cards.W[i].attachedDonCount; j++) {
            const don = new Card(this.opponent, this.scene, 'donCardAltArt');
            card.donAttached.pushBack(don);
          }
          card.writeOnCard(this.opponentCharacterArea, "+" + card.calculateTotalAttack(), 35, 
          { 
            color: '#ff0000',
            backgroundColor: 'rgba(0,0,0,0.7)',
          });
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
        card.indexInContainer = i;
        card.setPosition(card.calculatePositionInHand(), 0);
        this.opponentDonArea.add(card);
        if (data.cards.W[i].isResting) {
          card.rest();
        }
      }
    });

    this.client.on("opponentUpdateLeader", (data: any) => {
      this.opponent.leader?.boundingBox.destroy();
      this.opponent.leader?.textOnCard.destroy();
      this.opponentLeaderArea.removeAll(true);
      const newLeader = new Card(this.opponent, this.scene, data.card.id);
      newLeader.setOrigin(0, 0);
      newLeader.setScale(0.16);
      newLeader.flipY = true;
      newLeader.flipX = true;
      newLeader.setInteractive();
      newLeader.initInteractables(false);
      this.opponentLeaderArea.add(newLeader);
      this.opponent.leader = newLeader;
      if (data.card.isResting) {
        newLeader.rest();
      }

      // Check and populate the card's attachedDon
      if (data.card.attachedDonCount > 0) {
        newLeader.highlightBounds(0xff0000);
        for (let j = 0; j < data.card.attachedDonCount; j++) {
          const don = new Card(this.opponent, this.scene, 'donCardAltArt');
          newLeader.donAttached.pushBack(don);
        }
          newLeader.writeOnCard(this.opponentLeaderArea, "+" + newLeader.calculateTotalAttack(), 35, 
          { 
            color: '#ff0000',
            backgroundColor: 'rgba(0,0,0,0.7)',
          });
      }
    });

    this.client.on("opponentUpdateTrash", (data: any) => {
      this.opponentTrashArea.removeAll(true);
      this.opponent.trash.clear();
      for (let i = 0; i < data.cards.i; i++) {
        const card = new Card(this.opponent, this.scene, data.cards.W[i].id);
        card.setOrigin(0, 0);
        card.setScale(0.16);
        card.flipY = true;
        card.flipX = true;
        card.setInteractive();
        card.initInteractables(false);
        card.indexInContainer = i;
        card.setPosition(0, 0);
        this.opponent.trash.pushBack(card);
      }
      // We only have to render the last card in the trash
      const lastCard = this.opponent.trash.getElementByPos(this.opponent.trash.length - 1);
      lastCard.on("pointerdown", () => {
        displayTrash(this.scene, this.opponent.trash);
      });
      this.opponentTrashArea.add(lastCard);
    });

    this.client.on("opponentHoveredCard", (data: any) => {
      this.opponent.hand.getElementByPos(data.indexInHand)?.highlightBounds(0xff0000);
    });

    this.client.on("opponentUnhoveredCard", (data: any) => {
      this.opponent.hand.getElementByPos(data.indexInHand)?.unHighlightBounds();
    });
  }

  changeTurn(data: any) {
    if (data.personToChangeTurnTo === this.player.getUniqueId()) {
      this.player.playerState = PlayerState.REFRESH_PHASE;
      this.player.requestRefreshPhase();
      // Set all character cards summoning sickness to false
      this.player.characterArea.forEach((card: Card) => {
        card.summoningSickness = false;
      });

      this.player.leader?.donAttached.clear();
      this.player.leader?.unHighlightBounds();
      this.player.leader?.removeTextOnCard();

      if (data.turnNumber === 2 || data.turnNumber === 3) {
        if (this.player.leader) {
          this.player.leader.summoningSickness = false;
        }
      }

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
      this.scene.uiHandler.setEndButtonToMainPhase();
    } else {
      this.player.playerState = PlayerState.OPPONENTS_TURN;
      this.scene.uiHandler.setEndButtonToOpponentsTurn();
    }
  }

  mulligan(data: any) {
    this.player.playerState = PlayerState.LOADING;
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
    // Indicate to players where they can attach a Don card to
    if (card.isDonCard && !card.isDragging) {
      // highlight every player character and leader card
      this.player.characterArea.forEach((card: Card) => {
        card.highlightBounds();
      });
      if (this.player.leader) {
        this.player.leader.highlightBounds();
      }
    }
    else if (card.isDonCard && card.isDragging) {
      // Add a tint to cards the mouse is hovering over
      this.player.characterArea.forEach((characterCard: Card) => {
        if (Phaser.Geom.Rectangle.Contains(characterCard.getBounds(), this.scene.input.mousePointer.x, this.scene.input.mousePointer.y)) {
          characterCard.setTint(0x00ff00);
        }
        else {
          characterCard.clearTint();
        }
      });
      if (this.player.leader) {
        if (Phaser.Geom.Rectangle.Contains(this.player.leader.getBounds(), this.scene.input.mousePointer.x, this.scene.input.mousePointer.y)) {
          this.player.leader.setTint(0x00ff00);
        }
        else {
          this.player.leader.clearTint();
        }
      }
    }
  }

  unHighlightValidZones(card: Card) {
    if (card.isCharacterCard()) {
      this.playableCharacterArea.setVisible(false);
    }
    if (card.isDonCard) {
      // unhighlight every player character and leader card
      this.player.characterArea.forEach((card: Card) => {
        card.unHighlightBounds();
      });
      if (this.player.leader) {
        this.player.leader.unHighlightBounds();
      }
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

  checkForDonAttachment(card: Card) {
    let res = false;
    if (card.isDonCard) {
      // Check if the mouse is currently colliding with any of the character cards in play
      this.player.characterArea.forEach((characterCard: Card) => {
        if (Phaser.Geom.Rectangle.Contains(characterCard.getBounds(), this.scene.input.mousePointer.x, this.scene.input.mousePointer.y)) {
          res = true;
          console.log("Don!! Attachment to card:", characterCard.name);
          this.player.attachDon(this.scene, card, characterCard);
        }
      });
      if (this.player.leader) {
        if (Phaser.Geom.Rectangle.Contains(this.player.leader.getBounds(), this.scene.input.mousePointer.x, this.scene.input.mousePointer.y)) {
          res = true;
          console.log("Don!! Attachment to card:", this.player.leader.name);
          this.player.attachDon(this.scene, card, this.player.leader);
        }
      }
    }
    return res;
  }

  initiateAttack(card: Card, pointerX: number = 0, pointerY: number = 0) {
    this.scene.uiHandler.setEndButtonToAttack();
    this.player.setToAttackPhase(this.scene);
    // Create X and Y coords of the center of the card on the screen
    let cardXOnScreen = 0 
    let cardYOnScreen = 0
    
    if (card.isLeaderCard()) {
      cardXOnScreen = (card.x + this.playerLeaderArea.x) + (card.displayWidth / 2);
      cardYOnScreen = (card.y + this.playerLeaderArea.y) + (card.displayHeight / 2);
    } else {
      cardXOnScreen = (card.x + this.playerCharacterArea.x) + (card.displayWidth / 2);
      cardYOnScreen = (card.y + this.playerCharacterArea.y) + (card.displayHeight / 2);
    }

    // Inflate text to instruct the player to select a card to retire
    let informativeText = this.scene.add.text(1920/2, 50, "SELECT A CARD TO ATTACK")
      .setOrigin(0.5, 0.5);
    informativeText.setStyle({
      fontSize: '84px',
      fontFamily: 'Merriweather',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.8)',
    });
    informativeText.setScale(0.01);
    this.scene.tweens.add({
      targets: informativeText,
      scaleX: 1,
      scaleY: 1,
      duration: 350,
      ease: 'Power2',
    });

    let attackLine = this.scene.add.rectangle(cardXOnScreen, cardYOnScreen, 100, 6, 0xff0000)
      .setOrigin(0, 0);
    attackLine.width = Phaser.Math.Distance.Between(cardXOnScreen, cardYOnScreen, pointerX, pointerY);
    attackLine.rotation = Phaser.Math.Angle.Between(cardXOnScreen, cardYOnScreen, pointerX, pointerY);
    attackLine.setInteractive();
    // Make the attack line follow and rotate towards the mouse
    this.scene.input.on('pointermove', (pointer) => {
      attackLine.x = cardXOnScreen;
      attackLine.y = cardYOnScreen;
      attackLine.width = Phaser.Math.Distance.Between(cardXOnScreen, cardYOnScreen, pointer.x, pointer.y);
      attackLine.rotation = Phaser.Math.Angle.Between(cardXOnScreen, cardYOnScreen, pointer.x, pointer.y);
      // Check if mouse is over an attackable card and add a green tint to it
      this.opponentCharacterArea.each((card: Card) => {
        if (Phaser.Geom.Rectangle.Contains(card.getBounds(), pointer.x, pointer.y)) {
          card.setTint(0x00ff00);
        } else {
          card.clearTint();
        }
      });
      if (this.opponent.leader) {
        if (Phaser.Geom.Rectangle.Contains(this.opponent.leader.getBounds(), pointer.x, pointer.y)) {
          this.opponent.leader.setTint(0x00ff00);
        } else {
          this.opponent.leader.clearTint();
        }
      }
    });

    // If player right clicks, it cancels the attack
    this.scene.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        // Unhighlight all the attackable cards
        this.opponentCharacterArea.each((card: Card) => {
          card.unHighlightBounds();
        });
        this.opponent.leader?.unHighlightBounds();
        // Add animation of the attack line receding back to the card
        this.scene.tweens.add({
          targets: attackLine,
          x: cardXOnScreen,
          y: cardYOnScreen,
          width: 0,
          duration: 350,
          ease: 'Power1',
          onComplete: () => {
            attackLine.destroy();
            this.player.playerState = PlayerState.MAIN_PHASE;
            this.scene.uiHandler.setEndButtonToMainPhase();
          }
        });
        // Remove the informative text
        this.scene.tweens.add({
          targets: informativeText,
          scaleX: 0.01,
          scaleY: 0.01,
          duration: 350,
          ease: 'Power2',
          onComplete: () => {
            informativeText.destroy();
          }
        });
        // Remove the graphics that were used to highlight the attackable cards
        this.scene.input.off('pointermove');
        this.scene.input.off('pointerdown');
      }
      else { // if the player left clicks
        // Check if the mouse clicked on an attackable card
        this.opponentCharacterArea.each((card: Card) => {
          if (Phaser.Geom.Rectangle.Contains(card.getBounds(), pointer.x, pointer.y)) {
            console.log("Attacking character card with index:", card.indexInContainer);
          }
        });
        if (this.opponent.leader) {
          if (Phaser.Geom.Rectangle.Contains(this.opponent.leader.getBounds(), pointer.x, pointer.y)) {
            console.log("Attacking leader card");
          }
        }
      }
    });
  }
}
