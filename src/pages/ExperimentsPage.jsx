import React, { useState, useEffect } from 'react';
import { FlaskConical, Plus, Play, Pause, BarChart3, RefreshCw } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { adminApi } from '../services/api';

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [experimentResults, setExperimentResults] = useState(null);

  // Create form state
  const [newExperiment, setNewExperiment] = useState({
    name: '',
    description: '',
    variants: [
      { name: 'Control', description: 'Original experience', percentage: 50 },
      { name: 'Treatment', description: 'New experience', percentage: 50 }
    ],
    traffic_percentage: 100
  });

  useEffect(() => {
    loadExperiments();
  }, []);

  const loadExperiments = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getExperiments();
      setExperiments(response.experiments || []);
    } catch (err) {
      console.error('Failed to load experiments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExperiment = async () => {
    try {
      await adminApi.createExperiment(newExperiment);
      setShowCreateModal(false);
      setNewExperiment({
        name: '',
        description: '',
        variants: [
          { name: 'Control', description: 'Original experience', percentage: 50 },
          { name: 'Treatment', description: 'New experience', percentage: 50 }
        ],
        traffic_percentage: 100
      });
      loadExperiments();
    } catch (err) {
      alert('Failed to create experiment: ' + err.message);
    }
  };

  const handleStatusUpdate = async (experimentId, newStatus) => {
    try {
      await adminApi.updateExperiment(experimentId, { status: newStatus });
      loadExperiments();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const viewResults = async (experiment) => {
    try {
      const results = await adminApi.getExperimentResults(experiment.experimentId);
      setExperimentResults(results);
      setSelectedExperiment(experiment);
    } catch (err) {
      alert('Failed to load results: ' + err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusActions = (experiment) => {
    switch (experiment.status) {
      case 'draft':
        return (
          <button
            className="btn btn-sm btn-primary"
            onClick={() => handleStatusUpdate(experiment.experimentId, 'running')}
          >
            <Play size={14} /> Start
          </button>
        );
      case 'running':
        return (
          <>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => handleStatusUpdate(experiment.experimentId, 'paused')}
            >
              <Pause size={14} /> Pause
            </button>
            <button
              className="btn btn-sm"
              style={{ background: '#dbeafe', color: '#1e40af' }}
              onClick={() => handleStatusUpdate(experiment.experimentId, 'completed')}
            >
              Complete
            </button>
          </>
        );
      case 'paused':
        return (
          <button
            className="btn btn-sm btn-primary"
            onClick={() => handleStatusUpdate(experiment.experimentId, 'running')}
          >
            <Play size={14} /> Resume
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">A/B Testing</h1>
          <p className="page-subtitle">Create and manage experiments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} />
          New Experiment
        </button>
      </div>

      {/* Experiments List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Experiments</h3>
          <button className="btn btn-secondary btn-sm" onClick={loadExperiments}>
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : experiments.length === 0 ? (
          <div className="empty-state">
            <FlaskConical size={48} />
            <h3>No experiments yet</h3>
            <p>Create your first A/B test to start optimizing</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Experiment</th>
                  <th>Status</th>
                  <th>Traffic</th>
                  <th>Variants</th>
                  <th>Participants</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {experiments.map(exp => (
                  <tr key={exp.experimentId}>
                    <td>
                      <div>
                        <strong>{exp.name}</strong>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {exp.description}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${exp.status}`}>{exp.status}</span>
                    </td>
                    <td>{exp.trafficPercentage}%</td>
                    <td>{exp.variants?.length || 0}</td>
                    <td>{exp.metrics?.totalParticipants || 0}</td>
                    <td style={{ fontSize: '13px' }}>{formatDate(exp.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        {getStatusActions(exp)}
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => viewResults(exp)}
                        >
                          <BarChart3 size={14} /> Results
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Experiment Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Experiment</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            <div className="form-group">
              <label className="form-label">Experiment Name</label>
              <input
                type="text"
                className="form-input"
                value={newExperiment.name}
                onChange={e => setNewExperiment({ ...newExperiment, name: e.target.value })}
                placeholder="e.g., Matching Algorithm V2"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                type="text"
                className="form-input"
                value={newExperiment.description}
                onChange={e => setNewExperiment({ ...newExperiment, description: e.target.value })}
                placeholder="What are you testing?"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Traffic Percentage</label>
              <input
                type="number"
                className="form-input"
                value={newExperiment.traffic_percentage}
                onChange={e => setNewExperiment({ ...newExperiment, traffic_percentage: parseFloat(e.target.value) })}
                min="1"
                max="100"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Variants</label>
              {newExperiment.variants.map((variant, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={variant.name}
                    onChange={e => {
                      const variants = [...newExperiment.variants];
                      variants[index].name = e.target.value;
                      setNewExperiment({ ...newExperiment, variants });
                    }}
                    placeholder="Variant name"
                    style={{ flex: 2 }}
                  />
                  <input
                    type="number"
                    className="form-input"
                    value={variant.percentage}
                    onChange={e => {
                      const variants = [...newExperiment.variants];
                      variants[index].percentage = parseFloat(e.target.value);
                      setNewExperiment({ ...newExperiment, variants });
                    }}
                    placeholder="%"
                    style={{ width: '80px' }}
                  />
                </div>
              ))}
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setNewExperiment({
                  ...newExperiment,
                  variants: [...newExperiment.variants, { name: '', description: '', percentage: 0 }]
                })}
              >
                + Add Variant
              </button>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleCreateExperiment}>
                Create Experiment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {experimentResults && (
        <div className="modal-overlay" onClick={() => setExperimentResults(null)}>
          <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Results: {experimentResults.name}</h3>
              <button className="modal-close" onClick={() => setExperimentResults(null)}>×</button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <span className={`badge ${experimentResults.status}`}>{experimentResults.status}</span>
              <span style={{ marginLeft: '12px', color: '#666' }}>
                {experimentResults.totalParticipants} total participants
              </span>
            </div>

            {/* Variants Chart */}
            <div style={{ height: '200px', marginBottom: '24px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={experimentResults.variants}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="participants" fill="#003057" name="Participants" />
                  <Bar dataKey="conversions" fill="#B3A369" name="Conversions" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Variants Table */}
            <table>
              <thead>
                <tr>
                  <th>Variant</th>
                  <th>Participants</th>
                  <th>Conversions</th>
                  <th>Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {experimentResults.variants?.map(variant => (
                  <tr key={variant.name}>
                    <td><strong>{variant.name}</strong></td>
                    <td>{variant.participants}</td>
                    <td>{variant.conversions}</td>
                    <td>
                      <span style={{
                        fontWeight: '600',
                        color: variant.conversionRate > 0 ? '#10b981' : '#666'
                      }}>
                        {variant.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Comparison */}
            {experimentResults.comparison && (
              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <h4 style={{ marginBottom: '12px' }}>Statistical Comparison</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div>
                    <div style={{ color: '#666', fontSize: '12px' }}>Control</div>
                    <div style={{ fontWeight: '600' }}>
                      {experimentResults.comparison.controlConversionRate}%
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#666', fontSize: '12px' }}>Treatment</div>
                    <div style={{ fontWeight: '600' }}>
                      {experimentResults.comparison.treatmentConversionRate}%
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#666', fontSize: '12px' }}>Relative Lift</div>
                    <div style={{
                      fontWeight: '600',
                      color: experimentResults.comparison.relativeLift > 0 ? '#10b981' : '#ef4444'
                    }}>
                      {experimentResults.comparison.relativeLift > 0 ? '+' : ''}
                      {experimentResults.comparison.relativeLift}%
                    </div>
                  </div>
                </div>
                {experimentResults.comparison.needsMoreData && (
                  <div style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    background: '#fef3c7',
                    borderRadius: '6px',
                    color: '#92400e',
                    fontSize: '13px'
                  }}>
                    ⚠️ Need more data for statistical significance (min. 100 participants recommended)
                  </div>
                )}
              </div>
            )}

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setExperimentResults(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
