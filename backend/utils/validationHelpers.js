/**
 * HRMS AI Integrated System - Validation Helper Utilities
 * Hotel and Restaurant Management System with AI-powered features
 *
 * @description Common validation functions for data integrity and security
 * @version 1.0.0
 * @author HRMS Development Team
 * @created 2025-07-01
 */

/**
 * Email validation with comprehensive regex
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email format
 */
const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email.trim().toLowerCase());
};

/**
 * Phone number validation (supports multiple formats)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone format
 */
const isValidPhone = (phone) => {
    if (!phone || typeof phone !== 'string') return false;
    
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it's between 10-15 digits (international format)
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
};

/**
 * Password strength validation
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with strength score and requirements
 */
const validatePasswordStrength = (password) => {
    if (!password || typeof password !== 'string') {
        return {
            isValid: false,
            score: 0,
            requirements: {
                minLength: false,
                hasUppercase: false,
                hasLowercase: false,
                hasNumbers: false,
                hasSpecialChars: false
            },
            message: 'Password is required'
        };
    }

    const requirements = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumbers: /\d/.test(password),
        hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(requirements).filter(Boolean).length;
    const isValid = score >= 4; // At least 4 out of 5 requirements

    let message = '';
    if (!requirements.minLength) message += 'Password must be at least 8 characters long. ';
    if (!requirements.hasUppercase) message += 'Password must contain uppercase letters. ';
    if (!requirements.hasLowercase) message += 'Password must contain lowercase letters. ';
    if (!requirements.hasNumbers) message += 'Password must contain numbers. ';
    if (!requirements.hasSpecialChars) message += 'Password must contain special characters. ';

    return {
        isValid,
        score,
        requirements,
        message: isValid ? 'Password meets security requirements' : message.trim()
    };
};

/**
 * MongoDB ObjectId validation
 * @param {string} id - ID to validate
 * @returns {boolean} - True if valid ObjectId format
 */
const isValidObjectId = (id) => {
    if (!id || typeof id !== 'string') return false;
    return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Date validation and formatting
 * @param {string|Date} date - Date to validate
 * @returns {Object} - Validation result with parsed date
 */
const validateDate = (date) => {
    if (!date) {
        return { isValid: false, message: 'Date is required' };
    }

    const parsedDate = new Date(date);
    
    if (isNaN(parsedDate.getTime())) {
        return { isValid: false, message: 'Invalid date format' };
    }

    return {
        isValid: true,
        date: parsedDate,
        message: 'Valid date'
    };
};

/**
 * URL validation
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid URL format
 */
const isValidUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Credit card number validation (basic Luhn algorithm)
 * @param {string} cardNumber - Credit card number to validate
 * @returns {boolean} - True if valid card number
 */
const isValidCreditCard = (cardNumber) => {
    if (!cardNumber || typeof cardNumber !== 'string') return false;
    
    // Remove spaces and dashes
    const cleanNumber = cardNumber.replace(/[\s-]/g, '');
    
    // Check if all characters are digits and length is appropriate
    if (!/^\d{13,19}$/.test(cleanNumber)) return false;
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanNumber[i]);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
};

/**
 * Name validation (allows letters, spaces, hyphens, apostrophes)
 * @param {string} name - Name to validate
 * @returns {boolean} - True if valid name format
 */
const isValidName = (name) => {
    if (!name || typeof name !== 'string') return false;
    
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 50) return false;
    
    // Allow letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    return nameRegex.test(trimmedName);
};

/**
 * Sanitize string input to prevent XSS attacks
 * @param {string} input - String to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeString = (input) => {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/[<>]/g, '') // Remove < and > characters
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
};

/**
 * Validate room number format
 * @param {string} roomNumber - Room number to validate
 * @returns {boolean} - True if valid room number format
 */
const isValidRoomNumber = (roomNumber) => {
    if (!roomNumber || typeof roomNumber !== 'string') return false;
    
    // Allow alphanumeric room numbers (e.g., "101", "A12", "2B")
    const roomRegex = /^[A-Za-z0-9]{1,10}$/;
    return roomRegex.test(roomNumber.trim());
};

/**
 * Validate table number format
 * @param {string|number} tableNumber - Table number to validate
 * @returns {boolean} - True if valid table number
 */
const isValidTableNumber = (tableNumber) => {
    if (typeof tableNumber === 'number') {
        return tableNumber > 0 && tableNumber <= 1000;
    }
    
    if (typeof tableNumber === 'string') {
        const num = parseInt(tableNumber.trim());
        return !isNaN(num) && num > 0 && num <= 1000;
    }
    
    return false;
};

/**
 * Validate price/amount format
 * @param {string|number} amount - Amount to validate
 * @returns {boolean} - True if valid amount
 */
const isValidAmount = (amount) => {
    if (typeof amount === 'number') {
        return amount >= 0 && amount <= 999999.99;
    }
    
    if (typeof amount === 'string') {
        const num = parseFloat(amount);
        return !isNaN(num) && num >= 0 && num <= 999999.99;
    }
    
    return false;
};

/**
 * Comprehensive input validation for common fields
 * @param {Object} data - Data object to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} - Validation result
 */
const validateRequiredFields = (data, requiredFields) => {
    const errors = [];
    const missingFields = [];
    
    if (!data || typeof data !== 'object') {
        return {
            isValid: false,
            errors: ['Invalid data format'],
            missingFields: requiredFields
        };
    }
    
    requiredFields.forEach(field => {
        if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
            missingFields.push(field);
            errors.push(`${field} is required`);
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors,
        missingFields
    };
};

module.exports = {
    isValidEmail,
    isValidPhone,
    validatePasswordStrength,
    isValidObjectId,
    validateDate,
    isValidUrl,
    isValidCreditCard,
    isValidName,
    sanitizeString,
    isValidRoomNumber,
    isValidTableNumber,
    isValidAmount,
    validateRequiredFields
};
