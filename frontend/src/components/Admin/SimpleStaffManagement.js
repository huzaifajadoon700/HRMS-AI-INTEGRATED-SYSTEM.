import React, { useState, useEffect } from 'react';
import './simple-admin.css';

const SimpleStaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    salary: '',
    status: 'Active',
    hireDate: ''
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff');
      const data = await response.json();
      setStaff(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
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
      const url = editingStaff ? `/api/staff/${editingStaff.id}` : '/api/staff';
      const method = editingStaff ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      fetchStaff();
      resetForm();
    } catch (error) {
      console.error('Error saving staff:', error);
    }
  };

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setFormData(staffMember);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await fetch(`/api/staff/${id}`, { method: 'DELETE' });
        fetchStaff();
      } catch (error) {
        console.error('Error deleting staff:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      salary: '',
      status: 'Active',
      hireDate: ''
    });
    setEditingStaff(null);
    setShowAddForm(false);
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'All Departments' || member.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const staffStats = {
    total: staff.length,
    active: staff.filter(s => s.status === 'Active').length,
    inactive: staff.filter(s => s.status === 'Inactive').length,
    departments: [...new Set(staff.map(s => s.department))].length
  };

  return (
    <div className="simple-admin-container">
      <div className="simple-admin-header">
        <h1>Staff Management</h1>
        <p>Manage staff members and their information</p>
      </div>

      <div className="simple-stats-grid">
        <div className="simple-stat-card">
          <h3>Total Staff</h3>
          <div className="stat-number">{staffStats.total}</div>
          <div className="stat-label">All Staff</div>
        </div>
        <div className="simple-stat-card">
          <h3>Active Staff</h3>
          <div className="stat-number">{staffStats.active}</div>
          <div className="stat-label">Currently Active</div>
        </div>
        <div className="simple-stat-card">
          <h3>Inactive Staff</h3>
          <div className="stat-number">{staffStats.inactive}</div>
          <div className="stat-label">Not Active</div>
        </div>
        <div className="simple-stat-card">
          <h3>Departments</h3>
          <div className="stat-number">{staffStats.departments}</div>
          <div className="stat-label">Total Departments</div>
        </div>
      </div>

      <div className="simple-admin-controls">
        <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
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
            style={{ maxWidth: '200px' }}
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
          <h3>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
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
                {editingStaff ? 'Update Staff' : 'Add Staff'}
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
              <th>Position</th>
              <th>Salary</th>
              <th>Hire Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map(member => (
              <tr key={member.id}>
                <td>{member.name}</td>
                <td>{member.email}</td>
                <td>{member.phone || 'N/A'}</td>
                <td>{member.department}</td>
                <td>{member.position}</td>
                <td>${member.salary || 'N/A'}</td>
                <td>{member.hireDate || 'N/A'}</td>
                <td>
                  <span className={`simple-status simple-status-${member.status?.toLowerCase()}`}>
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
                      onClick={() => handleDelete(member.id)}
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

export default SimpleStaffManagement;
