import GameBoard from "../scenes/game_board";
import Player from "./player";

export default class Card {
  name: string;
  description: string;
  cost: number;
  attack: number;
  attribute: string;
  image: string;
  owner: Player;
  is_resting: boolean;

  constructor(owner: Player) {
    this.name = 'Luffy';
    this.description = 'This is a card';
    this.cost = 0;
    this.attack = 0;
    this.attribute = 'Strike';
    this.image = 'assets/card.png';
    this.is_resting = false;

    this.owner = owner;
  }

  render(x: number, y: number, scene: GameBoard) {
    const card = scene.add.image(x, y, this.image);
    card.setData({
      owner: this.owner.username,
    });
    card.setInteractive();
    if (card.getData['owner'] === this.owner.username) {
      scene.input.setDraggable(card);
    }
  }
}
