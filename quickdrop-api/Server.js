const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const deliveryRoutes = require('./routes/deliveryRoutes');
const authRoutes = require('./routes/authRoutes');
const { initSocket } = require('./sockets');

const app = express();
const httpServer = http.createServer(app);
initSocket(httpServer);

// Middleware
// FRONTEND_URL lets us lock CORS down to just your real deployed frontend
// once you know it (set it in Render's environment variables). Until then,
// this defaults to allowing any origin, which is fine for local development.
const allowedOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'QuickDrop API is running',
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/deliveries', deliveryRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler (catches anything unexpected)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 QuickDrop API running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready for real-time connections`);
});