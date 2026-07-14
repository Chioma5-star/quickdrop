const express = require('express');
const cors = require('cors');
require('dotenv').config();

const deliveryRoutes = require('./routes/deliveryRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'QuickDrop API is running',
  });
});

// Routes
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
app.listen(PORT, () => {
  console.log(`🚀 QuickDrop API running on http://localhost:${PORT}`);
});