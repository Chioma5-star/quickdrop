import { useState } from 'react';

export default function DeliveryForm({ onCreate }) {
  const [form, setForm] = useState({ pickup_location: '', dropoff_location: '', item_description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await onCreate(form);
      setSuccess('✅ Delivery request created');
      setForm({ pickup_location: '', dropoff_location: '', item_description: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card form-card">
      <h2>New Delivery Request</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row two-col">
          <div>
            <label htmlFor="pickup_location">Pickup Location</label>
            <input
              type="text"
              id="pickup_location"
              name="pickup_location"
              value={form.pickup_location}
              onChange={handleChange}
              placeholder="e.g. Osu, Accra"
              required
            />
          </div>
          <div>
            <label htmlFor="dropoff_location">Dropoff Location</label>
            <input
              type="text"
              id="dropoff_location"
              name="dropoff_location"
              value={form.dropoff_location}
              onChange={handleChange}
              placeholder="e.g. East Legon, Accra"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <label htmlFor="item_description">Item Description (optional)</label>
          <input
            type="text"
            id="item_description"
            name="item_description"
            value={form.item_description}
            onChange={handleChange}
            placeholder="e.g. Small parcel"
          />
        </div>

        {error && <p className="form-message error">⚠️ {error}</p>}
        {success && <p className="form-message success">{success}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Delivery Request'}
        </button>
      </form>
    </section>
  );
}