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
const quizRooms = []
const quizRoomUsers = {}

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
          io.to(socketId).emit('notification', `${notification.from}`);
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

  socket.on('create room', (dbUser) => {
    if(quizRoomUsers[dbUser.username] === undefined){
      quizRooms.push({host: {username: dbUser.username}})
      io.emit('new room', {host: {username: dbUser.username}});
    }
  });

  socket.on('join room', (dbUser) => {
    if(quizRoomUsers[dbUser.username] !== undefined){
      quizRooms[dbUser.username].guests.push(dbUser)
      socket.emit('joined room', dbUser)
    }
  })

  socket.on('load rooms', (username) => {
    Object.entries(users).forEach(([socketId, user]) => {
      if (username === user) {
        console.log(quizRooms)
        io.to(socketId).emit('all rooms', quizRooms);
      }
    });
  });

});

const PORT = 8080;
server.listen(PORT, () => console.log(`Listening on ${PORT}...`));