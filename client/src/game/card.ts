import GameBoard from "../scenes/game_board";
import Player from "./player";
import cardMetadata from '../cards/metadata.json';

export default class Card extends Phaser.GameObjects.Image {
  cardId: string;
  name: string;
  description: string;
  cost: number;
  attack: number;
  attribute: string;
  image: string;
  owner: Player;
  isResting: boolean;
  dragX: number;
  dragY: number;
  indexInHand: number;
  isDragging: boolean;
  category: string;
  life: number;

  constructor(
    owner: Player,
    scene: GameBoard,
    cardId: string,
    indexInHand = -1
  ) {
    // cardId is to keep this card unique from another card that has the same name and ID
    super(scene, 0, 0, cardId);
    this.cardId = cardId;

    // TODO: Sanity checks as not all cards may have these attributes and may show up as undefined
    this.category = cardMetadata[cardId]['Category']; // All caps as per the API
    // Allocate the properties based off the cardID from the metadata
    this.name = cardMetadata[cardId]['Name'];
    this.description = cardMetadata[cardId]['Effect'];
    this.cost = cardMetadata[cardId]['Cost'];
    this.attack = cardMetadata[cardId]['Power'];
    this.attribute = cardMetadata[cardId]['Attribute'];
    this.life = cardMetadata[cardId]['Life'];
    this.image = cardId + '.png';
    this.isResting = false;

    this.owner = owner;

    this.indexInHand = indexInHand;

    this.dragX = 0;
    this.dragY = 0;

    this.isDragging = false;
  }

  calculatePositionInHand() {
    // TODO: Fix magic number 100
    return this.indexInHand * 100;
  }

  isInHand() {
    return this.indexInHand !== -1;
  }

  isDraggable() {
    // TODO: Finish all conditionals
    return this.isInHand();
  }
}
