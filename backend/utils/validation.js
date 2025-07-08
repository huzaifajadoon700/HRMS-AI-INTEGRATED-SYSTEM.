// Validation utility functions

/**
 * Validates email format using regex
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid, false otherwise
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {boolean} True if password meets requirements, false otherwise
 */
const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validates phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone number is valid, false otherwise
 */
const validatePhoneNumber = (phone) => {
  // Basic phone number validation (10-15 digits)
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone);
};

/**
 * Validates if a string is not empty and contains only valid characters
 * @param {string} str - String to validate
 * @param {number} minLength - Minimum length required
 * @returns {boolean} True if string is valid, false otherwise
 */
const validateString = (str, minLength = 1) => {
  return typeof str === 'string' && str.trim().length >= minLength;
};

/**
 * Validates if a number is within specified range
 * @param {number} num - Number to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} True if number is valid, false otherwise
 */
const validateNumberRange = (num, min = 0, max = Infinity) => {
  return typeof num === 'number' && num >= min && num <= max;
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateString,
  validateNumberRange
};
