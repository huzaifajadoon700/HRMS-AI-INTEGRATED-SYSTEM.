import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiSettings, FiSave, FiRefreshCw, FiGlobe, FiMail, FiPhone,
  FiMapPin, FiUsers, FiStar, FiEdit, FiEye, FiCheck, FiX,
  FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiYoutube,
  FiClock, FiCalendar, FiHome, FiInfo, FiImage, FiType
} from 'react-icons/fi';
import { useHotelSettings } from '../../contexts/HotelSettingsContext';
import './HotelBrandingSettings.css';

const HotelBrandingSettings = () => {
  const navigate = useNavigate();
  const {
    settings,
    loading,
    error,
    adminMode,
    updateSettings,
    updateSection,
    resetSettings,
    loadSettings
  } = useHotelSettings();

  const [localSettings, setLocalSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }

    // Load settings if not already loaded
    if (!settings) {
      loadSettings(true);
    }
  }, [navigate, settings, loadSettings]);

  // Initialize local settings when hotel settings are loaded
  useEffect(() => {
    if (settings && !localSettings) {
      const initialSettings = JSON.parse(JSON.stringify(settings));

      // Ensure all contact fields exist with default values
      if (!initialSettings.contact) {
        initialSettings.contact = {};
      }
      if (!initialSettings.contact.phone) {
        initialSettings.contact.phone = {};
      }
      if (!initialSettings.contact.email) {
        initialSettings.contact.email = {};
      }
      if (!initialSettings.contact.address) {
        initialSettings.contact.address = {};
      }

      // Set default values for optional fields if they don't exist
      if (!initialSettings.contact.phone.secondary) {
        initialSettings.contact.phone.secondary = '';
      }
      if (!initialSettings.contact.email.support) {
        initialSettings.contact.email.support = '';
      }
      if (!initialSettings.contact.email.reservations) {
        initialSettings.contact.email.reservations = '';
      }
      if (!initialSettings.contact.website) {
        initialSettings.contact.website = '';
      }

      setLocalSettings(initialSettings);
    }
  }, [settings, localSettings]);

  // Handle input changes
  const handleChange = (section, field, value) => {
    if (!localSettings) return;

    const updatedSettings = { ...localSettings };

    if (section) {
      if (!updatedSettings[section]) {
        updatedSettings[section] = {};
      }

      // Handle nested objects
      if (field.includes('.')) {
        const [parentField, childField] = field.split('.');
        if (!updatedSettings[section][parentField]) {
          updatedSettings[section][parentField] = {};
        }
        updatedSettings[section][parentField][childField] = value;

        // Auto-generate full address when address components change
        if (section === 'contact' && parentField === 'address' &&
            ['street', 'city', 'country'].includes(childField)) {
          const address = updatedSettings.contact.address;
          const fullAddress = [
            address.street,
            address.city,
            address.country
          ].filter(Boolean).join(', ');

          if (!updatedSettings.contact.address) {
            updatedSettings.contact.address = {};
          }
          updatedSettings.contact.address.fullAddress = fullAddress;
        }
      } else {
        updatedSettings[section][field] = value;
      }
    } else {
      updatedSettings[field] = value;
    }

    setLocalSettings(updatedSettings);
    setHasChanges(true);
  };

  // Save all settings
  const handleSave = async () => {
    if (!localSettings || !adminMode) {
      toast.error('Admin access required');
      return;
    }

    // Basic validation
    if (!localSettings.hotelName?.trim()) {
      toast.error('Hotel name is required');
      return;
    }

    // Contact validation
    if (!localSettings.contact?.phone?.primary?.trim()) {
      toast.error('Primary phone number is required');
      return;
    }

    if (!localSettings.contact?.phone?.whatsapp?.trim()) {
      toast.error('WhatsApp number is required');
      return;
    }

    if (!localSettings.contact?.email?.primary?.trim()) {
      toast.error('Primary email is required');
      return;
    }

    if (!localSettings.contact?.address?.street?.trim()) {
      toast.error('Street address is required');
      return;
    }

    if (!localSettings.contact?.address?.city?.trim()) {
      toast.error('City is required');
      return;
    }

    if (!localSettings.contact?.address?.country?.trim()) {
      toast.error('Country is required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(localSettings.contact.email.primary)) {
      toast.error('Please enter a valid primary email address');
      return;
    }

    if (localSettings.contact.email.support && !emailRegex.test(localSettings.contact.email.support)) {
      toast.error('Please enter a valid support email address');
      return;
    }

    if (localSettings.contact.email.reservations && !emailRegex.test(localSettings.contact.email.reservations)) {
      toast.error('Please enter a valid reservations email address');
      return;
    }

    // Phone validation (basic)
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(localSettings.contact.phone.primary)) {
      toast.error('Please enter a valid primary phone number');
      return;
    }

    if (!phoneRegex.test(localSettings.contact.phone.whatsapp)) {
      toast.error('Please enter a valid WhatsApp number');
      return;
    }

    if (localSettings.contact.phone.secondary && !phoneRegex.test(localSettings.contact.phone.secondary)) {
      toast.error('Please enter a valid secondary phone number');
      return;
    }

    setSaving(true);
    try {
      const result = await updateSettings(localSettings);
      
      if (result.success) {
        toast.success('Hotel settings saved successfully!');
        setHasChanges(false);
        // Force reload settings to ensure all components get updated data
        await loadSettings(true);
      } else {
        toast.error(result.error || 'Failed to save settings');
      }
    } catch (error) {
      toast.error('Error saving settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Save specific section
  const saveSection = async (sectionName) => {
    if (!localSettings || !adminMode) {
      toast.error('Admin access required');
      return;
    }

    setSaving(true);
    try {
      let sectionData = {};

      switch (sectionName) {
        case 'contact':
          // Validate contact fields before saving
          if (!localSettings.contact?.phone?.primary?.trim()) {
            toast.error('Primary phone number is required');
            setSaving(false);
            return;
          }
          if (!localSettings.contact?.email?.primary?.trim()) {
            toast.error('Primary email is required');
            setSaving(false);
            return;
          }
          // Send contact data directly, not wrapped in contact object
          // Ensure all optional fields are included even if empty
          sectionData = {
            address: localSettings.contact.address || {},
            phone: {
              primary: localSettings.contact.phone?.primary || '',
              whatsapp: localSettings.contact.phone?.whatsapp || '',
              secondary: localSettings.contact.phone?.secondary || ''
            },
            email: {
              primary: localSettings.contact.email?.primary || '',
              support: localSettings.contact.email?.support || '',
              reservations: localSettings.contact.email?.reservations || ''
            },
            website: localSettings.contact.website || ''
          };
          break;
        case 'basic':
          sectionData = {
            hotelName: localSettings.hotelName,
            hotelSubtitle: localSettings.hotelSubtitle,
            description: localSettings.description
          };
          break;
        case 'branding':
          sectionData = { branding: localSettings.branding };
          break;
        case 'social':
          sectionData = { socialMedia: localSettings.socialMedia };
          break;
        case 'business':
          sectionData = {
            business: localSettings.business,
            statistics: localSettings.statistics
          };
          break;
        case 'content':
          sectionData = {
            heroContent: localSettings.heroContent,
            seo: localSettings.seo
          };
          break;
        default:
          toast.error('Invalid section');
          setSaving(false);
          return;
      }

      const result = await updateSection(sectionName, sectionData);

      if (result.success) {
        toast.success(`${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)} settings saved successfully!`);
        setHasChanges(false);
      } else {
        toast.error(result.error || `Failed to save ${sectionName} settings`);
      }
    } catch (error) {
      toast.error(`Error saving ${sectionName} settings: ` + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !localSettings) {
    return (
      <div className="enhanced-admin-settings-module-container">
        <div className="enhanced-settings-header">
          <div className="header-content">
            <div className="title-section">
              <div className="title-wrapper">
                <div className="title-icon">
                  <FiSettings />
                </div>
                <div className="title-text">
                  <h1 className="page-title">Loading Hotel Settings...</h1>
                  <p className="page-subtitle">Please wait while we load your hotel information</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-admin-settings-module-container">
      <div className="enhanced-settings-header">
        <div className="header-content">
          <div className="title-section">
            <div className="title-wrapper">
              <div className="title-icon">
                <FiSettings />
              </div>
              <div className="title-text">
                <h1 className="page-title">Hotel Branding Settings</h1>
                <p className="page-subtitle">Manage your hotel's branding, contact information, and content</p>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button
              className={`enhanced-btn enhanced-btn-primary ${hasChanges ? 'pulse' : ''}`}
              onClick={handleSave}
              disabled={saving || !hasChanges}
              title="Save all changes"
            >
              {saving ? <FiRefreshCw className="spinning" /> : <FiSave />}
              {saving ? 'Saving...' : 'Save All'}
            </button>
          </div>
        </div>
        {hasChanges && (
          <div className="changes-indicator">
            <FiInfo />
            You have unsaved changes. Don't forget to save!
          </div>
        )}
      </div>

      <div className="enhanced-settings-content">
        <div className="settings-nav">
          <div className="nav-header">
            <h3>Settings Categories</h3>
          </div>
          <div className="nav-items">
                <button
                  className={`nav-item ${activeTab === 'basic' ? 'active' : ''}`}
                  onClick={() => setActiveTab('basic')}
                >
                  <FiHome className="nav-icon" />
                  <span>Basic Info</span>
                </button>
                <button
                  className={`nav-item ${activeTab === 'branding' ? 'active' : ''}`}
                  onClick={() => setActiveTab('branding')}
                >
                  <FiImage className="nav-icon" />
                  <span>Branding</span>
                </button>
                <button
                  className={`nav-item ${activeTab === 'contact' ? 'active' : ''}`}
                  onClick={() => setActiveTab('contact')}
                >
                  <FiPhone className="nav-icon" />
                  <span>Contact</span>
                </button>
              </div>
            </div>

            <div className="settings-content">
              {activeTab === 'branding' && (
                <div className="settings-section">
                  <div className="section-header">
                    <h2>Logo & Branding</h2>
                    <p>Manage your hotel's visual identity and branding assets</p>
                  </div>
                  <div className="settings-grid">
                    <div className="setting-group">
                      <label className="setting-label">
                        <FiImage className="label-icon" />
                        Primary Logo URL
                      </label>
                      <input
                        type="url"
                        className="enhanced-input"
                        value={localSettings.branding?.logo?.primary || ''}
                        onChange={(e) => handleChange('branding', 'logo.primary', e.target.value)}
                        placeholder="Enter primary logo URL"
                      />
                      <small className="input-help">Main logo displayed in header and navigation</small>
                    </div>
                    <div className="setting-group">
                      <label className="setting-label">
                        <FiImage className="label-icon" />
                        Login Logo URL
                      </label>
                      <input
                        type="url"
                        className="enhanced-input"
                        value={localSettings.branding?.logo?.loginLogo || ''}
                        onChange={(e) => handleChange('branding', 'logo.loginLogo', e.target.value)}
                        placeholder="Enter login page logo URL"
                      />
                      <small className="input-help">Logo displayed on login and authentication pages</small>
                    </div>
                    <div className="setting-group">
                      <label className="setting-label">
                        <FiImage className="label-icon" />
                        Secondary Logo URL
                      </label>
                      <input
                        type="url"
                        className="enhanced-input"
                        value={localSettings.branding?.logo?.secondary || ''}
                        onChange={(e) => handleChange('branding', 'logo.secondary', e.target.value)}
                        placeholder="Enter secondary logo URL"
                      />
                      <small className="input-help">Alternative logo for different contexts</small>
                    </div>
                    <div className="setting-group">
                      <label className="setting-label">
                        <FiImage className="label-icon" />
                        Favicon URL
                      </label>
                      <input
                        type="url"
                        className="enhanced-input"
                        value={localSettings.branding?.logo?.favicon || ''}
                        onChange={(e) => handleChange('branding', 'logo.favicon', e.target.value)}
                        placeholder="Enter favicon URL"
                      />
                      <small className="input-help">Small icon displayed in browser tabs</small>
                    </div>
                    <div className="setting-group">
                      <label className="setting-label">
                        <FiType className="label-icon" />
                        Primary Color
                      </label>
                      <input
                        type="color"
                        className="enhanced-input"
                        value={localSettings.branding?.colors?.primary || '#64ffda'}
                        onChange={(e) => handleChange('branding', 'colors.primary', e.target.value)}
                      />
                      <small className="input-help">Main brand color used throughout the application</small>
                    </div>
                    <div className="setting-group">
                      <label className="setting-label">
                        <FiType className="label-icon" />
                        Secondary Color
                      </label>
                      <input
                        type="color"
                        className="enhanced-input"
                        value={localSettings.branding?.colors?.secondary || '#0A192F'}
                        onChange={(e) => handleChange('branding', 'colors.secondary', e.target.value)}
                      />
                      <small className="input-help">Secondary brand color for backgrounds and accents</small>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'basic' && (
                <div className="settings-section">
                  <div className="section-header">
                    <h2>Basic Hotel Information</h2>
                    <p>Configure your hotel's basic details and branding</p>
                  </div>
                  <div className="settings-grid">
                    <div className="setting-group">
                      <label className="setting-label">
                        <FiHome className="label-icon" />
                        Hotel Name *
                      </label>
                      <input
                        type="text"
                        className="enhanced-input"
                        value={localSettings.hotelName || ''}
                        onChange={(e) => handleChange(null, 'hotelName', e.target.value)}
                        placeholder="Enter hotel name"
                        required
                      />
                    </div>
                    <div className="setting-group">
                      <label className="setting-label">
                        <FiType className="label-icon" />
                        Hotel Subtitle
                      </label>
                      <input
                        type="text"
                        className="enhanced-input"
                        value={localSettings.hotelSubtitle || ''}
                        onChange={(e) => handleChange(null, 'hotelSubtitle', e.target.value)}
                        placeholder="Enter hotel subtitle"
                      />
                    </div>
                    <div className="setting-group full-width">
                      <label className="setting-label">
                        <FiInfo className="label-icon" />
                        Hotel Description
                      </label>
                      <textarea
                        className="enhanced-textarea"
                        value={localSettings.description || ''}
                        onChange={(e) => handleChange(null, 'description', e.target.value)}
                        placeholder="Enter hotel description"
                        style={{
                          minHeight: '120px',
                          height: 'auto',
                          resize: 'vertical',
                          display: 'block',
                          width: '100%',
                          maxWidth: '800px',
                          margin: '0 auto'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'contact' && (
                <div className="settings-section">
                  <div className="section-header">
                    <h2>Contact Information</h2>
                    <p>Manage your hotel's contact details and address</p>
                  </div>
                  <div className="settings-grid">
                    {/* Phone Numbers */}
                    <div className="setting-group">
                      <label className="setting-label">
                        <FiPhone className="label-icon" />
                        Primary Phone *
                      </label>
                      <input
                        type="tel"
                        className="enhanced-input"
                        value={localSettings.contact?.phone?.primary || ''}
                        onChange={(e) => handleChange('contact', 'phone.primary', e.target.value)}
                        placeholder="Enter primary phone"
                        required
                      />
                    </div>
                    <div className="setting-group">
                      <label className="setting-label">
                        <FiPhone className="label-icon" />
                        WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        className="enhanced-input"
                        value={localSettings.contact?.phone?.whatsapp || ''}
                        onChange={(e) => handleChange('contact', 'phone.whatsapp', e.target.value)}
                        placeholder="Enter WhatsApp number"
                        required
                      />
                    </div>
                    <div className="setting-group">
                      <label className="setting-label">
                        <FiPhone className="label-icon" />
                        Secondary Phone
                      </label>
                      <input
                        type="tel"
                        className="enhanced-input"
                        value={localSettings.contact?.phone?.secondary || ''}
                        onChange={(e) => handleChange('contact', 'phone.secondary', e.target.value)}
                        placeholder="Enter secondary phone"
                      />
                    </div>

                    {/* Email Addresses */}
                    <div className="setting-group">
                      <label className="setting-label">
                        <FiMail className="label-icon" />
                        Primary Email *
                      </label>
                      <input
                        type="email"
                        className="enhanced-input"
                        value={localSettings.contact?.email?.primary || ''}
                        onChange={(e) => handleChange('contact', 'email.primary', e.target.value)}
                        placeholder="Enter primary email"
                        required
                      />
                    </div>
                    <div className="setting-group">
                      <label className="setting-label">
                        <FiMail className="label-icon" />
                        Support Email
                      </label>
                      <input
                        type="email"
                        className="enhanced-input"
                        value={localSettings.contact?.email?.support || ''}
                        onChange={(e) => handleChange('contact', 'email.support', e.target.value)}
                        placeholder="Enter support email"
                      />
                    </div>
                    <div className="setting-group">
                      <label className="setting-label">
                        <FiMail className="label-icon" />
                        Reservations Email
                      </label>
                      <input
                        type="email"
                        className="enhanced-input"
                        value={localSettings.contact?.email?.reservations || ''}
                        onChange={(e) => handleChange('contact', 'email.reservations', e.target.value)}
                        placeholder="Enter reservations email"
                      />
                    </div>

                    {/* Address Information */}
                    <div className="setting-group full-width">
                      <label className="setting-label">
                        <FiMapPin className="label-icon" />
                        Street Address *
                      </label>
                      <input
                        type="text"
                        className="enhanced-input"
                        value={localSettings.contact?.address?.street || ''}
                        onChange={(e) => handleChange('contact', 'address.street', e.target.value)}
                        placeholder="Enter street address"
                        required
                        style={{
                          width: '100%',
                          maxWidth: '800px',
                          margin: '0 auto'
                        }}
                      />
                    </div>
                    <div className="setting-group">
                      <label className="setting-label">
                        <FiMapPin className="label-icon" />
                        City *
                      </label>
                      <input
                        type="text"
                        className="enhanced-input"
                        value={localSettings.contact?.address?.city || ''}
                        onChange={(e) => handleChange('contact', 'address.city', e.target.value)}
                        placeholder="Enter city"
                        required
                      />
                    </div>
                    <div className="setting-group">
                      <label className="setting-label">
                        <FiMapPin className="label-icon" />
                        Country *
                      </label>
                      <input
                        type="text"
                        className="enhanced-input"
                        value={localSettings.contact?.address?.country || ''}
                        onChange={(e) => handleChange('contact', 'address.country', e.target.value)}
                        placeholder="Enter country"
                        required
                      />
                    </div>
                    <div className="setting-group full-width">
                      <label className="setting-label">
                        <FiMapPin className="label-icon" />
                        Full Address (Auto-generated)
                      </label>
                      <input
                        type="text"
                        className="enhanced-input"
                        value={`${localSettings.contact?.address?.street || ''}, ${localSettings.contact?.address?.city || ''}, ${localSettings.contact?.address?.country || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',')}
                        onChange={(e) => handleChange('contact', 'address.fullAddress', e.target.value)}
                        placeholder="Full address will be auto-generated"
                        readOnly
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          width: '100%',
                          maxWidth: '800px',
                          margin: '0 auto'
                        }}
                      />
                    </div>

                    {/* Website */}
                    <div className="setting-group full-width">
                      <label className="setting-label">
                        <FiGlobe className="label-icon" />
                        Website URL
                      </label>
                      <input
                        type="url"
                        className="enhanced-input"
                        value={localSettings.contact?.website || ''}
                        onChange={(e) => handleChange('contact', 'website', e.target.value)}
                        placeholder="Enter website URL"
                        style={{
                          width: '100%',
                          maxWidth: '800px',
                          margin: '0 auto'
                        }}
                      />
                    </div>
                  </div>

                  {/* Contact Section Save Button */}
                  <div className="section-actions" style={{
                    marginTop: '2rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '1rem'
                  }}>
                    <button
                      className="enhanced-btn enhanced-btn-secondary"
                      onClick={() => {
                        setLocalSettings(JSON.parse(JSON.stringify(settings)));
                        setHasChanges(false);
                        toast.info('Contact settings reset to saved values');
                      }}
                      disabled={saving || !hasChanges}
                    >
                      <FiRefreshCw />
                      Reset
                    </button>
                    <button
                      className={`enhanced-btn enhanced-btn-primary ${hasChanges ? 'pulse' : ''}`}
                      onClick={() => saveSection('contact')}
                      disabled={saving || !hasChanges}
                    >
                      {saving ? <FiRefreshCw className="spinning" /> : <FiSave />}
                      {saving ? 'Saving...' : 'Save Contact Info'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      
      
    
  );
};

export default HotelBrandingSettings;
