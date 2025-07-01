import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiCpu, 
  FiActivity, 
  FiTrendingUp, 
  FiTarget, 
  FiBarChart2, 
  FiUsers, 
  FiHome,
  FiStar,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import './EnhancedDashboardModule.css';

const RoomRecommendationAnalytics = () => {
  const [mlMetrics, setMlMetrics] = useState(null);
  const [confusionMatrix, setConfusionMatrix] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchMLMetrics(),
        fetchConfusionMatrix(),
        fetchSystemStatus()
      ]);
    } catch (err) {
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMLMetrics = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
      const response = await axios.get(`${apiUrl}/rooms/ml/accuracy`);
      if (response.data.success) {
        setMlMetrics(response.data);
      }
    } catch (error) {
      console.error('Error fetching ML metrics:', error);
    }
  };

  const fetchConfusionMatrix = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
      const response = await axios.get(`${apiUrl}/rooms/ml/confusion-matrix`);
      if (response.data.success) {
        setConfusionMatrix(response.data);
      }
    } catch (error) {
      console.error('Error fetching confusion matrix:', error);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
      const response = await axios.get(`${apiUrl}/rooms/ml/status`);
      if (response.data.success) {
        setSystemStatus(response.data);
      }
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const getAccuracyColor = (rmse) => {
    if (rmse <= 0.8) return '#28a745'; // Excellent
    if (rmse <= 1.0) return '#17a2b8'; // Good
    if (rmse <= 1.2) return '#ffc107'; // Fair
    return '#dc3545'; // Poor
  };

  const getAccuracyLabel = (rmse) => {
    if (rmse <= 0.8) return 'Excellent';
    if (rmse <= 1.0) return 'Good';
    if (rmse <= 1.2) return 'Fair';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="enhanced-dash-module-container">
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading Room ML Analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="enhanced-dash-module-container">
        <div className="alert alert-danger">
          <FiAlertCircle className="me-2" />
          {error}
          <button className="btn btn-outline-danger btn-sm ms-3" onClick={fetchAllData}>
            <FiRefreshCw className="me-1" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-dash-module-container">
      {/* Header */}
      <div className="module-header">
        <div className="header-content">
          <div className="header-left">
            <FiCpu className="header-icon" />
            <div>
              <h2 className="module-title">Room Recommendation Analytics</h2>
              <p className="module-subtitle">AI-Powered Room Recommendation System Performance</p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <FiRefreshCw className={`me-1 ${refreshing ? 'spinning' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0 d-flex align-items-center">
                <FiActivity className="me-2" />
                ML System Status
              </h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3">
                  <div className="status-metric">
                    <div className="metric-icon text-success">
                      <FiCheckCircle size={24} />
                    </div>
                    <h4 className="metric-value text-success">
                      {systemStatus?.model_ready ? 'ACTIVE' : 'INACTIVE'}
                    </h4>
                    <p className="metric-label">Model Status</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="status-metric">
                    <div className="metric-icon text-info">
                      <FiUsers size={24} />
                    </div>
                    <h4 className="metric-value text-info">
                      {systemStatus?.users_count?.toLocaleString() || '0'}
                    </h4>
                    <p className="metric-label">Users Analyzed</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="status-metric">
                    <div className="metric-icon text-warning">
                      <FiHome size={24} />
                    </div>
                    <h4 className="metric-value text-warning">
                      {systemStatus?.rooms_count || '0'}
                    </h4>
                    <p className="metric-label">Rooms in Dataset</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="status-metric">
                    <div className="metric-icon text-primary">
                      <FiCpu size={24} />
                    </div>
                    <h4 className="metric-value text-primary">
                      {systemStatus?.training_time?.toFixed(2) || '0'}s
                    </h4>
                    <p className="metric-label">Training Time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accuracy Metrics */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0 d-flex align-items-center">
                <FiTarget className="me-2" />
                Accuracy Metrics
              </h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-6">
                  <div className="accuracy-metric">
                    <h3 className="metric-value" style={{ color: getAccuracyColor(mlMetrics?.rmse || 0) }}>
                      {mlMetrics?.rmse?.toFixed(3) || '0.000'}
                    </h3>
                    <p className="metric-label">RMSE Score</p>
                    <small className="text-muted">Root Mean Square Error</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="accuracy-metric">
                    <h3 className="metric-value" style={{ color: getAccuracyColor(mlMetrics?.mae || 0) }}>
                      {mlMetrics?.mae?.toFixed(3) || '0.000'}
                    </h3>
                    <p className="metric-label">MAE Score</p>
                    <small className="text-muted">Mean Absolute Error</small>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-center">
                <span className={`badge bg-${getAccuracyColor(mlMetrics?.rmse || 0) === '#28a745' ? 'success' : 
                  getAccuracyColor(mlMetrics?.rmse || 0) === '#17a2b8' ? 'info' : 
                  getAccuracyColor(mlMetrics?.rmse || 0) === '#ffc107' ? 'warning' : 'danger'} fs-6`}>
                  {getAccuracyLabel(mlMetrics?.rmse || 0)} Accuracy
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0 d-flex align-items-center">
                <FiBarChart2 className="me-2" />
                Confusion Matrix
              </h5>
            </div>
            <div className="card-body">
              {confusionMatrix?.confusion_matrix ? (
                <div className="row text-center">
                  <div className="col-6">
                    <div className="confusion-metric">
                      <h4 className="metric-value text-primary">
                        {(confusionMatrix.confusion_matrix.accuracy * 100).toFixed(1)}%
                      </h4>
                      <p className="metric-label">Accuracy</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="confusion-metric">
                      <h4 className="metric-value text-success">
                        {(confusionMatrix.confusion_matrix.precision * 100).toFixed(1)}%
                      </h4>
                      <p className="metric-label">Precision</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="confusion-metric">
                      <h4 className="metric-value text-warning">
                        {(confusionMatrix.confusion_matrix.recall * 100).toFixed(1)}%
                      </h4>
                      <p className="metric-label">Recall</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="confusion-metric">
                      <h4 className="metric-value text-info">
                        {(confusionMatrix.confusion_matrix.f1_score * 100).toFixed(1)}%
                      </h4>
                      <p className="metric-label">F1-Score</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted">
                  <p>Confusion matrix data not available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Model Information */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0 d-flex align-items-center">
                <FiStar className="me-2" />
                Model Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-primary">Algorithm Details</h6>
                  <ul className="list-unstyled">
                    <li><strong>Algorithm:</strong> SVD (Singular Value Decomposition)</li>
                    <li><strong>Type:</strong> Collaborative Filtering</li>
                    <li><strong>Real Model:</strong> {mlMetrics?.real_model ? '✅ Yes' : '❌ No'}</li>
                    <li><strong>Service Port:</strong> 5002</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6 className="text-success">Performance Insights</h6>
                  <ul className="list-unstyled">
                    <li><strong>Training Speed:</strong> {systemStatus?.training_time?.toFixed(2) || '0'}s</li>
                    <li><strong>Dataset Size:</strong> {systemStatus?.users_count?.toLocaleString() || '0'} users</li>
                    <li><strong>Room Coverage:</strong> {systemStatus?.rooms_count || '0'} rooms</li>
                    <li><strong>Model Status:</strong> {systemStatus?.model_ready ? '🟢 Active' : '🔴 Inactive'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomRecommendationAnalytics;
