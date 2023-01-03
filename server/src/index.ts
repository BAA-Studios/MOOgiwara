import express, { Express } from 'express';
import { createServer } from 'http';
import { Socket, Server } from 'socket.io';
import Player from './game/player';

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

const PORT = 3000;
const users: string[] = [];
const games = new Map<string, Game>();

const testDeck = [
  "OP01-060_p1",
  "OP01-077_p1",
  "OP01-076",
  "OP01-075",
  "OP01-074",
  "OP01-073",
  "OP01-072",
  "OP01-071",
  "OP01-070",
  "OP01-069"
];

/**
 * Find a game that has an open player slot
 * @param games list of open games
 * @returns     Lobby ID of game instance, if a match has been found; else null
 */
function findOpenGame(games: Map<string, Game>): string | null {
  console.log("LOOKING FOR OPEN GAMES");
  for (const [lobbyId, game] of games) {
    console.log('ID: ' + lobbyId);
    if (!game.isFull()) {
      console.log("FOUND!");
      return lobbyId; // Short-circuit if found
    }
  }
  return null;
}

/**
 * Creates a new game, and adds it to the global list of games
 */
function createNewGame(socketId: string): void {
  const newGame = new Game();
  games.set(socketId, newGame);
}

/**
 * Returns the first game in the global list with an open player slot.
 * If all games are filled, create a new Game instance.
 * @returns Lobby ID of game instance with one open player slot
 */
function findMatch(socketId: string): string {
  const openGame = findOpenGame(games);
  if (!openGame) {
    createNewGame(socketId);
    return socketId;
  }
  return openGame;
}

io.on('connection', (socket: Socket) => {
  console.log('User: ' + socket.id + ' connected');
  users.push(socket.id); // TODO: Remove on disconnect - might need to use Set instead of Array?

  const userId = socket.id; // temporary - to convert this to database PK if not guest
  const lobbyId = findMatch(socket.id);
  const game = games.get(lobbyId);
  console.log('[LOG] USER: ' + socket.id + ' joined game: ' + lobbyId);
  const player = new Player(socket, userId, lobbyId, testDeck);
  game?.push(player);
  if (game?.isFull()) {
    // Start the game
    const playerWhoStartsFirst = Math.floor(Math.random() * 2) + 1;
    game.whoseTurn = playerWhoStartsFirst;
    game.playerOne?.client.emit('start', {
      lobbyId: lobbyId,
      deckList: testDeck,
      opponentDeckList: testDeck
    });
    game.playerTwo?.client.emit('start', {
      lobbyId: lobbyId,
      deckList: testDeck,
      opponentDeckList: testDeck
    });
    console.log("[LOG] Game started: " + lobbyId);
  }

  // Packets Received Start ----------------------------

  player.initListeners();
  
  socket.on('boardFullyLoaded', () => {
    player.boardReady = true;
    player.deck.shuffle(); // Shuffle the player's deck
    if (game?.bothPlayersReady()) {
      game?.broadcastPacket('mulligan', {});
    }
  });

  socket.on('onMulligan', (data) => {
    player.mulligan = true;
    console.log(
      '[INFO] Player ' + player.client.id + ' mulliganed: ' + data.mulligan
    );
    if (game?.bothPlayersMulliganed()) {
      game?.broadcastPacket("mulliganDone", {});
      const personWhoGoesFirst = game?.getPlayer(game.whoseTurn)?.client.id;
      game?.broadcastChat(
        "Server: Game started! \nPlayer " + personWhoGoesFirst + " goes first."
      );
      game?.broadcastPacket('changeTurn', {
        personToChangeTurnTo: personWhoGoesFirst,
      });
    }
  });

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
    const game = games.get(data.lobbyId);
    // Send both players the message
    console.log(game?.playerOne?.client.id);
    console.log(game?.playerTwo?.client.id);
    console.log("Socket ID: " + socket.id);
    game?.broadcastChat(data.message);
  });
  // Packets Received End ----------------------------
});

server.listen(PORT, () => {
  console.log('Server is now listening on port: ' + PORT);
});
