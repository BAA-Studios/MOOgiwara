import GameBoard from "../scenes/game_board";
import Card from "./card";

export default class Player {
  client: any;
  username: string;
  lobbyId: number;

  hand: Card[];
  deck: Card[];
  trash: Card[];
  field: Card[];
  donDeck: Card[];
  lifeCards: Card[];

  constructor(username: string, lobbyId: number) {
    this.username = username;
    this.hand = [];
    this.deck = [];
    this.trash = [];
    this.field = [];
    this.donDeck = [];
    this.lifeCards = [];
    this.lobbyId = lobbyId;
  }

  addDeck(deck: Card[]) {
    this.deck = deck;
  }

  addTopOfDeck(card: Card) {
    this.deck.push(card);
  }

  addBottomOfDeck(card: Card) {
    this.deck.unshift(card);
  }

  addToFrontOfHand(card: Card) {
    this.hand.unshift(card);
  }

  addToHand(card: Card) {
    this.hand.push(card);
  }

  // Reshift the hand to the left and reassign index of card to -1
  removeCardFromHand(index: number) {
    let cardRemoved = this.hand.splice(index, 1)[0];
    cardRemoved.indexInHand = -1;
    for (let i = index; i < this.hand.length; i++) {
      this.hand[i].indexInHand = i;
    }
  }

  addTrash(card: Card) {
    this.trash.push(card);
  }

  drawCard(amount: number = 1, scene: GameBoard) {
    // Check if the amount is greater than the deck size
    if (amount > this.deck.length) {
      return;
    }
    for (let i = 0; i < amount; i++) {
      const card = this.deck.pop();
      if (!card) return;
      let sceneCard = scene.add.existing(card);
      // TODO: Add animation for drawing card from deck to hand
      this.addToHand(sceneCard);
      card.indexInHand = this.hand.length - 1;
      sceneCard.setPosition(card.calculatePositionInHand(), 0);
      scene.gameHandler.playerHandArea.add(sceneCard);
    }
  }

  getUniqueId() {
    return this.client.id;
  }

  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }
}
