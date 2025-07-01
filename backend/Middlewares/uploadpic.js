const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists (handle serverless environment)
const uploadsDir = path.join(__dirname, '..', 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (error) {
  console.warn('Cannot create uploads directory in serverless environment:', error.message);
  // In serverless, we'll use memory storage instead
}

// Set storage engine (use memory storage for serverless)
const storage = process.env.NODE_ENV === 'production'
  ? multer.memoryStorage() // Use memory storage in production/serverless
  : multer.diskStorage({
      destination: (req, file, cb) => {
          cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
          // Create a unique filename
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, uniqueSuffix + path.extname(file.originalname));
      },
  });

// File type validation
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, or GIF files are allowed'), false);
    }
};

// Initializing multer
const upload = multer({
    storage,
    limits: { 
        fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
    },
    fileFilter,
});

module.exports = upload;