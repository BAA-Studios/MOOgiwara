import { Socket } from "socket.io";

export default class Player {
    client: Socket;
    username: string;
    lobbyId: string;
    boardReady: boolean = false; // Stores information about whether the client has finished rendering the board


    constructor(client: Socket, username: string, lobbyId: string) {
        this.client = client;
        this.username = username;
        this.lobbyId = lobbyId;
    }
}