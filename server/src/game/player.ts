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
    deckList.push(tempLeaderId);

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
      // Unrest all cards and return any attached dons to the don deck
      this.characterArea.list().forEach((card) => {
        card.isResting = false;
        for (let i = 0; i < card.attachedDon.size(); i++) {
          this.donArea.push(card.attachedDon.getElementByPos(i));
        }
        card.clearDon();
      });
      // Return dons from leader to don area
      this.leader?.attachedDon.forEach((don) => {
        this.donArea.push(don);
      });

      this.leader?.clearDon();
      this.updateLeaderForOpponent();

      this.setSummoningSickness();
      this.characterArea.update(this.client);
      this.updateCharacterAreaForOpponent()
      this.donArea.list().forEach((card) => {
        card.isResting = false;
      });
      this.donArea.update(this.client);
      this.updateDonAreaForOpponent();
    });

    this.client.on("deckCount", (_, callback: Function) => {
      let count = this.deck.size();
      console.log(`[INFO] Player ${this.username} requested to know the size of their deck`)
      callback(count);
    });

    this.client.on("attachDon", (cardIndex: number, callback: Function) => {
      let cardAttachedTo: Card | undefined;
      if (cardIndex === -1) { // Is leader card
        cardAttachedTo = this.leader;
      } else {
        cardAttachedTo = this.characterArea.get(cardIndex);
      }

      if (!cardAttachedTo) {
        console.log(`[ERROR] Player ${this.username} tried to attach a don to a card that doesn't exist`);
        return;
      }

      console.log(`[INFO] Player ${this.username} requested to attach a Don!! to character ${cardAttachedTo?.name}`);
      // Remove the last unrested don from the don area
      for (let i = this.donArea.size() - 1; i >= 0; i--) {
        let don = this.donArea.get(i);
        if (!don.isResting) {
          cardAttachedTo.addDon(don);
          this.donArea.remove(don);
          break;
        }
      }
      callback(this.donArea.list());
      this.updateDonAreaForOpponent();

      if (cardIndex === -1) {
        this.updateLeaderForOpponent();
      } else {
        this.updateCharacterAreaForOpponent();
      }

      // Broadcast the don attached to the opponent
      this.game?.broadcastChat(`${this.username} attached a Don!! \nto "${cardAttachedTo.name}"`);
    });

    this.client.on("retireCard", (cardIndexInPlay: number, cardIndexInHand: number,  callback: Function) => {
      let cardRetired: Card | undefined;
      cardRetired = this.characterArea.get(cardIndexInPlay);
      let cardInHand = this.hand.get(cardIndexInHand);

      if (!cardInHand) {
        console.log(`[ERROR] Player ${this.username} tried to replace a card with a card that doesn't exist`);
        return;
      }

      if (!cardRetired) {
        console.log(`[ERROR] Player ${this.username} tried to replace a card that doesn't exist`);
        return;
      }
      console.log(`[INFO] Player ${this.username} requested to retire character: "${cardRetired?.name}" with character: "${cardInHand?.name}"`);
      // Remove the card from player's hand
      this.hand.remove(cardInHand);
      // Insert this card into the character area
      this.characterArea.insertAt(cardIndexInPlay, cardInHand);
      // Remove the original card from the character area
      this.characterArea.remove(cardRetired);
      // Check for any attached Don!! and return it to the donArea rested
      cardRetired.attachedDon.forEach((don) => {
        don.isResting = true;
        this.donArea.push(don);
      });
      cardRetired.clearDon();

      this.restDon(cardInHand.cost, false);
      cardInHand.summoningSickness = true;

      // Add it to the trash
      this.trash.push(cardRetired);

      callback(this.characterArea.list(), this.donArea.list(), this.hand.list(), this.trash.list());

      // Update every area for opponent
      this.updateCharacterAreaForOpponent();
      this.sendRemoveCardFromHandPacketToOpponent(1);
      this.updateDonAreaForOpponent();

      this.game?.broadcastChat(`${this.username} retired "${cardRetired.name}" \nand replaced it with "${cardInHand.name}"`);
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
    // Update the opponent's client
    this.game?.broadcastPacketExceptSelf("opponentRemoveCardFromHand", {
      amount: this.hand.size(),
    }, this);

    while(!this.hand.empty()) {
      this.deck.push(this.hand.popTopCard());
    }
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

  restDon(amount: number = 1, update: boolean = true) {
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
    if (update) { 
      this.donArea.update(this.client);
     }
  }

  setSummoningSickness() {
    for (let card of this.characterArea.list()) {
      card.summoningSickness = false;
    }
  }

  updateLeaderForOpponent() {
    this.game?.broadcastPacketExceptSelf("opponentUpdateLeader", {
      card: this.leader
    }, this);
  }

  updateCharacterAreaForOpponent() {
    this.game?.broadcastPacketExceptSelf("opponentUpdateCharacterArea", {
      cards: this.characterArea.list()
    }, this);
  }

  updateDonAreaForOpponent() {
    this.game?.broadcastPacketExceptSelf("opponentUpdateDonArea", {
      cards: this.donArea.list()
    }, this);
  }

  sendRemoveCardFromHandPacketToOpponent(amount: number) {
    this.game?.broadcastPacketExceptSelf("opponentRemoveCardFromHand", {
      amount: amount
    }, this);
  }
}
