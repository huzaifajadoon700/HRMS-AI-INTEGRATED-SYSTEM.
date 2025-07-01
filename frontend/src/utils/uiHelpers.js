/**
 * HRMS AI Integrated System - UI Helper Utilities
 * Hotel and Restaurant Management System with AI-powered features
 *
 * @description Frontend UI helper functions for React components and user interface
 * @version 1.0.0
 * @author HRMS Development Team
 * @created 2025-07-01
 */

/**
 * Format currency with proper locale and symbol
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @param {string} locale - Locale string (default: 'en-US')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return '$0.00';
    }

    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    } catch (error) {
        console.warn('Currency formatting error:', error.message);
        return `$${amount.toFixed(2)}`;
    }
};

/**
 * Format date for display in various formats
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'relative', 'time')
 * @param {string} locale - Locale string
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short', locale = 'en-US') => {
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
    }

    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    switch (format) {
        case 'relative':
            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Yesterday';
            if (diffDays === -1) return 'Tomorrow';
            if (diffDays > 0 && diffDays < 7) return `${diffDays} days ago`;
            if (diffDays < 0 && diffDays > -7) return `In ${Math.abs(diffDays)} days`;
            return dateObj.toLocaleDateString(locale);

        case 'time':
            return dateObj.toLocaleTimeString(locale, {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

        case 'long':
            return dateObj.toLocaleDateString(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });

        case 'short':
        default:
            return dateObj.toLocaleDateString(locale);
    }
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100, suffix = '...') => {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength - suffix.length).trim() + suffix;
};

/**
 * Generate initials from name
 * @param {string} name - Full name
 * @param {number} maxInitials - Maximum number of initials
 * @returns {string} Initials
 */
export const getInitials = (name, maxInitials = 2) => {
    if (!name || typeof name !== 'string') return '';
    
    return name
        .split(' ')
        .filter(word => word.length > 0)
        .slice(0, maxInitials)
        .map(word => word.charAt(0).toUpperCase())
        .join('');
};

/**
 * Generate random color for avatars or UI elements
 * @param {string} seed - Seed string for consistent colors
 * @returns {string} Hex color code
 */
export const generateColor = (seed = '') => {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
        '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
    ];
    
    if (seed) {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }
    
    return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Debounce function for search inputs and API calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay = 300) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
};

/**
 * Throttle function for scroll events and frequent updates
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 100) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func.apply(null, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
        }
    } catch (error) {
        console.error('Failed to copy text:', error);
        return false;
    }
};

/**
 * Download data as file
 * @param {string} data - Data to download
 * @param {string} filename - File name
 * @param {string} type - MIME type
 */
export const downloadFile = (data, filename, type = 'text/plain') => {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
};

/**
 * Scroll to element smoothly
 * @param {string|Element} element - Element selector or element
 * @param {Object} options - Scroll options
 */
export const scrollToElement = (element, options = {}) => {
    const targetElement = typeof element === 'string' 
        ? document.querySelector(element) 
        : element;
    
    if (!targetElement) return;
    
    const defaultOptions = {
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
        ...options
    };
    
    targetElement.scrollIntoView(defaultOptions);
};

/**
 * Check if element is in viewport
 * @param {Element} element - Element to check
 * @param {number} threshold - Threshold percentage (0-1)
 * @returns {boolean} Is in viewport
 */
export const isInViewport = (element, threshold = 0) => {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    const verticalThreshold = windowHeight * threshold;
    const horizontalThreshold = windowWidth * threshold;
    
    return (
        rect.top >= -verticalThreshold &&
        rect.left >= -horizontalThreshold &&
        rect.bottom <= windowHeight + verticalThreshold &&
        rect.right <= windowWidth + horizontalThreshold
    );
};

/**
 * Generate CSS class names conditionally
 * @param {...any} args - Class names and conditions
 * @returns {string} Combined class names
 */
export const classNames = (...args) => {
    const classes = [];
    
    args.forEach(arg => {
        if (!arg) return;
        
        if (typeof arg === 'string') {
            classes.push(arg);
        } else if (typeof arg === 'object') {
            Object.keys(arg).forEach(key => {
                if (arg[key]) {
                    classes.push(key);
                }
            });
        }
    });
    
    return classes.join(' ');
};

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Generate random ID for components
 * @param {string} prefix - Prefix for ID
 * @returns {string} Random ID
 */
export const generateId = (prefix = 'id') => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate image file
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateImageFile = (file, options = {}) => {
    const {
        maxSize = 5 * 1024 * 1024, // 5MB
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        minWidth = 0,
        minHeight = 0,
        maxWidth = Infinity,
        maxHeight = Infinity
    } = options;
    
    const errors = [];
    
    // Check file type
    if (!allowedTypes.includes(file.type)) {
        errors.push(`File type ${file.type} is not allowed`);
    }
    
    // Check file size
    if (file.size > maxSize) {
        errors.push(`File size ${formatFileSize(file.size)} exceeds maximum ${formatFileSize(maxSize)}`);
    }
    
    return new Promise((resolve) => {
        if (errors.length > 0) {
            resolve({ isValid: false, errors });
            return;
        }
        
        // Check image dimensions
        const img = new Image();
        img.onload = () => {
            if (img.width < minWidth) {
                errors.push(`Image width ${img.width}px is below minimum ${minWidth}px`);
            }
            if (img.height < minHeight) {
                errors.push(`Image height ${img.height}px is below minimum ${minHeight}px`);
            }
            if (img.width > maxWidth) {
                errors.push(`Image width ${img.width}px exceeds maximum ${maxWidth}px`);
            }
            if (img.height > maxHeight) {
                errors.push(`Image height ${img.height}px exceeds maximum ${maxHeight}px`);
            }
            
            resolve({
                isValid: errors.length === 0,
                errors,
                dimensions: { width: img.width, height: img.height }
            });
        };
        
        img.onerror = () => {
            resolve({ isValid: false, errors: ['Invalid image file'] });
        };
        
        img.src = URL.createObjectURL(file);
    });
};

/**
 * Create toast notification object
 * @param {string} message - Toast message
 * @param {string} type - Toast type ('success', 'error', 'warning', 'info')
 * @param {Object} options - Toast options
 * @returns {Object} Toast object
 */
export const createToast = (message, type = 'info', options = {}) => {
    return {
        id: generateId('toast'),
        message,
        type,
        timestamp: new Date(),
        duration: options.duration || (type === 'error' ? 5000 : 3000),
        dismissible: options.dismissible !== false,
        action: options.action || null,
        ...options
    };
};

/**
 * Format phone number for display
 * @param {string} phoneNumber - Raw phone number
 * @param {string} format - Format type ('us', 'international')
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber, format = 'us') => {
    if (!phoneNumber) return '';
    
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (format === 'us' && cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (format === 'us' && cleaned.length === 11 && cleaned.startsWith('1')) {
        return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else if (format === 'international') {
        // Basic international formatting
        if (cleaned.length > 10) {
            return `+${cleaned.slice(0, -10)} ${cleaned.slice(-10, -7)} ${cleaned.slice(-7, -4)} ${cleaned.slice(-4)}`;
        }
    }
    
    return phoneNumber; // Return original if no format matches
};

/**
 * Calculate reading time for text
 * @param {string} text - Text content
 * @param {number} wordsPerMinute - Average reading speed
 * @returns {string} Reading time estimate
 */
export const calculateReadingTime = (text, wordsPerMinute = 200) => {
    if (!text || typeof text !== 'string') return '0 min read';
    
    const wordCount = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    
    return `${minutes} min read`;
};

/**
 * Get contrast color (black or white) for background
 * @param {string} backgroundColor - Background color in hex
 * @returns {string} Contrast color
 */
export const getContrastColor = (backgroundColor) => {
    if (!backgroundColor) return '#000000';
    
    // Remove # if present
    const hex = backgroundColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

/**
 * Create URL with query parameters
 * @param {string} baseUrl - Base URL
 * @param {Object} params - Query parameters
 * @returns {string} URL with parameters
 */
export const createUrlWithParams = (baseUrl, params = {}) => {
    const url = new URL(baseUrl, window.location.origin);
    
    Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
            url.searchParams.set(key, params[key]);
        }
    });
    
    return url.toString();
};

/**
 * Parse query parameters from URL
 * @param {string} search - URL search string
 * @returns {Object} Parsed parameters
 */
export const parseQueryParams = (search = window.location.search) => {
    const params = {};
    const urlParams = new URLSearchParams(search);
    
    for (const [key, value] of urlParams.entries()) {
        params[key] = value;
    }
    
    return params;
};

/**
 * Check if device is mobile
 * @returns {boolean} Is mobile device
 */
export const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Check if device supports touch
 * @returns {boolean} Supports touch
 */
export const isTouchDevice = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Get device type
 * @returns {string} Device type ('mobile', 'tablet', 'desktop')
 */
export const getDeviceType = () => {
    const width = window.innerWidth;
    
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
};
