// ===== Configuration =====
const API_BASE_URL = 'http://localhost:5000/api/deliveries';

// Maps a status to how far along the pickup -> dropoff route bar should fill
const STATUS_PROGRESS = {
  pending: 0,
  picked_up: 33,
  in_transit: 66,
  delivered: 100,
  cancelled: 0,
};

const STATUS_LABELS = {
  pending: 'Pending',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

// ===== DOM references =====
const deliveryForm = document.getElementById('delivery-form');
const formMessage = document.getElementById('form-message');
const deliveriesList = document.getElementById('deliveries-list');
const loadingEl = document.getElementById('loading');
const errorMessageEl = document.getElementById('error-message');
const statusFilter = document.getElementById('status-filter');
const refreshBtn = document.getElementById('refresh-btn');

// ===== Fetch and render all deliveries =====
async function loadDeliveries() {
  loadingEl.style.display = 'block';
  errorMessageEl.textContent = '';
  deliveriesList.innerHTML = '';

  try {
    const status = statusFilter.value;
    const url = status ? `${API_BASE_URL}?status=${encodeURIComponent(status)}` : API_BASE_URL;

    const response = await fetch(url);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to load deliveries');
    }

    renderDeliveries(result.data);
  } catch (err) {
    errorMessageEl.textContent = `⚠️ ${err.message}. Is the API running on localhost:5000?`;
  } finally {
    loadingEl.style.display = 'none';
  }
}

// ===== Render delivery cards =====
function renderDeliveries(deliveries) {
  if (!deliveries || deliveries.length === 0) {
    deliveriesList.innerHTML = '<div class="empty-state">No delivery requests yet. Create one above to get started.</div>';
    return;
  }

  deliveriesList.innerHTML = deliveries.map(buildDeliveryCard).join('');

  // Attach event listeners after rendering (since innerHTML wipes previous ones)
  deliveries.forEach((delivery) => {
    const statusSelect = document.getElementById(`status-select-${delivery.id}`);
    const deleteBtn = document.getElementById(`delete-btn-${delivery.id}`);

    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => updateStatus(delivery.id, e.target.value));
    }
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => deleteDelivery(delivery.id));
    }
  });
}

function buildDeliveryCard(delivery) {
  const progress = STATUS_PROGRESS[delivery.status] ?? 0;
  const statusLabel = STATUS_LABELS[delivery.status] ?? delivery.status;
  const createdAt = new Date(delivery.created_at).toLocaleString();

  return `
    <article class="delivery-card">
      <div class="delivery-card-top">
        <div>
          <p class="customer-name">${escapeHtml(delivery.customer_name)}</p>
          ${delivery.item_description ? `<p class="item-desc">${escapeHtml(delivery.item_description)}</p>` : ''}
        </div>
        <span class="status-pill status-${delivery.status}">${statusLabel}</span>
      </div>

      <div class="route-bar">
        <div class="route-track">
          <div class="route-progress" style="width: ${progress}%"></div>
          <div class="route-dot" style="left: ${progress}%"></div>
        </div>
        <div class="route-labels">
          <span>${escapeHtml(delivery.pickup_location)}</span>
          <span>${escapeHtml(delivery.dropoff_location)}</span>
        </div>
      </div>

      <div class="card-actions">
        <label for="status-select-${delivery.id}" style="margin:0; text-transform:none; font-weight:500; color:var(--ink-soft); font-size:0.8rem;">
          Update status:
        </label>
        <select id="status-select-${delivery.id}">
          ${Object.keys(STATUS_LABELS).map((key) => `
            <option value="${key}" ${key === delivery.status ? 'selected' : ''}>${STATUS_LABELS[key]}</option>
          `).join('')}
        </select>
        <button class="btn btn-danger" id="delete-btn-${delivery.id}">Delete</button>
      </div>

      <p class="timestamp">Requested ${createdAt}</p>
    </article>
  `;
}

// ===== Create a new delivery request =====
deliveryForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    customer_name: document.getElementById('customer_name').value.trim(),
    pickup_location: document.getElementById('pickup_location').value.trim(),
    dropoff_location: document.getElementById('dropoff_location').value.trim(),
    item_description: document.getElementById('item_description').value.trim(),
  };

  formMessage.textContent = '';
  formMessage.className = 'form-message';

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to create delivery request');
    }

    formMessage.textContent = '✅ Delivery request created';
    formMessage.classList.add('success');
    deliveryForm.reset();
    loadDeliveries();
  } catch (err) {
    formMessage.textContent = `⚠️ ${err.message}`;
    formMessage.classList.add('error');
  }
});

// ===== Update delivery status =====
async function updateStatus(id, newStatus) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to update status');
    }

    loadDeliveries();
  } catch (err) {
    errorMessageEl.textContent = `⚠️ ${err.message}`;
  }
}

// ===== Delete a delivery request =====
async function deleteDelivery(id) {
  const confirmed = confirm('Delete this delivery request? This cannot be undone.');
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to delete delivery request');
    }

    loadDeliveries();
  } catch (err) {
    errorMessageEl.textContent = `⚠️ ${err.message}`;
  }
}

// ===== Utility: prevent basic HTML injection from user-entered text =====
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== Event listeners for filter/refresh =====
statusFilter.addEventListener('change', loadDeliveries);
refreshBtn.addEventListener('click', loadDeliveries);

// ===== Initial load =====
loadDeliveries();