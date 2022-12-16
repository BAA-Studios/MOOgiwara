import Phaser from 'phaser';
import Player from '../game/player';
import GameHandler from '../handlers/game_handler';
import UiHandler from '../handlers/ui_handler';
import ChatHandler from '../handlers/chat_handler';
import { Socket } from 'socket.io-client';
import Card from '../game/card';

export default class GameBoard extends Phaser.Scene {
  gameHandler: GameHandler;
  uiHandler: UiHandler;
  player: Player;
  opponent: Player;
  chatHandler: ChatHandler;
  client: Socket;
  lobbyId: number;
  deckList: string[];

  constructor() {
    super('game-board');
  }

  init(data: any) {
    this.player = data.player;
    this.opponent = data.opponent;
    this.client = data.client;
    this.lobbyId = this.player.lobbyId;
    this.deckList = data.deckList;
  }

  preload() {
    this.load.image('background', './images/game_board.png');
    this.load.html('chatbox', './src/game/chat/chat.html');
    let cardsToRender = new Set(this.deckList);
    for (let cardId of cardsToRender) {
      this.load.image(cardId, './cards/' + cardId + ".png");
    }
  }

  create() {
    this.add.image(0, 0, 'background').setOrigin(0, 0);
    let positionIndex = 0;
    for (let cardId of this.deckList) {
      // Set config of each card here
      let card = this.add.existing(new Card(this.player, this, cardId))
      .setOrigin(0, 0)
      .setScale(0.25)
      .setPosition(100 * positionIndex, 0);
      
      card.setInteractive();
      this.input.setDraggable(card);

      // Setting the location of where the card should return if its not played or released
      card.on('pointerdown', (pointer) => {
        if (pointer.rightButtonDown()) {
          return;
        }
        card.dragX = card.x
        card.dragY = card.y
      });

      card.on('dragend', () => {
        // TODO: Add logic to check if card has been dragged over a valid zone
        // Smoothly return the object to its original position
        this.tweens.add({
          targets: card,
          x: card.dragX,
          y: card.dragY,
          duration: 200,
          ease: 'Power2'
        });
      });

      this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
        gameObject.x = dragX;
        gameObject.y = dragY;
        // TODO: Add logic to check if card is being dragged over a valid zone
      });

      card.indexInHand = positionIndex;
      this.player.addHand(card);
      positionIndex++;

      // TODO: Initialize opponent's cards here
    }
    // Initialize any UI Here
    this.uiHandler = new UiHandler(this);
    this.uiHandler.initUi();

    // Initialize Chat Handler Here
    this.chatHandler = new ChatHandler(this);
    this.chatHandler.initChat();

    // Initialize Game Handler Here
    // Start game here
    this.gameHandler = new GameHandler(
      this,
      this.player,
      this.opponent,
      this.client
    );
    this.gameHandler.startGame();
  }
}
