const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

// Called once from server.js, right after the HTTP server is created
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // fine for a learning project; lock this to your real frontend URL in production
    },
  });

  // Every socket connection must present a valid JWT (same one used for the REST API)
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id, name, email, role }
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const { id, role } = socket.user;

    // Rooms let us broadcast only to the people who should see an update:
    // - each customer gets a private room for their own requests
    // - all couriers share one room, since any courier can see any open job
    if (role === 'customer') {
      socket.join(`customer:${id}`);
    } else if (role === 'courier') {
      socket.join('couriers');
    }

    console.log(`🔌 Socket connected: ${socket.user.name} (${role})`);

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.user.name}`);
    });
  });

  return io;
}

// Controllers call this to emit events after a delivery is created/updated
function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized yet — call initSocket(server) first');
  }
  return io;
}

module.exports = { initSocket, getIO };