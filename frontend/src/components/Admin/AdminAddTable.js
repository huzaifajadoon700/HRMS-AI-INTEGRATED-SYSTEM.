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
