const Game = require('./game/game.js');
const express = require('express')();
const server = require('http').createServer(express);
const io = require('socket.io')(server);

var users = [];
var games = [];
var lobbyId = 0;

io.on('connection', (socket) => {
  console.log('User: ' + socket.id + ' connected');
  users.push(socket.id);

  // Check if there is a game with an empty slot
  var game = games.find(game => !game.isFull());
  if (!game) {
    // If there is no game with an empty slot, create a new game
    game = new Game(lobbyId);
    games.push(game);
    lobbyId++;
  }
  console.log('[LOG] USER: ' + socket.id + ' joined game: ' + game.lobbyId);
  game.push(socket);
  if (game.isFull()) {
    // Start the game
    game.playerOneClient.emit('start', { player: 1 });
    game.playerTwoClient.emit('start', { player: 2 });
    console.log("[LOG] Game started: " + game.lobbyId);
  }

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server is now listening on port: 3000');
});