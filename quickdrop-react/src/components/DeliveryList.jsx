import DeliveryCard from './DeliveryCard';

export default function DeliveryList({ deliveries, loading, error, role, onUpdateStatus, onDelete }) {
  if (loading) {
    return <div className="loading-text">Loading deliveries...</div>;
  }

  if (error) {
    return <div className="error-message">⚠️ {error}</div>;
  }

  if (!deliveries || deliveries.length === 0) {
    return (
      <div className="empty-state">
        {role === 'courier'
          ? 'No delivery requests available right now.'
          : 'No delivery requests yet. Create one above to get started.'}
      </div>
    );
  }

  return (
    <div className="deliveries-list">
      {deliveries.map((delivery) => (
        <DeliveryCard
          key={delivery.id}
          delivery={delivery}
          role={role}
          onUpdateStatus={onUpdateStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}