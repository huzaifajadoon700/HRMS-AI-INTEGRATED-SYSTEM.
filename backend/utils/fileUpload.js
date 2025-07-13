// File upload helpers for secure file handling. No business logic is present in this file.
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

/**
 * File upload utilities for HRMS application
 * Provides secure file upload handling with validation and storage management
 */

/**
 * Allowed file types for different upload categories
 */
const ALLOWED_FILE_TYPES = {
  images: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  documents: {
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    extensions: ['.pdf', '.doc', '.docx'],
    maxSize: 10 * 1024 * 1024 // 10MB
  },
  spreadsheets: {
    mimeTypes: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    extensions: ['.xls', '.xlsx'],
    maxSize: 10 * 1024 * 1024 // 10MB
  }
};

/**
 * Generate unique filename
 * @param {string} originalName - Original filename
 * @returns {string} Unique filename
 */
const generateUniqueFilename = (originalName) => {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  return `${timestamp}-${randomString}${ext}`;
};

/**
 * Ensure upload directory exists
 * @param {string} uploadPath - Upload directory path
 */
const ensureUploadDir = (uploadPath) => {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
};

/**
 * Validate file type and size
 * @param {Object} file - Multer file object
 * @param {string} category - File category (images, documents, etc.)
 * @returns {Object} Validation result
 */
const validateFile = (file, category = 'images') => {
  const allowedTypes = ALLOWED_FILE_TYPES[category];
  
  if (!allowedTypes) {
    return {
      isValid: false,
      error: `Unknown file category: ${category}`
    };
  }
  
  // Check MIME type
  if (!allowedTypes.mimeTypes.includes(file.mimetype)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.mimeTypes.join(', ')}`
    };
  }
  
  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedTypes.extensions.includes(ext)) {
    return {
      isValid: false,
      error: `Invalid file extension. Allowed extensions: ${allowedTypes.extensions.join(', ')}`
    };
  }
  
  // Check file size
  if (file.size > allowedTypes.maxSize) {
    const maxSizeMB = allowedTypes.maxSize / (1024 * 1024);
    return {
      isValid: false,
      error: `File too large. Maximum size: ${maxSizeMB}MB`
    };
  }
  
  return { isValid: true };
};

/**
 * Create multer storage configuration
 * @param {string} uploadPath - Upload directory path
 * @param {string} category - File category
 * @returns {Object} Multer storage configuration
 */
const createStorage = (uploadPath, category = 'images') => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const fullPath = path.join(uploadPath, category);
      ensureUploadDir(fullPath);
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      const uniqueName = generateUniqueFilename(file.originalname);
      cb(null, uniqueName);
    }
  });
};

/**
 * Create multer upload middleware
 * @param {Object} options - Upload options
 * @returns {Object} Multer upload middleware
 */
const createUploadMiddleware = (options = {}) => {
  const {
    uploadPath = './uploads',
    category = 'images',
    maxFiles = 1,
    fieldName = 'file'
  } = options;
  
  const storage = createStorage(uploadPath, category);
  
  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      const validation = validateFile(file, category);
      if (validation.isValid) {
        cb(null, true);
      } else {
        cb(new Error(validation.error), false);
      }
    },
    limits: {
      fileSize: ALLOWED_FILE_TYPES[category]?.maxSize || 5 * 1024 * 1024,
      files: maxFiles
    }
  });
  
  return maxFiles === 1 ? upload.single(fieldName) : upload.array(fieldName, maxFiles);
};

/**
 * Delete file from filesystem
 * @param {string} filePath - Path to file to delete
 * @returns {Promise<boolean>} Success status
 */
const deleteFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Get file information
 * @param {string} filePath - Path to file
 * @returns {Object} File information
 */
const getFileInfo = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const stats = fs.statSync(filePath);
    const ext = path.extname(filePath);
    
    return {
      path: filePath,
      size: stats.size,
      extension: ext,
      mimeType: getMimeType(ext),
      created: stats.birthtime,
      modified: stats.mtime,
      sizeFormatted: formatFileSize(stats.size)
    };
  } catch (error) {
    console.error('Error getting file info:', error);
    return null;
  }
};

/**
 * Get MIME type from file extension
 * @param {string} extension - File extension
 * @returns {string} MIME type
 */
const getMimeType = (extension) => {
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  };
  
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Clean up old files (older than specified days)
 * @param {string} directory - Directory to clean
 * @param {number} maxAgeDays - Maximum age in days
 * @returns {Promise<number>} Number of files deleted
 */
const cleanupOldFiles = async (directory, maxAgeDays = 30) => {
  try {
    if (!fs.existsSync(directory)) {
      return 0;
    }
    
    const files = await fs.promises.readdir(directory);
    const maxAge = maxAgeDays * 24 * 60 * 60 * 1000; // Convert to milliseconds
    const now = Date.now();
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.promises.stat(filePath);
      
      if (stats.isFile() && (now - stats.mtime.getTime()) > maxAge) {
        await fs.promises.unlink(filePath);
        deletedCount++;
      }
    }
    
    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up old files:', error);
    return 0;
  }
};

/**
 * Get directory size
 * @param {string} directory - Directory path
 * @returns {Promise<number>} Directory size in bytes
 */
const getDirectorySize = async (directory) => {
  try {
    if (!fs.existsSync(directory)) {
      return 0;
    }
    
    const files = await fs.promises.readdir(directory);
    let totalSize = 0;
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.promises.stat(filePath);
      
      if (stats.isFile()) {
        totalSize += stats.size;
      } else if (stats.isDirectory()) {
        totalSize += await getDirectorySize(filePath);
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('Error calculating directory size:', error);
    return 0;
  }
};

module.exports = {
  ALLOWED_FILE_TYPES,
  generateUniqueFilename,
  ensureUploadDir,
  validateFile,
  createStorage,
  createUploadMiddleware,
  deleteFile,
  getFileInfo,
  getMimeType,
  formatFileSize,
  cleanupOldFiles,
  getDirectorySize
};
