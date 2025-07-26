import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./simple-admin.css";

const AdminUpdateTable = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [formData, setFormData] = useState({
    tableName: "",
    tableType: "",
    capacity: "",
    status: "Available",
    location: "",
    description: "",
    imageUrl: "",
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

    fetchTables();
  }, [navigate]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";
      const response = await axios.get(`${apiUrl}/tables`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTables(response.data);
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast.error("Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTable = (table) => {
    setSelectedTable(table);
    setFormData({
      tableName: table.tableName || "",
      tableType: table.tableType || "",
      capacity: table.capacity || "",
      status: table.status || "Available",
      location: table.location || "",
      description: table.description || "",
      imageUrl: table.image || "",
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
          imageUrl: base64Image
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
      imageUrl: ''
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
    if (!selectedTable) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";

      await axios.put(`${apiUrl}/tables/${selectedTable._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Table updated successfully!");
      setSelectedTable(null);
      setFormData({
        tableName: "",
        tableType: "",
        capacity: "",
        status: "Available",
        location: "",
        description: "",
        imageUrl: "",
      });
      fetchTables();
    } catch (error) {
      console.error("Error updating table:", error);
      toast.error("Failed to update table");
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
        <h1>Update Table</h1>
        <p>Select a table to update its details</p>
      </div>

      <div className="responsive-two-column">
        {/* Table Selection */}
        <div className="simple-table-container">
          <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
            <h3 style={{ margin: 0, color: "#000000" }}>
              Select Table to Update
            </h3>
          </div>
          <div style={{ padding: "20px" }}>
            {tables.length > 0 ? (
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {tables.map((table) => (
                  <div
                    key={table._id}
                    onClick={() => handleSelectTable(table)}
                    style={{
                      cursor: "pointer",
                      padding: "15px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      marginBottom: "10px",
                      backgroundColor:
                        selectedTable?._id === table._id
                          ? "#f0f9ff"
                          : "#ffffff",
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
                          {table.tableName}
                        </h6>
                        <p
                          style={{
                            margin: "0 0 5px 0",
                            color: "#000000",
                            fontSize: "14px",
                          }}
                        >
                          {table.tableType}
                        </p>
                        <small style={{ color: "#059669" }}>
                          Capacity: {table.capacity} people
                        </small>
                      </div>
                      <span
                        className={`simple-status simple-status-${table.status?.toLowerCase()}`}
                      >
                        {table.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p style={{ color: "#000000" }}>No tables found</p>
                <small style={{ color: "#000000" }}>
                  Add some tables first to update them
                </small>
              </div>
            )}
          </div>
        </div>

        {/* Update Form */}
        <div className="simple-table-container">
          <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
            <h3 style={{ margin: 0, color: "#000000" }}>
              Update Table Details
            </h3>
          </div>
          <div style={{ padding: "20px" }}>
            {selectedTable ? (
              <form onSubmit={handleSubmit} className="simple-form">
                <div className="simple-form-row">
                  <input
                    type="text"
                    name="tableName"
                    placeholder="Table Name"
                    value={formData.tableName}
                    onChange={handleInputChange}
                    required
                  />
                  <select
                    name="tableType"
                    value={formData.tableType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Table Type</option>
                    <option value="indoor">Indoor</option>
                    <option value="outdoor">Outdoor</option>
                    <option value="private">Private</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="VIP">VIP</option>
                    <option value="Booth">Booth</option>
                    <option value="Counter">Counter</option>
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
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Available">Available</option>
                    <option value="Booked">Booked</option>
                    <option value="Reserved">Reserved</option>
                  </select>
                </div>

                <div className="simple-form-row">
                  <input
                    type="text"
                    name="location"
                    placeholder="Location (e.g., Main Hall, Terrace, etc.)"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                  <div></div>
                </div>

                <textarea
                  name="description"
                  placeholder="Table Description (optional)"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                />

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
                        Upload Table Image
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
                        Table Image Preview
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
                        {imagePreview || formData.imageUrl ? (
                          <img
                            src={imagePreview || formData.imageUrl}
                            alt="Table Preview"
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
                      name="imageUrl"
                      placeholder="https://example.com/table-image.jpg"
                      value={formData.imageUrl}
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

                <div className="simple-form-actions">
                  <button
                    type="submit"
                    className="simple-btn simple-btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Table"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTable(null);
                      setFormData({
                        tableName: "",
                        tableType: "",
                        capacity: "",
                        status: "Available",
                        location: "",
                        description: "",
                        imageUrl: "",
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
                  Select a table from the list to update its details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUpdateTable;
