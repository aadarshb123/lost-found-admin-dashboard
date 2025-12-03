// Use Vercel backend directly (same as mobile app)
const API_BASE = 'https://lost-and-found-backend-swart.vercel.app/api';

class AdminApiService {
  async fetchJson(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  }

  // Analytics
  async getAnalyticsOverview() {
    return this.fetchJson('/admin/analytics/overview');
  }

  async getItemsOverTime(days = 30) {
    return this.fetchJson(`/admin/analytics/items-over-time?days=${days}`);
  }

  async getCategoryBreakdown() {
    return this.fetchJson('/admin/analytics/category-breakdown');
  }

  async getMatchRates() {
    return this.fetchJson('/admin/analytics/match-rates');
  }

  async getLocationHeatmap() {
    return this.fetchJson('/admin/analytics/location-heatmap');
  }

  // Items
  async getItems({ itemType, status, category, limit = 50, offset = 0 } = {}) {
    const params = new URLSearchParams();
    if (itemType) params.append('item_type', itemType);
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    params.append('limit', limit);
    params.append('offset', offset);

    return this.fetchJson(`/admin/items?${params.toString()}`);
  }

  async updateItemStatus(itemId, status) {
    return this.fetchJson(`/admin/items/${itemId}/status?status=${status}`, {
      method: 'PUT',
    });
  }

  async deleteItem(itemId) {
    return this.fetchJson(`/admin/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Matches
  async getMatches(status, limit = 50) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', limit);

    return this.fetchJson(`/admin/matches?${params.toString()}`);
  }

  async updateMatchStatus(matchId, status) {
    return this.fetchJson(`/admin/matches/${matchId}/status?status=${status}`, {
      method: 'PUT',
    });
  }

  // Health
  async getDetailedHealth() {
    return this.fetchJson('/admin/health/detailed');
  }

  // Report Found Item
  async reportFoundItem(itemData) {
    return this.fetchJson('/items/found', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  // Upload Image
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/upload/image`, {
      method: 'POST',
      body: formData,
      // Note: Don't set Content-Type header - browser will set it with boundary for FormData
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Image upload failed' }));
      throw new Error(error.detail || 'Image upload failed');
    }

    const data = await response.json();
    return data.photoUrl;
  }
}

export const adminApi = new AdminApiService();
export default adminApi;
