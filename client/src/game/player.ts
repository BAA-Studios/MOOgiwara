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

  constructor(username: string) {
    this.username = username;
    this.hand = [];
    this.deck = [];
    this.trash = [];
    this.field = [];
    this.donDeck = [];
    this.lifeCards = [];
  }
}
