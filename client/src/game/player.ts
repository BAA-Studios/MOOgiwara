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

  addHand(card: Card) {
    this.hand.push(card);
  }

  addTrash(card: Card) {
    this.trash.push(card);
  }

  drawCard() {
    const card = this.deck.pop();
    if (!card) return;
    this.addHand(card);
    return card;
  }
}
