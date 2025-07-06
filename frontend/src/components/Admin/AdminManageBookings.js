import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./simple-admin.css";

const AdminManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingBookingId, setDeletingBookingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }

    fetchBookings();
  }, [navigate]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";
      const response = await axios.get(`${apiUrl}/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setBookings(response.data);
      toast.success("Bookings loaded successfully");
    } catch (error) {
      console.error("Error fetching bookings:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again");
        navigate("/login");
      } else {
        toast.error("Failed to fetch bookings");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this booking? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingBookingId(bookingId);
    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";
      await axios.delete(`${apiUrl}/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking._id !== bookingId)
      );
      toast.success("Booking deleted successfully");
    } catch (error) {
      console.error("Error deleting booking:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again");
        navigate("/login");
      } else {
        toast.error("Failed to delete booking");
      }
    } finally {
      setDeletingBookingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getBookingStatus = (booking) => {
    const today = new Date();
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);

    if (today < checkIn) return "upcoming";
    if (today >= checkIn && today <= checkOut) return "active";
    return "completed";
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
        <h1>Manage Bookings</h1>
        <p>Monitor and manage all hotel bookings</p>
      </div>

      <div className="simple-admin-controls">
        <button
          onClick={fetchBookings}
          disabled={loading}
          className="simple-btn simple-btn-primary"
        >
          {loading ? "Loading..." : "Refresh Bookings"}
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
          style={{ minWidth: "1000px", width: "100%" }}
        >
          <thead>
            <tr>
              <th style={{ minWidth: "120px" }}>Booking ID</th>
              <th style={{ minWidth: "150px" }}>Customer</th>
              <th style={{ minWidth: "120px" }}>Room</th>
              <th style={{ minWidth: "120px" }}>Check-in</th>
              <th style={{ minWidth: "120px" }}>Check-out</th>
              <th style={{ minWidth: "80px" }}>Guests</th>
              <th style={{ minWidth: "120px" }}>Total Price</th>
              <th style={{ minWidth: "100px" }}>Status</th>
              <th style={{ minWidth: "160px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id}>
                <td>#{booking._id.slice(-8)}</td>
                <td>
                  <div>
                    <div style={{ fontWeight: "bold" }}>
                      {booking.customerName || booking.customer?.name || "N/A"}
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {booking.customerEmail || booking.customer?.email || ""}
                    </div>
                  </div>
                </td>
                <td>
                  Room {booking.roomNumber || booking.room?.roomNumber || "N/A"}
                </td>
                <td>{formatDate(booking.checkInDate)}</td>
                <td>{formatDate(booking.checkOutDate)}</td>
                <td>{booking.numberOfGuests || booking.guests || 1}</td>
                <td>Rs. {booking.totalPrice || 0}</td>
                <td>
                  <span
                    className={`simple-status simple-status-${getBookingStatus(
                      booking
                    )}`}
                  >
                    {getBookingStatus(booking)}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleDeleteBooking(booking._id)}
                    className="simple-btn simple-btn-small simple-btn-danger"
                    disabled={deletingBookingId === booking._id}
                  >
                    {deletingBookingId === booking._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {bookings.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <p>No bookings found.</p>
        </div>
      )}
    </div>
  );
};

export default AdminManageBookings;
