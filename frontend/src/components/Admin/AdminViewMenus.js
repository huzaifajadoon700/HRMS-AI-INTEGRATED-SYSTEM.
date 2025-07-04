import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./simple-admin.css";

const AdminViewMenus = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [menus, setMenus] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }

    fetchMenus();
  }, [navigate]);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
      const response = await axios.get(`${apiUrl}/menus`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMenus(response.data);
    } catch (error) {
      console.error("Error fetching menus:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
      }
      toast.error("Failed to fetch menus");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (menuId) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        const token = localStorage.getItem("token");
        const apiUrl = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
        await axios.delete(`${apiUrl}/menus/${menuId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Menu item deleted successfully");
        fetchMenus();
      } catch (error) {
        console.error("Error deleting menu:", error);
        toast.error("Failed to delete menu item");
      }
    }
  };

  const filteredMenus = menus.filter(menu =>
    menu.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    menu.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    menu.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="simple-admin-container"><p>Loading...</p></div>;

  return (
    <div className="simple-admin-container">
      <div className="simple-admin-header">
        <h1>View Menu Items</h1>
        <p>All menu items in simple table format</p>
      </div>

      <div className="simple-admin-controls">
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="simple-search-input"
        />
        <button 
          onClick={() => navigate('/admin/add-menu')}
          className="simple-btn simple-btn-primary"
        >
          Add New Menu Item
        </button>
      </div>

      <div className="simple-table-container">
        <table className="simple-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Description</th>
              <th>Ingredients</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMenus.map(menu => (
              <tr key={menu._id}>
                <td>
                  {menu.image ? (
                    <img src={menu.image} alt={menu.name} className="simple-room-image" />
                  ) : (
                    <div className="simple-no-image">No Image</div>
                  )}
                </td>
                <td>{menu.name}</td>
                <td>{menu.category}</td>
                <td>Rs. {menu.price}</td>
                <td>
                  <span className={`simple-status simple-status-${menu.status?.toLowerCase()}`}>
                    {menu.status}
                  </span>
                </td>
                <td className="simple-description">{menu.description}</td>
                <td className="simple-description">{menu.ingredients}</td>
                <td>
                  <div className="simple-actions">
                    <button 
                      onClick={() => navigate(`/admin/update-menu/${menu._id}`)}
                      className="simple-btn simple-btn-small"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(menu._id)}
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

      {filteredMenus.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p>No menu items found.</p>
          <button 
            onClick={() => navigate('/admin/add-menu')}
            className="simple-btn simple-btn-primary"
          >
            Add First Menu Item
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminViewMenus;
