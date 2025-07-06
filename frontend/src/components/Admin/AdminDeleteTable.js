import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./simple-admin.css";

const AdminDeleteTable = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [deletingTableId, setDeletingTableId] = useState(null);

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

  const handleDeleteTable = async (tableId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this table? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingTableId(tableId);
    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";
      await axios.delete(`${apiUrl}/tables/${tableId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Table deleted successfully!");
      fetchTables();
    } catch (error) {
      console.error("Error deleting table:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      toast.error(error.response?.data?.message || "Failed to delete table");
    } finally {
      setDeletingTableId(null);
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
        <h1>Delete Table</h1>
        <p>Select a table to remove it from the system</p>
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
          style={{ minWidth: "900px", width: "100%" }}
        >
          <thead>
            <tr>
              <th style={{ minWidth: "100px" }}>Image</th>
              <th style={{ minWidth: "120px" }}>Table Name</th>
              <th style={{ minWidth: "120px" }}>Table Type</th>
              <th style={{ minWidth: "100px" }}>Capacity</th>
              <th style={{ minWidth: "100px" }}>Status</th>
              <th style={{ minWidth: "120px" }}>Location</th>
              <th style={{ minWidth: "200px" }}>Description</th>
              <th style={{ minWidth: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((table) => (
              <tr key={table._id}>
                <td style={{ minWidth: "100px" }}>
                  {table.image ? (
                    <img
                      src={
                        table.image.startsWith("http")
                          ? table.image
                          : `${
                              process.env.REACT_APP_API_URL ||
                              "https://hrms-bace.vercel.app"
                            }${table.image}`
                      }
                      alt={table.tableName}
                      className="simple-room-image"
                      style={{
                        width: "60px",
                        height: "40px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/60x40/e5e7eb/9ca3af?text=No+Image";
                        e.target.onerror = null;
                      }}
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
                <td style={{ minWidth: "120px" }}>{table.tableType}</td>
                <td style={{ minWidth: "100px" }}>{table.capacity} people</td>
                <td style={{ minWidth: "100px" }}>
                  <span
                    className={`simple-status simple-status-${table.status?.toLowerCase()}`}
                  >
                    {table.status}
                  </span>
                </td>
                <td style={{ minWidth: "120px" }}>{table.location}</td>
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
                <td>
                  <button
                    onClick={() => handleDeleteTable(table._id)}
                    className="simple-btn simple-btn-small simple-btn-danger"
                    disabled={deletingTableId === table._id}
                  >
                    {deletingTableId === table._id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tables.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <p>No tables found.</p>
        </div>
      )}
    </div>
  );
};

export default AdminDeleteTable;
