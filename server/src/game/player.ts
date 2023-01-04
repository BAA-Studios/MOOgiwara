/*
* This file represents a player within a game
*/

import { Socket } from "socket.io";
import { SyncCardList } from "../game/sync_card_list";
import { Card } from "../game/card";
import { identifyLeaderCard } from "../util/utils";
import Game from "../game/game";

export default class Player {
  client: Socket;
  username: string;
  lobbyId: string;
  game: Game | undefined = undefined;
  boardReady = false; // Stores information about whether the client has finished rendering the board
  mulligan = false; // Stores information about whether the client has finished mulliganing

  // Private info to the player
  deck: SyncCardList;
  lifeCards: SyncCardList = new SyncCardList("lifeCards");

  // Public info to the player
  leader: Card | undefined = undefined;
  characterArea: SyncCardList = new SyncCardList("characterArea");
  donDeck: SyncCardList = new SyncCardList("donDeck");
  hand: SyncCardList = new SyncCardList("hand");
  trash: SyncCardList = new SyncCardList("trash");

  constructor(client: Socket, username: string, lobbyId: string, deckList: string[]) {
    this.client = client;
    this.username = username;
    this.lobbyId = lobbyId;
    let tempLeaderId = "";
    for (let card of deckList) {
      if (identifyLeaderCard(card)) {
        tempLeaderId = card;
        this.leader = new Card(card);
        // Remove the leader card from the deck
        deckList.splice(deckList.indexOf(card), 1);
        break;
      }
    }
    this.deck = new SyncCardList("deck", deckList);
    deckList.push(tempLeaderId)
  }

  /*
  * This function initializes the listeners to client requests
  */
  initListeners() {
    this.client.on("drawCard", (data) => {
      let amount = data.amount || 1;
      console.log(`Player ${this.username} requested to draw ${amount} card(s)`);
      this.drawCard(amount);

      // Update the opponent's client
      this.game?.broadcastPacketExceptSelf("opponentDrawCard", { 
        amount: amount,
      }, this);
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
  }

  removeCardFromHand(index: number) {
    let cardRemoved = this.hand.removeAt(index);
    // Update the client's hand
    this.hand.update(this.client);

    // Update the opponent's client
    this.game?.broadcastPacketExceptSelf("opponentRemoveCardFromHand", {
      amount: 1,
    }, this);
    return cardRemoved;
  }

  shuffleHandToDeck() {
    this.deck.extend(this.hand.list());

    // Update the opponent's client
    this.game?.broadcastPacketExceptSelf("opponentRemoveCardFromHand", {
      amount: this.hand.size(),
    }, this);

    this.hand.clear();
    this.deck.shuffle();

    // Update the client's hand
    this.hand.update(this.client);
  }
}
