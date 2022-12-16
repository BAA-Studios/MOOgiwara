/*
    for all connections related packets
*/
import io from 'socket.io-client';
import Phaser from 'phaser';
import Player from '../game/player';
import Card from '../game/card';

// The initial connection to the server
export function connectToServer(scene: Phaser.Scene) {
  const socket = io('http://localhost:3000');
  // TODO: Tell server what the user put in the username field
  waitForGame(scene, socket);
}

// The server sends a packet to the client to match the client with another player
export function waitForGame(scene: Phaser.Scene, io: any) {
  io.on('start', (data) => {
    // TODO: Initialise the player's and opponent's decks given from the server
    const player = new Player('test', data.lobbyId);
    const opponent = new Player('opponent', data.lobbyId);
    
    // TODO: Initialise the player's and opponent's decks given from the server
    let deckList = [
      'OP01-077_p1',
      'OP01-077_p1',
      'OP01-077_p1',
      'OP01-077_p1',
      'OP01-077_p1',
    ];

    scene.scene.start('game-board', {
      player: player,
      opponent: opponent,
      client: io,
      deckList: deckList,
    });
  });
}
