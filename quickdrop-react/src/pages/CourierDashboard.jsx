import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
import { getSocket } from '../socket';
import DeliveryList from '../components/DeliveryList';

export default function CourierDashboard() {
  const { token } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadDeliveries = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.getDeliveries(token, statusFilter || undefined);
      setDeliveries(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  // Live updates: new jobs appear instantly, and status changes made by
  // other couriers (or the customer cancelling) reflect without a refresh.
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function handleNew(newDelivery) {
      setDeliveries((prev) => [newDelivery, ...prev]);
    }

    function handleUpdated(updatedDelivery) {
      setDeliveries((prev) =>
        prev.map((d) => (d.id === updatedDelivery.id ? updatedDelivery : d))
      );
    }

    function handleDeleted({ id }) {
      setDeliveries((prev) => prev.filter((d) => d.id !== id));
    }

    socket.on('delivery:new', handleNew);
    socket.on('delivery:updated', handleUpdated);
    socket.on('delivery:deleted', handleDeleted);

    return () => {
      socket.off('delivery:new', handleNew);
      socket.off('delivery:updated', handleUpdated);
      socket.off('delivery:deleted', handleDeleted);
    };
  }, []);

  async function handleUpdateStatus(id, status) {
    try {
      await api.updateDeliveryStatus(token, id, status);
      loadDeliveries();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="container">
      <section className="card list-card">
        <div className="list-header">
          <h2>Available &amp; Assigned Deliveries</h2>
          <div className="filter-controls">
            <label htmlFor="status-filter">Filter by status:</label>
            <select id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="picked_up">Picked Up</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
            </select>
            <button className="btn btn-secondary" onClick={loadDeliveries}>
              Refresh
            </button>
          </div>
        </div>

        <p className="helper-text">
          Updating a request's status assigns it to you as the courier handling it.
        </p>

        <DeliveryList
          deliveries={deliveries}
          loading={loading}
          error={error}
          role="courier"
          onUpdateStatus={handleUpdateStatus}
        />
      </section>
    </main>
  );
}