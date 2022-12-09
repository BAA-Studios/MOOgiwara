/* 
    for all connections related packets
*/
import io from 'socket.io-client';


// The initial connection to the server
export function connectToServer() {
    const socket = io('http://localhost:3000');
}

// The server sends a packet to the client to match the client with another player
export function waitForGame() {

}