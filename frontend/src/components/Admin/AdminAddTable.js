import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./simple-admin.css";

const AdminAddTable = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tableNumber: "",
    capacity: "",
    status: "Available",
    location: "",
    description: "",
    tableType: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFeatureChange = (feature) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tableNumber || !formData.capacity || !formData.location) {
      toast.error(
        "Please fill in all required fields (Table Number, Capacity, Location)"
      );
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";
      const response = await axios.post(`${apiUrl}/tables`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Table added successfully!");
      setFormData({
        tableNumber: "",
        capacity: "",
        status: "available",
        location: "",
        description: "",
        tableType: "",
        features: [],
      });
    } catch (error) {
      console.error("Error adding table:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to add table";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="simple-admin-container">
      <div className="simple-admin-header">
        <h1>Add New Table</h1>
        <p>Add a new table to the system</p>
      </div>

      <div className="simple-table-container">
        <form onSubmit={handleSubmit} className="simple-form">
          <div className="simple-form-row">
            <input
              type="number"
              name="tableNumber"
              placeholder="Table Number"
              value={formData.tableNumber}
              onChange={handleInputChange}
              required
            />
            <select
              name="tableType"
              value={formData.tableType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Table Type</option>
              <option value="Regular">Regular</option>
              <option value="VIP">VIP</option>
              <option value="Outdoor">Outdoor</option>
              <option value="Private">Private</option>
              <option value="Bar">Bar</option>
            </select>
          </div>

          <div className="simple-form-row">
            <input
              type="number"
              name="capacity"
              placeholder="Capacity (number of people)"
              value={formData.capacity}
              onChange={handleInputChange}
              required
            />
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Reserved">Reserved</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div className="simple-form-row">
            <input
              type="text"
              name="location"
              placeholder="Location (e.g., Main Hall, Terrace, etc.)"
              value={formData.location}
              onChange={handleInputChange}
            />
            <div></div>
          </div>

          <textarea
            name="description"
            placeholder="Table Description (optional)"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
          />

          <div className="simple-form-actions">
            <button
              type="submit"
              className="simple-btn simple-btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Table'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/view-tables')}
              className="simple-btn simple-btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddTable;
            {/* Form Section */}
            <div className="form-section">
              <div className="form-card">
                <div className="form-header">
                  <h2 className="form-title">Table Details</h2>
                  <p className="form-subtitle">
                    Enter the basic information for the new table
                  </p>
                </div>

                <form className="enhanced-table-form" onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">
                        <FiTable className="label-icon" />
                        Table Number
                        <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="tableNumber"
                        className="enhanced-input"
                        placeholder="e.g., T-01, Table 15"
                        value={formData.tableNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <FiUsers className="label-icon" />
                        Seating Capacity
                        <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        className="enhanced-input"
                        placeholder="Number of seats"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        min="1"
                        max="20"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <FiMapPin className="label-icon" />
                        Location
                        <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="location"
                        className="enhanced-input"
                        placeholder="e.g., Main Hall, Terrace, VIP Section"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <FiLayers className="label-icon" />
                        Table Type
                      </label>
                      <select
                        name="tableType"
                        className="enhanced-select"
                        value={formData.tableType}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Table Type</option>
                        <option value="regular">Regular Table</option>
                        <option value="booth">Booth</option>
                        <option value="bar">Bar Table</option>
                        <option value="outdoor">Outdoor Table</option>
                        <option value="private">Private Dining</option>
                        <option value="counter">Counter Seating</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <FiCheck className="label-icon" />
                        Status
                      </label>
                      <select
                        name="status"
                        className="enhanced-select"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="available">✅ Available</option>
                        <option value="occupied">🔴 Occupied</option>
                        <option value="reserved">📅 Reserved</option>
                        <option value="maintenance">🔧 Maintenance</option>
                      </select>
                    </div>

                    <div className="form-group full-width">
                      <label className="form-label">
                        <FiEdit className="label-icon" />
                        Description
                      </label>
                      <textarea
                        name="description"
                        className="enhanced-textarea"
                        placeholder="Describe the table location, special features, or any notes..."
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4"
                      />
                    </div>
                  </div>

                  {/* Features Section */}
                  <div className="form-section-divider">
                    <h3 className="section-title">Table Features</h3>
                    <p className="section-subtitle">
                      Select special features available at this table
                    </p>
                  </div>

                  <div className="features-section">
                    <div className="features-grid">
                      {[
                        { name: "Window View", icon: FiEye },
                        { name: "Power Outlets", icon: FiRefreshCw },
                        { name: "High Chair Available", icon: FiUsers },
                        { name: "Wheelchair Accessible", icon: FiCheck },
                        { name: "Private Area", icon: FiLayers },
                        { name: "Near Kitchen", icon: FiMapPin },
                        { name: "Outdoor Seating", icon: FiGrid },
                        { name: "Bar Access", icon: FiTable },
                      ].map((feature) => {
                        const IconComponent = feature.icon;
                        return (
                          <label
                            key={feature.name}
                            className="feature-checkbox"
                          >
                            <input
                              type="checkbox"
                              checked={formData.features.includes(feature.name)}
                              onChange={() => handleFeatureChange(feature.name)}
                              className="checkbox-input"
                            />
                            <div className="checkbox-custom">
                              <FiCheck className="check-icon" />
                            </div>
                            <IconComponent className="feature-icon" />
                            <span className="feature-text">{feature.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="action-btn secondary"
                      onClick={() => navigate("/admin/tables")}
                    >
                      <FiX />
                      <span>Cancel</span>
                    </button>

                    <button
                      type="submit"
                      className="action-btn primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <FiRefreshCw className="spinning" />
                          <span>Adding Table...</span>
                        </>
                      ) : (
                        <>
                          <FiSave />
                          <span>Add Table</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            {/* Preview Section */}
            <div className="preview-section">
              <div className="preview-card">
                <div className="preview-header">
                  <h3 className="preview-title">Table Preview</h3>
                  <p className="preview-subtitle">
                    See how your table will appear
                  </p>
                </div>

                <div className="table-preview">
                  <div className="preview-table-visual">
                    <div className={`table-icon ${formData.status}`}>
                      <FiTable />
                    </div>
                    <div className={`status-indicator ${formData.status}`}>
                      {formData.status === "available" && <FiCheck />}
                      {formData.status === "occupied" && <FiUsers />}
                      {formData.status === "reserved" && <FiClock />}
                      {formData.status === "maintenance" && <FiTool />}
                    </div>
                  </div>

                  <div className="preview-content">
                    <div className="table-info">
                      <h4 className="table-number">
                        {formData.tableNumber || "Table Number"}
                      </h4>
                      <div className="table-details">
                        <div className="detail-item">
                          <FiUsers className="detail-icon" />
                          <span>{formData.capacity || "0"} Seats</span>
                        </div>
                        <div className="detail-item">
                          <FiMapPin className="detail-icon" />
                          <span>{formData.location || "Location"}</span>
                        </div>
                        <div className="detail-item">
                          <FiLayers className="detail-icon" />
                          <span>{formData.tableType || "Table Type"}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`status-badge ${formData.status}`}>
                      {formData.status === "available" && (
                        <>
                          <FiCheck />
                          <span>Available</span>
                        </>
                      )}
                      {formData.status === "occupied" && (
                        <>
                          <FiUsers />
                          <span>Occupied</span>
                        </>
                      )}
                      {formData.status === "reserved" && (
                        <>
                          <FiClock />
                          <span>Reserved</span>
                        </>
                      )}
                      {formData.status === "maintenance" && (
                        <>
                          <FiTool />
                          <span>Maintenance</span>
                        </>
                      )}
                    </div>

                    {formData.description && (
                      <p className="table-description">
                        {formData.description}
                      </p>
                    )}

                    {formData.features.length > 0 && (
                      <div className="table-features">
                        <h5>Features:</h5>
                        <div className="features-list">
                          {formData.features.map((feature, index) => (
                            <span key={index} className="feature-tag">
                              <FiCheck />
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="preview-details">
                  <div className="detail-item">
                    <span className="detail-label">Table Number:</span>
                    <span className="detail-value">
                      {formData.tableNumber || "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Capacity:</span>
                    <span className="detail-value">
                      {formData.capacity ? `${formData.capacity} seats` : "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">
                      {formData.location || "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">
                      {formData.tableType || "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">{formData.status}</span>
                  </div>
                  {formData.features.length > 0 && (
                    <div className="detail-item">
                      <span className="detail-label">Features:</span>
                      <span className="detail-value">
                        {formData.features.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAddTable;
