import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api/client';
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