const server = require('express')();
const http = require('http').createServer(server);
const io = require('socket.io')(http);

http.listen(3000, () => {
  console.log('Server is now listening on port: 3000');
});
