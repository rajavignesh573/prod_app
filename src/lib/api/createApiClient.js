const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export function createApiClient(token = '') {
  return async function apiJson(path, options = {}) {
    const headers = new Headers(options.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers
    });

    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Request failed');
    return payload.data;
  };
}
