import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getTableImageUrl, handleImageError } from "../../utils/imageUtils";
import "./simple-admin.css";

const AdminViewTables = () => {
  const navigate = useNavigate();

  // Function to handle navigation within admin dashboard
  const handleAdminNavigation = (module) => {
    console.log("=== ADMIN NAVIGATION TRIGGERED ===");
    console.log("Navigating to module:", module);

    // Dispatch custom event to trigger sidebar module change
    const event = new CustomEvent('adminModuleChange', {
      detail: { module: module }
    });
    window.dispatchEvent(event);
  };
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
      }
      toast.error("Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tableId) => {
    if (window.confirm("Are you sure you want to delete this table?")) {
      try {
        const token = localStorage.getItem("token");
        const apiUrl =
          process.env.REACT_APP_API_BASE_URL ||
          "https://hrms-bace.vercel.app/api";
        await axios.delete(`${apiUrl}/tables/${tableId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Table deleted successfully");
        fetchTables();
      } catch (error) {
        console.error("Error deleting table:", error);
        toast.error("Failed to delete table");
      }
    }
  };

  const filteredTables = tables.filter(
    (table) =>
      table.tableNumber
        ?.toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      table.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="simple-admin-container">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="simple-admin-container">
      <div className="simple-admin-header">
        <h1>View Tables</h1>
        <p>All tables in simple table format</p>
      </div>

      <div className="simple-admin-controls">
        <input
          type="text"
          placeholder="Search tables..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="simple-search-input"
        />
        <button
          onClick={() => handleAdminNavigation("AdminAddTable")}
          className="simple-btn simple-btn-primary"
        >
          Add New Table
        </button>
      </div>

      {/* Table scroll hint for mobile */}
      <div
        style={{
          marginBottom: "10px",
          fontSize: "14px",
          color: "#6b7280",
          textAlign: "center",
        }}
      >
        {window.innerWidth <= 768 && (
          <span>← Swipe left/right to see all columns →</span>
        )}
      </div>

      <div
        className="simple-table-container"
        style={{ overflowX: "auto", width: "100%" }}
      >
        <table
          className="simple-table"
          style={{ minWidth: "800px", width: "100%" }}
        >
          <thead>
            <tr>
              <th style={{ minWidth: "100px" }}>Image</th>
              <th style={{ minWidth: "120px" }}>Table Name</th>
              <th style={{ minWidth: "100px" }}>Capacity</th>
              <th style={{ minWidth: "120px" }}>Location</th>
              <th style={{ minWidth: "100px" }}>Type</th>
              <th style={{ minWidth: "100px" }}>Status</th>
              <th style={{ minWidth: "200px" }}>Description</th>
              <th style={{ minWidth: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTables.map((table) => (
              <tr key={table._id}>
                <td style={{ minWidth: "100px" }}>
                  {table.image ? (
                    <img
                      src={getTableImageUrl(table.image)}
                      alt={table.tableName}
                      className="simple-room-image"
                      style={{
                        width: "60px",
                        height: "40px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                      onError={(e) => handleImageError(e, "/images/placeholder-table.jpg")}
                    />
                  ) : (
                    <div
                      className="simple-no-image"
                      style={{ fontSize: "12px", color: "#6b7280" }}
                    >
                      No Image
                    </div>
                  )}
                </td>
                <td style={{ minWidth: "120px" }}>{table.tableName}</td>
                <td style={{ minWidth: "100px" }}>{table.capacity} people</td>
                <td style={{ minWidth: "120px" }}>{table.location}</td>
                <td style={{ minWidth: "100px" }}>{table.tableType}</td>
                <td style={{ minWidth: "100px" }}>
                  <span
                    className={`simple-status simple-status-${table.status?.toLowerCase()}`}
                  >
                    {table.status}
                  </span>
                </td>
                <td
                  style={{
                    minWidth: "200px",
                    maxWidth: "200px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {table.description}
                </td>
                <td style={{ minWidth: "120px" }}>
                  <button
                    onClick={() => handleDelete(table._id)}
                    className="simple-btn simple-btn-small simple-btn-danger"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTables.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <p>No tables found.</p>
          <button
            onClick={() => handleAdminNavigation("AdminAddTable")}
            className="simple-btn simple-btn-primary"
          >
            Add First Table
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminViewTables;
