import Phaser from 'phaser';
import Player, { PlayerState } from '../game/player';
import GameHandler from '../handlers/game_handler';
import UiHandler from '../handlers/ui_handler';
import ChatHandler from '../handlers/chat_handler';
import { Socket } from 'socket.io-client';
import Card from '../game/card';
import { displayCardInHigherRes } from './game_board_pop_ups';
import { identifyLeaderCard } from '../utility/util';

export default class GameBoard extends Phaser.Scene {
  gameHandler: GameHandler;
  uiHandler: UiHandler;
  player: Player;
  opponent: Player;
  chatHandler: ChatHandler;
  client: Socket;
  lobbyId: number;
  deckList: string[];
  opponentDeckList: string[];

  constructor() {
    super('game-board');
  }

  init(data: any) {
    this.player = data.player;
    this.opponent = data.opponent;
    this.client = data.client;
    this.lobbyId = this.player.lobbyId;
    this.deckList = data.deckList;
    this.opponentDeckList = data.opponentDeckList;
    this.player.client = this.client;
  }

  preload() {
    this.load.image('background', './images/game_board.png');
    this.load.html('chatbox', './src/game/chat/chat.html');
    this.load.image('hollowShortButton', './buttons/Hollow Short Button.png');
    this.load.image('standardButton', './buttons/Standard Button.png');
    this.load.image('loading', './images/mugiwara_logo_temp.png');

    const cardsToRender = new Set(this.deckList);
    const opponentCardsToRender = new Set(this.opponentDeckList);
    // Loads our deck
    for (const cardId of cardsToRender) {
      this.load.image(cardId, './cards/' + cardId + '.png');
      // Identify the leader card and remove it from the decklist
    }
    // Loads the opponent's deck
    for (const cardId of opponentCardsToRender) {
      this.load.image(cardId, './cards/' + cardId + '.png');
    }
  }

  create() {
    // This game will inject the right click button
    this.input.mouse?.disableContextMenu();
    this.add.image(0, 0, 'background').setOrigin(0, 0);

    for (const cardId of this.deckList) {
      // Set config of each card here
      const card = new Card(this.player, this, cardId)
        .setOrigin(0, 0)
        .setScale(0.25);
      card.setInteractive();
      this.input.setDraggable(card);

      // Adding/Removing a highlight when players hover over a card in their hand
      card.on('pointerover', () => {
        card.setTint(0xbebebe);
      });

      card.on('pointerout', () => {
        card.clearTint();
      });

      // Setting the location of where the card should return if its not played or released
      card.on('pointerdown', (pointer) => {
        if (pointer.rightButtonDown()) {
          displayCardInHigherRes(this, card.cardId);
          return;
        }
      });

      card.on('dragend', () => {
        // TODO: Add logic to check if card has been dragged over a valid zone
        // Smoothly return the object to its original position
        card.isDragging = false;
        if (!card.isDraggable()) {
          return;
        }
        this.tweens.add({
          targets: card,
          x: card.calculatePositionInHand(),
          y: 0,
          duration: 200,
          ease: 'Power2',
        });
      });

      this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        if (gameObject.owner.playerState != PlayerState.MAIN_PHASE) {
          return;
        }
        if(!gameObject.isDraggable()) {
          return;
        }
        gameObject.is_dragging = true;
        gameObject.x = dragX;
        gameObject.y = dragY;
        // TODO: Add logic to check if card is being dragged over a valid zone
      });

      // TODO(FIX): This is a crude way of identifying the leader from a decklist
      // The deck builder will use a specific syntax for decks that will allow us to identify the leader card faster
      if (card.category === 'LEADER') {
        card.setScale(0.16);
        this.player.leader = card;
        console.log(card)
        continue;
      }
      this.player.addTopOfDeck(card);
    }

    // TODO: Initialize opponent's cards here
    // TODO: DRY this code up
    // Find opponent's leader card
    for (const cardId of this.opponentDeckList) {
      if (identifyLeaderCard(cardId)) {
        let card = new Card(this.opponent, this, cardId);
        this.opponent.leader = card
          .setOrigin(0, 0)
          .setScale(0.16)
          .setInteractive();
        card.category = 'LEADER';
        card.on('pointerdown', (pointer) => {
          if (pointer.rightButtonDown()) {
            displayCardInHigherRes(this, cardId);
            return;
          }
        });
        // Adding/Removing a highlight when players hover over a card in their hand
        card.on('pointerover', () => {
          card.setTint(0xbebebe);
        });

        card.on('pointerout', () => {
          card.clearTint();
        });
      }
    }

    this.player.shuffleDeck();
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

    this.player.drawCard(5, this);

    this.client.emit("boardFullyLoaded", { lobbyId: this.lobbyId });

    this.gameHandler.initListeners();
  }
}
