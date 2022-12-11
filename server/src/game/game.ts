import { Socket } from 'socket.io';

export default class Game {
  playerOneClient: Socket | undefined;
  playerTwoClient: Socket | undefined;

  constructor(playerOne?: Socket, playerTwo?: Socket) {
    this.playerOneClient = playerOne;
    this.playerTwoClient = playerTwo;
  }

  isFull() {
    return this.playerOneClient && this.playerTwoClient;
  }

  isEmpty() {
    if (!this.playerTwoClient) {
      return this.playerOneClient?.disconnected
    }
    return this.playerOneClient?.disconnected && this.playerTwoClient?.disconnected;
  }

  clearPlayers() {
    this.playerOneClient = undefined;
    this.playerTwoClient = undefined;
  }

  push(client: Socket) {
    if (!this.playerOneClient) {
      this.playerOneClient = client;
    } else if (!this.playerTwoClient) {
      this.playerTwoClient = client;
    }
  }
}
