import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./simple-admin.css";

const AdminRoomUpdate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: "",
    roomType: "",
    price: "",
    status: "",
    description: "",
    capacity: "",
    image: "",
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

    fetchRooms();
  }, [navigate]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";
      const response = await axios.get(`${apiUrl}/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setFormData({
      roomNumber: room.roomNumber || "",
      roomType: room.roomType || "",
      price: room.price || "",
      status: room.status || "",
      description: room.description || "",
      capacity: room.capacity || "",
      image: room.image || "",
      imageUrl: "",
    });
    // Reset image upload states
    setSelectedFile(null);
    setImagePreview(null);
    setImageUploading(false);
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
    if (!selectedRoom) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        process.env.REACT_APP_API_BASE_URL ||
        "https://hrms-bace.vercel.app/api";

      await axios.put(`${apiUrl}/rooms/${selectedRoom._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Room updated successfully!");
      setSelectedRoom(null);
      setFormData({
        roomNumber: "",
        roomType: "",
        price: "",
        status: "",
        description: "",
        capacity: "",
        image: "",
        imageUrl: "",
      });
      setSelectedFile(null);
      setImagePreview(null);
      setImageUploading(false);
      fetchRooms();
    } catch (error) {
      console.error("Error updating room:", error);
      console.error("Error response:", error.response?.data);
      toast.error("Failed to update room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="simple-admin-container">
      <div className="simple-admin-header">
        <h1>Update Room</h1>
        <p>Select a room to update its details</p>
      </div>

      <div className="simple-admin-controls">
        <button
          onClick={fetchRooms}
          disabled={loading}
          className="simple-btn simple-btn-primary"
        >
          {loading ? "Loading..." : "Refresh Rooms"}
        </button>
      </div>

      <div className="responsive-two-column">
        {/* Room Selection */}
        <div className="simple-table-container">
          <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
            <h3 style={{ margin: 0, color: "#000000" }}>
              Select Room to Update
            </h3>
          </div>
          <div style={{ padding: "20px" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p style={{ color: "#000000" }}>Loading rooms...</p>
              </div>
            ) : rooms.length > 0 ? (
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {rooms.map((room) => (
                  <div
                    key={room._id}
                    onClick={() => handleSelectRoom(room)}
                    style={{
                      cursor: "pointer",
                      padding: "15px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      marginBottom: "10px",
                      backgroundColor:
                        selectedRoom?._id === room._id ? "#f0f9ff" : "#ffffff",
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
                          Room {room.roomNumber}
                        </h6>
                        <p
                          style={{
                            margin: "0 0 5px 0",
                            color: "#000000",
                            fontSize: "14px",
                          }}
                        >
                          {room.roomType}
                        </p>
                        <small style={{ color: "#059669" }}>
                          Rs.{" "}
                          {parseInt(room.price || 0).toLocaleString("en-PK")}
                          /night
                        </small>
                      </div>
                      <span
                        className={`simple-status simple-status-${room.status?.toLowerCase()}`}
                      >
                        {room.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p style={{ color: "#000000" }}>No rooms found</p>
                <small style={{ color: "#000000" }}>
                  Add some rooms first to update them
                </small>
              </div>
            )}
          </div>
        </div>

        {/* Update Form */}
        <div className="simple-table-container">
          <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
            <h3 style={{ margin: 0, color: "#000000" }}>Update Room Details</h3>
          </div>
          <div style={{ padding: "20px" }}>
            {selectedRoom ? (
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
                  <div></div>
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
                        Upload Room Image
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
                        Room Image Preview
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
                        {imagePreview || formData.imageUrl || formData.image ? (
                          <img
                            src={imagePreview || formData.imageUrl || formData.image}
                            alt="Room Preview"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'cover',
                              borderRadius: '0.375rem'
                            }}
                            onError={(e) => {
                              console.log("Image load error:", e.target.src);
                              e.target.style.display = 'none';
                            }}
                            key={`${formData.image || formData.imageUrl}-${Date.now()}`}
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
                      placeholder="https://example.com/room-image.jpg"
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
                    {loading ? "Updating..." : "Update Room"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRoom(null);
                      setFormData({
                        roomNumber: "",
                        roomType: "",
                        price: "",
                        status: "",
                        description: "",
                        capacity: "",
                        image: "",
                        imageUrl: "",
                      });
                      setSelectedFile(null);
                      setImagePreview(null);
                      setImageUploading(false);
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
                  Select a room from the list to update its details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRoomUpdate;
