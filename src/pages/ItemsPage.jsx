import React, { useState, useEffect } from 'react';
import { Search, Filter, Trash2, Edit, RefreshCw } from 'lucide-react';
import { adminApi } from '../services/api';

const CATEGORIES = ['BuzzCard', 'Electronics', 'Water Bottle', 'Clothing', 'Bag', 'Keys', 'Books', 'Other'];
const STATUSES = ['active', 'resolved', 'archived'];
const ITEM_TYPES = ['lost', 'found'];

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    itemType: '',
    status: '',
    category: ''
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadItems();
  }, [filters]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getItems(filters);
      setItems(response.items || []);
      setTotal(response.total || 0);
    } catch (err) {
      console.error('Failed to load items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (itemId, newStatus) => {
    try {
      await adminApi.updateItemStatus(itemId, newStatus);
      loadItems();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await adminApi.deleteItem(itemId);
      loadItems();
    } catch (err) {
      alert('Failed to delete item: ' + err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Items Management</h1>
        <p className="page-subtitle">View and manage all lost and found items</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="filters">
          <select
            className="filter-select"
            value={filters.itemType}
            onChange={(e) => setFilters({ ...filters, itemType: e.target.value })}
          >
            <option value="">All Types</option>
            {ITEM_TYPES.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            {STATUSES.map(status => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button className="btn btn-secondary" onClick={loadItems}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div style={{ marginBottom: '12px', color: '#666', fontSize: '14px' }}>
          Showing {items.length} of {total} items
        </div>

        {/* Items Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Type</th>
                <th>Category</th>
                <th>Location</th>
                <th>Status</th>
                <th>Reported</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    No items found
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.itemId}>
                    <td>
                      <div>
                        <strong>{item.title}</strong>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                          {item.description?.substring(0, 50)}...
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${item.itemType}`}>
                        {item.itemType}
                      </span>
                    </td>
                    <td>{item.category}</td>
                    <td>{item.location?.building || 'N/A'}</td>
                    <td>
                      <span className={`badge ${item.status}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px' }}>{formatDate(item.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <select
                          className="action-btn edit"
                          value={item.status}
                          onChange={(e) => handleStatusUpdate(item.itemId, e.target.value)}
                          style={{ cursor: 'pointer', padding: '4px 8px' }}
                        >
                          {STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(item.itemId)}
                          title="Delete item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
