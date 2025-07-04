import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import "./simple-admin.css";

const HotelBrandingSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    hotelName: 'HRMS Hotel',
    hotelSubtitle: 'Luxury & Comfort',
    primaryPhone: '+92-300-1234567',
    whatsappNumber: '+92-300-1234567',
    primaryEmail: 'info@hrmshotel.com',
    address: '123 Main Street, Karachi, Pakistan',
    website: 'www.hrmshotel.com',
    description: 'A premium hotel offering luxury accommodation and excellent service.'
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }
  }, [navigate]);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    // Basic validation
    if (!settings.hotelName.trim()) {
      toast.error('Hotel name is required');
      return;
    }

    if (!settings.primaryPhone.trim()) {
      toast.error('Primary phone number is required');
      return;
    }

    if (!settings.primaryEmail.trim()) {
      toast.error('Primary email is required');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Hotel settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="simple-admin-container"><p>Loading...</p></div>;

  return (
    <div className="simple-admin-container">
      <div className="simple-admin-header">
        <h1>Hotel Settings</h1>
        <p>Manage your hotel's basic information and contact details</p>
      </div>

      <div className="simple-admin-controls">
        <button 
          onClick={handleSave}
          disabled={loading}
          className="simple-btn simple-btn-primary"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="simple-table-container">
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: 0, color: '#000000' }}>Basic Hotel Information</h3>
        </div>
        <div style={{ padding: '20px' }}>
          <form className="simple-form">
            <div className="simple-form-row">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '5px', color: '#000000', fontWeight: 'bold' }}>
                  Hotel Name *
                </label>
                <input
                  type="text"
                  value={settings.hotelName}
                  onChange={(e) => handleInputChange('hotelName', e.target.value)}
                  placeholder="Enter hotel name"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '5px', color: '#000000', fontWeight: 'bold' }}>
                  Hotel Subtitle
                </label>
                <input
                  type="text"
                  value={settings.hotelSubtitle}
                  onChange={(e) => handleInputChange('hotelSubtitle', e.target.value)}
                  placeholder="Enter hotel subtitle"
                />
              </div>
            </div>

            <div className="simple-form-row">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '5px', color: '#000000', fontWeight: 'bold' }}>
                  Primary Phone *
                </label>
                <input
                  type="tel"
                  value={settings.primaryPhone}
                  onChange={(e) => handleInputChange('primaryPhone', e.target.value)}
                  placeholder="Enter primary phone number"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '5px', color: '#000000', fontWeight: 'bold' }}>
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={settings.whatsappNumber}
                  onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                  placeholder="Enter WhatsApp number"
                />
              </div>
            </div>

            <div className="simple-form-row">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '5px', color: '#000000', fontWeight: 'bold' }}>
                  Primary Email *
                </label>
                <input
                  type="email"
                  value={settings.primaryEmail}
                  onChange={(e) => handleInputChange('primaryEmail', e.target.value)}
                  placeholder="Enter primary email"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '5px', color: '#000000', fontWeight: 'bold' }}>
                  Website
                </label>
                <input
                  type="url"
                  value={settings.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="Enter website URL"
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '20px' }}>
              <label style={{ marginBottom: '5px', color: '#000000', fontWeight: 'bold' }}>
                Hotel Address
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter complete hotel address"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ marginBottom: '5px', color: '#000000', fontWeight: 'bold' }}>
                Hotel Description
              </label>
              <textarea
                value={settings.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter hotel description"
                rows="4"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Current Settings Summary */}
      <div className="simple-table-container" style={{ marginTop: '30px' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: 0, color: '#000000' }}>Current Settings Summary</h3>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div>
              <h4 style={{ color: '#000000', margin: '0 0 10px 0' }}>Hotel Information</h4>
              <p style={{ color: '#000000', margin: '5px 0' }}><strong>Name:</strong> {settings.hotelName}</p>
              <p style={{ color: '#000000', margin: '5px 0' }}><strong>Subtitle:</strong> {settings.hotelSubtitle}</p>
              <p style={{ color: '#000000', margin: '5px 0' }}><strong>Website:</strong> {settings.website}</p>
            </div>
            
            <div>
              <h4 style={{ color: '#000000', margin: '0 0 10px 0' }}>Contact Information</h4>
              <p style={{ color: '#000000', margin: '5px 0' }}><strong>Phone:</strong> {settings.primaryPhone}</p>
              <p style={{ color: '#000000', margin: '5px 0' }}><strong>WhatsApp:</strong> {settings.whatsappNumber}</p>
              <p style={{ color: '#000000', margin: '5px 0' }}><strong>Email:</strong> {settings.primaryEmail}</p>
            </div>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ color: '#000000', margin: '0 0 10px 0' }}>Address</h4>
            <p style={{ color: '#000000', margin: '5px 0' }}>{settings.address}</p>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ color: '#000000', margin: '0 0 10px 0' }}>Description</h4>
            <p style={{ color: '#000000', margin: '5px 0', lineHeight: '1.6' }}>{settings.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelBrandingSettings;
