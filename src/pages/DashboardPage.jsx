import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Link2,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { adminApi } from '../services/api';

const COLORS = ['#B3A369', '#003057', '#4A90E2', '#7ED321', '#BD10E0', '#F5A623', '#D0021B', '#8B572A'];

function StatCard({ icon: Icon, iconClass, label, value, change, changeType }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value">{value}</div>
          {change && (
            <div className={`stat-change ${changeType}`}>
              <TrendingUp size={14} />
              {change}
            </div>
          )}
        </div>
        <div className={`stat-icon ${iconClass}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [trendsData, setTrendsData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, trendsRes, categoryRes] = await Promise.all([
        adminApi.getAnalyticsOverview(),
        adminApi.getItemsOverTime(14),
        adminApi.getCategoryBreakdown()
      ]);

      setOverview(overviewRes);
      setTrendsData(trendsRes.data || []);
      setCategoryData(categoryRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="empty-state">
          <AlertCircle />
          <h3>Failed to load dashboard</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadDashboardData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of Lost & Found platform activity</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon={Package}
          iconClass="blue"
          label="Total Items"
          value={overview?.totalItems || 0}
          change={`${overview?.recentActivity?.itemsLast7Days || 0} this week`}
          changeType="positive"
        />
        <StatCard
          icon={Search}
          iconClass="red"
          label="Active Lost Items"
          value={overview?.lostItems?.active || 0}
        />
        <StatCard
          icon={CheckCircle}
          iconClass="green"
          label="Items Found"
          value={overview?.foundItems?.active || 0}
        />
        <StatCard
          icon={Link2}
          iconClass="purple"
          label="Match Rate"
          value={`${overview?.matches?.matchRate || 0}%`}
          change={`${overview?.matches?.total || 0} total matches`}
          changeType="positive"
        />
      </div>

      {/* Charts Row */}
      <div className="grid-2">
        {/* Activity Trends */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Item Activity (Last 14 Days)</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.slice(5)} // Show MM-DD
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="lost"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Lost"
                />
                <Line
                  type="monotone"
                  dataKey="found"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Found"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Items by Category</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="total"
                  nameKey="category"
                  label={({ category, percent }) =>
                    `${category} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={true}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Match Statistics */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Match Statistics</h3>
        </div>
        <div className="stats-grid">
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#003057' }}>
              {overview?.matches?.total || 0}
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>Total Matches</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#f59e0b' }}>
              {overview?.matches?.pending || 0}
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>Pending Review</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#10b981' }}>
              {overview?.matches?.confirmed || 0}
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>Confirmed</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#B3A369' }}>
              {overview?.matches?.matchRate || 0}%
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>Success Rate</div>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Lost Items Breakdown</h3>
          </div>
          <table>
            <tbody>
              <tr>
                <td>Active</td>
                <td style={{ textAlign: 'right' }}>
                  <span className="badge active">{overview?.lostItems?.active || 0}</span>
                </td>
              </tr>
              <tr>
                <td>Resolved</td>
                <td style={{ textAlign: 'right' }}>
                  <span className="badge resolved">{overview?.lostItems?.resolved || 0}</span>
                </td>
              </tr>
              <tr>
                <td><strong>Total</strong></td>
                <td style={{ textAlign: 'right' }}>
                  <strong>{overview?.lostItems?.total || 0}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Found Items Breakdown</h3>
          </div>
          <table>
            <tbody>
              <tr>
                <td>Active</td>
                <td style={{ textAlign: 'right' }}>
                  <span className="badge active">{overview?.foundItems?.active || 0}</span>
                </td>
              </tr>
              <tr>
                <td>Resolved</td>
                <td style={{ textAlign: 'right' }}>
                  <span className="badge resolved">{overview?.foundItems?.resolved || 0}</span>
                </td>
              </tr>
              <tr>
                <td><strong>Total</strong></td>
                <td style={{ textAlign: 'right' }}>
                  <strong>{overview?.foundItems?.total || 0}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
