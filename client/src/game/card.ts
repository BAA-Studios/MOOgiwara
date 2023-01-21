import GameBoard from "../scenes/game_board";
import Player from "./player";
import cardMetadata from '../cards/metadata.json';
import { displayCardInHigherRes } from "../scenes/game_board_pop_ups";
import { PlayerState } from "./player";
import { Vector } from "js-sdsl";

export default class Card extends Phaser.GameObjects.Image {
  cardId: string;
  gameBoard: GameBoard;
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
  indexInHand: number; // Misleading name, this is the index of the card, in their respective containers, field, hand, etc.
  isDragging: boolean;
  category: string;
  life: number;
  isDonCard: boolean;
  summoningSickness: boolean;
  textOnCard: Phaser.GameObjects.Text;
  isInPlay: boolean;
  boundingBox: Phaser.GameObjects.Graphics; // Stores the outer ring highlights of a card
  donAttached: Vector<Card> = new Vector<Card>; // Cards that are attached to this card

  constructor(
    owner: Player,
    scene: GameBoard,
    cardId: string,
    indexInHand = -1
  ) {
    // cardId is to keep this card unique from another card that has the same name and ID
    super(scene, 0, 0, cardId);
    this.cardId = cardId;
    this.gameBoard = scene;

    // TODO: Sanity checks as not all cards may have these attributes and may show up as undefined
    this.category = cardMetadata[cardId]['Category']; // All caps as per the API
    // Allocate the properties based off the cardID from the metadata
    this.name = cardMetadata[cardId]['Name'];
    this.description = cardMetadata[cardId]['Effect'];
    this.cost = cardMetadata[cardId]['Cost'];
    this.attack = parseInt(cardMetadata[cardId]['Power']);
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
    this.summoningSickness = false;

    this.textOnCard = this.scene.add.text(this.x, this.y, '').setVisible(false);
    this.isInPlay = false;

    this.boundingBox = this.scene.add.graphics();
  }

  calculatePositionInHand() {
    // TODO: Fix magic number 100
    if (this.isDonCard) {
      return this.indexInHand * 75;
    }
    return this.indexInHand * 100;
  }

  isInHand() {
    return this.indexInHand !== -1;
  }

  isDraggable() {
    // TODO: Finish all conditionals
    if (this.isResting) {
      return false;
    }
    return this.isInHand() || this.isDonCard;
  }

  isCharacterCard() {
    return this.category == 'CHARACTER';
  }

  isLeaderCard() {
    return this.category == 'LEADER';
  }

  rest() {
    this.setOrigin(0, 1)
    this.isResting = true;
    this.setRotation(Math.PI / 2);
  }

  unRest() {
    this.setOrigin(0, 0)
    this.isResting = false;
    this.setRotation(0);
    this.flipX = false;
    this.flipY = false;
  }

  highlightBounds(color: number = 0x00ff00) {
    this.boundingBox.clear();
    this.boundingBox.setAlpha(0.3);
    this.boundingBox.lineStyle(4, color);
    this.boundingBox.strokeRectShape(this.getBounds());
    this.scene.tweens.add({
      targets: this.boundingBox,
      alpha: 1,
      duration: 850,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  unHighlightBounds() {
    this.scene.tweens.add({
      targets: this.boundingBox,
      alpha: 0,
      duration: 350,
      ease: 'Power1',
      onComplete: () => {
        this.scene.tweens.killTweensOf(this.boundingBox);
        if (this.hasDonAttached()) {
          this.highlightBounds(0xff0000);
        }
      }
    });
  }

  hasDonAttached() {
    return this.donAttached.size() > 0;
  }

  calculateBonusAttackFromDon() {
    return 1000 * this.donAttached.size();
  }

  calculateTotalAttack() {
    return this.attack + this.calculateBonusAttackFromDon();
  }

  // Displays any text in the middle of the card, given a container
  writeOnCard(container: Phaser.GameObjects.Container, text: string, fontSize: number, style?: any) {
    this.textOnCard.setText(text);
    this.textOnCard.setFontSize(fontSize);
    this.textOnCard.setOrigin(0.5, 0.5);
    this.textOnCard.setFontFamily('Merriweather');
    this.textOnCard.setPosition(this.x + container.x + (this.displayWidth / 2), this.y + container.y + (this.displayHeight / 2));
    if (style) {
      this.textOnCard.setStyle(style);
    }
    this.scene.children.bringToTop(this.textOnCard);
    this.textOnCard.setVisible(true);
  }

  // Removes the text on the card
  removeTextOnCard() {
    this.textOnCard.setVisible(false);
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
        // Glow green/gray on areas where cards can be played
        this.gameBoard.gameHandler.highlightValidZones(gameObject);
        gameObject.isDragging = true;
        gameObject.x = dragX;
        gameObject.y = dragY;
      });

      this.on('dragend', () => {
        if (this.owner.playerState != PlayerState.MAIN_PHASE) {
          return;
        }
        this.isDragging = false;
        if (!this.isDraggable()) {
          return;
        }
        // Unhighlight any zones
        this.gameBoard.gameHandler.unHighlightValidZones(this);

        // Check if the card was dropped in a valid zone
        if (this.gameBoard.gameHandler.checkIfCardWasDroppedInValidZone(this)) {
          let result = this.owner.playCard(this);
          if (result) {
            return;
          }
        }
        let result = this.gameBoard.gameHandler.checkForDonAttachment(this);
        if (result) {
          return;
        }
        // Smoothly return the object to its original position
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
        displayCardInHigherRes(this.scene, this);
        return; 
      }
      // Allow the players to initiate an attack with this card has no summoning sickness
      // We don't need to check the owner of the person clicking the card, because the opponent's card's isInPlay attribute is always false
      if (this.isCharacterCard() || this.isLeaderCard()) {
        if (!this.isResting && !this.summoningSickness && this.isInPlay && this.owner.playerState == PlayerState.MAIN_PHASE) {
          // Render an arrow from this card's center following the pointer
          this.gameBoard.gameHandler.initiateAttack(this, pointer.x, pointer.y);
        }
      }
    });
  }
}
