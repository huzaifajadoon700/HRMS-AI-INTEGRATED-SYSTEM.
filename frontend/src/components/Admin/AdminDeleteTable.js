import React, { useState, useEffect } from "react";
import { Card, Button, Spinner, Table } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AdminManageRooms.css";
import "./AdminDeleteTable.css";

const AdminDeleteTable = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
      const response = await axios.get(`${apiUrl}/tables`);
      setTables(response.data);
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast.error("Failed to fetch tables");
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (!window.confirm("Are you sure you want to delete this table?")) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
      const response = await axios.delete(
        `${apiUrl}/tables/${tableId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );

      toast.success("Table deleted successfully!");
      // Update tables list
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
      setLoading(false);
    }
  };

  return (
    <div className="enhanced-delete-table-module-container">
    <div className="admin-manage-tables p-4">
      <h2 className="page-title mb-4">Delete Tables</h2>

      <Card className="cosmic-card">
        <Card.Header className="cosmic-card-header">
          <h5 className="mb-0">Select Table to Delete</h5>
        </Card.Header>
        <Card.Body className="cosmic-card-body">
          <Table striped bordered hover responsive className="cosmic-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Image</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center p-5">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </td>
                </tr>
              ) : tables.length > 0 ? (
                tables.map((table) => (
                  <tr key={table._id}>
                    <td>{table.tableName}</td>
                    <td>{table.tableType}</td>
                    <td>{table.capacity}</td>
                    <td>
                      <span
                        className={`badge cosmic-badge ${
                          table.status === "Available" ? "available" : "unavailable"
                        }`}
                      >
                        {table.status}
                      </span>
                    </td>
                    <td>
                      {table.image && (
                        <img
                          src={`${process.env.REACT_APP_API_URL || 'https://hrms-bace.vercel.app'}${table.image}`}
                          alt={table.tableName}
                          className="cosmic-table-image"
                        />
                      )}
                    </td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteTable(table._id)}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No tables found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
    </div>
  );
};

export default AdminDeleteTable;