import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Simple admin design
import "./simple-admin.css";

export default function Dashboardmodule() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      navigate("/login");
      return;
    }

    if (role !== "admin") {
      setError("Access denied. Admin privileges required.");
      setLoading(false);
      return;
    }

    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [navigate]);

  if (loading) {
    return (
      <div className="simple-admin-container">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="simple-admin-container">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button
            className="simple-btn simple-btn-primary"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="simple-admin-container">
      <div className="simple-admin-header">
        <h1>Hi, Default Admin!</h1>
        <p>Whole data about your business here.</p>
      </div>

      {/* Revenue Stats */}
      <div className="simple-stat-card" style={{ marginBottom: "30px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3>Revenue Stat</h3>
          <select
            style={{
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
            }}
          >
            <option>Monthly</option>
            <option>Weekly</option>
            <option>Daily</option>
          </select>
        </div>
        <div
          className="stat-number"
          style={{ fontSize: "36px", marginBottom: "8px" }}
        >
          $48,748.50
        </div>
        <div style={{ color: "#059669", fontSize: "14px" }}>
          + 16% from last month
        </div>
      </div>

      {/* Stats Grid */}
      <div className="simple-stats-grid">
        <div className="simple-stat-card">
          <h3>New Booking</h3>
          <div className="stat-number">1839</div>
          <div className="stat-label">Bookings</div>
        </div>

        <div className="simple-stat-card">
          <h3>Available Room</h3>
          <div className="stat-number">837</div>
          <div className="stat-label">Rooms</div>
        </div>

        <div className="simple-stat-card">
          <h3>Check In</h3>
          <div className="stat-number">148</div>
          <div className="stat-label">Guests</div>
        </div>

        <div className="simple-stat-card">
          <h3>Check Out</h3>
          <div className="stat-number">82</div>
          <div className="stat-label">Guests</div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="simple-table-container" style={{ marginTop: "30px" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
          <h3 style={{ margin: 0, color: "#111827" }}>Recent Activities</h3>
        </div>
        <table className="simple-table">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Room</th>
              <th>Activity</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Wade Warren</td>
              <td>#2743</td>
              <td>Requested coffee and water</td>
              <td>16 mins ago</td>
            </tr>
            <tr>
              <td>Esther Howard</td>
              <td>#3004</td>
              <td>Paid massage conference</td>
              <td>24 mins ago</td>
            </tr>
            <tr>
              <td>Leslie Alexander</td>
              <td>#3045</td>
              <td>Private information about local</td>
              <td>32 mins ago</td>
            </tr>
            <tr>
              <td>Guy Hawkins</td>
              <td>#3045</td>
              <td>Allow guests to view and refill</td>
              <td>48 mins ago</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bookings Summary */}
      <div className="simple-stat-card" style={{ marginTop: "30px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3>Bookings Summary</h3>
          <select
            style={{
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
            }}
          >
            <option>Monthly</option>
            <option>Weekly</option>
            <option>Daily</option>
          </select>
        </div>
        <div
          className="stat-number"
          style={{ fontSize: "36px", marginBottom: "8px" }}
        >
          20,395
        </div>
        <div
          style={{ color: "#6b7280", fontSize: "14px", marginBottom: "20px" }}
        >
          Total Bookings
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div>
            <div
              style={{ color: "#059669", fontSize: "24px", fontWeight: "600" }}
            >
              14,839
            </div>
            <div style={{ color: "#6b7280", fontSize: "14px" }}>
              Confirmed Booking
            </div>
          </div>
          <div>
            <div
              style={{ color: "#d97706", fontSize: "24px", fontWeight: "600" }}
            >
              6,738
            </div>
            <div style={{ color: "#6b7280", fontSize: "14px" }}>
              Pending Booking
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
