import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./simple-admin.css";

const AdminManageReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingReservationId, setDeletingReservationId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }
    
    fetchReservations();
  }, [navigate]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
      const response = await axios.get(`${apiUrl}/reservations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setReservations(response.data);
      toast.success("Reservations loaded successfully");
    } catch (error) {
      console.error("Error fetching reservations:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again");
        navigate("/login");
      } else {
        toast.error("Failed to fetch reservations");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReservation = async (reservationId) => {
    if (!window.confirm("Are you sure you want to delete this reservation? This action cannot be undone.")) {
      return;
    }
    
    setDeletingReservationId(reservationId);
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
      await axios.delete(`${apiUrl}/reservations/${reservationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setReservations(prevReservations => prevReservations.filter(reservation => reservation._id !== reservationId));
      toast.success("Reservation deleted successfully");
    } catch (error) {
      console.error("Error deleting reservation:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again");
        navigate("/login");
      } else {
        toast.error("Failed to delete reservation");
      }
    } finally {
      setDeletingReservationId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReservationStatus = (reservation) => {
    const today = new Date();
    const reservationDate = new Date(reservation.reservationDate);
    
    if (reservationDate.toDateString() === today.toDateString()) return 'today';
    if (reservationDate > today) return 'upcoming';
    return 'past';
  };

  if (loading) return <div className="simple-admin-container"><p>Loading...</p></div>;

  return (
    <div className="simple-admin-container">
      <div className="simple-admin-header">
        <h1>Manage Reservations</h1>
        <p>Monitor and manage all table reservations</p>
      </div>

      <div className="simple-admin-controls">
        <button 
          onClick={fetchReservations}
          disabled={loading}
          className="simple-btn simple-btn-primary"
        >
          {loading ? 'Loading...' : 'Refresh Reservations'}
        </button>
      </div>

      <div className="simple-table-container">
        <table className="simple-table">
          <thead>
            <tr>
              <th>Reservation ID</th>
              <th>Customer</th>
              <th>Table</th>
              <th>Date</th>
              <th>Time</th>
              <th>Guests</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(reservation => (
              <tr key={reservation._id}>
                <td>#{reservation._id.slice(-8)}</td>
                <td>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{reservation.customerName || reservation.customer?.name || 'N/A'}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{reservation.customerEmail || reservation.customer?.email || ''}</div>
                  </div>
                </td>
                <td>Table {reservation.tableNumber || reservation.table?.tableNumber || 'N/A'}</td>
                <td>{formatDate(reservation.reservationDate)}</td>
                <td>{formatTime(reservation.reservationTime || '12:00')}</td>
                <td>{reservation.numberOfGuests || reservation.guests || 1}</td>
                <td>
                  <span className={`simple-status simple-status-${getReservationStatus(reservation)}`}>
                    {getReservationStatus(reservation)}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => handleDeleteReservation(reservation._id)}
                    className="simple-btn simple-btn-small simple-btn-danger"
                    disabled={deletingReservationId === reservation._id}
                  >
                    {deletingReservationId === reservation._id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reservations.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p>No reservations found.</p>
        </div>
      )}
    </div>
  );
};

export default AdminManageReservations;
