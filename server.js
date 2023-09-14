const express = require('express');
const app = express();
const { createServer } = require('http');
const { join } = require('path');

const cors = require('cors');


const activeUsers = new Map(); 

const server = createServer(app);

const io = require("socket.io")(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
  });
  
  
  app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
  });
  
  // Store user socket information
  const users = {};
  
  io.on('connection', (socket) => {
    socket.on('join', (room) => {
      room = 113
      console.log(room)
      socket.join(room);
      users[socket.id] = room; 
      socket.broadcast.to(room).emit('user-connected', { userId: socket.id, message: 'New user has connected' });
    });
  
    socket.on('chat message', (msg) => {
      console.log(msg)
      const room = users[socket.id];
      socket.broadcast.to(room).emit('chat message', msg);
    });
  
    socket.on('disconnect', () => {
      const room = users[socket.id];
      socket.leave(room);
      delete users[socket.id];
    });
  });

  const PORT = 8080;
  server.listen(PORT, () => console.log(`Listening on ${PORT}...`));