import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./simple-admin.css";

const AdminUpdateMenu = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    status: "Available",
    ingredients: "",
    image: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }

    fetchMenuItems();
  }, [navigate]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";
      const response = await axios.get(`${apiUrl}/menus`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenuItems(response.data);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast.error("Failed to fetch menu items");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name || "",
      description: item.description || "",
      price: item.price || "",
      category: item.category || "",
      status: item.status || "Available",
      ingredients: item.ingredients || "",
      image: item.image || "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";

      await axios.put(`${apiUrl}/menus/${selectedItem._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Menu item updated successfully!");
      setSelectedItem(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        status: "Available",
        ingredients: "",
        image: "",
      });
      fetchMenuItems();
    } catch (error) {
      console.error("Error updating menu item:", error);
      toast.error("Failed to update menu item");
    } finally {
      setLoading(false);
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
        <h1>Update Menu Item</h1>
        <p>Select a menu item to update its details</p>
      </div>

      <div className="simple-admin-controls">
        <button
          onClick={fetchMenuItems}
          disabled={loading}
          className="simple-btn simple-btn-primary"
        >
          {loading ? "Loading..." : "Refresh Menu"}
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: window.innerWidth <= 768 ? "1fr" : "1fr 1fr",
          gap: "30px",
        }}
      >
        {/* Menu Selection */}
        <div className="simple-table-container">
          <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
            <h3 style={{ margin: 0, color: "#000000" }}>
              Select Menu Item to Update
            </h3>
          </div>
          <div style={{ padding: "20px" }}>
            {menuItems.length > 0 ? (
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {menuItems.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleSelectItem(item)}
                    style={{
                      cursor: "pointer",
                      padding: "15px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      marginBottom: "10px",
                      backgroundColor:
                        selectedItem?._id === item._id ? "#f0f9ff" : "#ffffff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <h6 style={{ margin: "0 0 5px 0", color: "#000000" }}>
                          {item.name}
                        </h6>
                        <p
                          style={{
                            margin: "0 0 5px 0",
                            color: "#000000",
                            fontSize: "14px",
                          }}
                        >
                          {item.category}
                        </p>
                        <small style={{ color: "#059669" }}>
                          Rs. {item.price}
                        </small>
                      </div>
                      <span
                        className={`simple-status simple-status-${item.status?.toLowerCase()}`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p style={{ color: "#000000" }}>No menu items found</p>
                <small style={{ color: "#000000" }}>
                  Add some menu items first to update them
                </small>
              </div>
            )}
          </div>
        </div>

        {/* Update Form */}
        <div className="simple-table-container">
          <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
            <h3 style={{ margin: 0, color: "#000000" }}>
              Update Menu Item Details
            </h3>
          </div>
          <div style={{ padding: "20px" }}>
            {selectedItem ? (
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
                    {loading ? "Updating..." : "Update Menu Item"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedItem(null);
                      setFormData({
                        name: "",
                        description: "",
                        price: "",
                        category: "",
                        status: "Available",
                        ingredients: "",
                        image: "",
                      });
                    }}
                    className="simple-btn simple-btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p style={{ color: "#000000" }}>
                  Select a menu item from the list to update its details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUpdateMenu;
