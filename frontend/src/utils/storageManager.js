/**
 * HRMS AI Integrated System - Local Storage Management Utility
 * Hotel and Restaurant Management System with AI-powered features
 *
 * @description Comprehensive local storage management with encryption, expiration, and type safety
 * @version 1.0.0
 * @author HRMS Development Team
 * @created 2025-07-01
 */

/**
 * Storage Manager Class for handling localStorage and sessionStorage
 */
class StorageManager {
    constructor(options = {}) {
        this.prefix = options.prefix || 'hrms_';
        this.enableEncryption = options.enableEncryption || false;
        this.defaultExpiration = options.defaultExpiration || 24 * 60 * 60 * 1000; // 24 hours
        this.encryptionKey = options.encryptionKey || 'hrms-default-key';
        
        // Check storage availability
        this.isLocalStorageAvailable = this.checkStorageAvailability('localStorage');
        this.isSessionStorageAvailable = this.checkStorageAvailability('sessionStorage');
        
        // Initialize cleanup interval
        this.startCleanupInterval();
    }

    /**
     * Check if storage is available
     * @param {string} type - Storage type ('localStorage' or 'sessionStorage')
     * @returns {boolean} Storage availability
     */
    checkStorageAvailability(type) {
        try {
            const storage = window[type];
            const testKey = '__storage_test__';
            storage.setItem(testKey, 'test');
            storage.removeItem(testKey);
            return true;
        } catch (error) {
            console.warn(`${type} is not available:`, error.message);
            return false;
        }
    }

    /**
     * Generate storage key with prefix
     * @param {string} key - Original key
     * @returns {string} Prefixed key
     */
    generateKey(key) {
        return `${this.prefix}${key}`;
    }

    /**
     * Simple encryption/decryption (for basic obfuscation)
     * @param {string} text - Text to encrypt/decrypt
     * @param {boolean} decrypt - Whether to decrypt (default: encrypt)
     * @returns {string} Encrypted/decrypted text
     */
    simpleEncrypt(text, decrypt = false) {
        if (!this.enableEncryption) return text;
        
        try {
            if (decrypt) {
                return atob(text);
            } else {
                return btoa(text);
            }
        } catch (error) {
            console.warn('Encryption/decryption failed:', error.message);
            return text;
        }
    }

    /**
     * Create storage item with metadata
     * @param {*} value - Value to store
     * @param {Object} options - Storage options
     * @returns {Object} Storage item with metadata
     */
    createStorageItem(value, options = {}) {
        const now = Date.now();
        const expiration = options.expiration || this.defaultExpiration;
        
        return {
            value,
            timestamp: now,
            expiresAt: expiration ? now + expiration : null,
            type: typeof value,
            version: '1.0'
        };
    }

    /**
     * Set item in localStorage
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @param {Object} options - Storage options
     * @returns {boolean} Success status
     */
    setLocal(key, value, options = {}) {
        if (!this.isLocalStorageAvailable) {
            console.warn('localStorage is not available');
            return false;
        }

        try {
            const storageKey = this.generateKey(key);
            const storageItem = this.createStorageItem(value, options);
            const serializedItem = JSON.stringify(storageItem);
            const finalValue = this.simpleEncrypt(serializedItem);
            
            localStorage.setItem(storageKey, finalValue);
            return true;
        } catch (error) {
            console.error('Failed to set localStorage item:', error.message);
            return false;
        }
    }

    /**
     * Get item from localStorage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Retrieved value or default
     */
    getLocal(key, defaultValue = null) {
        if (!this.isLocalStorageAvailable) {
            return defaultValue;
        }

        try {
            const storageKey = this.generateKey(key);
            const storedValue = localStorage.getItem(storageKey);
            
            if (!storedValue) {
                return defaultValue;
            }

            const decryptedValue = this.simpleEncrypt(storedValue, true);
            const storageItem = JSON.parse(decryptedValue);

            // Check expiration
            if (storageItem.expiresAt && Date.now() > storageItem.expiresAt) {
                this.removeLocal(key);
                return defaultValue;
            }

            return storageItem.value;
        } catch (error) {
            console.error('Failed to get localStorage item:', error.message);
            return defaultValue;
        }
    }

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    removeLocal(key) {
        if (!this.isLocalStorageAvailable) {
            return false;
        }

        try {
            const storageKey = this.generateKey(key);
            localStorage.removeItem(storageKey);
            return true;
        } catch (error) {
            console.error('Failed to remove localStorage item:', error.message);
            return false;
        }
    }

    /**
     * Set item in sessionStorage
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @param {Object} options - Storage options
     * @returns {boolean} Success status
     */
    setSession(key, value, options = {}) {
        if (!this.isSessionStorageAvailable) {
            console.warn('sessionStorage is not available');
            return false;
        }

        try {
            const storageKey = this.generateKey(key);
            const storageItem = this.createStorageItem(value, options);
            const serializedItem = JSON.stringify(storageItem);
            const finalValue = this.simpleEncrypt(serializedItem);
            
            sessionStorage.setItem(storageKey, finalValue);
            return true;
        } catch (error) {
            console.error('Failed to set sessionStorage item:', error.message);
            return false;
        }
    }

    /**
     * Get item from sessionStorage
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Retrieved value or default
     */
    getSession(key, defaultValue = null) {
        if (!this.isSessionStorageAvailable) {
            return defaultValue;
        }

        try {
            const storageKey = this.generateKey(key);
            const storedValue = sessionStorage.getItem(storageKey);
            
            if (!storedValue) {
                return defaultValue;
            }

            const decryptedValue = this.simpleEncrypt(storedValue, true);
            const storageItem = JSON.parse(decryptedValue);

            // Check expiration
            if (storageItem.expiresAt && Date.now() > storageItem.expiresAt) {
                this.removeSession(key);
                return defaultValue;
            }

            return storageItem.value;
        } catch (error) {
            console.error('Failed to get sessionStorage item:', error.message);
            return defaultValue;
        }
    }

    /**
     * Remove item from sessionStorage
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    removeSession(key) {
        if (!this.isSessionStorageAvailable) {
            return false;
        }

        try {
            const storageKey = this.generateKey(key);
            sessionStorage.removeItem(storageKey);
            return true;
        } catch (error) {
            console.error('Failed to remove sessionStorage item:', error.message);
            return false;
        }
    }

    /**
     * Clear all items with the current prefix
     * @param {string} storageType - 'local', 'session', or 'both'
     */
    clear(storageType = 'both') {
        const clearStorage = (storage, storageName) => {
            if (!storage) return;
            
            try {
                const keysToRemove = [];
                for (let i = 0; i < storage.length; i++) {
                    const key = storage.key(i);
                    if (key && key.startsWith(this.prefix)) {
                        keysToRemove.push(key);
                    }
                }
                
                keysToRemove.forEach(key => storage.removeItem(key));
                console.log(`Cleared ${keysToRemove.length} items from ${storageName}`);
            } catch (error) {
                console.error(`Failed to clear ${storageName}:`, error.message);
            }
        };

        if (storageType === 'local' || storageType === 'both') {
            clearStorage(localStorage, 'localStorage');
        }
        
        if (storageType === 'session' || storageType === 'both') {
            clearStorage(sessionStorage, 'sessionStorage');
        }
    }

    /**
     * Get storage usage information
     * @returns {Object} Storage usage stats
     */
    getStorageInfo() {
        const getStorageSize = (storage, storageName) => {
            if (!storage) return { available: false, used: 0, items: 0 };
            
            let used = 0;
            let items = 0;
            
            try {
                for (let i = 0; i < storage.length; i++) {
                    const key = storage.key(i);
                    if (key && key.startsWith(this.prefix)) {
                        const value = storage.getItem(key);
                        used += key.length + (value ? value.length : 0);
                        items++;
                    }
                }
                
                return { available: true, used, items };
            } catch (error) {
                return { available: false, used: 0, items: 0, error: error.message };
            }
        };

        return {
            localStorage: getStorageSize(localStorage, 'localStorage'),
            sessionStorage: getStorageSize(sessionStorage, 'sessionStorage'),
            prefix: this.prefix,
            encryptionEnabled: this.enableEncryption
        };
    }

    /**
     * Clean up expired items
     */
    cleanupExpired() {
        const cleanStorage = (storage, storageName) => {
            if (!storage) return;
            
            let cleanedCount = 0;
            const keysToRemove = [];
            
            try {
                for (let i = 0; i < storage.length; i++) {
                    const key = storage.key(i);
                    if (key && key.startsWith(this.prefix)) {
                        const value = storage.getItem(key);
                        if (value) {
                            try {
                                const decryptedValue = this.simpleEncrypt(value, true);
                                const storageItem = JSON.parse(decryptedValue);
                                
                                if (storageItem.expiresAt && Date.now() > storageItem.expiresAt) {
                                    keysToRemove.push(key);
                                }
                            } catch (parseError) {
                                // Invalid format, remove it
                                keysToRemove.push(key);
                            }
                        }
                    }
                }
                
                keysToRemove.forEach(key => {
                    storage.removeItem(key);
                    cleanedCount++;
                });
                
                if (cleanedCount > 0) {
                    console.log(`Cleaned ${cleanedCount} expired items from ${storageName}`);
                }
            } catch (error) {
                console.error(`Failed to cleanup ${storageName}:`, error.message);
            }
        };

        cleanStorage(localStorage, 'localStorage');
        cleanStorage(sessionStorage, 'sessionStorage');
    }

    /**
     * Start automatic cleanup interval
     */
    startCleanupInterval() {
        // Clean up expired items every 30 minutes
        setInterval(() => {
            this.cleanupExpired();
        }, 30 * 60 * 1000);
    }

    /**
     * Export all storage data
     * @returns {Object} Exported storage data
     */
    exportData() {
        const exportStorage = (storage, storageName) => {
            if (!storage) return {};
            
            const data = {};
            
            try {
                for (let i = 0; i < storage.length; i++) {
                    const key = storage.key(i);
                    if (key && key.startsWith(this.prefix)) {
                        const originalKey = key.replace(this.prefix, '');
                        const value = storage.getItem(key);
                        
                        if (value) {
                            try {
                                const decryptedValue = this.simpleEncrypt(value, true);
                                const storageItem = JSON.parse(decryptedValue);
                                data[originalKey] = storageItem;
                            } catch (parseError) {
                                console.warn(`Failed to parse storage item: ${key}`);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error(`Failed to export ${storageName}:`, error.message);
            }
            
            return data;
        };

        return {
            localStorage: exportStorage(localStorage, 'localStorage'),
            sessionStorage: exportStorage(sessionStorage, 'sessionStorage'),
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
    }
}

// Create default instance
const storageManager = new StorageManager({
    prefix: 'hrms_',
    enableEncryption: process.env.NODE_ENV === 'production',
    defaultExpiration: 7 * 24 * 60 * 60 * 1000 // 7 days
});

// Convenience methods for common operations
export const storage = {
    // User preferences
    setUserPreference: (key, value) => storageManager.setLocal(`pref_${key}`, value),
    getUserPreference: (key, defaultValue) => storageManager.getLocal(`pref_${key}`, defaultValue),
    
    // Authentication tokens
    setAuthToken: (token, remember = false) => {
        if (remember) {
            return storageManager.setLocal('auth_token', token, { expiration: 30 * 24 * 60 * 60 * 1000 }); // 30 days
        } else {
            return storageManager.setSession('auth_token', token);
        }
    },
    getAuthToken: () => storageManager.getLocal('auth_token') || storageManager.getSession('auth_token'),
    removeAuthToken: () => {
        storageManager.removeLocal('auth_token');
        storageManager.removeSession('auth_token');
    },
    
    // Form data (temporary storage)
    setFormData: (formId, data) => storageManager.setSession(`form_${formId}`, data),
    getFormData: (formId) => storageManager.getSession(`form_${formId}`),
    removeFormData: (formId) => storageManager.removeSession(`form_${formId}`),
    
    // Cart data
    setCart: (cartData) => storageManager.setLocal('cart', cartData),
    getCart: () => storageManager.getLocal('cart', []),
    clearCart: () => storageManager.removeLocal('cart'),
    
    // Recent searches
    addRecentSearch: (searchTerm) => {
        const recent = storageManager.getLocal('recent_searches', []);
        const updated = [searchTerm, ...recent.filter(term => term !== searchTerm)].slice(0, 10);
        storageManager.setLocal('recent_searches', updated);
    },
    getRecentSearches: () => storageManager.getLocal('recent_searches', []),
    
    // Theme and UI settings
    setTheme: (theme) => storageManager.setLocal('theme', theme),
    getTheme: () => storageManager.getLocal('theme', 'light'),
    
    // Language preference
    setLanguage: (language) => storageManager.setLocal('language', language),
    getLanguage: () => storageManager.getLocal('language', 'en'),
    
    // Utility methods
    clear: (type) => storageManager.clear(type),
    getInfo: () => storageManager.getStorageInfo(),
    cleanup: () => storageManager.cleanupExpired(),
    export: () => storageManager.exportData()
};

export { StorageManager };
export default storageManager;
