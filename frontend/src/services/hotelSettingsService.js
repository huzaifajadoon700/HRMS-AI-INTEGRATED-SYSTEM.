import axios from 'axios';
import { apiConfig } from '../config/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: apiConfig.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests for admin operations
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Hotel Settings API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Hotel Settings Service
 * Handles all API calls related to hotel settings management
 */
class HotelSettingsService {
  
  /**
   * Get public hotel settings (no authentication required)
   * Used by frontend components to display hotel information
   */
  async getPublicSettings() {
    try {
      const response = await axios.get(apiConfig.endpoints.hotelSettingsPublic);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching public hotel settings:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch hotel settings',
        data: this.getDefaultSettings() // Fallback to defaults
      };
    }
  }

  /**
   * Get full hotel settings (admin only)
   * Used by admin interface for management
   */
  async getAdminSettings() {
    try {
      const response = await api.get('/hotel-settings');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching admin hotel settings:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch admin settings'
      };
    }
  }

  /**
   * Update hotel settings (admin only)
   */
  async updateSettings(settingsData) {
    try {
      // Clear cache before updating to ensure fresh data
      this.clearCache();

      const response = await api.put('/hotel-settings', settingsData);

      // Cache the new settings
      if (response.data.data) {
        this.cacheSettings(response.data.data);
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error updating hotel settings:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update settings'
      };
    }
  }

  /**
   * Update specific section of hotel settings
   */
  async updateSection(section, sectionData) {
    try {
      console.log(`Updating section ${section} with data:`, sectionData);

      // For the hotel settings, we need to use the main update endpoint instead of section-specific
      // because the model structure doesn't match the section-based approach

      console.log('Transforming data for direct model update');

      // Clear cache before updating to ensure fresh data
      this.clearCache();

      // Get current settings first
      const currentResponse = await api.get('/hotel-settings');
      const currentSettings = currentResponse.data.data || {};

      // Merge the section data with current settings
      let updatedSettings = { ...currentSettings };

      if (section === 'basic') {
        // Update basic fields directly at root level
        updatedSettings.hotelName = sectionData.hotelName;
        updatedSettings.hotelSubtitle = sectionData.hotelSubtitle;
        updatedSettings.description = sectionData.description;
      } else if (section === 'contact') {
        // Update contact section
        updatedSettings.contact = {
          ...updatedSettings.contact,
          ...sectionData
        };
      } else if (section === 'branding') {
        // Update branding fields
        if (sectionData.logoUrls) {
          updatedSettings.logoUrls = { ...updatedSettings.logoUrls, ...sectionData.logoUrls };
        }
        if (sectionData.colors) {
          updatedSettings.colors = { ...updatedSettings.colors, ...sectionData.colors };
        }
        if (sectionData.fonts) {
          updatedSettings.fonts = { ...updatedSettings.fonts, ...sectionData.fonts };
        }
      }

      console.log('Updated settings to send:', updatedSettings);

      const response = await api.put('/hotel-settings', updatedSettings);
      console.log(`Section ${section} update response:`, response.data);

      // Cache the updated settings
      if (response.data.data) {
        this.cacheSettings(response.data.data);
        console.log('Settings cached successfully');
      }

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error(`Error updating ${section} section:`, error);
      console.error('Error details:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || `Failed to update ${section} section`
      };
    }
  }

  /**
   * Reset hotel settings to defaults (admin only)
   */
  async resetSettings() {
    try {
      const response = await api.post('/hotel-settings/reset');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error resetting hotel settings:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to reset settings'
      };
    }
  }

  /**
   * Get settings metadata (admin only)
   */
  async getMetadata() {
    try {
      const response = await api.get('/hotel-settings/metadata');
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('Error fetching settings metadata:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch metadata'
      };
    }
  }

  /**
   * Get default settings for fallback
   * Used when API is unavailable
   */
  getDefaultSettings() {
    return {
      hotelName: 'Hotel Royal',
      hotelSubtitle: 'Luxury & Comfort Experience',
      description: 'Experience luxury and comfort with our world-class hospitality services.',
      branding: {
        logo: {
          primary: '/images/logo-primary.png', // Main logo
          secondary: '/images/logo-secondary.png', // Alternative logo
          favicon: '/images/favicon.ico', // Favicon
          loginLogo: '/images/logo-login.png' // Login page logo
        },
        colors: {
          primary: '#64ffda',
          secondary: '#0A192F',
          accent: '#ffffff'
        },
        fonts: {
          primary: 'Inter',
          secondary: 'Roboto'
        }
      },
      contact: {
        address: {
          street: '123 Luxury Street',
          city: 'Lahore',
          country: 'Pakistan',
          fullAddress: '123 Luxury Street, Lahore, Pakistan'
        },
        phone: {
          primary: '+92 336 945 769',
          secondary: '+92 123 456 7890',
          whatsapp: '+92 336 945 769'
        },
        email: {
          primary: 'info@hotelroyal.com',
          support: 'support@hotelroyal.com',
          reservations: 'reservations@hotelroyal.com'
        },
        website: 'https://hotelroyal.com'
      },
      socialMedia: {
        facebook: 'https://facebook.com/hotelroyal',
        twitter: 'https://twitter.com/hotelroyal',
        instagram: 'https://instagram.com/hotelroyal',
        linkedin: 'https://linkedin.com/company/hotelroyal',
        youtube: 'https://youtube.com/hotelroyal'
      },
      business: {
        hours: '24/7 Available',
        established: '2020',
        license: 'HL-2024-001'
      },
      statistics: {
        totalRooms: 150,
        totalStaff: 85,
        totalClients: 2500,
        yearsOfService: 5
      },
      heroContent: {
        mainTitle: 'Luxury Hotel Experience',
        subtitle: 'WELCOME TO LUXURY',
        description: 'Premium accommodations with world-class hospitality'
      },
      services: [
        {
          name: 'Fine Dining',
          description: 'Experience exquisite cuisine prepared by world-class chefs',
          icon: 'FaUtensils'
        },
        {
          name: 'Luxury Rooms',
          description: 'Comfortable and elegant accommodations',
          icon: 'FaHotel'
        },
        {
          name: 'Spa & Wellness',
          description: 'Relax and rejuvenate with our premium spa services',
          icon: 'FaSpa'
        },
        {
          name: 'Event Hosting',
          description: 'Perfect venues for your special occasions',
          icon: 'FaCalendarAlt'
        },
        {
          name: 'Concierge Service',
          description: '24/7 personalized assistance for all your needs',
          icon: 'FaConciergeBell'
        },
        {
          name: 'Free WiFi',
          description: 'High-speed internet access throughout the property',
          icon: 'FaWifi'
        }
      ],
      seo: {
        metaTitle: 'Hotel Royal - Luxury Hotel & Restaurant',
        metaDescription: 'Experience luxury and comfort at Hotel Royal. Premium rooms, fine dining, and exceptional service.',
        keywords: 'hotel, luxury, restaurant, accommodation, booking'
      }
    };
  }

  /**
   * Cache management for offline support
   */
  cacheSettings(settings) {
    try {
      localStorage.setItem('hotelSettings', JSON.stringify(settings));
      localStorage.setItem('hotelSettingsTimestamp', Date.now().toString());
    } catch (error) {
      console.warn('Failed to cache hotel settings:', error);
    }
  }

  getCachedSettings() {
    try {
      const cached = localStorage.getItem('hotelSettings');
      const timestamp = localStorage.getItem('hotelSettingsTimestamp');
      
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        const maxAge = 5 * 60 * 1000; // 5 minutes
        
        if (age < maxAge) {
          return JSON.parse(cached);
        }
      }
    } catch (error) {
      console.warn('Failed to get cached hotel settings:', error);
    }
    return null;
  }

  clearCache() {
    try {
      localStorage.removeItem('hotelSettings');
      localStorage.removeItem('hotelSettingsTimestamp');
    } catch (error) {
      console.warn('Failed to clear hotel settings cache:', error);
    }
  }
}

// Export singleton instance
const hotelSettingsService = new HotelSettingsService();
export default hotelSettingsService;
