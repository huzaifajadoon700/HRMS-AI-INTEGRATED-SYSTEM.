import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./simple-admin.css";

const AdminAddRoom = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: '',
    capacity: '',
    price: '',
    status: 'Available',
    description: '',
    image: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
      
      await axios.post(`${apiUrl}/rooms`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("Room added successfully");
      navigate('/admin/view-rooms');
    } catch (error) {
      console.error("Error adding room:", error);
      toast.error("Failed to add room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="simple-admin-container">
      <div className="simple-admin-header">
        <h1>Add New Room</h1>
        <p>Add a new room to the system</p>
      </div>

      <div className="simple-form-container">
        <form onSubmit={handleSubmit} className="simple-form">
          <div className="simple-form-row">
            <input
              type="number"
              name="roomNumber"
              placeholder="Room Number"
              value={formData.roomNumber}
              onChange={handleInputChange}
              required
            />
            <select
              name="roomType"
              value={formData.roomType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Room Type</option>
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Suite">Suite</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Family">Family</option>
            </select>
          </div>

          <div className="simple-form-row">
            <input
              type="number"
              name="capacity"
              placeholder="Capacity (number of people)"
              value={formData.capacity}
              onChange={handleInputChange}
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Price per night"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="simple-form-row">
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
            <input
              type="url"
              name="image"
              placeholder="Image URL (optional)"
              value={formData.image}
              onChange={handleInputChange}
            />
          </div>

          <textarea
            name="description"
            placeholder="Room Description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
          />

          <div className="simple-form-actions">
            <button 
              type="submit" 
              className="simple-btn simple-btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Room'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/admin/view-rooms')}
              className="simple-btn simple-btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddRoom;
