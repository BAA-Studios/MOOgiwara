import express, { Express } from 'express';
import { createServer } from 'http';
import { Socket, Server } from 'socket.io';
import Player from './game/player';
// @ts-ignore
import testDeck from './cards/test_deck.json' assert { type: "json" };

import Game from './game/game';
import * as db from './database/connection';
import { verify } from './util/jwt';
import { Vector } from 'js-sdsl';
import { IPlayerData, PlayerData } from './database/player_data_model';
import { getRandomName } from './util/utils';
// import logger from './util/logger';

const app: Express = express();

app.use(express.static('../client/dist'));

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

db.connectToDB();

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

function startGame(lobbyId: string): void {
  const game = games.get(lobbyId);
  if (game?.isFull()) {
    // Start the game
    const playerWhoStartsFirst = Math.floor(Math.random() * 2) + 1;
    game.whoseTurn = playerWhoStartsFirst;
    game.playerOne?.client.emit('start', {
      name: game.playerOne.username,
      opponentName: game.playerTwo?.username,
      lobbyId: lobbyId,
      deckList: testDeck["blue"],
      opponentDeckList: testDeck["blue"]
    });
    game.playerTwo?.client.emit('start', {
      name: game.playerTwo.username,
      opponentName: game.playerOne?.username,
      lobbyId: lobbyId,
      deckList: testDeck["blue"],
      opponentDeckList: testDeck["blue"]
    });
    game.start();
    console.log("[LOG] Game started: " + lobbyId);
  }
}

function startQueuing(player: Player): void {
  if (!player.username) {  // guests' usernames are not initialised
    player.setUsername(getRandomName());  // insert code to automatically generate names for guests
  }

  console.log(`[LOG] User: ${player.username} has started queuing`);
  const lobbyId = findMatch(player.socketId);
  player.setLobbyId(lobbyId);
  const game = games.get(lobbyId);
  console.log(`[LOG] USER: ${player.username} joined game: ${lobbyId}`);
  game?.push(player);
  player.game = game;

  startGame(lobbyId);
}

app.get('/', (req, res) => {
  console.log(req);
  res.sendFile("../client/dist/index.html");
});

io.on('connection', (socket: Socket) => {
  const userId = socket.id; // temporary - to convert this to database PK if not guest
  console.log(`[LOG] User: ${userId} connected`);
  users.pushBack(userId);
  let player: Player = new Player(socket, socket.id, testDeck["blue"]);
  let game: Game;
  let lobbyId: string;

  // Packets Received Start ----------------------------

  // Login-related packets -----------------------------
  socket.once('token', (token) => {
    verify(token).then(
      async function(value) {
        let playerData: IPlayerData | undefined;
        // New user:
        if (!await db.isRegisteredUser(value?.email)) {
          // Save player data extracted from JWT into DB:
          playerData = await PlayerData.create({
            googleId: value?.googleID,
            name: value?.fullName,
            email: value?.email,
            decks: []
          });
          await playerData.save();
          console.debug(`Unregistered user ${value?.email} encountered! Saving to DB...`);
          player.sendNotification('Account created!', 0x00ff00);
        } else {  // Existing user:
          // Fetch player data
          playerData = await db.fetchPlayerDataByEmail(value?.email);
          if (playerData != undefined) {
            player.sendNotification(`Welcome back, ${value?.fullName}!`, 0x00ff00);
          }
        }

        // Populate the Player instance
        if (!playerData) {
          console.error(`[ERROR] Failed to fetch player data for ${value?.email}`);
          player.sendNotification(`Unable to load account ${value?.email}`, 0xff0000);
          return;
        }
        player.setPlayerData(playerData);
        player.playerId = playerData.id;
        player.username = playerData.name;

        socket.emit('removeSignInButton', { name: playerData.name });
      },
      function(error) {
        console.error('[ERROR] ' + error);
        player.sendNotification('Failed to verify your account!', 0xff0000);
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
      `[INFO] Player ${player.username} mulliganed: ${data.mulligan}`
    );
    if (game?.bothPlayersMulliganed()) {
      game?.broadcastPacket("mulliganDone", {});
      const personWhoGoesFirst: Player | undefined = game?.getPlayer(game.whoseTurn);
      game?.broadcastChat(
        `Server: Game started! \nPlayer ${personWhoGoesFirst?.username ?? 'Unknown User'} goes first.`
      );
      game?.sendChangeTurnPacket(personWhoGoesFirst?.client.id);
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
    game?.broadcastChat(data.message);
  });

  socket.on('deckManager', (callback) => {
    callback(player.playerData?.decks);
  })
  // Packets Received End ----------------------------
});

server.listen(PORT, () => {
  console.log('Server is now listening on port: ' + PORT);
});