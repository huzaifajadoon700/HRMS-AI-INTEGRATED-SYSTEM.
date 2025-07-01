/**
 * HRMS AI Integrated System - Custom React Hooks
 * Hotel and Restaurant Management System with AI-powered features
 *
 * @description Collection of reusable React hooks for common functionality
 * @version 1.0.0
 * @author HRMS Development Team
 * @created 2025-07-01
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Hook for managing local storage with React state
 * @param {string} key - Storage key
 * @param {*} initialValue - Initial value
 * @returns {Array} [value, setValue, removeValue]
 */
export const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    const removeValue = useCallback(() => {
        try {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    }, [key, initialValue]);

    return [storedValue, setValue, removeValue];
};

/**
 * Hook for debouncing values
 * @param {*} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {*} Debounced value
 */
export const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

/**
 * Hook for managing async operations
 * @param {Function} asyncFunction - Async function to execute
 * @returns {Object} { data, loading, error, execute }
 */
export const useAsync = (asyncFunction) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (...args) => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await asyncFunction(...args);
            setData(result);
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [asyncFunction]);

    return { data, loading, error, execute };
};

/**
 * Hook for API calls with caching
 * @param {string} url - API URL
 * @param {Object} options - Fetch options
 * @returns {Object} { data, loading, error, refetch }
 */
export const useApi = (url, options = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const cache = useRef(new Map());

    const fetchData = useCallback(async () => {
        // Check cache first
        const cacheKey = `${url}${JSON.stringify(options)}`;
        if (cache.current.has(cacheKey)) {
            const cachedData = cache.current.get(cacheKey);
            setData(cachedData);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            
            // Cache the result
            cache.current.set(cacheKey, result);
            setData(result);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [url, options]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refetch = useCallback(() => {
        const cacheKey = `${url}${JSON.stringify(options)}`;
        cache.current.delete(cacheKey);
        fetchData();
    }, [fetchData, url, options]);

    return { data, loading, error, refetch };
};

/**
 * Hook for managing form state
 * @param {Object} initialValues - Initial form values
 * @param {Function} validate - Validation function
 * @returns {Object} Form state and handlers
 */
export const useForm = (initialValues = {}, validate = null) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = useCallback((name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    }, [errors]);

    const handleBlur = useCallback((name) => {
        setTouched(prev => ({ ...prev, [name]: true }));
        
        if (validate) {
            const fieldErrors = validate({ ...values });
            if (fieldErrors[name]) {
                setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
            }
        }
    }, [values, validate]);

    const handleSubmit = useCallback(async (onSubmit) => {
        setIsSubmitting(true);
        
        // Mark all fields as touched
        const allTouched = {};
        Object.keys(values).forEach(key => {
            allTouched[key] = true;
        });
        setTouched(allTouched);

        // Validate all fields
        if (validate) {
            const validationErrors = validate(values);
            setErrors(validationErrors);
            
            if (Object.keys(validationErrors).length > 0) {
                setIsSubmitting(false);
                return;
            }
        }

        try {
            await onSubmit(values);
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    }, [values, validate]);

    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [initialValues]);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        reset
    };
};

/**
 * Hook for managing pagination
 * @param {Array} data - Data array
 * @param {number} itemsPerPage - Items per page
 * @returns {Object} Pagination state and controls
 */
export const usePagination = (data, itemsPerPage = 10) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = data.slice(startIndex, endIndex);

    const goToPage = useCallback((page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    }, [totalPages]);

    const nextPage = useCallback(() => {
        goToPage(currentPage + 1);
    }, [currentPage, goToPage]);

    const prevPage = useCallback(() => {
        goToPage(currentPage - 1);
    }, [currentPage, goToPage]);

    const reset = useCallback(() => {
        setCurrentPage(1);
    }, []);

    return {
        currentPage,
        totalPages,
        currentData,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
        goToPage,
        nextPage,
        prevPage,
        reset
    };
};

/**
 * Hook for detecting clicks outside an element
 * @param {Function} callback - Callback function
 * @returns {Object} Ref to attach to element
 */
export const useClickOutside = (callback) => {
    const ref = useRef();

    useEffect(() => {
        const handleClick = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                callback();
            }
        };

        document.addEventListener('mousedown', handleClick);
        return () => {
            document.removeEventListener('mousedown', handleClick);
        };
    }, [callback]);

    return ref;
};

/**
 * Hook for managing toggle state
 * @param {boolean} initialValue - Initial toggle value
 * @returns {Array} [value, toggle, setTrue, setFalse]
 */
export const useToggle = (initialValue = false) => {
    const [value, setValue] = useState(initialValue);

    const toggle = useCallback(() => {
        setValue(prev => !prev);
    }, []);

    const setTrue = useCallback(() => {
        setValue(true);
    }, []);

    const setFalse = useCallback(() => {
        setValue(false);
    }, []);

    return [value, toggle, setTrue, setFalse];
};

/**
 * Hook for managing window size
 * @returns {Object} { width, height, isMobile, isTablet, isDesktop }
 */
export const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowSize.width < 768;
    const isTablet = windowSize.width >= 768 && windowSize.width < 1024;
    const isDesktop = windowSize.width >= 1024;

    return {
        ...windowSize,
        isMobile,
        isTablet,
        isDesktop
    };
};

/**
 * Hook for managing previous value
 * @param {*} value - Current value
 * @returns {*} Previous value
 */
export const usePrevious = (value) => {
    const ref = useRef();
    
    useEffect(() => {
        ref.current = value;
    });
    
    return ref.current;
};

/**
 * Hook for managing array state
 * @param {Array} initialArray - Initial array
 * @returns {Object} Array state and manipulation functions
 */
export const useArray = (initialArray = []) => {
    const [array, setArray] = useState(initialArray);

    const push = useCallback((element) => {
        setArray(prev => [...prev, element]);
    }, []);

    const filter = useCallback((callback) => {
        setArray(prev => prev.filter(callback));
    }, []);

    const update = useCallback((index, newElement) => {
        setArray(prev => {
            const newArray = [...prev];
            newArray[index] = newElement;
            return newArray;
        });
    }, []);

    const remove = useCallback((index) => {
        setArray(prev => prev.filter((_, i) => i !== index));
    }, []);

    const clear = useCallback(() => {
        setArray([]);
    }, []);

    return {
        array,
        set: setArray,
        push,
        filter,
        update,
        remove,
        clear
    };
};

/**
 * Hook for managing search functionality
 * @param {Array} data - Data to search
 * @param {Array} searchFields - Fields to search in
 * @returns {Object} Search state and results
 */
export const useSearch = (data, searchFields = []) => {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const filteredData = useMemo(() => {
        if (!debouncedSearchTerm) return data;

        return data.filter(item => {
            return searchFields.some(field => {
                const value = item[field];
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
                }
                if (typeof value === 'number') {
                    return value.toString().includes(debouncedSearchTerm);
                }
                return false;
            });
        });
    }, [data, debouncedSearchTerm, searchFields]);

    const clearSearch = useCallback(() => {
        setSearchTerm('');
    }, []);

    return {
        searchTerm,
        setSearchTerm,
        filteredData,
        clearSearch,
        hasResults: filteredData.length > 0,
        resultCount: filteredData.length
    };
};

/**
 * Hook for managing sorting functionality
 * @param {Array} data - Data to sort
 * @param {string} defaultSortKey - Default sort key
 * @param {string} defaultSortOrder - Default sort order ('asc' or 'desc')
 * @returns {Object} Sort state and sorted data
 */
export const useSort = (data, defaultSortKey = null, defaultSortOrder = 'asc') => {
    const [sortKey, setSortKey] = useState(defaultSortKey);
    const [sortOrder, setSortOrder] = useState(defaultSortOrder);

    const sortedData = useMemo(() => {
        if (!sortKey) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            if (aValue < bValue) {
                return sortOrder === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortOrder === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [data, sortKey, sortOrder]);

    const handleSort = useCallback((key) => {
        if (sortKey === key) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    }, [sortKey]);

    const resetSort = useCallback(() => {
        setSortKey(defaultSortKey);
        setSortOrder(defaultSortOrder);
    }, [defaultSortKey, defaultSortOrder]);

    return {
        sortedData,
        sortKey,
        sortOrder,
        handleSort,
        resetSort
    };
};

/**
 * Hook for managing timer/countdown
 * @param {number} initialTime - Initial time in seconds
 * @param {Function} onComplete - Callback when timer completes
 * @returns {Object} Timer state and controls
 */
export const useTimer = (initialTime, onComplete = null) => {
    const [time, setTime] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef();

    const start = useCallback(() => {
        setIsRunning(true);
    }, []);

    const pause = useCallback(() => {
        setIsRunning(false);
    }, []);

    const reset = useCallback(() => {
        setTime(initialTime);
        setIsRunning(false);
    }, [initialTime]);

    useEffect(() => {
        if (isRunning && time > 0) {
            intervalRef.current = setInterval(() => {
                setTime(prev => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        if (onComplete) onComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isRunning, time, onComplete]);

    const formatTime = useCallback((seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    return {
        time,
        isRunning,
        formattedTime: formatTime(time),
        start,
        pause,
        reset
    };
};

/**
 * Hook for managing intersection observer
 * @param {Object} options - Intersection observer options
 * @returns {Array} [ref, isIntersecting]
 */
export const useIntersectionObserver = (options = {}) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, options);

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [options]);

    return [ref, isIntersecting];
};
