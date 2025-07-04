import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./simple-admin.css";

const AdminViewTables = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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
    if (window.confirm('Are you sure you want to delete this table?')) {
      try {
        const token = localStorage.getItem("token");
        const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
        await axios.delete(`${apiUrl}/tables/${tableId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Table deleted successfully");
        fetchTables();
      } catch (error) {
        console.error("Error deleting table:", error);
        toast.error("Failed to delete table");
      }
    }
  };

  const filteredTables = tables.filter(table =>
    table.tableNumber?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="simple-admin-container"><p>Loading...</p></div>;

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
          onClick={() => navigate('/admin/add-table')}
          className="simple-btn simple-btn-primary"
        >
          Add New Table
        </button>
      </div>

      <div className="simple-table-container">
        <table className="simple-table">
          <thead>
            <tr>
              <th>Table Number</th>
              <th>Capacity</th>
              <th>Location</th>
              <th>Type</th>
              <th>Status</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTables.map(table => (
              <tr key={table._id}>
                <td>{table.tableNumber}</td>
                <td>{table.capacity} people</td>
                <td>{table.location}</td>
                <td>{table.type}</td>
                <td>
                  <span className={`simple-status simple-status-${table.status?.toLowerCase()}`}>
                    {table.status}
                  </span>
                </td>
                <td className="simple-description">{table.description}</td>
                <td>
                  <div className="simple-actions">
                    <button 
                      onClick={() => navigate(`/admin/update-table/${table._id}`)}
                      className="simple-btn simple-btn-small"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(table._id)}
                      className="simple-btn simple-btn-small simple-btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTables.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p>No tables found.</p>
          <button 
            onClick={() => navigate('/admin/add-table')}
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
