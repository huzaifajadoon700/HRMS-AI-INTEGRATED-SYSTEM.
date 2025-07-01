/**
 * HRMS AI Integrated System - Date and Time Helper Utilities
 * Hotel and Restaurant Management System with AI-powered features
 *
 * @description Comprehensive date and time utilities for booking, reservations, and scheduling
 * @version 1.0.0
 * @author HRMS Development Team
 * @created 2025-07-01
 */

/**
 * Format date to various string formats
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'iso', 'time', 'datetime')
 * @param {string} timezone - Timezone (default: 'UTC')
 * @returns {string} Formatted date string
 */
const formatDate = (date, format = 'short', timezone = 'UTC') => {
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date provided');
    }

    const options = { timeZone: timezone };

    switch (format) {
        case 'short':
            return dateObj.toLocaleDateString('en-US', {
                ...options,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        
        case 'long':
            return dateObj.toLocaleDateString('en-US', {
                ...options,
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });
        
        case 'iso':
            return dateObj.toISOString().split('T')[0];
        
        case 'time':
            return dateObj.toLocaleTimeString('en-US', {
                ...options,
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        
        case 'datetime':
            return dateObj.toLocaleString('en-US', {
                ...options,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        
        default:
            return dateObj.toLocaleDateString('en-US', options);
    }
};

/**
 * Add or subtract time from a date
 * @param {Date|string} date - Base date
 * @param {number} amount - Amount to add/subtract
 * @param {string} unit - Time unit ('days', 'hours', 'minutes', 'months', 'years')
 * @returns {Date} Modified date
 */
const addTime = (date, amount, unit) => {
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date provided');
    }

    switch (unit) {
        case 'minutes':
            dateObj.setMinutes(dateObj.getMinutes() + amount);
            break;
        case 'hours':
            dateObj.setHours(dateObj.getHours() + amount);
            break;
        case 'days':
            dateObj.setDate(dateObj.getDate() + amount);
            break;
        case 'months':
            dateObj.setMonth(dateObj.getMonth() + amount);
            break;
        case 'years':
            dateObj.setFullYear(dateObj.getFullYear() + amount);
            break;
        default:
            throw new Error('Invalid time unit. Use: minutes, hours, days, months, years');
    }

    return dateObj;
};

/**
 * Calculate difference between two dates
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @param {string} unit - Unit for result ('days', 'hours', 'minutes')
 * @returns {number} Difference in specified unit
 */
const dateDifference = (date1, date2, unit = 'days') => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
        throw new Error('Invalid date(s) provided');
    }

    const diffMs = Math.abs(d2.getTime() - d1.getTime());

    switch (unit) {
        case 'minutes':
            return Math.floor(diffMs / (1000 * 60));
        case 'hours':
            return Math.floor(diffMs / (1000 * 60 * 60));
        case 'days':
            return Math.floor(diffMs / (1000 * 60 * 60 * 24));
        default:
            throw new Error('Invalid unit. Use: minutes, hours, days');
    }
};

/**
 * Check if a date is within business hours
 * @param {Date|string} date - Date to check
 * @param {Object} businessHours - Business hours configuration
 * @returns {boolean} True if within business hours
 */
const isWithinBusinessHours = (date, businessHours = {}) => {
    const dateObj = new Date(date);
    const day = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = dateObj.getHours();
    const minute = dateObj.getMinutes();
    const timeInMinutes = hour * 60 + minute;

    const defaultHours = {
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' },
        saturday: { start: '10:00', end: '16:00' },
        sunday: null // Closed
    };

    const hours = { ...defaultHours, ...businessHours };
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayHours = hours[dayNames[day]];

    if (!dayHours) {
        return false; // Closed on this day
    }

    const startTime = timeStringToMinutes(dayHours.start);
    const endTime = timeStringToMinutes(dayHours.end);

    return timeInMinutes >= startTime && timeInMinutes <= endTime;
};

/**
 * Convert time string (HH:MM) to minutes since midnight
 * @param {string} timeString - Time in HH:MM format
 * @returns {number} Minutes since midnight
 */
const timeStringToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
};

/**
 * Get next available business day
 * @param {Date|string} date - Starting date
 * @param {Array} excludeDays - Days to exclude (0-6, where 0 is Sunday)
 * @returns {Date} Next business day
 */
const getNextBusinessDay = (date, excludeDays = [0, 6]) => {
    let nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    while (excludeDays.includes(nextDay.getDay())) {
        nextDay.setDate(nextDay.getDate() + 1);
    }

    return nextDay;
};

/**
 * Check if date is a weekend
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if weekend
 */
const isWeekend = (date) => {
    const day = new Date(date).getDay();
    return day === 0 || day === 6; // Sunday or Saturday
};

/**
 * Get booking duration in a readable format
 * @param {Date|string} checkIn - Check-in date
 * @param {Date|string} checkOut - Check-out date
 * @returns {Object} Duration breakdown
 */
const getBookingDuration = (checkIn, checkOut) => {
    const days = dateDifference(checkIn, checkOut, 'days');
    const hours = dateDifference(checkIn, checkOut, 'hours') % 24;

    return {
        days,
        hours,
        totalHours: dateDifference(checkIn, checkOut, 'hours'),
        formatted: days > 0 ? `${days} day(s)` : `${hours} hour(s)`
    };
};

/**
 * Generate time slots for reservations
 * @param {string} startTime - Start time (HH:MM)
 * @param {string} endTime - End time (HH:MM)
 * @param {number} intervalMinutes - Interval between slots
 * @returns {Array} Array of time slots
 */
const generateTimeSlots = (startTime, endTime, intervalMinutes = 30) => {
    const slots = [];
    const start = timeStringToMinutes(startTime);
    const end = timeStringToMinutes(endTime);

    for (let time = start; time < end; time += intervalMinutes) {
        const hours = Math.floor(time / 60);
        const minutes = time % 60;
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        slots.push({
            value: timeString,
            label: formatTimeSlot(timeString),
            minutes: time
        });
    }

    return slots;
};

/**
 * Format time slot for display
 * @param {string} timeString - Time in HH:MM format
 * @returns {string} Formatted time for display
 */
const formatTimeSlot = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Check if a date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the past
 */
const isPastDate = (date) => {
    return new Date(date) < new Date();
};

/**
 * Check if a date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
const isToday = (date) => {
    const today = new Date();
    const checkDate = new Date(date);
    
    return today.toDateString() === checkDate.toDateString();
};

/**
 * Get relative time description (e.g., "2 hours ago", "in 3 days")
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time description
 */
const getRelativeTime = (date) => {
    const now = new Date();
    const targetDate = new Date(date);
    const diffMs = targetDate.getTime() - now.getTime();
    const isPast = diffMs < 0;
    const absDiffMs = Math.abs(diffMs);

    const minutes = Math.floor(absDiffMs / (1000 * 60));
    const hours = Math.floor(absDiffMs / (1000 * 60 * 60));
    const days = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
        return 'just now';
    } else if (minutes < 60) {
        return isPast ? `${minutes} minute(s) ago` : `in ${minutes} minute(s)`;
    } else if (hours < 24) {
        return isPast ? `${hours} hour(s) ago` : `in ${hours} hour(s)`;
    } else {
        return isPast ? `${days} day(s) ago` : `in ${days} day(s)`;
    }
};

/**
 * Validate date range for bookings
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
const validateDateRange = (startDate, endDate, options = {}) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    const {
        allowPastDates = false,
        maxAdvanceDays = 365,
        minDuration = 1, // minimum hours
        maxDuration = 720 // maximum hours (30 days)
    } = options;

    const errors = [];

    // Check if dates are valid
    if (isNaN(start.getTime())) {
        errors.push('Invalid start date');
    }
    if (isNaN(end.getTime())) {
        errors.push('Invalid end date');
    }

    if (errors.length > 0) {
        return { isValid: false, errors };
    }

    // Check if start date is in the past
    if (!allowPastDates && start < now) {
        errors.push('Start date cannot be in the past');
    }

    // Check if end date is before start date
    if (end <= start) {
        errors.push('End date must be after start date');
    }

    // Check advance booking limit
    const advanceDays = dateDifference(now, start, 'days');
    if (advanceDays > maxAdvanceDays) {
        errors.push(`Cannot book more than ${maxAdvanceDays} days in advance`);
    }

    // Check duration limits
    const durationHours = dateDifference(start, end, 'hours');
    if (durationHours < minDuration) {
        errors.push(`Minimum duration is ${minDuration} hour(s)`);
    }
    if (durationHours > maxDuration) {
        errors.push(`Maximum duration is ${maxDuration} hour(s)`);
    }

    return {
        isValid: errors.length === 0,
        errors,
        duration: durationHours
    };
};

module.exports = {
    formatDate,
    addTime,
    dateDifference,
    isWithinBusinessHours,
    timeStringToMinutes,
    getNextBusinessDay,
    isWeekend,
    getBookingDuration,
    generateTimeSlots,
    formatTimeSlot,
    isPastDate,
    isToday,
    getRelativeTime,
    validateDateRange
};
