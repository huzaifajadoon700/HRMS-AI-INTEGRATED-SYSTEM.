import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./simple-admin.css";

const AdminAddMenu = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    ingredients: '',
    status: 'Available',
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
      
      await axios.post(`${apiUrl}/menus`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("Menu item added successfully");
      navigate('/admin/view-menus');
    } catch (error) {
      console.error("Error adding menu:", error);
      toast.error("Failed to add menu item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="simple-admin-container">
      <div className="simple-admin-header">
        <h1>Add New Menu Item</h1>
        <p>Add a new menu item to the system</p>
      </div>

      <div className="simple-form-container">
        <form onSubmit={handleSubmit} className="simple-form">
          <div className="simple-form-row">
            <input
              type="text"
              name="name"
              placeholder="Menu Item Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Category</option>
              <option value="Appetizers">Appetizers</option>
              <option value="Main Course">Main Course</option>
              <option value="Desserts">Desserts</option>
              <option value="Beverages">Beverages</option>
              <option value="Salads">Salads</option>
              <option value="Soups">Soups</option>
            </select>
          </div>

          <div className="simple-form-row">
            <input
              type="number"
              name="price"
              placeholder="Price (Rs.)"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
              <option value="Seasonal">Seasonal</option>
            </select>
          </div>

          <div className="simple-form-row">
            <input
              type="url"
              name="image"
              placeholder="Image URL (optional)"
              value={formData.image}
              onChange={handleInputChange}
            />
            <div></div>
          </div>

          <textarea
            name="description"
            placeholder="Menu Item Description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
          />

          <textarea
            name="ingredients"
            placeholder="Ingredients (comma separated)"
            value={formData.ingredients}
            onChange={handleInputChange}
            rows="3"
          />

          <div className="simple-form-actions">
            <button 
              type="submit" 
              className="simple-btn simple-btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Menu Item'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/admin/view-menus')}
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

export default AdminAddMenu;
