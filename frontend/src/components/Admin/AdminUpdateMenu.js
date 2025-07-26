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
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

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
    // Reset image upload states
    setSelectedFile(null);
    setImagePreview(null);
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, or GIF)');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image upload
  const handleImageUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setImageUploading(true);
    try {
      // Convert to base64 for demo (not recommended for production)
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target.result;
        setFormData(prev => ({
          ...prev,
          image: base64Image
        }));
        toast.success('Image uploaded successfully!');
        setImageUploading(false);
      };
      reader.readAsDataURL(selectedFile);

    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image. Please try again.');
      setImageUploading(false);
    }
  };

  // Clear image
  const clearImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
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

      <div className="responsive-two-column">
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

                {/* Image Upload Section */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '1rem',
                    flexWrap: 'wrap'
                  }}>
                    {/* File Upload */}
                    <div style={{ flex: '1', minWidth: '250px' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        color: '#374151'
                      }}>
                        Upload Image File
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px dashed #d1d5db',
                          borderRadius: '0.5rem',
                          backgroundColor: '#f9fafb',
                          cursor: 'pointer'
                        }}
                      />
                      {selectedFile && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={handleImageUpload}
                            disabled={imageUploading}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: imageUploading ? '#9ca3af' : '#059669',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.375rem',
                              cursor: imageUploading ? 'not-allowed' : 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            {imageUploading ? 'Uploading...' : 'Upload Image'}
                          </button>
                          <button
                            type="button"
                            onClick={clearImage}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.375rem',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Image Preview */}
                    <div style={{ flex: '1', minWidth: '200px' }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        color: '#374151'
                      }}>
                        Image Preview
                      </label>
                      <div style={{
                        width: '100%',
                        height: '150px',
                        border: '2px dashed #d1d5db',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f9fafb'
                      }}>
                        {imagePreview || formData.image ? (
                          <img
                            src={imagePreview || formData.image}
                            alt="Preview"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'cover',
                              borderRadius: '0.375rem'
                            }}
                          />
                        ) : (
                          <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                            No image selected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* URL Input as Alternative */}
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      color: '#374151'
                    }}>
                      Or Enter Image URL
                    </label>
                    <input
                      type="url"
                      name="image"
                      placeholder="https://example.com/image.jpg"
                      value={formData.image}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
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
