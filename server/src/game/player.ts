/*
* This file represents a player within a game
*/

import { Socket } from "socket.io";
import { SyncCardList } from "../game/sync_card_list";
import { Card } from "../game/card";
import { identifyLeaderCard } from "../util/utils";
import Game from "../game/game";
import { playCard } from "../cards/card_engine";

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
  donArea: SyncCardList = new SyncCardList("donArea");
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

    // Init the don deck with 10 don cards
    for (let i = 0; i < 10; i++) {
      const card = new Card("donCardAltArt");
      this.donDeck.push(card);
    }
  }

  /*
  * This function initializes the listeners to client requests
  */
  initListeners() {
    this.client.on("drawCard", (amount: number, callback) => {
      console.log(`[INFO] Player ${this.username} requested to draw ${amount} card(s)`);
      this.drawCard(amount);

      callback({
        cards: this.hand.cards(),
        type: this.hand.type
      });

      // Update the opponent's client
      this.game?.broadcastPacketExceptSelf("opponentDrawCard", { 
        amount: amount,
      }, this);
    });

    this.client.on("drawDon", (data) => {
      let amount = data.amount;
      console.log(`[INFO] Player ${this.username} requested to draw ${amount} Don!!`);
      if (this.donDeck.size() === 0) { 
        return;
      }
      let serverAmountCalculated = this.drawDon(amount);
      this.game?.broadcastPacketExceptSelf("opponentDrawDon", {
        amount: serverAmountCalculated,
      }, this);
    });

    this.client.on("shuffleHandToDeck", () => {
      console.log(`[INFO] Player ${this.username} requested to shuffle hand to deck`);
      this.shuffleHandToDeck();
    });

    this.client.on('shuffleDeck', () => {
      console.log(`[INFO] Player ${this.username} requested to shuffle deck`);
      this.deck.shuffle();
    });

    this.client.on('endTurn', () => {
      console.log(`[INFO] Player ${this.username} requested to end turn`);
      this.game?.broadcastChat(`${this.username} ended their turn.`);
      this.game?.changeTurn();
    });

    this.client.on('playCard', (data) => {
      let cardPlayed = this.hand.get(data.index);
      if (cardPlayed === undefined) {
        console.log(`[ERROR] Player ${this.username} tried to play a card that doesn't exist`);
        return;
      }
      console.log(`[INFO] Player ${this.username} requested to play card ${cardPlayed.name}`);
      // send card to the card engine to determine how it should be played.
      playCard(this, cardPlayed);
    });

    this.client.on('refreshPhase', () => {
      console.log(`[INFO] Player ${this.username} requested to refresh their board (Refresh Phase))`);
      // Unrest all cards
      this.characterArea.list().forEach((card) => {
        card.isResting = false;
      });
      this.characterArea.update(this.client);
      this.game?.broadcastPacketExceptSelf("opponentUpdateCharacterArea", {
        cards: this.characterArea.list()
      }, this);
      this.donArea.list().forEach((card) => {
        card.isResting = false;
      });
      this.donArea.update(this.client);
      this.game?.broadcastPacketExceptSelf("opponentUpdateDonArea", { 
        cards: this.donArea.list() 
    }, this);
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
  }

  drawDon(amount: number = 1) {
    let cardsDrawn = 0;
    for (let i = 0; i < amount; i++) {
      if (this.donDeck.size() === 0) {
        break;
      }
      const card = this.donDeck.popTopCard();
      this.donArea.push(card);
      cardsDrawn++;
    }

    this.donArea.update(this.client);
    return cardsDrawn;
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

  setLifeCards() {
    if (this.leader === undefined) {
      return;
    }
    for (let i = 0; i < this.leader.life; i++) {
      this.lifeCards.push(this.deck.popTopCard());
    }
  }

  getHeathLeft() {
    return this.lifeCards.size();
  }

  getUnrestedDonLeft() {
    let unrestedDon = 0;
    for (let card of this.donArea.list()) {
      if (!card.isResting) {
        unrestedDon++;
      }
    }
    return unrestedDon;
  }

  getDonTotal() {
    return this.donArea.size();
  }

  restDon(amount: number = 1) {
    let unrestedDon = this.getUnrestedDonLeft();
    if (unrestedDon === 0) {
      return;
    }
    if (amount > unrestedDon) {
      amount = unrestedDon;
    }
    // Rest the cards starting from the back of the list
    for (let i = this.donArea.size() - 1; i >= 0; i--) {
      let card = this.donArea.get(i);
      if (card === undefined) {
        continue;
      }
      if (!card.isResting && amount > 0) {
        card.isResting = true;
        amount--;
      }
    }
    this.donArea.update(this.client);
  }
}
