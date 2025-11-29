import React, { useState, useEffect } from 'react';
import { Link2, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { adminApi } from '../services/api';

const STATUSES = ['pending', 'confirmed', 'rejected'];

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [matchRates, setMatchRates] = useState(null);

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [matchesRes, ratesRes] = await Promise.all([
        adminApi.getMatches(statusFilter || undefined),
        adminApi.getMatchRates()
      ]);

      setMatches(matchesRes.matches || []);
      setMatchRates(ratesRes);
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (matchId, newStatus) => {
    try {
      await adminApi.updateMatchStatus(matchId, newStatus);
      loadData();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={16} color="#10b981" />;
      case 'rejected': return <XCircle size={16} color="#ef4444" />;
      default: return <Clock size={16} color="#f59e0b" />;
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Match Management</h1>
        <p className="page-subtitle">Review and manage item matches</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Matches</div>
          <div className="stat-value">{matchRates?.totalMatches || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Review</div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>
            {matchRates?.byStatus?.pending || 0}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Confirmed</div>
          <div className="stat-value" style={{ color: '#10b981' }}>
            {matchRates?.byStatus?.confirmed || 0}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Similarity</div>
          <div className="stat-value">
            {((matchRates?.averageSimilarity || 0) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Similarity Distribution */}
      {matchRates?.similarityDistribution && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Similarity Score Distribution</h3>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {matchRates.similarityDistribution.map(item => (
              <div key={item.range} style={{
                padding: '12px 20px',
                background: '#f8f9fa',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#003057' }}>
                  {item.count}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>{item.range}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matches Table */}
      <div className="card">
        <div className="filters">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUSES.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          <button className="btn btn-secondary" onClick={loadData}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Match ID</th>
                <th>Lost Item</th>
                <th>Found Item</th>
                <th>Similarity</th>
                <th>Status</th>
                <th>Created</th>
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
              ) : matches.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    No matches found
                  </td>
                </tr>
              ) : (
                matches.map(match => (
                  <tr key={match.matchId}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                      {match.matchId}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                      {match.lostItemId}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                      {match.foundItemId}
                    </td>
                    <td>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{
                          width: '60px',
                          height: '6px',
                          background: '#e5e7eb',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${(match.similarity || 0) * 100}%`,
                            height: '100%',
                            background: match.similarity >= 0.9 ? '#10b981' :
                                       match.similarity >= 0.8 ? '#B3A369' : '#f59e0b',
                            borderRadius: '3px'
                          }}></div>
                        </div>
                        <span style={{ fontWeight: '500' }}>
                          {((match.similarity || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {getStatusIcon(match.status)}
                        <span className={`badge ${match.status}`}>
                          {match.status}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px' }}>{formatDate(match.createdAt)}</td>
                    <td>
                      {match.status === 'pending' && (
                        <div className="action-buttons">
                          <button
                            className="btn btn-sm"
                            style={{ background: '#d1fae5', color: '#065f46' }}
                            onClick={() => handleStatusUpdate(match.matchId, 'confirmed')}
                          >
                            Confirm
                          </button>
                          <button
                            className="btn btn-sm"
                            style={{ background: '#fee2e2', color: '#991b1b' }}
                            onClick={() => handleStatusUpdate(match.matchId, 'rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      )}
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
