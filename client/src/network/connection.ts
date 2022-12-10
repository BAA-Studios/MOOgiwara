/* 
    for all connections related packets
*/
import io from 'socket.io-client';
import Phaser from 'phaser';
import Player from '../game/player';


// The initial connection to the server
export function connectToServer(scene: Phaser.Scene) {
    const socket = io('http://localhost:3000');
    // TODO: Tell server what the user put in the username field
    waitForGame(scene, socket);
}

// The server sends a packet to the client to match the client with another player
export function waitForGame(scene: Phaser.Scene, io: any) {
    io.on('start', (data) => {
        const player = new Player('test', data.lobbyId);
        const opponent = new Player('opponent', data.lobbyId);
        scene.scene.start('game-board', {player: player, opponent: opponent, client: io});
    });
}