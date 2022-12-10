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
}
