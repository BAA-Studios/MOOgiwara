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
    this.load.image('optcg_card_back', './cards/optcg_card_back.jpg');
    this.load.image('donCardAltArt', './cards/donCardAltArt.png');
    this.load.image('moogiwara', './images/MOOgiwara.png');

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

    // Identifying the leader card
    for (const cardId of this.deckList) {
      const card = new Card(this.player, this, cardId);
      // TODO(FIX): This is a crude way of identifying the leader from a decklist
      // The deck builder will use a specific syntax for decks that will allow us to identify the leader card faster
      if (card.category === 'LEADER') {
        card.setOrigin(0, 0).setScale(0.25).setInteractive();
        card.initInteractables();
        card.setScale(0.16);
        this.player.leader = card;
        this.player.leader.isInPlay = true;
        this.player.leader.summoningSickness = true;
        continue;
      }
    }

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
            displayCardInHigherRes(this, card);
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

    this.client.emit("boardFullyLoaded", { lobbyId: this.lobbyId });

    this.gameHandler.initListeners();
  }
}
