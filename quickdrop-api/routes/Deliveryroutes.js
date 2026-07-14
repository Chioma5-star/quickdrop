const express = require('express');
const router = express.Router();
const {
  createDelivery,
  getAllDeliveries,
  getDeliveryById,
  updateDelivery,
  deleteDelivery,
} = require('../controllers/deliveryController');

// POST /api/deliveries - create a new delivery request
router.post('/', createDelivery);

// GET /api/deliveries - get all delivery requests (optional ?status=pending filter)
router.get('/', getAllDeliveries);

// GET /api/deliveries/:id - get a single delivery request
router.get('/:id', getDeliveryById);

// PUT /api/deliveries/:id - update a delivery request (including status)
router.put('/:id', updateDelivery);

// DELETE /api/deliveries/:id - delete a delivery request
router.delete('/:id', deleteDelivery);

module.exports = router;