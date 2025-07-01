import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import hotelSettingsService from '../services/hotelSettingsService';

// Initial state
const initialState = {
  settings: null,
  loading: true,
  error: null,
  lastUpdated: null,
  isOnline: navigator.onLine,
  adminMode: false
};

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_SETTINGS: 'SET_SETTINGS',
  SET_ERROR: 'SET_ERROR',
  SET_ONLINE_STATUS: 'SET_ONLINE_STATUS',
  SET_ADMIN_MODE: 'SET_ADMIN_MODE',
  UPDATE_SECTION: 'UPDATE_SECTION',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer function
const hotelSettingsReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case actionTypes.SET_SETTINGS:
      return {
        ...state,
        settings: action.payload,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      };
    
    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    case actionTypes.SET_ONLINE_STATUS:
      return {
        ...state,
        isOnline: action.payload
      };
    
    case actionTypes.SET_ADMIN_MODE:
      return {
        ...state,
        adminMode: action.payload
      };
    
    case actionTypes.UPDATE_SECTION:
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.payload.section]: action.payload.data
        },
        lastUpdated: new Date().toISOString()
      };
    
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

// Create context
const HotelSettingsContext = createContext();

// Provider component
export const HotelSettingsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(hotelSettingsReducer, initialState);

  // Check if user is admin
  const checkAdminMode = useCallback(() => {
    const role = localStorage.getItem('role');
    const isAdmin = role === 'admin';
    dispatch({ type: actionTypes.SET_ADMIN_MODE, payload: isAdmin });
    return isAdmin;
  }, []);

  // Load hotel settings
  const loadSettings = useCallback(async (forceRefresh = false) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      dispatch({ type: actionTypes.CLEAR_ERROR });

      // Check for cached settings first (if not forcing refresh)
      if (!forceRefresh && state.isOnline) {
        const cached = hotelSettingsService.getCachedSettings();
        if (cached) {
          dispatch({ type: actionTypes.SET_SETTINGS, payload: cached });
          return { success: true, data: cached, fromCache: true };
        }
      }

      // Fetch from API
      const result = await hotelSettingsService.getPublicSettings();
      
      if (result.success) {
        dispatch({ type: actionTypes.SET_SETTINGS, payload: result.data });
        
        // Cache the settings
        hotelSettingsService.cacheSettings(result.data);
        
        return { success: true, data: result.data, fromCache: false };
      } else {
        // Try cached settings as fallback
        const cached = hotelSettingsService.getCachedSettings();
        if (cached) {
          dispatch({ type: actionTypes.SET_SETTINGS, payload: cached });
          return { success: true, data: cached, fromCache: true, warning: result.error };
        } else {
          // Use default settings as last resort
          const defaults = hotelSettingsService.getDefaultSettings();
          dispatch({ type: actionTypes.SET_SETTINGS, payload: defaults });
          return { success: true, data: defaults, fromDefaults: true, warning: result.error };
        }
      }
    } catch (error) {
      console.error('Error loading hotel settings:', error);
      
      // Try cached or default settings
      const cached = hotelSettingsService.getCachedSettings();
      if (cached) {
        dispatch({ type: actionTypes.SET_SETTINGS, payload: cached });
        return { success: true, data: cached, fromCache: true, error: error.message };
      } else {
        const defaults = hotelSettingsService.getDefaultSettings();
        dispatch({ type: actionTypes.SET_SETTINGS, payload: defaults });
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        return { success: false, data: defaults, fromDefaults: true, error: error.message };
      }
    }
  }, []);

  // Update settings (admin only)
  const updateSettings = useCallback(async (settingsData) => {
    if (!state.adminMode) {
      throw new Error('Admin access required');
    }

    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });

      const result = await hotelSettingsService.updateSettings(settingsData);

      if (result.success) {
        dispatch({ type: actionTypes.SET_SETTINGS, payload: result.data });
        // Clear cache and force refresh
        hotelSettingsService.clearCache();
        hotelSettingsService.cacheSettings(result.data);
        // Notify all components that settings have changed
        window.dispatchEvent(new CustomEvent('hotelSettingsChanged', { detail: result.data }));

        // Force reload settings to ensure all components get fresh data
        setTimeout(() => {
          loadSettings(true);
        }, 100);

        return { success: true, data: result.data, message: result.message };
      } else {
        console.error('Settings update failed:', result.error);
        dispatch({ type: actionTypes.SET_ERROR, payload: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Settings update error:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [state.adminMode, loadSettings]);

  // Update specific section
  const updateSection = useCallback(async (section, sectionData) => {
    if (!state.adminMode) {
      throw new Error('Admin access required');
    }

    try {
      const result = await hotelSettingsService.updateSection(section, sectionData);

      if (result.success) {
        dispatch({ type: actionTypes.SET_SETTINGS, payload: result.data });
        // Clear cache and force refresh
        hotelSettingsService.clearCache();
        hotelSettingsService.cacheSettings(result.data);
        // Notify all components that settings have changed
        window.dispatchEvent(new CustomEvent('hotelSettingsChanged', { detail: result.data }));

        // Force reload settings to ensure all components get fresh data
        setTimeout(() => {
          loadSettings(true);
        }, 100);

        return { success: true, data: result.data, message: result.message };
      } else {
        console.error('Update failed:', result.error);
        dispatch({ type: actionTypes.SET_ERROR, payload: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Update error:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [state.adminMode, loadSettings]);

  // Reset settings to defaults (admin only)
  const resetSettings = useCallback(async () => {
    if (!state.adminMode) {
      throw new Error('Admin access required');
    }

    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      
      const result = await hotelSettingsService.resetSettings();
      
      if (result.success) {
        dispatch({ type: actionTypes.SET_SETTINGS, payload: result.data });
        hotelSettingsService.clearCache();
        return { success: true, data: result.data, message: result.message };
      } else {
        dispatch({ type: actionTypes.SET_ERROR, payload: result.error });
        return { success: false, error: result.error };
      }
    } catch (error) {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [state.adminMode]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: actionTypes.CLEAR_ERROR });
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: actionTypes.SET_ONLINE_STATUS, payload: true });
      // Reload settings when coming back online
      loadSettings(true);
    };

    const handleOffline = () => {
      dispatch({ type: actionTypes.SET_ONLINE_STATUS, payload: false });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadSettings]);

  // Listen for auth state changes
  useEffect(() => {
    const handleAuthChange = () => {
      checkAdminMode();
    };

    window.addEventListener('authStateChanged', handleAuthChange);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, [checkAdminMode]);

  // Initial load
  useEffect(() => {
    checkAdminMode();
    loadSettings();
  }, []);

  // Context value
  const value = {
    // State
    settings: state.settings,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    isOnline: state.isOnline,
    adminMode: state.adminMode,
    
    // Actions
    loadSettings,
    updateSettings,
    updateSection,
    resetSettings,
    clearError,
    
    // Utilities
    isLoaded: !state.loading && state.settings !== null,
    hasError: state.error !== null
  };

  return (
    <HotelSettingsContext.Provider value={value}>
      {children}
    </HotelSettingsContext.Provider>
  );
};

// Custom hook to use hotel settings
export const useHotelSettings = () => {
  const context = useContext(HotelSettingsContext);
  
  if (!context) {
    throw new Error('useHotelSettings must be used within a HotelSettingsProvider');
  }
  
  return context;
};

export default HotelSettingsContext;
