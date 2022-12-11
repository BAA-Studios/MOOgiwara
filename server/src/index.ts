import express, { Express } from 'express';
import { createServer } from 'http';
import { Socket, Server } from 'socket.io';

import Game from './game/game';

const app: Express = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  },
});

const PORT: number = 3000;
const users: string[] = [];
const games = new Map<string, Game>();

/**
 * Find a game that has an open player slot
 * @param games list of open games
 * @returns     Lobby ID of game instance, if a match has been found; else null
 */
function findOpenGame(games: Map<string, Game>): string | null {
  console.log("LOOKING FOR OPEN GAMES")
  for (let [lobbyId, game] of games) {
    console.log('ID: ' + lobbyId)
    if (!game.isFull()) {
      console.log("FOUND!")
      return lobbyId; // Short-circuit if found
    }
  }
  return null;
}

/**
 * Creates a new game, and adds it to the global list of games
 */
function createNewGame(socketId: string): void {
  let newGame = new Game();
  games.set(socketId, newGame);
}

/**
 * Returns the first game in the global list with an open player slot.
 * If all games are filled, create a new Game instance.
 * @returns Lobby ID of game instance with one open player slot
 */
function findMatch(socketId: string): string {
  let openGame = findOpenGame(games);
  if (!openGame) {
    createNewGame(socketId);
    return socketId;
  }
  return openGame;
}

io.on('connection', (socket: Socket) => {
  console.log('User: ' + socket.id + ' connected');
  users.push(socket.id);  // TODO: Remove on disconnect - might need to use Set instead of Array?

  let userId = socket.id;  // temporary - to convert this to database PK if not guest
  let lobbyId = findMatch(socket.id);
  let game = games.get(lobbyId);
  console.log('[LOG] USER: ' + socket.id + ' joined game: ' + lobbyId);
  game?.push(socket);
  if (game?.isFull()) {
    // Start the game
    game.playerOneClient?.emit('start', { lobbyId: lobbyId });
    game.playerTwoClient?.emit('start', { lobbyId: lobbyId });
    console.log("[LOG] Game started: " + lobbyId);
  }

  socket.on('disconnect', () => {
    console.log('User ' + userId + ' disconnected');
    if (game?.isEmpty()) {
      game?.clearPlayers();
      console.log("Game instance cleared: " + games.delete(lobbyId));
    }
  });

  socket.on('chatMessage', (data) => {
    console.log('Chat message received: ' + data.message);
    // Find the lobby that the players are in
    let game = games.get(data.lobbyId);
    // Send both players the message
    console.log(game?.playerOneClient?.id);
    console.log(game?.playerTwoClient?.id);
    console.log("Socket ID: " + socket.id);
    game?.playerOneClient?.emit('chatMessage', { message: data.message });
    game?.playerTwoClient?.emit('chatMessage', { message: data.message });
  });
});

server.listen(PORT, () => {
  console.log('Server is now listening on port: ' + PORT);
});
