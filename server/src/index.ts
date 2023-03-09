import express, { Express } from 'express';
import { createServer } from 'http';
import { Socket, Server } from 'socket.io';
import Player from './game/player';
// @ts-ignore
import testDeck from './cards/test_deck.json' assert { type: "json" };

import Game from './game/game';
import connectToDB from './database/connection';
import { verify } from './util/jwt';
import { Vector } from 'js-sdsl';
import { PlayerData } from './database/player_data_model';

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
const users: Vector<string> = new Vector<string>();
const games = new Map<string, Game>();

connectToDB();

/* async function setTestDB() {
  const pData = new PlayerData({
    google_id: 's0me4lphanumer1cstr1ng',
    name: 'somestring',
    email: 'some@address.here',
    decks: []
  })
  pData.decks.push({ deck_string: "some string of text 1" });
  pData.decks.push({ deck_string: "some string of text 2" });

  await pData.save();
} */

async function readFromTestDB() {
  const pData = await PlayerData.findOne({ google_id: 's0me4lphanumer1cstr1ng' });
  if (pData) {
    console.log(pData.email);
    console.log(pData.decks);
    console.log(pData.decks[0].deck_string);
  }
  else {
    console.log('UNABLE TO FETCH DUMMY PLAYER DATA FROM DB');
  }
}

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

function startQueuing(player: Player): void {
  console.log(`[LOG] User: ${player.playerId ? player.playerId : player.socketId} has started queuing`);
  const lobbyId = findMatch(player.socketId);
  player.setLobbyId(lobbyId);
  const game = games.get(lobbyId);
  console.log(`[LOG] USER: ${player.playerId ? player.playerId : player.socketId} joined game: ${lobbyId}`);
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
  
  if (!player.username) {  // guests' usernames are not initialised
    // insert code to automatically generate names for guest:
    player.username = `Guest ${player.socketId}`  // temporary until we set up name generation
  }
}

io.on('connection', (socket: Socket) => {
  const userId = socket.id; // temporary - to convert this to database PK if not guest
  console.log(`[LOG] User: ${userId} connected`);
  users.pushBack(userId); // TODO: Remove on disconnect - might need to use Set instead of Array?
  let player: Player = new Player(socket, socket.id, testDeck);
  let game: Game;
  let lobbyId: string;

  // Packets Received Start ----------------------------

  // Login-related packets -----------------------------
  socket.once('token', (token) => {
    verify(token).then(
      function(value) {
        console.log('[DEBUG] JWT Token verification result:');
        console.log(value);
        // requires DB set up
        // TODO: IF email not recognised, save as new user in DB, alongside `fullName`
        // TODO: Send a toast to the user to let them know that an account has been created, and they're being logged in
        // TODO: ELSE Send a packet to the server to display their name + logging in message
        // "Logging in"
        // TODO: set username (from DB)
        // TODO: set playerId (from DB)
      },
      function(error) {
        console.log('[ERROR] ' + error);
        // TODO: Send a packet to the server to display an error toast
      }
    );
  });

  // Game-related packets ------------------------------
  socket.on('queue', () => {
    startQueuing(player);
    if (player.game) {
      game = player.game;
    } else {
      console.log('[Error] User ' + userId + ' has no associated game instance!')
      return;
    }
    lobbyId = player.lobbyId ? player.lobbyId : "";    

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
    users.eraseElementByValue(userId);
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
// setTestDB()
readFromTestDB()