// Data transformation helpers for formatting and cleaning data. No business logic is present in this file.

/**
 * Transform user data for API response (remove sensitive fields)
 * @param {Object} user - User object from database
 * @returns {Object} Sanitized user object
 */
const transformUser = (user) => {
  if (!user) return null;
  
  const userObj = user.toObject ? user.toObject() : user;
  
  // Remove sensitive fields
  const { password, __v, ...sanitizedUser } = userObj;
  
  return {
    ...sanitizedUser,
    id: sanitizedUser._id,
    createdAt: sanitizedUser.createdAt ? new Date(sanitizedUser.createdAt).toISOString() : null,
    updatedAt: sanitizedUser.updatedAt ? new Date(sanitizedUser.updatedAt).toISOString() : null
  };
};

/**
 * Transform table data for API response
 * @param {Object} table - Table object from database
 * @returns {Object} Formatted table object
 */
const transformTable = (table) => {
  if (!table) return null;
  
  const tableObj = table.toObject ? table.toObject() : table;
  
  return {
    ...tableObj,
    id: tableObj._id,
    capacity: parseInt(tableObj.capacity),
    features: tableObj.features || [],
    avgRating: parseFloat(tableObj.avgRating || 0),
    totalBookings: parseInt(tableObj.totalBookings || 0),
    createdAt: tableObj.createdAt ? new Date(tableObj.createdAt).toISOString() : null,
    updatedAt: tableObj.updatedAt ? new Date(tableObj.updatedAt).toISOString() : null
  };
};

/**
 * Transform booking/reservation data for API response
 * @param {Object} booking - Booking object from database
 * @returns {Object} Formatted booking object
 */
const transformBooking = (booking) => {
  if (!booking) return null;
  
  const bookingObj = booking.toObject ? booking.toObject() : booking;
  
  return {
    ...bookingObj,
    id: bookingObj._id,
    guests: parseInt(bookingObj.guests),
    totalPrice: parseFloat(bookingObj.totalPrice || 0),
    reservationDate: bookingObj.reservationDate ? new Date(bookingObj.reservationDate).toISOString() : null,
    createdAt: bookingObj.createdAt ? new Date(bookingObj.createdAt).toISOString() : null,
    updatedAt: bookingObj.updatedAt ? new Date(bookingObj.updatedAt).toISOString() : null
  };
};

/**
 * Transform menu item data for API response
 * @param {Object} menuItem - Menu item object from database
 * @returns {Object} Formatted menu item object
 */
const transformMenuItem = (menuItem) => {
  if (!menuItem) return null;
  
  const itemObj = menuItem.toObject ? menuItem.toObject() : menuItem;
  
  return {
    ...itemObj,
    id: itemObj._id,
    price: parseFloat(itemObj.price || 0),
    ingredients: itemObj.ingredients ? itemObj.ingredients.split(',').map(i => i.trim()) : [],
    createdAt: itemObj.createdAt ? new Date(itemObj.createdAt).toISOString() : null,
    updatedAt: itemObj.updatedAt ? new Date(itemObj.updatedAt).toISOString() : null
  };
};

/**
 * Transform array of objects using specified transformer
 * @param {Array} items - Array of items to transform
 * @param {Function} transformer - Transformation function
 * @returns {Array} Array of transformed items
 */
const transformArray = (items, transformer) => {
  if (!Array.isArray(items)) return [];
  return items.map(transformer).filter(Boolean);
};

/**
 * Format currency value
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount, currency = 'USD') => {
  if (typeof amount !== 'number') return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} locale - Locale for formatting (default: en-US)
 * @returns {string} Formatted date string
 */
const formatDate = (date, locale = 'en-US') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format time for display
 * @param {Date|string} time - Time to format
 * @param {string} locale - Locale for formatting (default: en-US)
 * @returns {string} Formatted time string
 */
const formatTime = (time, locale = 'en-US') => {
  if (!time) return '';
  
  const timeObj = new Date(time);
  if (isNaN(timeObj.getTime())) return '';
  
  return timeObj.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} Title case string
 */
const toTitleCase = (str) => {
  if (typeof str !== 'string') return '';
  
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

/**
 * Convert string to camelCase
 * @param {string} str - String to convert
 * @returns {string} CamelCase string
 */
const toCamelCase = (str) => {
  if (typeof str !== 'string') return '';
  
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
};

/**
 * Convert string to snake_case
 * @param {string} str - String to convert
 * @returns {string} Snake_case string
 */
const toSnakeCase = (str) => {
  if (typeof str !== 'string') return '';
  
  return str.replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map(word => word.toLowerCase())
    .join('_');
};

/**
 * Deep clone an object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * Remove empty values from object
 * @param {Object} obj - Object to clean
 * @returns {Object} Cleaned object
 */
const removeEmptyValues = (obj) => {
  const cleaned = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value === 'object' && !Array.isArray(value)) {
          const cleanedNested = removeEmptyValues(value);
          if (Object.keys(cleanedNested).length > 0) {
            cleaned[key] = cleanedNested;
          }
        } else {
          cleaned[key] = value;
        }
      }
    }
  }
  
  return cleaned;
};

/**
 * Paginate array data
 * @param {Array} data - Data to paginate
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Items per page
 * @returns {Object} Paginated result
 */
const paginate = (data, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const paginatedData = data.slice(offset, offset + limit);
  
  return {
    data: paginatedData,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: data.length,
      pages: Math.ceil(data.length / limit),
      hasNext: offset + limit < data.length,
      hasPrev: page > 1
    }
  };
};

/**
 * Sort array of objects by field
 * @param {Array} data - Data to sort
 * @param {string} field - Field to sort by
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted data
 */
const sortByField = (data, field, order = 'asc') => {
  return data.sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

module.exports = {
  transformUser,
  transformTable,
  transformBooking,
  transformMenuItem,
  transformArray,
  formatCurrency,
  formatDate,
  formatTime,
  toTitleCase,
  toCamelCase,
  toSnakeCase,
  deepClone,
  removeEmptyValues,
  paginate,
  sortByField
};
