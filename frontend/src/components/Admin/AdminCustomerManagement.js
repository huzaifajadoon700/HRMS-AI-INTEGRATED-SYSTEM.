import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./simple-admin.css";

const AdminCustomerManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    status: "Active",
    membershipType: "Regular",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }

    fetchCustomers();
  }, [navigate, fetchCustomers]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";
      const response = await axios.get(`${apiUrl}/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
      }
      toast.error("Failed to fetch customers");
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
      const url = editingCustomer
        ? `${apiUrl}/customers/${editingCustomer._id}`
        : `${apiUrl}/customers`;
      const method = editingCustomer ? "PUT" : "POST";

      await axios({
        method,
        url,
        data: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(
        editingCustomer
          ? "Customer updated successfully"
          : "Customer added successfully"
      );
      fetchCustomers();
      resetForm();
    } catch (error) {
      console.error("Error saving customer:", error);
      toast.error("Failed to save customer");
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData(customer);
    setShowAddForm(true);
  };

  const handleDelete = async (customerId) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        const token = localStorage.getItem("token");
        const apiUrl =
          process.env.REACT_APP_API_BASE_URL ||
          "https://hrms-bace.vercel.app/api";
        await axios.delete(`${apiUrl}/customers/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Customer deleted successfully");
        fetchCustomers();
      } catch (error) {
        console.error("Error deleting customer:", error);
        toast.error("Failed to delete customer");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      status: "Active",
      membershipType: "Regular",
    });
    setEditingCustomer(null);
    setShowAddForm(false);
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm);
    const matchesStatus =
      statusFilter === "All Status" || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
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
        <h1>Customer Management</h1>
        <p>Manage customer information and details</p>
      </div>

      <div className="simple-admin-controls">
        <div
          style={{
            display: "flex",
            gap: window.innerWidth <= 768 ? "8px" : "16px",
            flex: 1,
            flexWrap: window.innerWidth <= 768 ? "wrap" : "nowrap",
          }}
        >
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="simple-search-input"
            style={{
              minWidth: window.innerWidth <= 768 ? "100%" : "auto",
              marginBottom: window.innerWidth <= 768 ? "10px" : "0",
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="simple-search-input"
            style={{
              maxWidth: window.innerWidth <= 768 ? "100%" : "200px",
              minWidth: window.innerWidth <= 768 ? "100%" : "150px",
            }}
          >
            <option value="All Status">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="VIP">VIP</option>
          </select>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="simple-btn simple-btn-primary"
          style={{
            marginTop: window.innerWidth <= 768 ? "10px" : "0",
            width: window.innerWidth <= 768 ? "100%" : "auto",
          }}
        >
          Add Customer
        </button>
      </div>

      {showAddForm && (
        <div className="simple-form-container">
          <h3>{editingCustomer ? "Edit Customer" : "Add New Customer"}</h3>
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
                required
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleInputChange}
              />
            </div>
            <div className="simple-form-row">
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={formData.country}
                onChange={handleInputChange}
              />
              <select
                name="membershipType"
                value={formData.membershipType}
                onChange={handleInputChange}
                required
              >
                <option value="Regular">Regular</option>
                <option value="Premium">Premium</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
            <div className="simple-form-row">
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="VIP">VIP</option>
              </select>
              <div></div>
            </div>
            <textarea
              name="address"
              placeholder="Full Address"
              value={formData.address}
              onChange={handleInputChange}
              rows="3"
            />
            <div className="simple-form-actions">
              <button type="submit" className="simple-btn simple-btn-primary">
                {editingCustomer ? "Update Customer" : "Add Customer"}
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

      <div className="simple-table-container">
        <table className="simple-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th className="hide-mobile">Phone</th>
              <th className="hide-mobile">City</th>
              <th className="hide-mobile">Country</th>
              <th className="hide-mobile">Membership</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer._id}>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td className="hide-mobile">{customer.phone}</td>
                <td className="hide-mobile">{customer.city || "N/A"}</td>
                <td className="hide-mobile">{customer.country || "N/A"}</td>
                <td className="hide-mobile">{customer.membershipType}</td>
                <td>
                  <span
                    className={`simple-status simple-status-${customer.status?.toLowerCase()}`}
                  >
                    {customer.status}
                  </span>
                </td>
                <td>
                  <div className="simple-actions">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="simple-btn simple-btn-small"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(customer._id)}
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

      {filteredCustomers.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <p>No customers found.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="simple-btn simple-btn-primary"
          >
            Add First Customer
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminCustomerManagement;
