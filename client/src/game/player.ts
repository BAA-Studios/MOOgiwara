import GameBoard from "../scenes/game_board";
import Card from "./card";
import { Vector } from "js-sdsl";
import { displayTrash } from "../scenes/game_board_pop_ups";
import CounterStack from "./counter_stack";
import { Socket } from "socket.io-client";

export enum PlayerState {
  LOADING,
  MULLIGAN,
  OPPONENTS_TURN,
  MAIN_PHASE,
  ATTACK_PHASE,
  BLOCKER_PHASE,
  COUNTER_PHASE,
  REFRESH_PHASE,
  DON_PHASE,
  DRAW_PHASE,
  RETIRE,
}

export default class Player {
  client: Socket;
  username: string;
  lobbyId: number;
  playerState: PlayerState;
  leader: Card | null = null;
  deck: Vector<Card> // Players don't need to know the deck, info is stored on server, these will be filled with blank cards
  hand: Vector<Card>;
  trash: Vector<Card>;
  characterArea: Vector<Card>;
  donArea: Vector<Card>;
  lifeCards: Vector<Card>; // These will be filled with blank cards, players only need to know the quantity of life cards left

  constructor(username: string, lobbyId: number, client: Socket) {
    this.username = username;
    this.deck = new Vector<Card>();
    this.hand = new Vector<Card>();
    this.trash = new Vector<Card>();
    this.characterArea = new Vector<Card>();
    this.donArea = new Vector<Card>();
    this.lifeCards = new Vector<Card>();
    this.lobbyId = lobbyId;
    this.playerState = PlayerState.LOADING;
    this.client = client;
  }

  addToFrontOfHand(card: Card) {
    this.hand.insert(0, card);
  }

  addToHand(card: Card) {
    this.hand.pushBack(card);
  }


  // Reshift the hand to the left and reassign index of card to -1
  removeCardFromHand(index: number, scene: GameBoard) {
    const cardRemoved = this.hand.getElementByPos(index);
    this.hand.eraseElementByPos(index);
    cardRemoved.indexInContainer = -1;
    for (let i = index; i < this.hand.size(); i++) {
      this.hand.getElementByPos(i).indexInContainer = i;
    }
    scene.gameHandler.playerHandArea.remove(cardRemoved, true);
    return cardRemoved;
  }

  removeCardFromDonArea(index: number, scene: GameBoard) {
    const cardRemoved = this.donArea.getElementByPos(index);
    this.donArea.eraseElementByPos(index);
    cardRemoved.indexInContainer = -1;
    for (let i = index; i < this.hand.size(); i++) {
      this.donArea.getElementByPos(i).indexInContainer = i;
    }
    scene.gameHandler.playerDonArea.remove(cardRemoved, true);
    return cardRemoved;
  }

  shuffleHandToDeck() {
    this.client.emit("shuffleHandToDeck", { });
  }
  
  // Called when the server sends a drawCard request
  handleDrawCard(card: Card) {
    this.addToHand(card);
  }

  // Sends a request to the server to draw a card, and handles the response and any actions after, the default function will do nothing
  requestDrawCard(scene: GameBoard, amount: number = 1, actionAfter?: Function) {
    // Using the callback method to determine when the server has finished drawing the card and it has resolved on the client side
    this.client.emit("drawCard", amount, (data) => {
      this.updateHand(scene, data.cards)
      if (actionAfter) {
        actionAfter();
      }
    });
  }

  // Sends a request to the server to update the Don!! count
  requestDrawDon(amount: number = 1) {
    this.client.emit("drawDon", {
      amount: amount
    });
  }

  /*
  *  Given a new hand from the server, rerender the hand
  */
  updateHand(scene: GameBoard, newHand) {
    // Destroy all cards in hand
    this.hand.clear();
    scene.gameHandler.playerHandArea.removeAll(true);
    // Add new cards to hand
    let cards = newHand.W;
    for (let i = 0; i < newHand.i; i++) {
      const card = new Card(this, scene, cards[i].id)
      .setOrigin(0, 0)
      .setScale(0.25)
      .setInteractive();

      card.initInteractables();

      this.addToHand(card);
      scene.gameHandler.playerHandArea.add(card);
      card.indexInContainer = this.hand.size() - 1;
      card.setPosition(card.calculatePositionInHand(), 0);
      card.objectId = cards[i].objectId;
      card.isInHand = true;
    }
  }

  updateDonArea(scene: GameBoard, cardList) {
    // Destroy all cards in donArea
    this.donArea.clear();
    scene.gameHandler.playerDonArea.removeAll(true);
    // Add new cards to hand
    let cards = cardList.W;
    if (scene.gameHandler.playerDonDeckArea.length > 0) {
      if (cards.length === 10) {
        scene.gameHandler.playerDonDeckArea.removeAll(true);
      }
    }
    for (let i = 0; i < cardList.i; i++) {
      const card = new Card(this, scene, cards[i].id)
      .setOrigin(0, 0)
      .setScale(0.16)
      .setInteractive();

      card.initInteractables();

      this.donArea.pushBack(card);
      scene.gameHandler.playerDonArea.add(card);
      card.indexInContainer = this.donArea.size() - 1;
      card.setPosition(card.calculatePositionInHand(), 0);
      card.objectId = cards[i].objectId;
      if (cards[i].isResting) {
        card.rest();
      }
    }
  }

  updateCharacterArea(scene: GameBoard, cardList) {
    // Destroy all cards in donArea
    // Unhighlight all cards
    for (let i = 0; i < this.characterArea.size(); i++) {
      this.characterArea.getElementByPos(i).boundingBox.destroy();
      this.characterArea.getElementByPos(i).textOnCard.destroy();
    }
    this.characterArea.clear();
    scene.gameHandler.playerCharacterArea.removeAll(true);
    // Add new cards to hand
    let cards = cardList.W;
    for (let i = 0; i < cardList.i; i++) {
      const card = new Card(this, scene, cards[i].id)
      .setOrigin(0, 0)
      .setScale(0.16)
      .setInteractive();

      card.initInteractables(false);

      this.characterArea.pushBack(card);
      scene.gameHandler.playerCharacterArea.add(card);
      card.indexInContainer = this.characterArea.size() - 1;
      card.setPosition(card.calculatePositionInCharacterArea(), 0);
      card.objectId = cards[i].objectId;
      card.summoningSickness = cards[i].summoningSickness;
      card.isInPlay = true;
      if (cards[i].isResting) {
        card.rest();
      }
      if (cards[i].attachedDonCount > 0) {
        card.highlightBounds(0xff0000);
        for (let j = 0; j < cards[i].attachedDonCount; j++) {
          const don = new Card(this, scene, 'donCardAltArt');
          card.donAttached.pushBack(don);
        }
        card.writeOnCard(scene.gameHandler.playerCharacterArea, "+" + card.calculateTotalAttack(), 35, 
        { 
          color: '#00ff00',
          backgroundColor: 'rgba(0,0,0,0.7)',
        });
      }
    }
  }

  getUniqueId() {
    return this.client.id;
  }

  shuffleDeck() {
    this.client.emit("shuffleDeck", {});
  }

  getTotalUnrestedDon() {
    let total = 0;
    for (let i = 0; i < this.donArea.size(); i++) {
      if (!this.donArea.getElementByPos(i).isResting) {
        total++;
      }
    }
    return total;
  }

  playCard(card: Card) {
    if (card.cost > this.getTotalUnrestedDon()) {
      console.log("Not enough Don!!");
      return false;
    }
    if (card.isCharacterCard() && this.characterArea.length >= 5) {
      console.log("Character area is full, must retire a card");
      this.retireCard(card);
      return true;
    }
    this.client.emit("playCard", {
      index: card.indexInContainer
    });
    return true;
  }

  requestRefreshPhase() {
    this.client.emit("refreshPhase", {});
  }

  setToAttackPhase(scene: GameBoard) {
    this.playerState = PlayerState.ATTACK_PHASE;
    // Give every attackable card in the opponent's character area a green lined border
    for (let i = 0; i < scene.gameHandler.opponent.characterArea.size(); i++) {
      let characterCard = scene.gameHandler.opponent.characterArea.getElementByPos(i);
      // TODO: Check if the card is attackable
      if (characterCard.isResting) {
        // Set a box around the characterCard's bounds
        characterCard.highlightBounds();
      }
    }
    // Give the opponent's Leader card a green lined border
    if (scene.opponent.leader) {
      scene.opponent.leader.highlightBounds();
    }
  }

  setToRetireState() {
    this.playerState = PlayerState.RETIRE;
    // Give every card in the player's character area a red lined border
    for (let i = 0; i < this.characterArea.size(); i++) {
      let characterCard = this.characterArea.getElementByPos(i);
      characterCard.highlightBounds();
    }
  }

  attachDon(gameBoard: GameBoard, donCard: Card, characterCard: Card) {
    this.client.emit("attachDon", characterCard.indexInContainer, (donArea) => {
      // Add animation for the don card shrinking inside the card
      gameBoard.tweens.add({
        targets: donCard,
        scaleX: 0,
        scaleY: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          this.playerState = PlayerState.MAIN_PHASE;
          characterCard.highlightBounds(0xff0000); // Give the card a red highlight
          characterCard.donAttached.pushBack(donCard);

          // Add a transparent black background and display the total power of the card
          let container = gameBoard.gameHandler.playerCharacterArea;
          if (characterCard.isLeaderCard()) {
            container = gameBoard.gameHandler.playerLeaderArea;
          }
          characterCard.writeOnCard(container, "+" + characterCard.calculateTotalAttack().toString(), 35, 
            {
              color: '#00ff00',
              backgroundColor: 'rgba(0,0,0,0.7)'
            }
          );
          // Remove don from donArea
          this.updateDonArea(gameBoard, donArea);
        }
      });
    });
  }

  retireCard(card: Card) {
    // Move the card to where the leader area would be
    let scene = card.gameBoard
    this.setToRetireState();
    scene.uiHandler.setEndButtonToRetire();
    scene.tweens.add({
      targets: card,
      x: 4 * 100,
      y: -300,
      duration: 350,
      ease: 'Power2',
    });

    // Inflate text to instruct the player to select a card to retire
    let informativeText = scene.add.text(1920/2, 440, "SELECT A CARD TO REPLACE")
      .setOrigin(0.5, 0.5);
    informativeText.setStyle({
      fontSize: '84px',
      fontFamily: 'Merriweather',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.8)',
    });
    informativeText.setScale(0.01);
    scene.tweens.add({
      targets: informativeText,
      scaleX: 1,
      scaleY: 1,
      duration: 350,
      ease: 'Power2',
    });

    let centerXOnCard = (scene.gameHandler.playerHandArea.x + 400) + (card.displayWidth / 2);
    let centerYOnCard = (scene.gameHandler.playerHandArea.y + -300) + (card.displayHeight / 2);
    let pointerX = scene.input.mousePointer.x
    let pointerY = scene.input.mousePointer.y

    let attackLine = scene.add.rectangle(centerXOnCard, centerYOnCard, 100, 6, 0xff0000)
      .setOrigin(0, 0);
    attackLine.width = Phaser.Math.Distance.Between(centerXOnCard, centerYOnCard, pointerX, pointerY);
    attackLine.rotation = Phaser.Math.Angle.Between(centerXOnCard, centerYOnCard, pointerX, pointerY);
    attackLine.setInteractive();
    // Make the attack line follow and rotate towards the mouse
    scene.input.on('pointermove', (pointer) => {
      attackLine.x = centerXOnCard;
      attackLine.y = centerYOnCard;
      attackLine.width = Phaser.Math.Distance.Between(centerXOnCard, centerYOnCard, pointer.x, pointer.y);
      attackLine.rotation = Phaser.Math.Angle.Between(centerXOnCard, centerYOnCard, pointer.x, pointer.y);
    });

    let clickedValidTarget = false;

    // If player right clicks, it cancels the attack
    scene.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        clickedValidTarget = true;
        scene.gameHandler.playerCharacterArea.each((card: Card) => {
          card.unHighlightBounds();
        });
        // Add animation of the attack line receding back to the card
        scene.tweens.add({
          targets: attackLine,
          x: centerXOnCard,
          y: centerYOnCard,
          width: 0,
          duration: 350,
          ease: 'Power1',
          onComplete: () => {
            scene.tweens.add({
              targets: card,
              x: card.calculatePositionInHand(),
              y: 0,
              duration: 200,
              ease: 'Power2',
            })
            attackLine.destroy();
            this.playerState = PlayerState.MAIN_PHASE;
            scene.uiHandler.setEndButtonToMainPhase();
          }
        });
      }
      else {
        // Check if the mouse clicked on an attackable card
        scene.gameHandler.playerCharacterArea.each((characterCard: Card) => {
          if (Phaser.Geom.Rectangle.Contains(characterCard.getBounds(), pointer.x, pointer.y) && this.playerState == PlayerState.RETIRE) {
            console.log("Retiring character card with index:", characterCard.indexInContainer);
            clickedValidTarget = true;
            this.playerState = PlayerState.LOADING;
            attackLine.destroy();
            this.sendRetirePacket(scene, characterCard.indexInContainer, card.indexInContainer);
            card.destroy();
          }
        });
      }
      if (!clickedValidTarget) {
        return;
      }
      // Remove the informative text
      scene.tweens.add({
        targets: informativeText,
        scaleX: 0.01,
        scaleY: 0.01,
        duration: 350,
        ease: 'Power2',
        onComplete: () => {
          informativeText.destroy();
        }
      });
      scene.input.off('pointermove');
      scene.input.off('pointerdown');
    });
  }

  sendRetirePacket(scene: GameBoard, indexOfCardInPlay: number, indexOfCardInHand: number) {
    this.client.emit("retireCard", indexOfCardInPlay, indexOfCardInHand, (cardList, donCardList, handCardList, trashCardList) => {
      this.updateCharacterArea(scene, cardList);
      this.updateDonArea(scene, donCardList);
      this.updateHand(scene, handCardList)
      this.updateTrash(scene, trashCardList);
      this.playerState = PlayerState.MAIN_PHASE;
      scene.uiHandler.setEndButtonToMainPhase();
    });
  }

  updateTrash(scene: GameBoard, cardList) {
    scene.gameHandler.playerTrashArea.removeAll(true);
    this.trash.clear();
    let cards = cardList.W;
    for (let i = 0; i < cardList.i; i++) {
      let card = new Card(this, scene, cards[i].id, i)
        .setInteractive()
        .setOrigin(0, 0)
        .setScale(0.16);
      card.initInteractables(false);
      this.trash.pushBack(card);
    }
    // We only have to render the last card trashed
    if (this.trash.length > 0) {
      let card = this.trash.getElementByPos(this.trash.length - 1);
      card.on("pointerdown", () => { 
        displayTrash(scene, this.trash);
      });
      scene.gameHandler.playerTrashArea.add(card);
    }
  }

  setBlockerPhase(scene: GameBoard) {
    this.playerState = PlayerState.BLOCKER_PHASE;
    scene.uiHandler.setEndButtonToBlockerPhase();
  }

  setCounterPhase(scene: GameBoard) {
    this.playerState = PlayerState.COUNTER_PHASE;
    scene.uiHandler.setEndButtonToCounterPhase();

    // Instantiate a counter stack
    const counterStack = new CounterStack(scene);
    counterStack.inflate();
  }
}
