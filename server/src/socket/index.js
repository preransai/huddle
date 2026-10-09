const { Server } = require('socket.io');
const cookie = require('cookie');
const env = require('../config/env');
const { COOKIE_NAME, verifyToken } = require('../middleware/auth');

let io = null;

const roomFor = (userId) => `user:${userId}`;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  // The browser sends the same httpOnly cookie on the WebSocket handshake, so
  // the socket is authenticated exactly like a REST request and the client
  // never has to handle the token itself.
  io.use((socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    const userId = verifyToken(cookies[COOKIE_NAME]);
    if (!userId) return next(new Error('unauthorized'));
    socket.data.userId = userId;
    next();
  });

  // One room per user instead of a userId -> socketId map: a user with three
  // tabs open has three sockets in the same room, and emitting to the room
  // reaches all of them without any bookkeeping on connect/disconnect.
  io.on('connection', (socket) => {
    socket.join(roomFor(socket.data.userId));
  });

  return io;
}

function emitToUser(userId, event, payload) {
  if (!io) return;
  io.to(roomFor(userId)).emit(event, payload);
}

function closeSocket() {
  if (io) io.close();
  io = null;
}

module.exports = { initSocket, emitToUser, closeSocket };
