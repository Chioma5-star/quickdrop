const express = require('express');
const router = express.Router();
const {
  createDelivery,
  getAllDeliveries,
  getDeliveryById,
  updateDelivery,
  deleteDelivery,
} = require('../controllers/deliveryController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Every route below requires a valid logged-in user
router.use(requireAuth);

// POST /api/deliveries - only customers create delivery requests
router.post('/', requireRole('customer'), createDelivery);

// GET /api/deliveries - customers see their own, couriers see all
router.get('/', getAllDeliveries);

// GET /api/deliveries/:id
router.get('/:id', getDeliveryById);

// PUT /api/deliveries/:id - customers can cancel their own, couriers can claim + update status
router.put('/:id', updateDelivery);

// DELETE /api/deliveries/:id - customers only, own requests
router.delete('/:id', requireRole('customer'), deleteDelivery);

module.exports = router;