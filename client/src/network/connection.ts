/*
    for all connections related packets
*/
import io, { Socket } from 'socket.io-client';
import Phaser from 'phaser';
import Player from '../game/player';

// The initial connection to the server
export function connectToServer(): Socket {
  const socket = io('http://localhost:3000');
  // TODO: Tell server what the user put in the username field
  return socket;
}

// The server sends a packet to the client to match the client with another player
export function waitForGame(scene: Phaser.Scene, io: Socket) {
  io.emit('queue');
  io.on('start', (data) => {
    // TODO: Initialise the player's and opponent's decks given from the server
    const player = new Player(data.name, data.lobbyId, io);
    const opponent = new Player(data.opponentName, data.lobbyId, io); // Passing the client to the opponent even though it's not used
    console.debug(data);

    // TODO: Initialise the player's and opponent's decks given from the server
    scene.scene.start('game-board', {
      player: player,
      opponent: opponent,
      deckList: data.deckList,
      opponentDeckList: data.opponentDeckList,
    });
  });
}
