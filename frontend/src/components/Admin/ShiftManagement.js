import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./simple-admin.css";

const ShiftManagement = () => {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }

    fetchShifts();
    fetchStaff();
  }, [selectedDate, navigate]);

  const fetchShifts = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";
      const response = await axios.get(`${apiUrl}/shift?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShifts(response.data);
    } catch (error) {
      toast.error("Failed to fetch shifts");
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";
      const response = await axios.get(`${apiUrl}/staff`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaff(response.data);
    } catch (error) {
      toast.error("Failed to fetch staff");
    }
  };

  const getStaffName = (staffId) => {
    const staffMember = staff.find((member) => member._id === staffId);
    return staffMember ? staffMember.name : "Unknown Staff";
  };

  const getStaffRole = (staffId) => {
    const staffMember = staff.find((member) => member._id === staffId);
    return staffMember ? staffMember.role : "Unknown Role";
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
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
        <h1>Shift Management</h1>
        <p>Manage staff shifts and attendance</p>
      </div>

      <div className="simple-admin-controls">
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <div>
            <label style={{ marginRight: "10px", color: "#000000" }}>
              Select Date:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: "8px",
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
              }}
            />
          </div>
          <button
            onClick={fetchShifts}
            disabled={loading}
            className="simple-btn simple-btn-secondary"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
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
              <th style={{ minWidth: "150px" }}>Staff Member</th>
              <th style={{ minWidth: "100px" }}>Role</th>
              <th style={{ minWidth: "120px" }}>Date</th>
              <th style={{ minWidth: "100px" }}>Start Time</th>
              <th style={{ minWidth: "100px" }}>End Time</th>
              <th style={{ minWidth: "100px" }}>Duration</th>
              <th style={{ minWidth: "100px" }}>Status</th>
              <th style={{ minWidth: "100px" }}>Attended</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => (
              <tr key={shift._id}>
                <td>{getStaffName(shift.staffId)}</td>
                <td>{getStaffRole(shift.staffId)}</td>
                <td>{new Date(shift.date).toLocaleDateString()}</td>
                <td>{formatTime(shift.startTime)}</td>
                <td>{formatTime(shift.endTime)}</td>
                <td>{shift.duration} hours</td>
                <td>
                  <span
                    className={`simple-status simple-status-${shift.status}`}
                  >
                    {shift.status}
                  </span>
                </td>
                <td>
                  <span
                    className={`simple-status ${
                      shift.attended
                        ? "simple-status-available"
                        : "simple-status-unavailable"
                    }`}
                  >
                    {shift.attended ? "Present" : "Absent"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {shifts.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <p>
            No shifts found for {new Date(selectedDate).toLocaleDateString()}.
          </p>
        </div>
      )}
    </div>
  );
};

export default ShiftManagement;
