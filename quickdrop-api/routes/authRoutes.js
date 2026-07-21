const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

// POST /api/auth/signup
router.post('/signup', signup);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me - get the currently logged-in user's profile
router.get('/me', requireAuth, getMe);

module.exports = router;