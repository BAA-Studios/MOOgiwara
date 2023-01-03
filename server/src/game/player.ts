import { Socket } from "socket.io";
import { Card } from "./card";
import { Vector } from "js-sdsl";

export default class Player {
  client: Socket;
  username: string;
  lobbyId: string;
  boardReady = false; // Stores information about whether the client has finished rendering the board
  mulligan = false; // Stores information about whether the client has finished mulliganing
  deck: Vector<Card> = new Vector<Card>();

  constructor(client: Socket, username: string, lobbyId: string) {
    this.client = client;
    this.username = username;
    this.lobbyId = lobbyId;
  }
}
