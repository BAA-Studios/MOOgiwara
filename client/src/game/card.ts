import GameBoard from "../scenes/game_board";
import Player from "./player";

export default class Card extends Phaser.GameObjects.Image {
  cardId: string;
  name: string;
  description: string;
  cost: number;
  attack: number;
  attribute: string;
  image: string;
  owner: Player;
  is_resting: boolean;
  dragX: number;
  dragY: number;
  indexInHand: number;
  is_dragging: boolean;

  constructor(owner: Player, scene: GameBoard, cardId: string, indexInHand: number = -1) {
    // cardId is to keep this card unique from another card that has the same name and ID
    super(scene, 0, 0, cardId);
    this.cardId = cardId;
    this.name = 'Luffy';
    this.description = 'This is a card';
    this.cost = 0;
    this.attack = 0;
    this.attribute = 'Strike';
    this.image = cardId + '.png';
    this.is_resting = false;

    this.owner = owner;

    this.indexInHand = indexInHand;

    this.dragX = 0;
    this.dragY = 0;

    this.is_dragging = false;
  }

  render(x: number, y: number) {
    const card = this.scene.add.image(x, y, this.image);
    card.setData({
      owner: this.owner.username,
    });
    card.setInteractive();
    if (card.getData['owner'] === this.owner.username) {
      this.scene.input.setDraggable(card);
    }
  }

  calculatePositionInHand() {
    // TODO: Fix magic number 100
    return this.indexInHand * 100;
  }

  isInHand() {
    return this.indexInHand !== -1;
  }
}
