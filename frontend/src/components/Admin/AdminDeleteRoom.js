import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./simple-admin.css";

const AdminDeleteRoom = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [deletingRoomId, setDeletingRoomId] = useState(null);

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
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";
      const response = await axios.get(`${apiUrl}/rooms`);
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/placeholder-room.jpg";
    try {
      if (imagePath.startsWith("http")) return imagePath;
      const cleanPath = imagePath.replace(/^\/+/, "");
      const serverURL =
        process.env.REACT_APP_API_URL || "https://hrms-bace.vercel.app";
      if (cleanPath.includes("uploads")) {
        return `${serverURL}/${cleanPath}`;
      }
      return `${serverURL}/uploads/${cleanPath}`;
    } catch (error) {
      console.error("Error formatting image URL:", error);
      return "/images/placeholder-room.jpg";
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this room? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingRoomId(roomId);
    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";
      await axios.delete(`${apiUrl}/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Room deleted successfully!");
      fetchRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      toast.error(error.response?.data?.message || "Failed to delete room");
    } finally {
      setDeletingRoomId(null);
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
        <h1>Delete Room</h1>
        <p>Select a room to remove it from the system</p>
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
          style={{ minWidth: "1000px", width: "100%" }}
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
            {rooms.map((room) => (
              <tr key={room._id}>
                <td>
                  {room.image ? (
                    <img
                      src={room.image}
                      alt={room.roomNumber}
                      className="simple-room-image"
                    />
                  ) : (
                    <div className="simple-no-image">No Image</div>
                  )}
                </td>
                <td>{room.roomNumber}</td>
                <td>{room.roomType}</td>
                <td>{room.capacity} people</td>
                <td>Rs. {room.price}/night</td>
                <td>
                  <span
                    className={`simple-status simple-status-${room.status?.toLowerCase()}`}
                  >
                    {room.status}
                  </span>
                </td>
                <td className="simple-description">{room.description}</td>
                <td>
                  <button
                    onClick={() => handleDeleteRoom(room._id)}
                    className="simple-btn simple-btn-small simple-btn-danger"
                    disabled={deletingRoomId === room._id}
                  >
                    {deletingRoomId === room._id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rooms.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <p>No rooms found.</p>
        </div>
      )}
    </div>
  );
};

export default AdminDeleteRoom;
