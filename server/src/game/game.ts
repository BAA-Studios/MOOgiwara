/*
  This file is responsible for handling a game instance
*/

import Player from './player';

export default class Game {
  playerOne: Player | undefined;
  playerTwo: Player | undefined;
  whoseTurn = 1;

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
    this.playerOne = undefined;
    this.playerTwo = undefined;
  }

  push(player: Player) {
    if (!this.playerOne) {
      this.playerOne = player;
    } else if (!this.playerTwo) {
      this.playerTwo = player;
    }
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

  getPlayer(index: number) {
    return index === 1 ? this.playerOne : this.playerTwo;
  }
}
