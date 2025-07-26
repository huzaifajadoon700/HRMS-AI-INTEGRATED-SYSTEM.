import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./simple-admin.css";

const AdminAddMenu = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
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
    <>
      {/* Mobile Responsive CSS */}
      <style>
        {`
          @media (max-width: 768px) {
            .admin-image-upload-container {
              flex-direction: column !important;
              gap: 1rem !important;
            }

            .admin-image-upload-section {
              flex: none !important;
              min-width: auto !important;
              width: 100% !important;
            }

            .admin-image-upload-buttons {
              flex-direction: column !important;
              gap: 0.5rem !important;
            }

            .admin-image-upload-buttons button {
              width: 100% !important;
            }

            .admin-image-preview {
              max-width: 100% !important;
              text-align: center !important;
            }
          }

          @media (max-width: 480px) {
            .simple-form-section h3 {
              font-size: 1rem !important;
              margin-bottom: 0.75rem !important;
            }

            .admin-image-upload-section label {
              font-size: 0.8rem !important;
            }

            .admin-image-upload-section input {
              padding: 0.5rem !important;
              font-size: 0.875rem !important;
            }
          }
        `}
      </style>

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

          {/* Image Upload Section */}
          <div className="simple-form-section">
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#374151' }}>
              Menu Item Image
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <div className="admin-image-upload-container" style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1rem',
                flexWrap: 'wrap'
              }}>
                {/* File Upload */}
                <div className="admin-image-upload-section" style={{ flex: '1', minWidth: '250px' }}>
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
                    <div className="admin-image-upload-buttons" style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
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

                {/* OR Divider */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 1rem',
                  color: '#6b7280',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  OR
                </div>

                {/* URL Input */}
                <div className="admin-image-upload-section" style={{ flex: '1', minWidth: '250px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="image"
                    placeholder="https://example.com/food.jpg"
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

              {/* Image Preview */}
              {(imagePreview || formData.image) && (
                <div className="admin-image-preview" style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  backgroundColor: '#f9fafb'
                }}>
                  <h4 style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '0.9rem',
                    color: '#374151'
                  }}>
                    Image Preview
                  </h4>
                  <img
                    src={imagePreview || formData.image}
                    alt="Menu item preview"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '150px',
                      objectFit: 'cover',
                      borderRadius: '0.375rem',
                      border: '1px solid #d1d5db'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div style={{
                    display: 'none',
                    color: '#ef4444',
                    fontSize: '0.875rem',
                    marginTop: '0.5rem'
                  }}>
                    Failed to load image
                  </div>
                </div>
              )}
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
    </>
  );
};

export default AdminAddMenu;
