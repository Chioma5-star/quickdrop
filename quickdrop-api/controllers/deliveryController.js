const pool = require('../config/db');
const { getIO } = require('../sockets');

const VALID_STATUSES = ['pending', 'picked_up', 'in_transit', 'delivered', 'cancelled'];

// CREATE - POST /api/deliveries  (customers only)
async function createDelivery(req, res) {
  try {
    const { pickup_location, dropoff_location, item_description } = req.body;
    const customer_id = req.user.id;
    const customer_name = req.user.name;

    if (!pickup_location || !dropoff_location) {
      return res.status(400).json({
        success: false,
        message: 'pickup_location and dropoff_location are required',
      });
    }

    const result = await pool.query(
      `INSERT INTO delivery_requests (customer_name, customer_id, pickup_location, dropoff_location, item_description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [customer_name, customer_id, pickup_location, dropoff_location, item_description || null]
    );

    const newDelivery = result.rows[0];

    // Let every connected courier know a new job is available, live
    getIO().to('couriers').emit('delivery:new', newDelivery);

    return res.status(201).json({ success: true, data: newDelivery });
  } catch (err) {
    console.error('createDelivery error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error creating delivery request' });
  }
}

// READ ALL - GET /api/deliveries
// Customers see only their own requests. Couriers see everything (so they can pick jobs up).
async function getAllDeliveries(req, res) {
  try {
    const { status } = req.query;
    const { id: userId, role } = req.user;

    const conditions = [];
    const params = [];

    if (role === 'customer') {
      params.push(userId);
      conditions.push(`customer_id = $${params.length}`);
    }
    // couriers get no ownership filter — they can see all requests to pick from

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    let query = 'SELECT * FROM delivery_requests';
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
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
    const { id: userId, role } = req.user;

    const result = await pool.query('SELECT * FROM delivery_requests WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Delivery request with id ${id} not found` });
    }

    const delivery = result.rows[0];

    if (role === 'customer' && delivery.customer_id !== userId) {
      return res.status(403).json({ success: false, message: 'You can only view your own delivery requests' });
    }

    return res.status(200).json({ success: true, data: delivery });
  } catch (err) {
    console.error('getDeliveryById error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error fetching delivery request' });
  }
}

// UPDATE - PUT /api/deliveries/:id
// Customers: can only cancel their own pending request.
// Couriers: can claim an unassigned request and update its status.
async function updateDelivery(req, res) {
  try {
    const { id } = req.params;
    const { status, pickup_location, dropoff_location, item_description } = req.body;
    const { id: userId, role } = req.user;

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

    if (role === 'customer') {
      if (current.customer_id !== userId) {
        return res.status(403).json({ success: false, message: 'You can only update your own delivery requests' });
      }
      if (status && status !== 'cancelled') {
        return res.status(403).json({ success: false, message: 'Customers can only cancel a delivery request' });
      }
    }

    // Courier claims the job automatically the first time they update its status
    let courier_id = current.courier_id;
    if (role === 'courier' && !courier_id) {
      courier_id = userId;
    }

    const result = await pool.query(
      `UPDATE delivery_requests
       SET pickup_location = $1,
           dropoff_location = $2,
           item_description = $3,
           status = $4,
           courier_id = $5,
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [
        pickup_location || current.pickup_location,
        dropoff_location || current.dropoff_location,
        item_description !== undefined ? item_description : current.item_description,
        status || current.status,
        courier_id,
        id,
      ]
    );

    const updatedDelivery = result.rows[0];

    // Notify the customer who owns this request, and all couriers (so their
    // list reflects the new status/claim immediately, no refresh needed)
    if (updatedDelivery.customer_id) {
      getIO().to(`customer:${updatedDelivery.customer_id}`).emit('delivery:updated', updatedDelivery);
    }
    getIO().to('couriers').emit('delivery:updated', updatedDelivery);

    return res.status(200).json({ success: true, data: updatedDelivery });
  } catch (err) {
    console.error('updateDelivery error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error updating delivery request' });
  }
}

// DELETE - DELETE /api/deliveries/:id  (customers, own requests only)
async function deleteDelivery(req, res) {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    const existing = await pool.query('SELECT * FROM delivery_requests WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Delivery request with id ${id} not found` });
    }

    if (role === 'customer' && existing.rows[0].customer_id !== userId) {
      return res.status(403).json({ success: false, message: 'You can only delete your own delivery requests' });
    }

    const result = await pool.query('DELETE FROM delivery_requests WHERE id = $1 RETURNING *', [id]);
    const deleted = result.rows[0];

    if (deleted.customer_id) {
      getIO().to(`customer:${deleted.customer_id}`).emit('delivery:deleted', { id: deleted.id });
    }
    getIO().to('couriers').emit('delivery:deleted', { id: deleted.id });

    return res.status(200).json({ success: true, message: 'Delivery request deleted', data: deleted });
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