const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// A small wrapper around fetch() that:
// - prefixes every call with the API base URL
// - attaches the Bearer token automatically when one is provided
// - always parses JSON and throws a readable error on failure
async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Request failed with status ${response.status}`);
  }

  return result;
}

// ===== Auth =====
export function signup({ name, email, password, role }) {
  return request('/auth/signup', { method: 'POST', body: { name, email, password, role } });
}

export function login({ email, password }) {
  return request('/auth/login', { method: 'POST', body: { email, password } });
}

export function getMe(token) {
  return request('/auth/me', { token });
}

// ===== Deliveries =====
export function getDeliveries(token, status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return request(`/deliveries${query}`, { token });
}

export function createDelivery(token, payload) {
  return request('/deliveries', { method: 'POST', body: payload, token });
}

export function updateDeliveryStatus(token, id, status) {
  return request(`/deliveries/${id}`, { method: 'PUT', body: { status }, token });
}

export function deleteDelivery(token, id) {
  return request(`/deliveries/${id}`, { method: 'DELETE', token });
}