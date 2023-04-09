import Phaser from 'phaser';
import { Socket } from 'socket.io-client';
import Card from '../game/card';
import StandardButton from '../game/menu/buttons/standard_button';
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
    this.opponentCharacterArea = this.scene.add.container(720, 394);

    this.playerHandArea = this.scene.add.container(515, 996).setInteractive();
    this.opponentHandArea = this.scene.add.container(515, -123);

    this.playerDeckArea = this.scene.add.container(1309, 706);
    this.opponentDeckArea = this.scene.add.container(1309, 244);

    this.playerTrashArea = this.scene.add.container(1309, 556);
    this.opponentTrashArea = this.scene.add.container(1309, 392);

    this.playerLeaderArea = this.scene.add.container(947, 704);
    this.opponentLeaderArea = this.scene.add.container(947, 246);

    this.playerDonArea = this.scene.add.container(630, 856);
    this.opponentDonArea = this.scene.add.container(630, 95);

    this.playerDonDeckArea = this.scene.add.container(722, 705);
    this.opponentDonDeckArea = this.scene.add.container(722, 246);

    this.playerLifeArea = this.scene.add.container(572, 555);
    this.opponentLifeArea = this.scene.add.container(572, 247);

    // This is the location of the character area in a rectangle
    this.playableCharacterArea = this.scene.add.graphics();
    this.playableCharacterArea.fillStyle(0x00ff00, 0.3);
    this.playableCharacterArea.fillRoundedRect(717, 552, 570, 141, 18);
    this.playableCharacterArea.setVisible(false);

    // Used to do hit detection
    this.playableCharacterAreaHitBox = this.scene.add.rectangle(717, 552, 570, 141, 0x000000);
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
    this.client.on("drawDon", () => {
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

    this.client.on('mulligan', () => {
      this.player.requestDrawCard(this.scene, 5, () => {
        this.mulligan();
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
          duration: 500,
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
          duration: 500,
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
        card.setPosition(card.calculatePositionInCharacterArea(), 0);
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
            color: '#00ff00',
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
            color: '#00ff00',
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

    this.client.on("opponentInitiateAttack", (data: any, callback: Function) => {
      this.player.setBlockerPhase(this.scene);
      let attackingCard = this.opponent.leader;
      if (!data.cardAttackingIsLeader) {
        attackingCard = this.opponent.characterArea.getElementByPos(data.cardAttackingIndex);
      }
      let defendingCard = this.player.leader;
      if (!data.cardDefendingIsLeader) {
        defendingCard = this.player.characterArea.getElementByPos(data.cardDefendingIndex);
      }
      if (!attackingCard || !defendingCard) {
        return;
      }
      attackingCard.rest();

      // calculate screen coord
      let attackingCardXOnScreen = attackingCard.x;
      let attackingCardYOnScreen = attackingCard.y;

      if (data.cardAttackingIsLeader) {
        attackingCardXOnScreen += this.opponentLeaderArea.x;
        attackingCardYOnScreen += this.opponentLeaderArea.y;
      } else {
        attackingCardXOnScreen += this.opponentCharacterArea.x;
        attackingCardYOnScreen += this.opponentCharacterArea.y;
      }

      attackingCardXOnScreen += attackingCard.displayWidth / 2;
      attackingCardYOnScreen += attackingCard.displayHeight / 2;

      let defendingCardXOnScreen = defendingCard.x;
      let defendingCardYOnScreen = defendingCard.y;

      if (data.cardDefendingIsLeader) {
        defendingCardXOnScreen += this.playerLeaderArea.x;
        defendingCardYOnScreen += this.playerLeaderArea.y;
      } else {
        defendingCardXOnScreen += this.playerCharacterArea.x;
        defendingCardYOnScreen += this.playerCharacterArea.y;
      }

      defendingCardXOnScreen += defendingCard.displayWidth / 2;
      defendingCardYOnScreen += defendingCard.displayHeight / 2;

      // Render a red line from the attacking card to the defending card
      let attackLine = this.scene.add.rectangle(attackingCardXOnScreen, attackingCardYOnScreen, 100, 6, 0xff0000)
        .setOrigin(0, 0);
      // Set the end of the attackLine to the defending card
      attackLine.width = Phaser.Math.Distance.Between(attackingCardXOnScreen, attackingCardYOnScreen, defendingCardXOnScreen, defendingCardYOnScreen);
      attackLine.rotation = Phaser.Math.Angle.Between(attackingCardXOnScreen, attackingCardYOnScreen, defendingCardXOnScreen, defendingCardYOnScreen);

      let damageText = this.scene.add.text(attackingCardXOnScreen, attackingCardYOnScreen, attackingCard.calculateTotalAttack().toString(), {
        fontFamily: 'Merriweather',
        fontSize: "55px",
        color: '#00ff00',
        backgroundColor: 'rgba(0,0,0,0.7)',
      }).setOrigin(0.5, 0.5).setScale(0.01);

      let defendingText = this.scene.add.text(defendingCardXOnScreen, defendingCardYOnScreen, defendingCard.attack.toString(), {
        fontFamily: 'Merriweather',
        fontSize: "55px",
        color: '#ff0000',
        backgroundColor: 'rgba(0,0,0,0.7)',
      }).setOrigin(0.5, 0.5).setScale(0.01);

      let informativeText = this.scene.add.text(1920/2, 50, 
      `Opponent is attacking your ${defendingCard.cardName}`, 
      {
        fontFamily: 'Merriweather',
        fontSize: "84px",
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.8)',
      }).setOrigin(0.5, 0.5).setScale(0.01);

      this.scene.tweens.add({
        targets: [damageText, defendingText, informativeText],
        scaleX: 1,
        scaleY: 1,
        ease: 'Power1',
        duration: 350,
      });

      // Allow player to click on any blockers to take place of the attack
      // BLOCK PHASE

      // Add a skip blocker button
      let skipBlockerButton = this.scene.add.existing(new StandardButton(this.scene, 250, (1080/2)+75, 'SKIP BLOCK', () => {
        skipBlockerButton.setInteractive(false);
        if (this.player.playerState === PlayerState.BLOCKER_PHASE) {
          console.log("Skipped block, going to counter phase");
          callback(-3); // The code to inform server that user skipped block
          this.player.setCounterPhase(this.scene)
        }
        // Unhighlight all blockers
        this.player.characterArea.forEach((cardInField: Card) => {
          cardInField.unHighlightBounds();
        });
        informativeText.setText(`Opponent is attacking your ${defendingCard?.cardName}`);
        informativeText.y = 50;
        skipBlockerButton.destroy();
      }));
      skipBlockerButton.buttonText.setFontSize(34);

      let totalBlockers = 0;
      this.player.characterArea.forEach((card: Card) => {
        if (!card.isBlocker || card.isResting) {
          return;
        }
        card.highlightBounds();
        card.on("pointerdown", () => {
          if (this.player.playerState === PlayerState.BLOCKER_PHASE) {
            // Move the attackLine to the blocker
            let blockerXOnScreen = card.x + this.playerCharacterArea.x + card.displayWidth / 2;
            let blockerYOnScreen = card.y + this.playerCharacterArea.y + card.displayHeight / 2;
  
            attackLine.width = Phaser.Math.Distance.Between(attackingCardXOnScreen, attackingCardYOnScreen, blockerXOnScreen, blockerYOnScreen);
            attackLine.rotation = Phaser.Math.Angle.Between(attackingCardXOnScreen, attackingCardYOnScreen, blockerXOnScreen, blockerYOnScreen);
            
            // Move defender text to the blocker
            defendingText.x = blockerXOnScreen;
            defendingText.y = blockerYOnScreen;
            defendingText.text = card.attack.toString();

            callback(card.indexInContainer);

            card.rest();
            // Unhighlight all blockers
            this.player.characterArea.forEach((cardInField: Card) => {
              cardInField.unHighlightBounds();
            });

            informativeText.setText(`Opponent is attacking your ${card.cardName}`);
            informativeText.y = 50;

            this.player.setCounterPhase(this.scene);
            skipBlockerButton.destroy();
          }
        });
        totalBlockers++;
      });

      if (totalBlockers > 0) {
        informativeText.setText(informativeText.text + "\n                            Select a Blocker");
        informativeText.y = 100;
      }

      if (totalBlockers == 0) {
        skipBlockerButton.destroy();
        this.player.setCounterPhase(this.scene);
        console.log("Go to Counter Phase");
        return;
      }
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

  mulligan() {
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
      case 'trash':
        this.player.updateTrash(this.scene, cards);
        break;
    }
  }

  highlightValidZones(card: Card) {
    if (card.isCharacterCard() || (card.isEventCard() && !card.isCounterEventCard())) {
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
    if (card.isCharacterCard() || (card.isEventCard() && !card.isCounterEventCard())) {
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
          this.player.playerState = PlayerState.LOADING;
          console.log("Don!! Attachment to card:", characterCard.cardName);
          this.player.attachDon(this.scene, card, characterCard);
        }
      });
      if (this.player.leader) {
        if (Phaser.Geom.Rectangle.Contains(this.player.leader.getBounds(), this.scene.input.mousePointer.x, this.scene.input.mousePointer.y)) {
          res = true;
          this.player.playerState = PlayerState.LOADING;
          console.log("Don!! Attachment to card:", this.player.leader.cardName);
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
        let cardToAttack = this.opponent.leader
        let cardToAttackExists = false;
        this.opponentCharacterArea.each((oppCard: Card) => {
          if (Phaser.Geom.Rectangle.Contains(card.getBounds(), pointer.x, pointer.y) && card.isAttackable()) {
            console.log("Attacking character card with index:", card.indexInContainer);
            // Make the end of the attack line point to the middle of the selected card
            cardToAttack = oppCard;
            cardToAttackExists = true;
          }
        });
        if (this.opponent.leader) {
          if (Phaser.Geom.Rectangle.Contains(this.opponent.leader.getBounds(), pointer.x, pointer.y)) {
            console.log("Attacking leader card");
            cardToAttack = this.opponent.leader;
            cardToAttackExists = true;
          }
        }
        
        if (!cardToAttackExists || !cardToAttack) {
          return;
        }

        // Clean up events
        this.scene.input.off('pointermove');
        this.scene.input.off('pointerdown');

        let oppCardXOnScreen = (cardToAttack.x + this.opponentLeaderArea.x) + (cardToAttack.displayWidth / 2);
        let oppCardYOnScreen = (cardToAttack.y + this.opponentLeaderArea.y) + (cardToAttack.displayHeight / 2);
        attackLine.width = Phaser.Math.Distance.Between(cardXOnScreen, cardYOnScreen, oppCardXOnScreen, oppCardYOnScreen);
        attackLine.rotation = Phaser.Math.Angle.Between(cardXOnScreen, cardYOnScreen, oppCardXOnScreen, oppCardYOnScreen);
        // Write how much damage the attack will do, and how much the opponent's defense stat is
        let opponentLeaderX = (cardToAttack.x + this.opponentLeaderArea.x) + (cardToAttack.displayWidth / 2);
        let opponentLeaderY = (cardToAttack.y + this.opponentLeaderArea.y) + (cardToAttack.displayHeight / 2);

        let damageText = this.scene.add.text(cardXOnScreen, cardYOnScreen, card.calculateTotalAttack().toString())
          .setOrigin(0.5, 0.5);
        damageText.setStyle({
          fontSize: '55px',
          fontFamily: 'Merriweather',
          color: '#00ff00',
          backgroundColor: 'rgba(0,0,0,0.7)',
        });

        let defendText = this.scene.add.text(opponentLeaderX, opponentLeaderY, cardToAttack.attack.toString());
        defendText.setOrigin(0.5, 0.5);
        defendText.setStyle({
          fontSize: '55px',
          fontFamily: 'Merriweather',
          color: '#ff0000',
          backgroundColor: 'rgba(0,0,0,0.7)',
        });
        informativeText.setText("Attacking " + cardToAttack.cardName + " for " + card.calculateTotalAttack() + " damage");
        
        // Set the attacker to resting
        card.unHighlightBounds();
        card.rest();
        card.highlightBounds(0xff0000);

        this.client.emit('initiateAttack',
          card.isLeaderCard(),
          card.indexInContainer,
          cardToAttack.isLeaderCard(),
          cardToAttack.indexInContainer, (blockerIndex: number) => {
          // If opponent chose a blocker
          if (blockerIndex === -1) {
            return;
          }
          // Move attack line to the blocker
          let blocker = this.opponent.characterArea.getElementByPos(blockerIndex);
          let blockerXOnScreen = (blocker.x + this.opponentCharacterArea.x) + (blocker.displayWidth / 2);
          let blockerYOnScreen = (blocker.y + this.opponentCharacterArea.y) + (blocker.displayHeight / 2);

          attackLine.width = Phaser.Math.Distance.Between(cardXOnScreen, cardYOnScreen, blockerXOnScreen, blockerYOnScreen);
          attackLine.rotation = Phaser.Math.Angle.Between(cardXOnScreen, cardYOnScreen, blockerXOnScreen, blockerYOnScreen);

          // Move defend text to the blocker
          defendText.x = blockerXOnScreen;
          defendText.y = blockerYOnScreen;
          defendText.setText(blocker.attack.toString());

          blocker.rest();

          // Rewrite the informative text
          informativeText.setText("Attacking " + blocker.cardName + " for " + card.calculateTotalAttack() + " damage");
        });
      }
    });
  }
}
