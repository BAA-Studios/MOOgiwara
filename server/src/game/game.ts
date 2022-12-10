import { Socket } from 'socket.io';

export default class Game {
  lobbyId: number;
  playerOneClient: Socket | undefined;
  playerTwoClient: Socket | undefined;

  constructor(lobbyId: number, playerOne?: Socket, playerTwo?: Socket) {
    this.lobbyId = lobbyId;
    this.playerOneClient = playerOne;
    this.playerTwoClient = playerTwo;
  }

  isFull() {
    return this.playerOneClient && this.playerTwoClient;
  }

  push(client: Socket) {
    if (!this.playerOneClient) {
      this.playerOneClient = client;
    } else if (!this.playerTwoClient) {
      this.playerTwoClient = client;
    }
  }
}
