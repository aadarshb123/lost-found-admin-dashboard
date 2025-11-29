import React, { useState, useEffect } from 'react';
import { RefreshCw, MapPin, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
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

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState(30);
  const [trendsData, setTrendsData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [matchRates, setMatchRates] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [trends, categories, locations, rates] = await Promise.all([
        adminApi.getItemsOverTime(timeRange),
        adminApi.getCategoryBreakdown(),
        adminApi.getLocationHeatmap(),
        adminApi.getMatchRates()
      ]);

      setTrendsData(trends.data || []);
      setCategoryData(categories.data || []);
      setLocationData(locations.data || []);
      setMatchRates(rates);
    } catch (err) {
      console.error('Failed to load analytics:', err);
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

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Detailed platform metrics and insights</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            className="filter-select"
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button className="btn btn-secondary" onClick={loadAnalytics}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Activity Trend */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <TrendingUp size={18} style={{ marginRight: '8px' }} />
            Item Activity Over Time
          </h3>
        </div>
        <div style={{ height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendsData}>
              <defs>
                <linearGradient id="colorLost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorFound" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Area
                type="monotone"
                dataKey="lost"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorLost)"
                name="Lost Items"
              />
              <Area
                type="monotone"
                dataKey="found"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorFound)"
                name="Found Items"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2">
        {/* Category Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Items by Category</h3>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="category"
                  tick={{ fontSize: 12 }}
                  width={100}
                />
                <Tooltip />
                <Bar dataKey="lost" fill="#ef4444" name="Lost" stackId="a" />
                <Bar dataKey="found" fill="#10b981" name="Found" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Category Distribution</h3>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="total"
                  nameKey="category"
                  label={({ category, percent }) =>
                    percent > 0.05 ? `${category} (${(percent * 100).toFixed(0)}%)` : ''
                  }
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

      {/* Location Hotspots */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <MapPin size={18} style={{ marginRight: '8px' }} />
            Location Hotspots
          </h3>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Location</th>
                <th>Lost Items</th>
                <th>Found Items</th>
                <th>Total</th>
                <th>Distribution</th>
              </tr>
            </thead>
            <tbody>
              {locationData.map((loc, index) => {
                const maxTotal = Math.max(...locationData.map(l => l.total));
                const percentage = maxTotal > 0 ? (loc.total / maxTotal) * 100 : 0;

                return (
                  <tr key={loc.building}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: COLORS[index % COLORS.length]
                        }}></div>
                        <strong>{loc.building}</strong>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: '#ef4444' }}>{loc.lost}</span>
                    </td>
                    <td>
                      <span style={{ color: '#10b981' }}>{loc.found}</span>
                    </td>
                    <td><strong>{loc.total}</strong></td>
                    <td>
                      <div style={{
                        width: '150px',
                        height: '8px',
                        background: '#e5e7eb',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: `linear-gradient(90deg, #ef4444 0%, #ef4444 ${loc.lost / loc.total * 100}%, #10b981 ${loc.lost / loc.total * 100}%, #10b981 100%)`,
                          borderRadius: '4px'
                        }}></div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Match Statistics */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Match Performance</h3>
        </div>
        <div className="grid-3" style={{ marginBottom: '24px' }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '42px', fontWeight: '700', color: '#003057' }}>
              {matchRates?.totalMatches || 0}
            </div>
            <div style={{ color: '#666' }}>Total Matches</div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '42px', fontWeight: '700', color: '#B3A369' }}>
              {((matchRates?.averageSimilarity || 0) * 100).toFixed(1)}%
            </div>
            <div style={{ color: '#666' }}>Average Similarity</div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '42px', fontWeight: '700', color: '#10b981' }}>
              {matchRates?.byStatus?.confirmed || 0}
            </div>
            <div style={{ color: '#666' }}>Confirmed Matches</div>
          </div>
        </div>

        {/* Similarity Distribution */}
        <h4 style={{ marginBottom: '16px' }}>Similarity Score Distribution</h4>
        <div style={{ height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={matchRates?.similarityDistribution || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#B3A369" name="Matches" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
