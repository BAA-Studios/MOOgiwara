import express, { Express } from 'express';
import { createServer } from 'http';
import { Socket, Server } from 'socket.io';

import Game from './game/game';

const app: Express = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
  }
});

const users: string[] = [];
const games: Game[] = [];

/**
 * This function returns the smallest available lobby ID that is not in use
 * @param games Array of Game objects
 * @returns     Number, representing lobby ID
 */
function getUnusedLobbyId(games: Game[]): number {
  let listOfIds: number[] = games.map(element => element.lobbyId);
  listOfIds.sort();
  let counter = 0;
  for (var i = 0; i <= listOfIds[-1]; i++) {
    if (counter < listOfIds[i]) {
      return counter;
    }
    counter++;
  }
  return counter;
}

/**
 * Find a game that has an open player slot
 * @param games list of open games
 * @returns     Game instance, if a match has been found; else null
 */
function findOpenGame(games: Game[]): Game | null {
  for (const game of games) {
    if (!game.isFull()) {
      return game;  // Short-circuit if found
    }
  }
  return null;
}

/**
 * Creates a new game, and adds it to the global list of games
 */
function createNewGame(): Game {
  let newId = getUnusedLobbyId(games);
  let newGame = new Game(newId);
  games.push(newGame);
  return newGame;
}

/**
 * Returns the first game in the global list with an open player slot.
 * If all games are filled, create a new Game instance.
 * @returns Game instance with one open player slot
 */
function findMatch(): Game {
  let openGame = findOpenGame(games);
  return !openGame ? createNewGame() : openGame;
}

io.on('connection', (socket: Socket) => {
  console.log('User: ' + socket.id + ' connected');
  users.push(socket.id);

  let game = findMatch();
  console.log('[LOG] USER: ' + socket.id + ' joined game: ' + game.lobbyId);
  game.push(socket);
  if (game.isFull()) {
    // Start the game
    game.playerOneClient?.emit('start', { lobbyId: game.lobbyId });
    game.playerTwoClient?.emit('start', { lobbyId: game.lobbyId });
    console.log("[LOG] Game started: " + game.lobbyId);
  }

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('chatMessage', (data) => {
    console.log('Chat message received: ' + data.message);
    // Find the lobby that the players are in
    const game = games.find((element) => element.lobbyId == data.lobbyId);
    // Send both players the message
    game?.playerOneClient?.emit('chatMessage', { message: data.message });
    game?.playerTwoClient?.emit('chatMessage', { message: data.message });
  });
});

server.listen(3000, () => {
  console.log('Server is now listening on port: 3000');
});
