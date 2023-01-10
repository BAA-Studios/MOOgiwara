import GameBoard from "../scenes/game_board";
import Player from "./player";
import cardMetadata from '../cards/metadata.json';
import { displayCardInHigherRes } from "../scenes/game_board_pop_ups";
import { PlayerState } from "./player";

export default class Card extends Phaser.GameObjects.Image {
  cardId: string;
  objectId: number = 0;
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
  isDonCard: boolean;

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
    this.isDonCard = this.name == "Don!!";
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
    return this.isInHand() || this.isDonCard;
  }

  rest() {
    this.isResting = true;
    this.setRotation(Math.PI / 2);
    this.flipX = true;
    this.flipY = true;
  }

  unRest() {
    this.isResting = false;
    this.setRotation(0);
    this.flipX = false;
    this.flipY = false;
  }

  initInteractables(draggable: boolean = true) {

    if (draggable) {
      this.scene.input.setDraggable(this);

      this.scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        if (gameObject.owner.playerState != PlayerState.MAIN_PHASE) {
          return;
        }
        if(!gameObject.isDraggable()) {
          return;
        }
        gameObject.isDragging = true;
        gameObject.x = dragX;
        gameObject.y = dragY;
        // TODO: Add logic to check if card is being dragged over a valid zone
      });

      this.on('dragend', () => {
        // TODO: Add logic to check if card has been dragged over a valid zone
        // Smoothly return the object to its original position
        this.isDragging = false;
        if (!this.isDraggable()) {
          return;
        }
        this.scene.tweens.add({
          targets: this,
          x: this.calculatePositionInHand(),
          y: 0,
          duration: 200,
          ease: 'Power2',
        });
      });
    }
    
    // Adding/Removing a highlight when players hover over a card in their hand
    this.on('pointerover', () => {
      this.setTint(0xbebebe);
    });

    this.on('pointerout', () => {
      this.clearTint();
    });

    // Setting the location of where the card should return if its not played or released
    this.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        displayCardInHigherRes(this.scene, this.cardId);
        return;
      }
    });
  }
}
