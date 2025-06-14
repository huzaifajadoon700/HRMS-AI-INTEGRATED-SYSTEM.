import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiEye, FiStar, FiTrendingUp, FiUsers, FiTarget, FiTable,
  FiRefreshCw, FiSearch, FiFilter, FiGrid, FiList, FiMapPin,
  FiCheckCircle, FiXCircle, FiBarChart, FiActivity, FiPlus
} from "react-icons/fi";
import { tableRecommendationService } from "../../services/tableRecommendationService";
import "./AdminManageRooms.css";

const AdminViewTables = () => {
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableAnalytics, setTableAnalytics] = useState({});
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }
    
    fetchTables();
    fetchTableAnalytics();
  }, [navigate]);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/api/tables");
      console.log("Fetched tables:", response.data);
      setTables(response.data);
      setFilteredTables(response.data);
      toast.success("Tables loaded successfully");
    } catch (error) {
      console.error("Error fetching tables:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      toast.error(error.response?.data?.message || "Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  };

  const fetchTableAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const response = await tableRecommendationService.getAdminDashboard();
      if (response.success) {
        // Create a map of table analytics for easy lookup
        const analyticsMap = {};
        response.analytics.popularTables?.forEach(table => {
          analyticsMap[table._id] = {
            totalInteractions: table.totalInteractions,
            uniqueUsers: table.uniqueUsers,
            avgRating: table.avgRating
          };
        });
        setTableAnalytics(analyticsMap);
      }
    } catch (error) {
      console.error("Error fetching table analytics:", error);
      // Don't show error toast for analytics as it's supplementary data
    } finally {
      setLoadingAnalytics(false);
    }
  };

  return (
    <div className="enhanced-view-tables-module-container">
      {/* Enhanced Header */}
      <div className="enhanced-tables-header">
        <div className="header-content">
          <div className="title-section">
            <div className="title-wrapper">
              <div className="title-icon">
                <FiTable />
              </div>
              <div className="title-text">
                <h1 className="page-title">Table Analytics</h1>
                <p className="page-subtitle">Monitor table performance and customer preferences</p>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-icon">
                  <FiTable />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{tables.length}</div>
                  <div className="stat-label">Total Tables</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FiCheckCircle />
                </div>
                <div className="stat-content">
                  <div className="stat-number">
                    {tables.filter(t => t.status === 'Available').length}
                  </div>
                  <div className="stat-label">Available Tables</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FiActivity />
                </div>
                <div className="stat-content">
                  <div className="stat-number">
                    {Object.values(tableAnalytics).reduce((sum, t) => sum + (t.totalInteractions || 0), 0)}
                  </div>
                  <div className="stat-label">Total Interactions</div>
                </div>
              </div>
            </div>

          </div>

          {/* Controls Section */}
          <div className="controls-section">
            <div className="search-controls">
              <div className="search-box">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search tables..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="view-controls">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <FiGrid />
                <span>Grid</span>
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <FiList />
                <span>List</span>
              </button>
            </div>

            <div className="action-controls">
              <button className="action-btn primary" onClick={() => navigate('/admin/add-table')}>
                <FiPlus />
                <span>Add Table</span>
              </button>
              <button
                className="action-btn secondary"
                onClick={fetchTableAnalytics}
                disabled={loadingAnalytics}
              >
                <FiRefreshCw className={loadingAnalytics ? 'spinning' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="enhanced-tabs">
        <div className="tabs-container">
          <button className="tab-btn active">
            <FiTable className="tab-icon" />
            <span className="tab-text">All Tables</span>
          </button>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="enhanced-content">
        <div className={`tables-container ${viewMode}-view`}>
          {loading ? (
            <div className="enhanced-loading">
              <div className="loading-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
              </div>
              <p className="loading-text">Loading tables...</p>
            </div>
          ) : filteredTables.length > 0 ? (
            <div className="enhanced-tables-grid">
              {filteredTables.map((table) => {
                const analytics = tableAnalytics[table._id] || {};
                return (
                  <div key={table._id} className={`enhanced-table-card ${viewMode}-card`}>
                    <div className="table-image-container">
                      <img
                        src={table.image ? `http://localhost:8080${table.image}` : "/images/placeholder-table.jpg"}
                        alt={`Table ${table.tableNumber || table.tableName}`}
                        className="table-image"
                        onError={(e) => {
                          e.target.src = "/images/placeholder-table.jpg";
                          e.target.onerror = null;
                        }}
                      />
                      <div className="image-overlay">
                        <div className="overlay-actions">
                          <button className="action-btn view-btn">
                            <FiEye />
                          </button>
                        </div>
                      </div>

                      <div className="table-badges">
                        <span className={`status-badge ${table.status === 'Available' ? 'available' : 'occupied'}`}>
                          {table.status}
                        </span>
                      </div>
                    </div>

                    <div className="table-content">
                      <div className="table-header">
                        <div className="table-title">
                          <h3 className="table-number">Table {table.tableNumber || table.tableName}</h3>
                          <span className="table-type">{table.tableType || 'Standard'}</span>
                        </div>
                        <div className="table-capacity">
                          <span className="capacity-amount">{table.capacity}</span>
                          <span className="capacity-period">seats</span>
                        </div>
                      </div>

                      <p className="table-description">{table.description || 'Comfortable dining table for your guests'}</p>

                      <div className="table-stats">
                        <div className="stat-item">
                          <FiUsers className="stat-icon capacity" />
                          <span className="stat-value">{table.capacity}</span>
                          <span className="stat-label">seats</span>
                        </div>
                        {analytics.totalInteractions > 0 && (
                          <div className="stat-item">
                            <FiActivity className="stat-icon interactions" />
                            <span className="stat-value">{analytics.totalInteractions}</span>
                            <span className="stat-label">interactions</span>
                          </div>
                        )}
                        {analytics.avgRating > 0 && (
                          <div className="stat-item">
                            <FiStar className="stat-icon rating" />
                            <span className="stat-value">{analytics.avgRating.toFixed(1)}</span>
                            <span className="stat-label">rating</span>
                          </div>
                        )}
                      </div>

                      <div className="table-features">
                        <div className="feature-tag">
                          <FiMapPin className="feature-icon" />
                          <span className="feature-text">{table.location || 'Main Hall'}</span>
                        </div>
                        <div className="feature-tag">
                          <FiTable className="feature-icon" />
                          <span className="feature-text">{table.tableType || 'Standard'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="enhanced-empty-state">
              <div className="empty-icon">
                <FiTable />
              </div>
              <div className="empty-content">
                <h3 className="empty-title">No tables found</h3>
                <p className="empty-description">
                  {searchTerm
                    ? 'Try adjusting your search criteria'
                    : 'Add some tables to see them listed here'
                  }
                </p>
                {!searchTerm && (
                  <button className="empty-action-btn" onClick={() => navigate('/admin/add-table')}>
                    <FiPlus />
                    Add New Table
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminViewTables;