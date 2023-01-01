import GameBoard from "../scenes/game_board";
import Card from "./card";
import { Vector } from "js-sdsl";
import { shuffle } from "../utility/util";

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
  hand: Vector<Card>;
  deck: Vector<Card>;
  trash: Vector<Card>;
  field: Vector<Card>;
  donDeck: Vector<Card>;
  lifeCards: Vector<Card>;

  constructor(username: string, lobbyId: number) {
    this.username = username;
    this.hand = new Vector<Card>();
    this.deck = new Vector<Card>();
    this.trash = new Vector<Card>();
    this.field = new Vector<Card>();
    this.donDeck = new Vector<Card>();
    this.lifeCards = new Vector<Card>();
    this.lobbyId = lobbyId;
    this.playerState = PlayerState.LOADING;
  }

  addDeck(deck: Vector<Card>) {
    this.deck = deck;
  }

  addTopOfDeck(card: Card) {
    this.deck.insert(0, card);
  }

  addBottomOfDeck(card: Card) {
    this.deck.pushBack(card);
  }

  addToFrontOfHand(card: Card) {
    this.hand.insert(0, card);
  }

  addToHand(card: Card) {
    this.hand.pushBack(card);
  }

  removeCardFromTopOfDeck() {
    const cardRemoved = this.deck.getElementByPos(0);
    this.deck.eraseElementByPos(0);
    return cardRemoved;
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

  moveHandToDeck(scene: GameBoard) {
    while (!this.hand.empty()) {
      const card = this.removeCardFromHand(0, scene);
      this.addBottomOfDeck(card);
    }
    this.shuffleDeck();
  }

  addTrash(card: Card) {
    this.trash.pushBack(card);
  }

  drawCard(amount = 1, scene: GameBoard) {
    // Check if the amount is greater than the deck size
    if (amount > this.deck.length) {
      return;
    }
    for (let i = 0; i < amount; i++) {
      const card = this.removeCardFromTopOfDeck();
      if (!card) return;
      // Check if card has already been added to scene
      let sceneCard = card;
      if (sceneCard.scene) {
        sceneCard.setActive(true).setVisible(true);
      } else {
        sceneCard = scene.add.existing(card);
      }

      // TODO: Add animation for drawing card from deck to hand
      this.addToHand(sceneCard);
      card.indexInHand = this.hand.size() - 1;
      sceneCard.setPosition(card.calculatePositionInHand(), 0);
      scene.gameHandler.playerHandArea.add(sceneCard);
    }
    // TODO:
  }

  getUniqueId() {
    return this.client.id;
  }

  shuffleDeck() {
    shuffle(this.deck);
  }

  rerenderHand(scene: GameBoard): void {
    scene.gameHandler.playerHandArea.removeAll(true);
    this.hand.forEach((card) => {
      const sceneCard = scene.add.existing(card);
      scene.gameHandler.playerHandArea.add(sceneCard);
    });
  }
}
