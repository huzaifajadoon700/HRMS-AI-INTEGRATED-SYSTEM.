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
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    staffId: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    duration: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

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

  // Auto-calculate duration when startTime or endTime changes
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      const diffMs = end - start;
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours > 0) {
        const roundedHours = Math.round(diffHours * 2) / 2; // Round to nearest 0.5 hours

        if (formData.duration !== roundedHours) {
          setFormData((prev) => ({
            ...prev,
            duration: roundedHours,
          }));
        }
      } else if (formData.duration !== "") {
        setFormData((prev) => ({
          ...prev,
          duration: "",
        }));
      }
    } else if (formData.duration !== "") {
      setFormData((prev) => ({
        ...prev,
        duration: "",
      }));
    }
  }, [formData.startTime, formData.endTime]);

  const fetchShifts = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";

      console.log(`Fetching shifts from: ${apiUrl}/shift?date=${selectedDate}`);
      console.log(`Token: ${token ? "Present" : "Missing"}`);

      if (!token) {
        toast.error("Authentication required. Please login.");
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (selectedDate) {
        params.append('date', selectedDate);
      }

      const queryString = params.toString();
      const url = `${apiUrl}/shift${queryString ? `?${queryString}` : ''}`;

      console.log("Fetching shifts from URL:", url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setShifts(response.data);
      console.log("Shifts fetched successfully:", response.data);
      if (response.data.length > 0) {
        console.log("Sample shift data:", response.data[0]);
        console.log("Sample staffId data:", response.data[0].staffId);
      }
    } catch (error) {
      console.error("Error fetching shifts:", error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error config:", error.config);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.statusText ||
        "Failed to fetch shifts";
      toast.error(errorMessage);
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

  const getStaffName = (staffData) => {
    // If staffData is already populated (object), use it directly
    if (staffData && typeof staffData === 'object' && staffData.name) {
      return staffData.name;
    }
    // If staffData is just an ID (string), find it in the staff array
    if (typeof staffData === 'string') {
      const staffMember = staff.find((member) => member._id === staffData);
      return staffMember ? staffMember.name : "Unknown Staff";
    }
    return "Unknown Staff";
  };

  const getStaffRole = (staffData) => {
    // If staffData is already populated (object), use it directly
    if (staffData && typeof staffData === 'object' && staffData.role) {
      return staffData.role;
    }
    // If staffData is just an ID (string), find it in the staff array
    if (typeof staffData === 'string') {
      const staffMember = staff.find((member) => member._id === staffData);
      return staffMember ? staffMember.role : "Unknown Role";
    }
    return "Unknown Role";
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-calculate duration when both start and end times are set
    if (name === "startTime" || name === "endTime") {
      const startTime = name === "startTime" ? value : formData.startTime;
      const endTime = name === "endTime" ? value : formData.endTime;

      if (startTime && endTime) {
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        const diffMs = end - start;
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours > 0) {
          setFormData((prev) => ({
            ...prev,
            [name]: value,
            duration: Math.round(diffHours * 2) / 2, // Round to nearest 0.5 hours
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            [name]: value,
            duration: "",
          }));
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          duration: "",
        }));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      staffId: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "",
      endTime: "",
      duration: "",
      notes: "",
    });
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";

      if (!token) {
        toast.error("Authentication required. Please login.");
        return;
      }

      // Validate form data
      if (
        !formData.staffId ||
        !formData.date ||
        !formData.startTime ||
        !formData.endTime ||
        !formData.duration
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Prepare data with proper types
      const shiftData = {
        ...formData,
        duration: parseFloat(formData.duration) // Ensure duration is a number
      };

      console.log("Submitting shift data:", shiftData);
      console.log("API URL:", `${apiUrl}/shift/add`);

      const response = await axios.post(`${apiUrl}/shift/add`, shiftData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Shift created:", response.data);
      toast.success("Shift assigned successfully!");

      // Update the selected date to match the created shift's date
      if (formData.date !== selectedDate) {
        setSelectedDate(formData.date);
      }

      // Fetch shifts to refresh the list
      await fetchShifts();
      resetForm();
    } catch (error) {
      console.error("Error creating shift:", error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error config:", error.config);

      let errorMessage = "Failed to assign shift";

      if (error.response?.status === 404) {
        errorMessage =
          "API endpoint not found. Please check server configuration.";
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (error.response?.status === 400) {
        errorMessage =
          error.response?.data?.message || "Invalid shift data provided";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
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
        <h1>Shift Management</h1>
        <p>Manage staff shifts and attendance</p>
      </div>

      <div className="simple-admin-controls">
        <div
          style={{
            display: "flex",
            gap: window.innerWidth <= 768 ? "10px" : "15px",
            alignItems: "center",
            flexWrap: window.innerWidth <= 768 ? "wrap" : "nowrap",
          }}
        >
          <div
            style={{
              minWidth: window.innerWidth <= 768 ? "100%" : "auto",
              marginBottom: window.innerWidth <= 768 ? "10px" : "0",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <label
              style={{
                color: "#000000",
                display: window.innerWidth <= 768 ? "block" : "inline",
                marginBottom: window.innerWidth <= 768 ? "5px" : "0",
              }}
            >
              Filter by Date:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: "8px",
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
                width: window.innerWidth <= 768 ? "100%" : "auto",
              }}
            />
            <button
              onClick={() => setSelectedDate("")}
              className="simple-btn simple-btn-secondary"
              style={{
                padding: "8px 12px",
                fontSize: "14px",
                whiteSpace: "nowrap",
              }}
            >
              Show All
            </button>
          </div>
          <button
            onClick={fetchShifts}
            disabled={loading}
            className="simple-btn simple-btn-secondary"
            style={{
              width: window.innerWidth <= 768 ? "100%" : "auto",
              whiteSpace: "nowrap",
            }}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="simple-btn simple-btn-primary"
            style={{
              width: window.innerWidth <= 768 ? "100%" : "auto",
              whiteSpace: "nowrap",
            }}
          >
            {showAddForm ? "Cancel" : "Add Shift"}
          </button>
        </div>
      </div>

      {/* Add Shift Form */}
      {showAddForm && (
        <div
          style={{
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ marginBottom: "20px", color: "#000000" }}>
            Assign New Shift
          </h3>
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  window.innerWidth <= 768 ? "1fr" : "repeat(3, 1fr)",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    color: "#000000",
                    fontWeight: "500",
                  }}
                >
                  Staff Member *
                </label>
                <select
                  name="staffId"
                  value={formData.staffId}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "4px",
                    background: "#ffffff",
                  }}
                >
                  <option value="">Select Staff Member</option>
                  {staff.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} - {member.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    color: "#000000",
                    fontWeight: "500",
                  }}
                >
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "4px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    color: "#000000",
                    fontWeight: "500",
                  }}
                >
                  Start Time *
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "4px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    color: "#000000",
                    fontWeight: "500",
                  }}
                >
                  End Time *
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "4px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    color: "#000000",
                    fontWeight: "500",
                  }}
                >
                  Duration (hours) - Auto-calculated
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration || ""}
                  onChange={handleInputChange}
                  step="0.5"
                  min="1"
                  max="12"
                  placeholder="Auto-calculated"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "4px",
                    background: "#f9fafb",
                    color: "#374151",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    color: "#000000",
                    fontWeight: "500",
                  }}
                >
                  Notes
                </label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Optional notes"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "4px",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                disabled={submitting}
                className="simple-btn simple-btn-primary"
              >
                {submitting ? "Assigning..." : "Assign Shift"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="simple-btn simple-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

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
          style={{ minWidth: "800px", width: "100%" }}
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
