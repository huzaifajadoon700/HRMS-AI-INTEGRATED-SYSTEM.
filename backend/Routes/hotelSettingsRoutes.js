const express = require('express');
const router = express.Router();
const upload = require('../Middlewares/uploadpic');
const {
  getHotelSettings,
  updateHotelSettings,
  resetHotelSettings,
  getPublicHotelSettings,
  updateHotelSection,
  getHotelSettingsMetadata,
  uploadLogo,
  updateBrandingSettings
} = require('../Controllers/hotelSettingsController');
const { ensureAuthenticated, ensureAdmin } = require('../Middlewares/Auth');

// Public routes (no authentication required)
router.get('/public', getPublicHotelSettings);

// Admin routes (authentication + admin role required)
router.use(ensureAuthenticated);
router.use(ensureAdmin);

// Get all hotel settings (admin only)
router.get('/', getHotelSettings);

// Update hotel settings (admin only)
router.put('/', updateHotelSettings);

// Logo upload endpoints (admin only)
router.post('/upload-logo', upload.single('logo'), uploadLogo);

// Update branding settings with logo URLs (admin only)
router.put('/branding', updateBrandingSettings);

// Reset hotel settings to defaults (admin only)
router.post('/reset', resetHotelSettings);

// Update specific section (admin only)
router.put('/section/:section', updateHotelSection);

// Get settings metadata (admin only)
router.get('/metadata', getHotelSettingsMetadata);

module.exports = router;
