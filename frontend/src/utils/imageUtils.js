/**
 * Utility function to handle image URLs consistently across the application
 * Supports both external URLs (Unsplash, etc.) and local uploads
 */

import { apiConfig } from '../config/api';

export const getImageUrl = (imagePath, fallback = "/images/placeholder-food.jpg") => {
  // Return fallback if no image path provided
  if (!imagePath) {
    console.log('getImageUrl: No image path provided, using fallback:', fallback);
    return fallback;
  }

  // Handle invalid image paths (common issue with failed uploads)
  if (imagePath.includes('undefined') || imagePath === '/uploads/undefined' || imagePath === 'undefined') {
    console.log('getImageUrl: Invalid image path detected:', imagePath, 'using fallback:', fallback);
    return fallback;
  }

  try {
    // If it's already a full URL (Unsplash, external sources), return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      console.log('getImageUrl: External URL detected:', imagePath);
      return imagePath;
    }

    // If it's a local upload path
    const cleanPath = imagePath.replace(/^\/+/, '');
    console.log('getImageUrl: Processing local path:', imagePath, '-> cleaned:', cleanPath);

    let finalUrl;
    // Check if it already includes uploads in the path
    if (cleanPath.includes('uploads/') || cleanPath.startsWith('uploads')) {
      finalUrl = `${apiConfig.serverURL}/${cleanPath}`;
    } else {
      // Default to uploads folder
      finalUrl = `${apiConfig.serverURL}/uploads/${cleanPath}`;
    }

    console.log('getImageUrl: Final URL:', finalUrl, 'Server URL:', apiConfig.serverURL);
    return finalUrl;

  } catch (error) {
    console.error('getImageUrl: Error formatting image URL:', error, 'for path:', imagePath);
    return fallback;
  }
};

/**
 * Get image URL specifically for menu items
 */
export const getMenuImageUrl = (imagePath) => {
  return getImageUrl(imagePath, "/images/placeholder-menu.jpg");
};

/**
 * Get image URL specifically for room items
 */
export const getRoomImageUrl = (imagePath) => {
  return getImageUrl(imagePath, "/images/placeholder-room.jpg");
};

/**
 * Get image URL specifically for table items
 */
export const getTableImageUrl = (imagePath) => {
  return getImageUrl(imagePath, "/images/placeholder-table.jpg");
};

/**
 * Handle image error by setting fallback
 */
export const handleImageError = (e, fallback = "/images/placeholder-food.jpg") => {
  e.target.src = fallback;
  e.target.onerror = null; // Prevent infinite loop
};

/**
 * Handle menu image error
 */
export const handleMenuImageError = (e) => {
  handleImageError(e, "/images/placeholder-menu.jpg");
};
