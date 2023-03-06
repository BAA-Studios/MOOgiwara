import express, { Express } from 'express';
import { createServer } from 'http';
import { Socket, Server } from 'socket.io';
import Player from './game/player';
// @ts-ignore
import testDeck from './cards/test_deck.json' assert { type: "json" };

import Game from './game/game';
import { verify } from './util/jwt';

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

/**
 * Find a game that has an open player slot
 * @param games list of open games
 * @returns     Lobby ID of game instance, if a match has been found; else null
 */
function findOpenGame(games: Map<string, Game>): string | null {
  for (const [lobbyId, game] of games) {
    if (!game.isFull()) {
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

function startQueuing(socket: Socket): Player {
  console.log('[LOG] User: ' + socket.id + ' has started queuing');
  const lobbyId = findMatch(socket.id);
  const game = games.get(lobbyId);
  console.log('[LOG] USER: ' + socket.id + ' joined game: ' + lobbyId);
  const player = new Player(socket, socket.id, lobbyId, testDeck);
  game?.push(player);
  player.game = game;
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
    game.start();
    console.log("[LOG] Game started: " + lobbyId);
  }
  return player;
}

io.on('connection', (socket: Socket) => {
  console.log('[LOG] User: ' + socket.id + ' connected');
  const userId = socket.id; // temporary - to convert this to database PK if not guest
  users.push(userId); // TODO: Remove on disconnect - might need to use Set instead of Array?
  let player: Player;
  let game: Game;
  let lobbyId: string;

  // Packets Received Start ----------------------------

  // Login-related packets -----------------------------
  socket.once('token', (token) => {
      const payload = verify(token);
      console.log('[DEBUG] JWT Token verification result:')
      console.log(payload);
      // IF: New email flow:
      //    send a packet to the client to let the user agree to create an account, and subsequently log them in
      // ELSE:
      //    Send a packet to the client to log the user in
  });

  // Game-related packets ------------------------------
  socket.on('queue', () => {
    player = startQueuing(socket);
    if (player.game) {
      game = player.game;
    } else {
      console.log('[Error] User ' + userId + ' has no associated game instance!')
      return;
    }
    lobbyId = player.lobbyId;    

    player.initListeners();
  });
  
  socket.once('boardFullyLoaded', () => {
    player.boardReady = true;
    player.deck.shuffle(); // Shuffle the player's deck
    if (game?.bothPlayersReady()) {
      game?.broadcastPacket('mulligan', {});
    }
  });

  socket.once('onMulligan', (data) => {
    player.mulligan = true;
    player.setLifeCards();
    console.log(
      '[INFO] Player ' + player.client.id + ' mulliganed: ' + data.mulligan
    );
    if (game?.bothPlayersMulliganed()) {
      game?.broadcastPacket("mulliganDone", {});
      const personWhoGoesFirst = game?.getPlayer(game.whoseTurn)?.client.id;
      game?.broadcastChat(
        "Server: Game started! \nPlayer " + personWhoGoesFirst + " goes first."
      );
      game?.sendChangeTurnPacket(personWhoGoesFirst);
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
