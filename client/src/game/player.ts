import GameBoard from "../scenes/game_board";
import Card from "./card";
import { Vector } from "js-sdsl";

export enum PlayerState {
  LOADING,
  MULLIGAN,
  OPPONENTS_TURN,
  MAIN_PHASE,
  COUNTER_PHASE,
  DON_PHASE,
  DRAW_PHASE,
}

export default class Player {
  client: any;
  username: string;
  lobbyId: number;
  playerState: PlayerState;
  leader: Card | null = null;
  // deck: Vector<Card>: Players don't need to know the deck, info is stored on server
  hand: Vector<Card>;
  trash: Vector<Card>;
  field: Vector<Card>;
  donDeck: Vector<Card>;
  lifeCards: Vector<Card>; // These will be filled with blank cards, players only need to know the quantity of life cards left

  constructor(username: string, lobbyId: number) {
    this.username = username;
    this.hand = new Vector<Card>();
    this.trash = new Vector<Card>();
    this.field = new Vector<Card>();
    this.donDeck = new Vector<Card>();
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
    scene.gameHandler.playerHandArea.remove(cardRemoved);
    cardRemoved.setActive(false).setVisible(false);
    return cardRemoved;
  }

  shuffleHandToDeck() {
    this.client.emit("shuffleHandToDeck", { });
  }

  drawCard(amount = 1) {
    this.client.emit("drawCard", {
      amount: amount
    });
  }

  /*
  *  Given a new hand from the server, rerender the hand
  */
  updateHand(scene: GameBoard, newHand) {
    // Destroy all cards in hand
    while (!this.hand.empty()) {
      const card = this.removeCardFromHand(0, scene);
      card.destroy();
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
    }
    this.handUpToDate = true;
  }

  getUniqueId() {
    return this.client.id;
  }

  shuffleDeck() {
    this.client.emit("shuffleDeck", {});
  }
}
