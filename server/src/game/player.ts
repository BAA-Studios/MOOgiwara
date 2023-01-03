/*
* This file represents a player within a game
*/

import { Socket } from "socket.io";
import { SyncCardList } from "../game/sync_card_list";
import { Card } from "../game/card";

export default class Player {
  client: Socket;
  username: string;
  lobbyId: string;
  boardReady = false; // Stores information about whether the client has finished rendering the board
  mulligan = false; // Stores information about whether the client has finished mulliganing

  // Private info to the player
  deck: SyncCardList;
  lifeCards: SyncCardList = new SyncCardList("lifeCards");

  // Public info to the player
  leader: Card | null = null;
  donDeck: SyncCardList = new SyncCardList("donDeck");
  hand: SyncCardList = new SyncCardList("hand");
  trash: SyncCardList = new SyncCardList("trash");

  constructor(client: Socket, username: string, lobbyId: string, deckList: string[]) {
    this.client = client;
    this.username = username;
    this.lobbyId = lobbyId;
    // TODO: remove and identify the leader card in the deckList
    this.deck = new SyncCardList("deck", deckList);
  }

  /*
  * This function initializes the listeners to client requests
  */
  initListeners() {
    this.client.on("drawCard", (data) => {
      let amount = data.amount || 1;
      console.log(`Player ${this.username} requested to draw ${amount} card(s)`);
      this.drawCard(amount);
    });

    this.client.on("shuffleHandToDeck", () => {
      console.log(`Player ${this.username} requested to shuffle hand to deck`);
      this.shuffleHandToDeck();
    });

    this.client.on('shuffleDeck', () => {
      console.log(`Player ${this.username} requested to shuffle deck`);
      this.deck.shuffle();
    });
  }

  drawCard(amount: number = 1) {
    for (let i = 0; i < amount; i++) {
      if (this.deck.size() === 0) {
        break;
      }
      const card = this.deck.popTopCard();
      this.hand.push(card);
    }
    // Update the client's hand
    this.hand.update(this.client);
    this.client.emit("finishDrawCard", { });
  }

  shuffleHandToDeck() {
    this.deck.extend(this.hand.list());
    this.hand.clear();
    this.deck.shuffle();

    // Update the client's hand
    this.hand.update(this.client);
  }
}
