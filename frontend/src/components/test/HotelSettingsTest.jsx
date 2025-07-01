import React from 'react';
import { useHotelSettings } from '../../contexts/HotelSettingsContext';
import { useHotelInfo, useContactInfo, useSocialMedia, useHotelStats } from '../../hooks/useHotelInfo';

/**
 * Test component to verify Hotel Settings Context is working
 * This component can be temporarily added to any page for testing
 */
const HotelSettingsTest = () => {
  const {
    settings,
    loading,
    error,
    isLoaded,
    adminMode,
    isOnline,
    lastUpdated
  } = useHotelSettings();

  const hotelInfo = useHotelInfo();
  const contactInfo = useContactInfo();
  const socialMedia = useSocialMedia();
  const stats = useHotelStats();

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        background: '#f0f8ff', 
        border: '2px solid #007bff',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <h3>🔄 Loading Hotel Settings...</h3>
        <p>Fetching hotel information from API...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        background: '#fff3cd', 
        border: '2px solid #ffc107',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <h3>⚠️ Hotel Settings Error</h3>
        <p><strong>Error:</strong> {error}</p>
        <p><strong>Fallback:</strong> Using default/cached settings</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      background: '#d4edda', 
      border: '2px solid #28a745',
      borderRadius: '8px',
      margin: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2>✅ Hotel Settings Context Test</h2>
      
      {/* Status Information */}
      <div style={{ marginBottom: '20px', padding: '10px', background: 'white', borderRadius: '4px' }}>
        <h3>📊 Context Status</h3>
        <ul>
          <li><strong>Loaded:</strong> {isLoaded ? '✅ Yes' : '❌ No'}</li>
          <li><strong>Admin Mode:</strong> {adminMode ? '👑 Yes' : '👤 No'}</li>
          <li><strong>Online:</strong> {isOnline ? '🌐 Yes' : '📴 No'}</li>
          <li><strong>Last Updated:</strong> {lastUpdated || 'Never'}</li>
          <li><strong>Settings Object:</strong> {settings ? '✅ Available' : '❌ Null'}</li>
        </ul>
      </div>

      {/* Basic Hotel Info */}
      <div style={{ marginBottom: '20px', padding: '10px', background: 'white', borderRadius: '4px' }}>
        <h3>🏨 Basic Hotel Information</h3>
        <ul>
          <li><strong>Hotel Name:</strong> {hotelInfo.hotelName}</li>
          <li><strong>Subtitle:</strong> {hotelInfo.hotelSubtitle}</li>
          <li><strong>Description:</strong> {hotelInfo.description}</li>
          <li><strong>Established:</strong> {hotelInfo.established}</li>
          <li><strong>Business Hours:</strong> {hotelInfo.businessHours}</li>
        </ul>
      </div>

      {/* Contact Information */}
      <div style={{ marginBottom: '20px', padding: '10px', background: 'white', borderRadius: '4px' }}>
        <h3>📞 Contact Information</h3>
        <ul>
          <li><strong>Address:</strong> {contactInfo.address}</li>
          <li><strong>Phone:</strong> {contactInfo.phone}</li>
          <li><strong>WhatsApp:</strong> {contactInfo.whatsapp}</li>
          <li><strong>Email:</strong> {contactInfo.email}</li>
          <li><strong>Website:</strong> {contactInfo.website}</li>
        </ul>
      </div>

      {/* Statistics */}
      <div style={{ marginBottom: '20px', padding: '10px', background: 'white', borderRadius: '4px' }}>
        <h3>📈 Hotel Statistics</h3>
        <ul>
          <li><strong>Total Rooms:</strong> {stats.totalRooms}</li>
          <li><strong>Total Staff:</strong> {stats.totalStaff}</li>
          <li><strong>Total Clients:</strong> {stats.totalClients}</li>
          <li><strong>Years of Service:</strong> {stats.yearsOfService}</li>
        </ul>
      </div>

      {/* Social Media */}
      <div style={{ marginBottom: '20px', padding: '10px', background: 'white', borderRadius: '4px' }}>
        <h3>📱 Social Media Links</h3>
        <ul>
          <li><strong>Facebook:</strong> {socialMedia.facebook}</li>
          <li><strong>Instagram:</strong> {socialMedia.instagram}</li>
          <li><strong>Twitter:</strong> {socialMedia.twitter}</li>
          <li><strong>LinkedIn:</strong> {socialMedia.linkedin}</li>
          <li><strong>YouTube:</strong> {socialMedia.youtube}</li>
        </ul>
      </div>

      {/* Hero Content */}
      <div style={{ marginBottom: '20px', padding: '10px', background: 'white', borderRadius: '4px' }}>
        <h3>🎯 Hero Content</h3>
        <ul>
          <li><strong>Main Title:</strong> {hotelInfo.heroTitle}</li>
          <li><strong>Subtitle:</strong> {hotelInfo.heroSubtitle}</li>
          <li><strong>Description:</strong> {hotelInfo.heroDescription}</li>
        </ul>
      </div>

      {/* Services */}
      <div style={{ marginBottom: '20px', padding: '10px', background: 'white', borderRadius: '4px' }}>
        <h3>🛎️ Services ({hotelInfo.services.length})</h3>
        {hotelInfo.services.length > 0 ? (
          <ul>
            {hotelInfo.services.slice(0, 3).map((service, index) => (
              <li key={index}>
                <strong>{service.name}:</strong> {service.description}
              </li>
            ))}
            {hotelInfo.services.length > 3 && (
              <li><em>... and {hotelInfo.services.length - 3} more services</em></li>
            )}
          </ul>
        ) : (
          <p>No services available</p>
        )}
      </div>

      {/* SEO Data */}
      <div style={{ marginBottom: '20px', padding: '10px', background: 'white', borderRadius: '4px' }}>
        <h3>🔍 SEO Information</h3>
        <ul>
          <li><strong>Meta Title:</strong> {hotelInfo.seo.title}</li>
          <li><strong>Meta Description:</strong> {hotelInfo.seo.description}</li>
          <li><strong>Keywords:</strong> {hotelInfo.seo.keywords}</li>
        </ul>
      </div>

      {/* Raw Data (for debugging) */}
      <details style={{ marginTop: '20px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
          🔧 Raw Settings Data (Click to expand)
        </summary>
        <pre style={{ 
          background: '#f8f9fa', 
          padding: '10px', 
          borderRadius: '4px', 
          overflow: 'auto',
          fontSize: '12px',
          marginTop: '10px'
        }}>
          {JSON.stringify(settings, null, 2)}
        </pre>
      </details>

      <div style={{ marginTop: '20px', padding: '10px', background: '#e7f3ff', borderRadius: '4px' }}>
        <p><strong>✅ Hotel Settings Context is working correctly!</strong></p>
        <p>You can now use <code>useHotelInfo()</code>, <code>useContactInfo()</code>, and other hooks throughout your application.</p>
      </div>
    </div>
  );
};

export default HotelSettingsTest;
