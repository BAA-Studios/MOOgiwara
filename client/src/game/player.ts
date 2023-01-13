import GameBoard from "../scenes/game_board";
import Card from "./card";
import { Vector } from "js-sdsl";

export enum PlayerState {
  LOADING,
  MULLIGAN,
  OPPONENTS_TURN,
  MAIN_PHASE,
  COUNTER_PHASE,
  REFRESH_PHASE,
  DON_PHASE,
  DRAW_PHASE,
}

export default class Player {
  client: any;
  username: string;
  lobbyId: number;
  playerState: PlayerState;
  leader: Card | null = null;
  deck: Vector<Card> // Players don't need to know the deck, info is stored on server, these will be filled with blank cards
  hand: Vector<Card>;
  trash: Vector<Card>;
  field: Vector<Card>;
  donArea: Vector<Card>;
  lifeCards: Vector<Card>; // These will be filled with blank cards, players only need to know the quantity of life cards left

  constructor(username: string, lobbyId: number) {
    this.username = username;
    this.deck = new Vector<Card>();
    this.hand = new Vector<Card>();
    this.trash = new Vector<Card>();
    this.field = new Vector<Card>();
    this.donArea = new Vector<Card>();
    this.lifeCards = new Vector<Card>();
    this.lobbyId = lobbyId;
    this.playerState = PlayerState.LOADING;
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
    cardRemoved.indexInHand = -1;
    for (let i = index; i < this.hand.size(); i++) {
      this.hand.getElementByPos(i).indexInHand = i;
    }
    scene.gameHandler.playerHandArea.remove(cardRemoved, true);
    return cardRemoved;
  }

  removeCardFromDonArea(index: number, scene: GameBoard) {
    const cardRemoved = this.donArea.getElementByPos(index);
    this.donArea.eraseElementByPos(index);
    cardRemoved.indexInHand = -1;
    for (let i = index; i < this.hand.size(); i++) {
      this.donArea.getElementByPos(i).indexInHand = i;
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

  // Sends a request to the server to draw a card
  requestDrawCard(amount: number = 1) {
    this.client.emit("drawCard", {
      amount: amount
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
    while (!this.hand.empty()) {
      this.removeCardFromHand(0, scene);
    }
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
      card.indexInHand = this.hand.size() - 1;
      card.setPosition(card.calculatePositionInHand(), 0);
      card.objectId = cards[i].objectId;
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
      card.indexInHand = this.donArea.size() - 1;
      card.setPosition(card.calculatePositionInHand(), 0);
      card.objectId = cards[i].objectId;
    }
  }

  getUniqueId() {
    return this.client.id;
  }

  shuffleDeck() {
    this.client.emit("shuffleDeck", {});
  }
}
