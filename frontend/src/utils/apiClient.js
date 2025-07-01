/**
 * HRMS AI Integrated System - API Client Utility
 * Hotel and Restaurant Management System with AI-powered features
 *
 * @description Centralized API client with error handling, authentication, and request/response interceptors
 * @version 1.0.0
 * @author HRMS Development Team
 * @created 2025-07-01
 */

import axios from 'axios';

/**
 * API Configuration
 */
const API_CONFIG = {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000 // 1 second
};

/**
 * Create axios instance with default configuration
 */
const apiClient = axios.create({
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

/**
 * Request interceptor for authentication and logging
 */
apiClient.interceptors.request.use(
    (config) => {
        // Add authentication token if available
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request timestamp for performance monitoring
        config.metadata = { startTime: new Date() };

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
                data: config.data,
                params: config.params
            });
        }

        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

/**
 * Response interceptor for error handling and logging
 */
apiClient.interceptors.response.use(
    (response) => {
        // Calculate response time
        const responseTime = new Date() - response.config.metadata.startTime;

        // Log response in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
                status: response.status,
                responseTime: `${responseTime}ms`,
                data: response.data
            });
        }

        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Calculate response time for failed requests
        if (originalRequest.metadata) {
            const responseTime = new Date() - originalRequest.metadata.startTime;
            console.error(`❌ API Error: ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`, {
                status: error.response?.status,
                responseTime: `${responseTime}ms`,
                message: error.message
            });
        }

        // Handle authentication errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            // Clear invalid tokens
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('authToken');
            
            // Redirect to login page
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
            
            return Promise.reject(error);
        }

        // Handle network errors with retry logic
        if (!error.response && originalRequest._retryCount < API_CONFIG.retryAttempts) {
            originalRequest._retryCount = originalRequest._retryCount || 0;
            originalRequest._retryCount++;

            console.log(`🔄 Retrying request (${originalRequest._retryCount}/${API_CONFIG.retryAttempts})`);

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));

            return apiClient(originalRequest);
        }

        return Promise.reject(error);
    }
);

/**
 * API Response wrapper for consistent error handling
 */
class ApiResponse {
    constructor(response) {
        this.success = response.data?.success ?? true;
        this.data = response.data?.data ?? response.data;
        this.message = response.data?.message ?? 'Operation successful';
        this.status = response.status;
        this.pagination = response.data?.pagination;
    }
}

/**
 * API Error wrapper for consistent error handling
 */
class ApiError extends Error {
    constructor(error) {
        const message = error.response?.data?.error?.message || 
                       error.response?.data?.message || 
                       error.message || 
                       'An unexpected error occurred';
        
        super(message);
        
        this.name = 'ApiError';
        this.status = error.response?.status;
        this.code = error.response?.data?.error?.code;
        this.details = error.response?.data?.error?.details;
        this.isNetworkError = !error.response;
        this.originalError = error;
    }
}

/**
 * Generic API methods
 */
export const api = {
    /**
     * GET request
     * @param {string} url - API endpoint
     * @param {Object} params - Query parameters
     * @param {Object} options - Additional axios options
     * @returns {Promise<ApiResponse>} API response
     */
    async get(url, params = {}, options = {}) {
        try {
            const response = await apiClient.get(url, { params, ...options });
            return new ApiResponse(response);
        } catch (error) {
            throw new ApiError(error);
        }
    },

    /**
     * POST request
     * @param {string} url - API endpoint
     * @param {Object} data - Request body
     * @param {Object} options - Additional axios options
     * @returns {Promise<ApiResponse>} API response
     */
    async post(url, data = {}, options = {}) {
        try {
            const response = await apiClient.post(url, data, options);
            return new ApiResponse(response);
        } catch (error) {
            throw new ApiError(error);
        }
    },

    /**
     * PUT request
     * @param {string} url - API endpoint
     * @param {Object} data - Request body
     * @param {Object} options - Additional axios options
     * @returns {Promise<ApiResponse>} API response
     */
    async put(url, data = {}, options = {}) {
        try {
            const response = await apiClient.put(url, data, options);
            return new ApiResponse(response);
        } catch (error) {
            throw new ApiError(error);
        }
    },

    /**
     * PATCH request
     * @param {string} url - API endpoint
     * @param {Object} data - Request body
     * @param {Object} options - Additional axios options
     * @returns {Promise<ApiResponse>} API response
     */
    async patch(url, data = {}, options = {}) {
        try {
            const response = await apiClient.patch(url, data, options);
            return new ApiResponse(response);
        } catch (error) {
            throw new ApiError(error);
        }
    },

    /**
     * DELETE request
     * @param {string} url - API endpoint
     * @param {Object} options - Additional axios options
     * @returns {Promise<ApiResponse>} API response
     */
    async delete(url, options = {}) {
        try {
            const response = await apiClient.delete(url, options);
            return new ApiResponse(response);
        } catch (error) {
            throw new ApiError(error);
        }
    },

    /**
     * Upload file
     * @param {string} url - API endpoint
     * @param {FormData} formData - Form data with file
     * @param {Function} onProgress - Progress callback
     * @returns {Promise<ApiResponse>} API response
     */
    async upload(url, formData, onProgress = null) {
        try {
            const options = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (onProgress) {
                options.onUploadProgress = (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onProgress(percentCompleted);
                };
            }

            const response = await apiClient.post(url, formData, options);
            return new ApiResponse(response);
        } catch (error) {
            throw new ApiError(error);
        }
    }
};

/**
 * Specific API endpoints for HRMS
 */
export const hrmsApi = {
    // Authentication
    auth: {
        login: (credentials) => api.post('/auth/login', credentials),
        register: (userData) => api.post('/auth/register', userData),
        logout: () => api.post('/auth/logout'),
        refreshToken: () => api.post('/auth/refresh'),
        forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
        resetPassword: (token, password) => api.post('/auth/reset-password', { token, password })
    },

    // User management
    users: {
        getProfile: () => api.get('/api/user/profile'),
        updateProfile: (data) => api.put('/api/user/profile', data),
        updatePassword: (data) => api.patch('/api/user/password', data),
        getById: (id) => api.get(`/api/user/${id}`)
    },

    // Room management
    rooms: {
        getAll: (params) => api.get('/api/rooms', params),
        getById: (id) => api.get(`/api/rooms/${id}`),
        create: (data) => api.post('/api/rooms', data),
        update: (id, data) => api.put(`/api/rooms/${id}`, data),
        delete: (id) => api.delete(`/api/rooms/${id}`),
        getAvailable: (params) => api.get('/api/rooms/available', params)
    },

    // Booking management
    bookings: {
        getAll: (params) => api.get('/api/bookings', params),
        getById: (id) => api.get(`/api/bookings/${id}`),
        create: (data) => api.post('/api/bookings', data),
        update: (id, data) => api.put(`/api/bookings/${id}`, data),
        cancel: (id) => api.delete(`/api/bookings/${id}`),
        getUserBookings: () => api.get('/api/bookings/user')
    },

    // Table reservations
    reservations: {
        getAll: (params) => api.get('/api/reservations', params),
        getById: (id) => api.get(`/api/reservations/${id}`),
        create: (data) => api.post('/api/reservations', data),
        update: (id, data) => api.put(`/api/reservations/${id}`, data),
        cancel: (id) => api.delete(`/api/reservations/${id}`),
        getAvailableTables: (params) => api.get('/api/tables/available', params)
    },

    // Menu and orders
    menu: {
        getAll: (params) => api.get('/api/menus', params),
        getById: (id) => api.get(`/api/menus/${id}`),
        getCategories: () => api.get('/api/menus/categories')
    },

    orders: {
        getAll: (params) => api.get('/api/orders', params),
        getById: (id) => api.get(`/api/orders/${id}`),
        create: (data) => api.post('/api/orders', data),
        update: (id, data) => api.put(`/api/orders/${id}`, data),
        getUserOrders: () => api.get('/api/orders/user')
    },

    // Payments
    payments: {
        createIntent: (data) => api.post('/api/payment/create-intent', data),
        confirmPayment: (data) => api.post('/api/payment/confirm', data),
        getHistory: () => api.get('/api/payment/history')
    },

    // Feedback
    feedback: {
        submit: (data) => api.post('/api/feedback', data),
        getAll: (params) => api.get('/api/feedback', params)
    },

    // File uploads
    files: {
        upload: (file, onProgress) => {
            const formData = new FormData();
            formData.append('file', file);
            return api.upload('/api/files/upload', formData, onProgress);
        }
    }
};

/**
 * Utility functions
 */
export const apiUtils = {
    /**
     * Check if error is a network error
     * @param {Error} error - Error object
     * @returns {boolean} True if network error
     */
    isNetworkError: (error) => error instanceof ApiError && error.isNetworkError,

    /**
     * Check if error is an authentication error
     * @param {Error} error - Error object
     * @returns {boolean} True if auth error
     */
    isAuthError: (error) => error instanceof ApiError && error.status === 401,

    /**
     * Get error message for display
     * @param {Error} error - Error object
     * @returns {string} User-friendly error message
     */
    getErrorMessage: (error) => {
        if (error instanceof ApiError) {
            if (error.isNetworkError) {
                return 'Network error. Please check your connection and try again.';
            }
            return error.message;
        }
        return 'An unexpected error occurred. Please try again.';
    },

    /**
     * Set authentication token
     * @param {string} token - JWT token
     * @param {boolean} remember - Whether to persist token
     */
    setAuthToken: (token, remember = false) => {
        if (remember) {
            localStorage.setItem('authToken', token);
        } else {
            sessionStorage.setItem('authToken', token);
        }
    },

    /**
     * Clear authentication token
     */
    clearAuthToken: () => {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
    }
};

export { ApiResponse, ApiError };
export default api;
