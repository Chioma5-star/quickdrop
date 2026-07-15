const STATUS_PROGRESS = { pending: 0, picked_up: 33, in_transit: 66, delivered: 100, cancelled: 0 };
const STATUS_LABELS = {
  pending: 'Pending',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function DeliveryCard({ delivery, role, onUpdateStatus, onDelete }) {
  const progress = STATUS_PROGRESS[delivery.status] ?? 0;
  const statusLabel = STATUS_LABELS[delivery.status] ?? delivery.status;
  const createdAt = new Date(delivery.created_at).toLocaleString();

  return (
    <article className="delivery-card">
      <div className="delivery-card-top">
        <div>
          <p className="customer-name">{delivery.customer_name}</p>
          {delivery.item_description && <p className="item-desc">{delivery.item_description}</p>}
        </div>
        <span className={`status-pill status-${delivery.status}`}>{statusLabel}</span>
      </div>

      <div className="route-bar">
        <div className="route-track">
          <div className="route-progress" style={{ width: `${progress}%` }} />
          <div className="route-dot" style={{ left: `${progress}%` }} />
        </div>
        <div className="route-labels">
          <span>{delivery.pickup_location}</span>
          <span>{delivery.dropoff_location}</span>
        </div>
      </div>

      <div className="card-actions">
        {/* Courier: can move the delivery through every stage */}
        {role === 'courier' && delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
          <>
            <label className="inline-label">Update status:</label>
            <select value={delivery.status} onChange={(e) => onUpdateStatus(delivery.id, e.target.value)}>
              {Object.keys(STATUS_LABELS).map((key) => (
                <option key={key} value={key}>
                  {STATUS_LABELS[key]}
                </option>
              ))}
            </select>
          </>
        )}

        {/* Customer: can only cancel their own pending/in-progress request */}
        {role === 'customer' && delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
          <button className="btn btn-danger" onClick={() => onUpdateStatus(delivery.id, 'cancelled')}>
            Cancel Request
          </button>
        )}

        {role === 'customer' && onDelete && (
          <button className="btn btn-secondary" onClick={() => onDelete(delivery.id)}>
            Delete
          </button>
        )}
      </div>

      <p className="timestamp">Requested {createdAt}</p>
    </article>
  );
}