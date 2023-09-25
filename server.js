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

const users = {};

io.on('connection', (socket) => {
  socket.on('join', (user) => {
    console.log(user)
    socket.join(user);
    users[socket.id] = user;
    console.log(users)
  });

  socket.on('chat message', (msg) => {
    Object.entries(users).forEach(([socketId, user]) => {
      if (user === msg.to) {
        io.to(socketId).emit('chat message', msg);
      }
    });
  });

  socket.on('notification', (notification) => {
    if (notification.type === "msg") {

      Object.entries(users).forEach(([socketId, user]) => {
        if (user === notification.to) {
          io.to(socketId).emit('notification', `You have received a message from${notification.from}`);
        }
      });
    }
    // socket.broadcast.to(user).emit('notification', msg);
  });

  socket.on('disconnect', () => {
    const room = users[socket.id];
    socket.leave(room);
    delete users[socket.id];
  });
});

const PORT = 8080;
server.listen(PORT, () => console.log(`Listening on ${PORT}...`));