const pool = require('../config/db');

const VALID_STATUSES = ['pending', 'picked_up', 'in_transit', 'delivered', 'cancelled'];

// CREATE - POST /api/deliveries
async function createDelivery(req, res) {
  try {
    const { customer_name, pickup_location, dropoff_location, item_description } = req.body;

    if (!customer_name || !pickup_location || !dropoff_location) {
      return res.status(400).json({
        success: false,
        message: 'customer_name, pickup_location, and dropoff_location are required',
      });
    }

    const result = await pool.query(
      `INSERT INTO delivery_requests (customer_name, pickup_location, dropoff_location, item_description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [customer_name, pickup_location, dropoff_location, item_description || null]
    );

    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('createDelivery error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error creating delivery request' });
  }
}

// READ ALL - GET /api/deliveries
async function getAllDeliveries(req, res) {
  try {
    const { status } = req.query;

    let query = 'SELECT * FROM delivery_requests';
    const params = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error('getAllDeliveries error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error fetching delivery requests' });
  }
}

// READ ONE - GET /api/deliveries/:id
async function getDeliveryById(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM delivery_requests WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Delivery request with id ${id} not found` });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('getDeliveryById error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error fetching delivery request' });
  }
}

// UPDATE - PUT /api/deliveries/:id
async function updateDelivery(req, res) {
  try {
    const { id } = req.params;
    const { customer_name, pickup_location, dropoff_location, item_description, status } = req.body;

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const existing = await pool.query('SELECT * FROM delivery_requests WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Delivery request with id ${id} not found` });
    }

    const current = existing.rows[0];

    const result = await pool.query(
      `UPDATE delivery_requests
       SET customer_name = $1,
           pickup_location = $2,
           dropoff_location = $3,
           item_description = $4,
           status = $5,
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [
        customer_name || current.customer_name,
        pickup_location || current.pickup_location,
        dropoff_location || current.dropoff_location,
        item_description !== undefined ? item_description : current.item_description,
        status || current.status,
        id,
      ]
    );

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('updateDelivery error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error updating delivery request' });
  }
}

// DELETE - DELETE /api/deliveries/:id
async function deleteDelivery(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM delivery_requests WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Delivery request with id ${id} not found` });
    }

    return res.status(200).json({ success: true, message: 'Delivery request deleted', data: result.rows[0] });
  } catch (err) {
    console.error('deleteDelivery error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error deleting delivery request' });
  }
}

module.exports = {
  createDelivery,
  getAllDeliveries,
  getDeliveryById,
  updateDelivery,
  deleteDelivery,
};