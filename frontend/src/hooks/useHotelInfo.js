import { useState, useEffect } from 'react';
import axios from 'axios';
import { useHotelSettings } from '../contexts/HotelSettingsContext';

/**
 * Custom hook for easy access to hotel information
 * Provides commonly used hotel data with fallbacks
 */
export const useHotelInfo = () => {
  const { settings, loading, error, isLoaded } = useHotelSettings();

  // Helper function to get nested property with fallback
  const getProperty = (path, fallback = '') => {
    if (!settings) return fallback;
    
    return path.split('.').reduce((obj, key) => {
      return obj && obj[key] !== undefined ? obj[key] : fallback;
    }, settings);
  };

  return {
    // Loading states
    loading,
    error,
    isLoaded,
    
    // Basic hotel info
    hotelName: getProperty('hotelName', 'Hotel Royal'),
    hotelSubtitle: getProperty('hotelSubtitle', 'Luxury & Comfort Experience'),
    description: getProperty('description', 'Experience luxury and comfort with our world-class hospitality services.'),
    
    // Contact information
    address: getProperty('contact.address.fullAddress', '123 Luxury Street, Lahore, Pakistan'),
    phone: getProperty('contact.phone.primary', '+92 336 945 769'),
    whatsapp: getProperty('contact.phone.whatsapp', '+92 336 945 769'),
    email: getProperty('contact.email.primary', 'info@hotelroyal.com'),
    website: getProperty('contact.website', 'https://hotelroyal.com'),
    
    // Business info
    businessHours: getProperty('business.hours', '24/7 Available'),
    established: getProperty('business.established', '2020'),
    
    // Statistics
    totalRooms: getProperty('statistics.totalRooms', 150),
    totalStaff: getProperty('statistics.totalStaff', 85),
    totalClients: getProperty('statistics.totalClients', 2500),
    yearsOfService: getProperty('statistics.yearsOfService', 5),
    
    // Hero content
    heroTitle: getProperty('heroContent.mainTitle', 'Luxury Hotel Experience'),
    heroSubtitle: getProperty('heroContent.subtitle', 'WELCOME TO LUXURY'),
    heroDescription: getProperty('heroContent.description', 'Premium accommodations with world-class hospitality'),
    
    // Social media
    socialMedia: {
      facebook: getProperty('socialMedia.facebook', 'https://facebook.com/hotelroyal'),
      twitter: getProperty('socialMedia.twitter', 'https://twitter.com/hotelroyal'),
      instagram: getProperty('socialMedia.instagram', 'https://instagram.com/hotelroyal'),
      linkedin: getProperty('socialMedia.linkedin', 'https://linkedin.com/company/hotelroyal'),
      youtube: getProperty('socialMedia.youtube', 'https://youtube.com/hotelroyal')
    },
    
    // Services
    services: getProperty('services', []),
    
    // SEO data
    seo: {
      title: getProperty('seo.metaTitle', 'Hotel Royal - Luxury Hotel & Restaurant'),
      description: getProperty('seo.metaDescription', 'Experience luxury and comfort at Hotel Royal. Premium rooms, fine dining, and exceptional service.'),
      keywords: getProperty('seo.keywords', 'hotel, luxury, restaurant, accommodation, booking')
    },
    
    // Full settings object (for advanced use)
    fullSettings: settings
  };
};

/**
 * Hook for contact information specifically
 */
export const useContactInfo = () => {
  const { settings } = useHotelSettings();
  
  if (!settings?.contact) {
    return {
      address: '123 Luxury Street, Lahore, Pakistan',
      phone: '+92 336 945 769',
      email: 'info@hotelroyal.com',
      whatsapp: '+92 336 945 769',
      website: 'https://hotelroyal.com'
    };
  }
  
  return {
    address: settings.contact.address?.fullAddress || '123 Luxury Street, Lahore, Pakistan',
    street: settings.contact.address?.street || '123 Luxury Street',
    city: settings.contact.address?.city || 'Lahore',
    country: settings.contact.address?.country || 'Pakistan',
    phone: settings.contact.phone?.primary || '+92 336 945 769',
    phoneSecondary: settings.contact.phone?.secondary || '+92 123 456 7890',
    whatsapp: settings.contact.phone?.whatsapp || '+92 336 945 769',
    email: settings.contact.email?.primary || 'info@hotelroyal.com',
    emailSupport: settings.contact.email?.support || 'support@hotelroyal.com',
    emailReservations: settings.contact.email?.reservations || 'reservations@hotelroyal.com',
    website: settings.contact.website || 'https://hotelroyal.com'
  };
};

/**
 * Hook for social media links
 */
export const useSocialMedia = () => {
  const { settings } = useHotelSettings();
  
  const defaultSocial = {
    facebook: 'https://facebook.com/hotelroyal',
    twitter: 'https://twitter.com/hotelroyal',
    instagram: 'https://instagram.com/hotelroyal',
    linkedin: 'https://linkedin.com/company/hotelroyal',
    youtube: 'https://youtube.com/hotelroyal'
  };
  
  return settings?.socialMedia || defaultSocial;
};

/**
 * Hook for hotel statistics - fetches real-time data from APIs
 */
export const useHotelStats = () => {
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalMenuItems: 0,
    totalClients: 0,
    totalTables: 0,
    loading: true,
    error: null
  });

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));

        // Fetch data from multiple endpoints in parallel
        const [roomsResponse, menusResponse, tablesResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/rooms`),
          axios.get(`${API_BASE_URL}/menus`),
          axios.get(`${API_BASE_URL}/tables`)
        ]);

        // Use a fixed value for clients as requested
        const totalClients = 20;

        // Extract counts from responses
        const totalRooms = Array.isArray(roomsResponse.data) ? roomsResponse.data.length :
                          (roomsResponse.data?.rooms?.length || 0);

        const totalMenuItems = Array.isArray(menusResponse.data) ? menusResponse.data.length :
                              (menusResponse.data?.menus?.length || 0);

        const totalTables = Array.isArray(tablesResponse.data) ? tablesResponse.data.length :
                           (tablesResponse.data?.tables?.length || 0);

        setStats({
          totalRooms,
          totalMenuItems,
          totalClients,
          totalTables,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Error fetching hotel statistics:', error);
        // Use fallback values on error
        setStats({
          totalRooms: 20,
          totalMenuItems: 50,
          totalClients: 20,
          totalTables: 15,
          loading: false,
          error: 'Using cached data'
        });
      }
    };

    fetchStats();
  }, [API_BASE_URL]);

  return stats;
};

/**
 * Hook for hero/banner content
 */
export const useHeroContent = () => {
  const { settings } = useHotelSettings();
  
  const defaultHero = {
    mainTitle: 'Luxury Hotel Experience',
    subtitle: 'WELCOME TO LUXURY',
    description: 'Premium accommodations with world-class hospitality'
  };
  
  return settings?.heroContent || defaultHero;
};

/**
 * Hook for SEO metadata
 */
export const useSEOData = () => {
  const { settings } = useHotelSettings();

  const defaultSEO = {
    metaTitle: 'Hotel Royal - Luxury Hotel & Restaurant',
    metaDescription: 'Experience luxury and comfort at Hotel Royal. Premium rooms, fine dining, and exceptional service.',
    keywords: 'hotel, luxury, restaurant, accommodation, booking'
  };

  return settings?.seo || defaultSEO;
};

/**
 * Hook for branding assets (logos, colors, fonts)
 */
export const useBranding = () => {
  const { settings } = useHotelSettings();

  const defaultBranding = {
    logo: {
      primary: '/images/logo-primary.png',
      secondary: '/images/logo-secondary.png',
      favicon: '/images/favicon.ico',
      loginLogo: '/images/logo-login.png'
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
  };

  // console.log('useBranding - Settings:', settings);
  // console.log('useBranding - Settings branding:', settings?.branding);
  // console.log('useBranding - Using default?', !settings?.branding);

  return settings?.branding || defaultBranding;
};

/**
 * Hook for logo URLs specifically
 */
export const useLogos = () => {
  const branding = useBranding();
  const { settings } = useHotelSettings();

  // console.log('useLogos - Raw settings:', settings);
  // console.log('useLogos - Branding:', branding);
  // console.log('useLogos - Logo object:', branding.logo);

  return branding.logo;
};

/**
 * Hook for brand colors specifically
 */
export const useBrandColors = () => {
  const branding = useBranding();
  return branding.colors;
};

export default useHotelInfo;
