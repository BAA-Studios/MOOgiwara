/*
  This file is responsible for handling a game instance
*/

import Player from './player';

export default class Game {
  playerOne: Player | undefined;
  playerTwo: Player | undefined;
  whoseTurn = 1;
  turnNumber = 0;

  constructor(playerOne?: Player, playerTwo?: Player) {
    this.playerOne = playerOne;
    this.playerTwo = playerTwo;
  }

  isFull() {
    return this.playerOne && this.playerTwo;
  }

  isEmpty() {
    if (!this.playerTwo) {
      return this.playerOne?.client.disconnected;
    }
    return (
      this.playerOne?.client.disconnected && this.playerTwo?.client.disconnected
    );
  }

  bothPlayersReady() {
    return this.playerOne?.boardReady && this.playerTwo?.boardReady;
  }

  bothPlayersMulliganed() {
    return this.playerOne?.mulligan && this.playerTwo?.mulligan;
  }

  clearPlayers() {
    if (this.playerOne) {
      this.playerOne.game = undefined;
      this.playerOne = undefined;
      return;
    }
    if (this.playerTwo) {
      this.playerTwo.game = undefined;
      this.playerTwo = undefined;
    }
  }

  push(player: Player) {
    if (!this.playerOne) {
      this.playerOne = player;
    } else if (!this.playerTwo) {
      this.playerTwo = player;
    }
  }

  changeTurn() {
    if (this.whoseTurn === 1) {
      this.whoseTurn = 2;
    } else {
      this.whoseTurn = 1;
    }
    this.turnNumber++;
    this.sendChangeTurnPacket(this.getPlayer(this.whoseTurn)?.client.id);
  }

  sendChangeTurnPacket(playerId: string | undefined) {
    this.broadcastPacket('changeTurn', {
      personToChangeTurnTo: playerId,
      turnNumber: this.turnNumber,
    });
  }

  broadcastChat(message: string) {
    this.playerOne?.client.emit('chatMessage', {
      message: message,
    });
    this.playerTwo?.client.emit('chatMessage', {
      message: message,
    });
  }

  broadcastPacket(header: string, data: any) {
    this.playerOne?.client.emit(header, data);
    this.playerTwo?.client.emit(header, data);
  }

  broadcastPacketExceptSelf(header: string, data: any, player: Player) {
    if (player === this.playerOne) {
      this.playerTwo?.client.emit(header, data);
    } else {
      this.playerOne?.client.emit(header, data);
    }
  }

  getPlayer(index: number) {
    return index === 1 ? this.playerOne : this.playerTwo;
  }

  getOpponent(player: Player) {
    if (player === this.playerOne) {
      return this.playerTwo;
    }
    return this.playerOne;
  }

  playersTurn(player: Player) {
    if (this.playerOne === player) {
      return this.whoseTurn === 1;
    }
    return this.whoseTurn === 2;
  }

  start() {
    // Assign each player's cards in their deck with a unique object Id
    if (!(this.playerOne?.deck && this.playerTwo?.deck)) {
      return;
    }
    let id = 0;

    for(let i = 0; i < this.playerOne?.deck.size(); i++) {
      let card = this.playerOne?.deck.get(i);
      card.objectId = id;
      id++;
    }

    for(let i = 0; i < this.playerTwo?.deck.size(); i++) {
      let card = this.playerOne?.deck.get(i);
      card.objectId = id;
      id++
    }
  }
}
