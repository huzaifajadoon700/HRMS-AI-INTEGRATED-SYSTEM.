/**
 * HRMS AI Integrated System - Frontend Form Validation Utilities
 * Hotel and Restaurant Management System with AI-powered features
 *
 * @description Client-side form validation utilities for React components
 * @version 1.0.0
 * @author HRMS Development Team
 * @created 2025-07-01
 */

/**
 * Validation rules for different field types
 */
export const ValidationRules = {
    // Email validation
    email: {
        pattern: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
        message: 'Please enter a valid email address'
    },
    
    // Phone number validation
    phone: {
        pattern: /^[\+]?[1-9][\d]{0,15}$/,
        message: 'Please enter a valid phone number'
    },
    
    // Password validation
    password: {
        minLength: 8,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
    },
    
    // Name validation
    name: {
        pattern: /^[a-zA-Z\s\-']{2,50}$/,
        message: 'Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes'
    },
    
    // Room number validation
    roomNumber: {
        pattern: /^[A-Za-z0-9]{1,10}$/,
        message: 'Room number must be 1-10 alphanumeric characters'
    },
    
    // Table number validation
    tableNumber: {
        pattern: /^[1-9]\d{0,2}$/,
        message: 'Table number must be between 1 and 999'
    },
    
    // Price validation
    price: {
        pattern: /^\d+(\.\d{1,2})?$/,
        message: 'Price must be a valid amount (e.g., 10.99)'
    },
    
    // Date validation
    date: {
        message: 'Please select a valid date'
    },
    
    // Time validation
    time: {
        pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        message: 'Please enter a valid time (HH:MM)'
    }
};

/**
 * Validate individual field
 * @param {string} value - Field value
 * @param {string} type - Validation type
 * @param {Object} options - Additional validation options
 * @returns {Object} Validation result
 */
export const validateField = (value, type, options = {}) => {
    const result = {
        isValid: true,
        error: '',
        value: value?.toString().trim() || ''
    };

    // Check if field is required
    if (options.required && (!result.value || result.value.length === 0)) {
        result.isValid = false;
        result.error = options.requiredMessage || `${type} is required`;
        return result;
    }

    // Skip validation if field is empty and not required
    if (!result.value && !options.required) {
        return result;
    }

    const rule = ValidationRules[type];
    if (!rule) {
        console.warn(`Unknown validation type: ${type}`);
        return result;
    }

    // Length validation
    if (options.minLength && result.value.length < options.minLength) {
        result.isValid = false;
        result.error = `Minimum length is ${options.minLength} characters`;
        return result;
    }

    if (options.maxLength && result.value.length > options.maxLength) {
        result.isValid = false;
        result.error = `Maximum length is ${options.maxLength} characters`;
        return result;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(result.value)) {
        result.isValid = false;
        result.error = options.message || rule.message;
        return result;
    }

    // Special validations
    switch (type) {
        case 'password':
            if (result.value.length < rule.minLength) {
                result.isValid = false;
                result.error = `Password must be at least ${rule.minLength} characters long`;
            }
            break;

        case 'date':
            const date = new Date(result.value);
            if (isNaN(date.getTime())) {
                result.isValid = false;
                result.error = rule.message;
            } else if (options.minDate && date < new Date(options.minDate)) {
                result.isValid = false;
                result.error = `Date must be after ${options.minDate}`;
            } else if (options.maxDate && date > new Date(options.maxDate)) {
                result.isValid = false;
                result.error = `Date must be before ${options.maxDate}`;
            }
            break;

        case 'price':
            const price = parseFloat(result.value);
            if (isNaN(price) || price < 0) {
                result.isValid = false;
                result.error = 'Price must be a positive number';
            } else if (options.maxPrice && price > options.maxPrice) {
                result.isValid = false;
                result.error = `Price cannot exceed ${options.maxPrice}`;
            }
            break;
    }

    return result;
};

/**
 * Validate entire form
 * @param {Object} formData - Form data object
 * @param {Object} validationSchema - Validation schema
 * @returns {Object} Validation result with errors
 */
export const validateForm = (formData, validationSchema) => {
    const errors = {};
    let isValid = true;

    Object.keys(validationSchema).forEach(fieldName => {
        const fieldValue = formData[fieldName];
        const fieldSchema = validationSchema[fieldName];
        
        const validation = validateField(fieldValue, fieldSchema.type, fieldSchema.options);
        
        if (!validation.isValid) {
            errors[fieldName] = validation.error;
            isValid = false;
        }
    });

    return { isValid, errors };
};

/**
 * Real-time validation hook for React components
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationSchema - Validation schema
 * @returns {Object} Form state and validation functions
 */
export const useFormValidation = (initialValues, validationSchema) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const validateSingleField = (name, value) => {
        const fieldSchema = validationSchema[name];
        if (!fieldSchema) return;

        const validation = validateField(value, fieldSchema.type, fieldSchema.options);
        
        setErrors(prev => ({
            ...prev,
            [name]: validation.isValid ? '' : validation.error
        }));

        return validation.isValid;
    };

    const handleChange = (name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
        
        // Validate if field has been touched
        if (touched[name]) {
            validateSingleField(name, value);
        }
    };

    const handleBlur = (name) => {
        setTouched(prev => ({ ...prev, [name]: true }));
        validateSingleField(name, values[name]);
    };

    const validateAll = () => {
        const validation = validateForm(values, validationSchema);
        setErrors(validation.errors);
        
        // Mark all fields as touched
        const allTouched = {};
        Object.keys(validationSchema).forEach(key => {
            allTouched[key] = true;
        });
        setTouched(allTouched);

        return validation.isValid;
    };

    const resetForm = () => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    };

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        validateAll,
        resetForm,
        isValid: Object.keys(errors).length === 0 || Object.values(errors).every(error => !error)
    };
};

/**
 * Common validation schemas for HRMS forms
 */
export const ValidationSchemas = {
    // User registration form
    userRegistration: {
        name: {
            type: 'name',
            options: { required: true, requiredMessage: 'Full name is required' }
        },
        email: {
            type: 'email',
            options: { required: true, requiredMessage: 'Email address is required' }
        },
        phone: {
            type: 'phone',
            options: { required: true, requiredMessage: 'Phone number is required' }
        },
        password: {
            type: 'password',
            options: { required: true, requiredMessage: 'Password is required' }
        }
    },

    // Room booking form
    roomBooking: {
        checkIn: {
            type: 'date',
            options: { 
                required: true, 
                requiredMessage: 'Check-in date is required',
                minDate: new Date().toISOString().split('T')[0]
            }
        },
        checkOut: {
            type: 'date',
            options: { 
                required: true, 
                requiredMessage: 'Check-out date is required',
                minDate: new Date().toISOString().split('T')[0]
            }
        },
        guests: {
            type: 'tableNumber',
            options: { required: true, requiredMessage: 'Number of guests is required' }
        }
    },

    // Table reservation form
    tableReservation: {
        date: {
            type: 'date',
            options: { 
                required: true, 
                requiredMessage: 'Reservation date is required',
                minDate: new Date().toISOString().split('T')[0]
            }
        },
        time: {
            type: 'time',
            options: { required: true, requiredMessage: 'Reservation time is required' }
        },
        partySize: {
            type: 'tableNumber',
            options: { required: true, requiredMessage: 'Party size is required' }
        },
        specialRequests: {
            type: 'name',
            options: { required: false, maxLength: 500 }
        }
    },

    // Contact form
    contact: {
        name: {
            type: 'name',
            options: { required: true, requiredMessage: 'Name is required' }
        },
        email: {
            type: 'email',
            options: { required: true, requiredMessage: 'Email is required' }
        },
        subject: {
            type: 'name',
            options: { required: true, requiredMessage: 'Subject is required', maxLength: 100 }
        },
        message: {
            type: 'name',
            options: { required: true, requiredMessage: 'Message is required', maxLength: 1000 }
        }
    }
};

/**
 * Utility function to format validation errors for display
 * @param {Object} errors - Validation errors object
 * @returns {Array} Array of error messages
 */
export const formatValidationErrors = (errors) => {
    return Object.entries(errors)
        .filter(([_, error]) => error && error.trim())
        .map(([field, error]) => ({
            field: field.charAt(0).toUpperCase() + field.slice(1),
            message: error
        }));
};

/**
 * Sanitize input to prevent XSS attacks
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
};

/**
 * Check if form has unsaved changes
 * @param {Object} currentValues - Current form values
 * @param {Object} initialValues - Initial form values
 * @returns {boolean} True if form has changes
 */
export const hasUnsavedChanges = (currentValues, initialValues) => {
    return JSON.stringify(currentValues) !== JSON.stringify(initialValues);
};
