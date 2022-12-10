const Game = require('./game/game.js');
const express = require('express')();
const server = require('http').createServer(express);
const io = require('socket.io')(server);

const users = [];
const games = {};
let lobbyId = 0;

io.on('connection', (socket) => {
  console.log('User: ' + socket.id + ' connected');
  users.push(socket.id);

  // Check if there is a game with an empty slot
  let game = null;
  for (let i = 0; i < lobbyId; i++) {
    if (!games[i].isFull()) {
      game = games[i];
      break;
    }
  }
  if (!game) {
    // If there is no game with an empty slot, create a new game
    game = new Game(lobbyId);
    games[lobbyId] = game;
    lobbyId++;
  }
  console.log('[LOG] USER: ' + socket.id + ' joined game: ' + game.lobbyId);
  game.push(socket);
  if (game.isFull()) {
    // Start the game
    game.playerOneClient.emit('start', { lobbyId: game.lobbyId });
    game.playerTwoClient.emit('start', { lobbyId: game.lobbyId });
    console.log("[LOG] Game started: " + game.lobbyId);
  }

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('chatMessage', (data) => {
    console.log('Chat message received: ' + data.message);
    // Find the lobby that the players are in
    const game = games[data.lobbyId];
    // Send both players the message
    game.playerOneClient.emit('chatMessage', { message: data.message });
    game.playerTwoClient.emit('chatMessage', { message: data.message });
  });
});

server.listen(3000, () => {
  console.log('Server is now listening on port: 3000');
});
