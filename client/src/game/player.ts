import Card from "./card";

export default class Player {
  client: any
  username: string;
  hand: Card[];
  deck: Card[];
  trash: Card[];
  field: Card[];
  donDeck: Card[];
  lifeCards: Card[];

  constructor() {
    this.username = 'Player';
    this.hand = [];
    this.deck = [];
    this.trash = [];
    this.field = [];
    this.donDeck = [];
    this.lifeCards = [];
  }
}
