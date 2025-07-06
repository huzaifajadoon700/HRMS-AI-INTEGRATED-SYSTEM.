import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./simple-admin.css";

const AdminUpdateTable = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [formData, setFormData] = useState({
    tableNumber: "",
    tableType: "",
    capacity: "",
    status: "Available",
    location: "",
    description: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }

    fetchTables();
  }, [navigate]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";
      const response = await axios.get(`${apiUrl}/tables`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTables(response.data);
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast.error("Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTable = (table) => {
    setSelectedTable(table);
    setFormData({
      tableNumber: table.tableNumber || "",
      tableType: table.tableType || "",
      capacity: table.capacity || "",
      status: table.status || "Available",
      location: table.location || "",
      description: table.description || "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTable) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";

      await axios.put(`${apiUrl}/tables/${selectedTable._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Table updated successfully!");
      setSelectedTable(null);
      setFormData({
        tableNumber: "",
        tableType: "",
        capacity: "",
        status: "Available",
        location: "",
        description: "",
      });
      fetchTables();
    } catch (error) {
      console.error("Error updating table:", error);
      toast.error("Failed to update table");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="simple-admin-container">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="simple-admin-container">
      <div className="simple-admin-header">
        <h1>Update Table</h1>
        <p>Select a table to update its details</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: window.innerWidth <= 768 ? "1fr" : "1fr 1fr",
          gap: "30px",
        }}
      >
        {/* Table Selection */}
        <div className="simple-table-container">
          <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
            <h3 style={{ margin: 0, color: "#000000" }}>
              Select Table to Update
            </h3>
          </div>
          <div style={{ padding: "20px" }}>
            {tables.length > 0 ? (
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {tables.map((table) => (
                  <div
                    key={table._id}
                    onClick={() => handleSelectTable(table)}
                    style={{
                      cursor: "pointer",
                      padding: "15px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      marginBottom: "10px",
                      backgroundColor:
                        selectedTable?._id === table._id
                          ? "#f0f9ff"
                          : "#ffffff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <h6 style={{ margin: "0 0 5px 0", color: "#000000" }}>
                          Table {table.tableNumber}
                        </h6>
                        <p
                          style={{
                            margin: "0 0 5px 0",
                            color: "#000000",
                            fontSize: "14px",
                          }}
                        >
                          {table.tableType}
                        </p>
                        <small style={{ color: "#059669" }}>
                          Capacity: {table.capacity} people
                        </small>
                      </div>
                      <span
                        className={`simple-status simple-status-${table.status?.toLowerCase()}`}
                      >
                        {table.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p style={{ color: "#000000" }}>No tables found</p>
                <small style={{ color: "#000000" }}>
                  Add some tables first to update them
                </small>
              </div>
            )}
          </div>
        </div>

        {/* Update Form */}
        <div className="simple-table-container">
          <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
            <h3 style={{ margin: 0, color: "#000000" }}>
              Update Table Details
            </h3>
          </div>
          <div style={{ padding: "20px" }}>
            {selectedTable ? (
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
                    {loading ? "Updating..." : "Update Table"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTable(null);
                      setFormData({
                        tableNumber: "",
                        tableType: "",
                        capacity: "",
                        status: "Available",
                        location: "",
                        description: "",
                      });
                    }}
                    className="simple-btn simple-btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p style={{ color: "#000000" }}>
                  Select a table from the list to update its details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUpdateTable;
