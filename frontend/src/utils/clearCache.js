// Utility to clear hotel settings cache
// Run this in browser console: clearHotelCache()

export const clearHotelCache = () => {
  try {
    // Clear hotel settings cache
    localStorage.removeItem('hotelSettings');
    localStorage.removeItem('hotelSettingsTimestamp');
    
    // Clear any other related cache
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('hotel') || key.includes('contact')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('✅ Hotel settings cache cleared successfully');
    console.log('🔄 Please refresh the page to load fresh data');
    
    // Optionally reload the page
    if (window.confirm('Cache cleared! Reload page to see fresh data?')) {
      window.location.reload();
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    return false;
  }
};

// Make it available globally for console access
if (typeof window !== 'undefined') {
  window.clearHotelCache = clearHotelCache;
}

export default clearHotelCache;
