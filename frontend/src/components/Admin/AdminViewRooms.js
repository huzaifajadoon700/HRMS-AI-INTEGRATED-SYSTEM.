import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./simple-admin.css";

const AdminViewRooms = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }

    fetchRooms();
  }, [navigate]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";
      const response = await axios.get(`${apiUrl}/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
      }
      toast.error("Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roomId) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        const token = localStorage.getItem("token");
        const apiUrl =
          process.env.REACT_APP_API_BASE_URL ||
          "https://hrms-bace.vercel.app/api";
        await axios.delete(`${apiUrl}/rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Room deleted successfully");
        fetchRooms();
      } catch (error) {
        console.error("Error deleting room:", error);
        toast.error("Failed to delete room");
      }
    }
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.roomNumber
        ?.toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      room.roomType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1>View Rooms</h1>
        <p>All rooms in simple table format</p>
      </div>

      <div className="simple-admin-controls">
        <input
          type="text"
          placeholder="Search rooms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="simple-search-input"
        />
        <button
          onClick={() => navigate("/admin/add-room")}
          className="simple-btn simple-btn-primary"
        >
          Add New Room
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
          style={{ minWidth: "900px", width: "100%" }}
        >
          <thead>
            <tr>
              <th style={{ minWidth: "100px" }}>Image</th>
              <th style={{ minWidth: "120px" }}>Room Number</th>
              <th style={{ minWidth: "120px" }}>Room Type</th>
              <th style={{ minWidth: "100px" }}>Capacity</th>
              <th style={{ minWidth: "120px" }}>Price</th>
              <th style={{ minWidth: "100px" }}>Status</th>
              <th style={{ minWidth: "200px" }}>Description</th>
              <th style={{ minWidth: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map((room) => (
              <tr key={room._id}>
                <td style={{ minWidth: "100px" }}>
                  {room.image ? (
                    <img
                      src={room.image}
                      alt={room.roomType}
                      className="simple-room-image"
                      style={{
                        width: "60px",
                        height: "40px",
                        objectFit: "cover",
                        borderRadius: "4px",
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
                <td style={{ minWidth: "120px" }}>{room.roomNumber}</td>
                <td style={{ minWidth: "120px" }}>{room.roomType}</td>
                <td style={{ minWidth: "100px" }}>{room.capacity} people</td>
                <td style={{ minWidth: "120px" }}>Rs. {room.price}/night</td>
                <td style={{ minWidth: "100px" }}>
                  <span
                    className={`simple-status simple-status-${room.status?.toLowerCase()}`}
                  >
                    {room.status}
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
                  {room.description}
                </td>
                <td style={{ minWidth: "120px" }}>
                  <button
                    onClick={() => handleDelete(room._id)}
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

      {filteredRooms.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <p>No rooms found.</p>
          <button
            onClick={() => navigate("/admin/add-room")}
            className="simple-btn simple-btn-primary"
          >
            Add First Room
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminViewRooms;
