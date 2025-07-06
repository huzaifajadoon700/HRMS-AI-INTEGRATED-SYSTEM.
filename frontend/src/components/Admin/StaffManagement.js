import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./simple-admin.css";

const StaffManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    salary: "",
    status: "Active",
    hireDate: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }

    fetchStaff();
  }, [navigate]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";
      const response = await axios.get(`${apiUrl}/staff`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStaff(response.data);
    } catch (error) {
      console.error("Error fetching staff:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
      }
      toast.error("Failed to fetch staff");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";
      const url = editingStaff
        ? `${apiUrl}/staff/${editingStaff._id}`
        : `${apiUrl}/staff`;
      const method = editingStaff ? "PUT" : "POST";

      await axios({
        method,
        url,
        data: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(
        editingStaff ? "Staff updated successfully" : "Staff added successfully"
      );
      fetchStaff();
      resetForm();
    } catch (error) {
      console.error("Error saving staff:", error);
      toast.error("Failed to save staff");
    }
  };

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setFormData(staffMember);
    setShowAddForm(true);
  };

  const handleDelete = async (staffId) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        const token = localStorage.getItem("token");
        const apiUrl =
          process.env.REACT_APP_API_BASE_URL ||
          "https://hrms-bace.vercel.app/api";
        await axios.delete(`${apiUrl}/staff/${staffId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Staff deleted successfully");
        fetchStaff();
      } catch (error) {
        console.error("Error deleting staff:", error);
        toast.error("Failed to delete staff");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      salary: "",
      status: "Active",
      hireDate: "",
    });
    setEditingStaff(null);
    setShowAddForm(false);
  };

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      departmentFilter === "All Departments" ||
      member.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  if (loading)
    return (
      <div className="simple-admin-container">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="simple-admin-container">
      <div className="simple-admin-header">
        <h1>Staff Management</h1>
        <p>Manage staff members and their information</p>
      </div>

      <div className="simple-admin-controls">
        <div style={{ display: "flex", gap: "16px", flex: 1 }}>
          <input
            type="text"
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="simple-search-input"
          />
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="simple-search-input"
            style={{ maxWidth: "200px" }}
          >
            <option value="All Departments">All Departments</option>
            <option value="Front Desk">Front Desk</option>
            <option value="Housekeeping">Housekeeping</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Management">Management</option>
          </select>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="simple-btn simple-btn-primary"
        >
          Add Staff
        </button>
      </div>

      {showAddForm && (
        <div className="simple-form-container">
          <h3>{editingStaff ? "Edit Staff Member" : "Add New Staff Member"}</h3>
          <form onSubmit={handleSubmit} className="simple-form">
            <div className="simple-form-row">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="simple-form-row">
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
              />
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Department</option>
                <option value="Front Desk">Front Desk</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Management">Management</option>
              </select>
            </div>
            <div className="simple-form-row">
              <input
                type="text"
                name="position"
                placeholder="Position/Job Title"
                value={formData.position}
                onChange={handleInputChange}
                required
              />
              <input
                type="number"
                name="salary"
                placeholder="Salary"
                value={formData.salary}
                onChange={handleInputChange}
              />
            </div>
            <div className="simple-form-row">
              <input
                type="date"
                name="hireDate"
                placeholder="Hire Date"
                value={formData.hireDate}
                onChange={handleInputChange}
              />
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="simple-form-actions">
              <button type="submit" className="simple-btn simple-btn-primary">
                {editingStaff ? "Update Staff" : "Add Staff"}
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
          style={{ minWidth: "1000px", width: "100%" }}
        >
          <thead>
            <tr>
              <th style={{ minWidth: "150px" }}>Name</th>
              <th style={{ minWidth: "180px" }}>Email</th>
              <th style={{ minWidth: "120px" }}>Phone</th>
              <th style={{ minWidth: "120px" }}>Department</th>
              <th style={{ minWidth: "120px" }}>Position</th>
              <th style={{ minWidth: "100px" }}>Salary</th>
              <th style={{ minWidth: "120px" }}>Hire Date</th>
              <th style={{ minWidth: "100px" }}>Status</th>
              <th style={{ minWidth: "160px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((member) => (
              <tr key={member._id}>
                <td style={{ minWidth: "150px" }}>{member.name}</td>
                <td style={{ minWidth: "180px" }}>{member.email}</td>
                <td style={{ minWidth: "120px" }}>{member.phone || "N/A"}</td>
                <td style={{ minWidth: "120px" }}>{member.department}</td>
                <td style={{ minWidth: "120px" }}>{member.position}</td>
                <td style={{ minWidth: "100px" }}>
                  Rs. {member.salary || "N/A"}
                </td>
                <td style={{ minWidth: "120px" }}>
                  {member.hireDate || "N/A"}
                </td>
                <td style={{ minWidth: "100px" }}>
                  <span
                    className={`simple-status simple-status-${member.status?.toLowerCase()}`}
                  >
                    {member.status}
                  </span>
                </td>
                <td>
                  <div className="simple-actions">
                    <button
                      onClick={() => handleEdit(member)}
                      className="simple-btn simple-btn-small"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(member._id)}
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

      {filteredStaff.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <p>No staff members found.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="simple-btn simple-btn-primary"
          >
            Add First Staff Member
          </button>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
