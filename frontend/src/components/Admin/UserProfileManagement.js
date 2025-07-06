import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./simple-admin.css";

const UserProfileManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "User",
    status: "Active",
    phone: "",
    department: "",
    password: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }

    fetchUsers();
  }, [navigate]); // fetchUsers is called only once on mount

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";

      // Try admin endpoint first
      let response;
      try {
        response = await axios.get(`${apiUrl}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (adminError) {
        // If admin endpoint fails, try the regular user endpoint
        console.log("Admin endpoint failed, trying user endpoint...");
        response = await axios.get(`${apiUrl}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // If user endpoint returns single user, wrap in array
        if (response.data && !Array.isArray(response.data)) {
          response.data = [response.data];
        }
      }

      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      console.error("Error details:", error.response?.data);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
        toast.error("Session expired. Please login again.");
      } else if (error.response?.status === 403) {
        toast.error("Access denied. Admin privileges required.");
      } else {
        toast.error(
          `Failed to fetch users: ${
            error.response?.data?.message || error.message
          }`
        );
      }
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

      if (editingUser) {
        // Update existing user
        await axios.put(`${apiUrl}/admin/users/${editingUser._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("User updated successfully");
      } else {
        // Create new user - use auth signup endpoint
        await axios.post(`${apiUrl}/auth/signup`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("User added successfully");
      }

      fetchUsers();
      resetForm();
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Failed to save user");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ ...user, password: "" }); // Don't show password
    setShowAddForm(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem("token");
        const apiUrl =
          process.env.REACT_APP_API_BASE_URL ||
          "https://hrms-bace.vercel.app/api";
        await axios.delete(`${apiUrl}/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("User deleted successfully");
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "User",
      status: "Active",
      phone: "",
      department: "",
      password: "",
    });
    setEditingUser(null);
    setShowAddForm(false);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All Roles" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const userStats = {
    total: users.length,
    active: users.filter((u) => u.status === "Active").length,
    inactive: users.filter((u) => u.status === "Inactive").length,
    admins: users.filter((u) => u.role === "Administrator").length,
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
        <h1>User Management</h1>
        <p>Manage and monitor user profiles</p>
      </div>

      <div className="simple-stats-grid">
        <div className="simple-stat-card">
          <h3>Total Users</h3>
          <div className="stat-number">{userStats.total}</div>
          <div className="stat-label">All Users</div>
        </div>
        <div className="simple-stat-card">
          <h3>Active Users</h3>
          <div className="stat-number">{userStats.active}</div>
          <div className="stat-label">Currently Active</div>
        </div>
        <div className="simple-stat-card">
          <h3>Inactive Users</h3>
          <div className="stat-number">{userStats.inactive}</div>
          <div className="stat-label">Deactivated</div>
        </div>
        <div className="simple-stat-card">
          <h3>Administrators</h3>
          <div className="stat-number">{userStats.admins}</div>
          <div className="stat-label">Admin Access</div>
        </div>
      </div>

      <div className="simple-admin-controls">
        <div
          style={{ display: "flex", gap: "16px", flex: 1, flexWrap: "wrap" }}
        >
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="simple-search-input"
            style={{ minWidth: "200px", flex: 1 }}
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="simple-search-input"
            style={{ minWidth: "150px", maxWidth: "200px" }}
          >
            <option value="All Roles">All Roles</option>
            <option value="Administrator">Administrator</option>
            <option value="Manager">Manager</option>
            <option value="Staff">Staff</option>
            <option value="User">User</option>
          </select>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="simple-btn simple-btn-primary"
          style={{ whiteSpace: "nowrap", minWidth: "120px" }}
        >
          Add User
        </button>
      </div>

      {showAddForm && (
        <div className="simple-form-container">
          <h3>{editingUser ? "Edit User" : "Add New User"}</h3>
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
              <input
                type="text"
                name="department"
                placeholder="Department"
                value={formData.department}
                onChange={handleInputChange}
              />
            </div>
            <div className="simple-form-row">
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="User">User</option>
                <option value="Staff">Staff</option>
                <option value="Manager">Manager</option>
                <option value="Administrator">Administrator</option>
              </select>
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
            {!editingUser && (
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required={!editingUser}
              />
            )}
            <div className="simple-form-actions">
              <button type="submit" className="simple-btn simple-btn-primary">
                {editingUser ? "Update User" : "Add User"}
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
              <th style={{ minWidth: "120px" }}>Name</th>
              <th style={{ minWidth: "180px" }}>Email</th>
              <th style={{ minWidth: "120px" }}>Phone</th>
              <th style={{ minWidth: "120px" }}>Department</th>
              <th style={{ minWidth: "100px" }}>Role</th>
              <th style={{ minWidth: "100px" }}>Status</th>
              <th style={{ minWidth: "160px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td style={{ minWidth: "120px" }}>{user.name}</td>
                <td style={{ minWidth: "180px" }}>{user.email}</td>
                <td style={{ minWidth: "120px" }}>{user.phone || "N/A"}</td>
                <td style={{ minWidth: "120px" }}>
                  {user.department || "N/A"}
                </td>
                <td style={{ minWidth: "100px" }}>{user.role}</td>
                <td style={{ minWidth: "100px" }}>
                  <span
                    className={`simple-status simple-status-${user.status?.toLowerCase()}`}
                  >
                    {user.status}
                  </span>
                </td>
                <td style={{ minWidth: "160px" }}>
                  <div
                    className="simple-actions"
                    style={{ display: "flex", gap: "8px", flexWrap: "nowrap" }}
                  >
                    <button
                      onClick={() => handleEdit(user)}
                      className="simple-btn simple-btn-small"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="simple-btn simple-btn-small simple-btn-danger"
                      style={{ whiteSpace: "nowrap" }}
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

      {filteredUsers.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <p>No users found.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="simple-btn simple-btn-primary"
          >
            Add First User
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfileManagement;
