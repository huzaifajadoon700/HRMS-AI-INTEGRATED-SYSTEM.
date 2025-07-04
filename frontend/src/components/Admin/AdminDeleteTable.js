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
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
      const response = await axios.get(`${apiUrl}/tables`, {
        headers: { Authorization: `Bearer ${token}` }
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
    if (!window.confirm("Are you sure you want to delete this table? This action cannot be undone.")) {
      return;
    }

    setDeletingTableId(tableId);
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
      await axios.delete(`${apiUrl}/tables/${tableId}`, {
        headers: { Authorization: `Bearer ${token}` }
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

  if (loading) return <div className="simple-admin-container"><p>Loading...</p></div>;

  return (
    <div className="simple-admin-container">
      <div className="simple-admin-header">
        <h1>Delete Table</h1>
        <p>Select a table to remove it from the system</p>
      </div>

      <div className="simple-table-container">
        <table className="simple-table">
          <thead>
            <tr>
              <th>Table Number</th>
              <th>Table Type</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Location</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tables.map(table => (
              <tr key={table._id}>
                <td>{table.tableNumber}</td>
                <td>{table.tableType}</td>
                <td>{table.capacity} people</td>
                <td>
                  <span className={`simple-status simple-status-${table.status?.toLowerCase()}`}>
                    {table.status}
                  </span>
                </td>
                <td>{table.location}</td>
                <td className="simple-description">{table.description}</td>
                <td>
                  <button 
                    onClick={() => handleDeleteTable(table._id)}
                    className="simple-btn simple-btn-small simple-btn-danger"
                    disabled={deletingTableId === table._id}
                  >
                    {deletingTableId === table._id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tables.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p>No tables found.</p>
        </div>
      )}
    </div>
  );
};

export default AdminDeleteTable;
