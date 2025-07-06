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

      <div className="simple-table-container">
        <table className="simple-table">
          <thead>
            <tr>
              <th className="hide-mobile">Image</th>
              <th>Room Number</th>
              <th>Room Type</th>
              <th className="hide-mobile">Capacity</th>
              <th>Price</th>
              <th>Status</th>
              <th className="hide-mobile">Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map((room) => (
              <tr key={room._id}>
                <td className="hide-mobile">
                  {room.image ? (
                    <img
                      src={room.image}
                      alt={room.roomType}
                      className="simple-room-image"
                    />
                  ) : (
                    <div className="simple-no-image">No Image</div>
                  )}
                </td>
                <td>{room.roomNumber}</td>
                <td>{room.roomType}</td>
                <td className="hide-mobile">{room.capacity} people</td>
                <td>Rs. {room.price}/night</td>
                <td>
                  <span
                    className={`simple-status simple-status-${room.status?.toLowerCase()}`}
                  >
                    {room.status}
                  </span>
                </td>
                <td className="hide-mobile simple-description">
                  {room.description}
                </td>
                <td>
                  <button
                    onClick={() => handleDelete(room._id)}
                    className="simple-btn simple-btn-small simple-btn-danger"
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
