import React, { useState, useEffect } from 'react';
import './simple-admin.css';

const SimpleUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'User',
    status: 'Active',
    phone: '',
    department: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      fetchUsers();
      resetForm();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData(user);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await fetch(`/api/users/${id}`, { method: 'DELETE' });
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'User',
      status: 'Active',
      phone: '',
      department: ''
    });
    setEditingUser(null);
    setShowAddForm(false);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'Active').length,
    inactive: users.filter(u => u.status === 'Inactive').length,
    admins: users.filter(u => u.role === 'Administrator').length
  };

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
        <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="simple-search-input"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="simple-search-input"
            style={{ maxWidth: '200px' }}
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
        >
          Add User
        </button>
      </div>

      {showAddForm && (
        <div className="simple-form-container">
          <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
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
            <div className="simple-form-actions">
              <button type="submit" className="simple-btn simple-btn-primary">
                {editingUser ? 'Update User' : 'Add User'}
              </button>
              <button type="button" onClick={resetForm} className="simple-btn simple-btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="simple-table-container">
        <table className="simple-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone || 'N/A'}</td>
                <td>{user.department || 'N/A'}</td>
                <td>{user.role}</td>
                <td>
                  <span className={`simple-status simple-status-${user.status?.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <div className="simple-actions">
                    <button 
                      onClick={() => handleEdit(user)}
                      className="simple-btn simple-btn-small"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)}
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
    </div>
  );
};

export default SimpleUserManagement;
