const HotelSettings = require('../Models/HotelSettings');

// Get hotel settings (public endpoint - no auth required)
const getHotelSettings = async (req, res) => {
  try {
    const settings = await HotelSettings.getSingleton();
    
    res.status(200).json({
      success: true,
      data: settings,
      message: 'Hotel settings retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching hotel settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hotel settings',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Update hotel settings (admin only)
const updateHotelSettings = async (req, res) => {
  try {
    const userId = req.user?.id;
    const updateData = req.body;

    // Validate required fields if provided
    if (updateData.contact?.email?.primary && !isValidEmail(updateData.contact.email.primary)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid primary email format',
        timestamp: new Date().toISOString()
      });
    }

    if (updateData.contact?.email?.support && !isValidEmail(updateData.contact.email.support)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid support email format',
        timestamp: new Date().toISOString()
      });
    }

    if (updateData.contact?.email?.reservations && !isValidEmail(updateData.contact.email.reservations)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reservations email format',
        timestamp: new Date().toISOString()
      });
    }

    // Update settings
    const updatedSettings = await HotelSettings.updateSingleton(updateData, userId);

    res.status(200).json({
      success: true,
      data: updatedSettings,
      message: 'Hotel settings updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating hotel settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update hotel settings',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Reset hotel settings to defaults (admin only)
const resetHotelSettings = async (req, res) => {
  try {
    const userId = req.user?.id;

    // Delete existing settings to trigger default creation
    await HotelSettings.deleteMany({});
    
    // Create new default settings
    const defaultSettings = new HotelSettings({});
    defaultSettings.settings.updatedBy = userId;
    await defaultSettings.save();

    res.status(200).json({
      success: true,
      data: defaultSettings,
      message: 'Hotel settings reset to defaults successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error resetting hotel settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset hotel settings',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Get hotel settings for public use (minimal data)
const getPublicHotelSettings = async (req, res) => {
  try {
    const settings = await HotelSettings.getSingleton();
    
    // Return only public-facing information
    const publicData = {
      hotelName: settings.hotelName,
      hotelSubtitle: settings.hotelSubtitle,
      description: settings.description,
      contact: {
        address: settings.contact.address,
        phone: {
          primary: settings.contact.phone.primary,
          secondary: settings.contact.phone.secondary,
          whatsapp: settings.contact.phone.whatsapp
        },
        email: {
          primary: settings.contact.email.primary,
          support: settings.contact.email.support,
          reservations: settings.contact.email.reservations
        },
        website: settings.contact.website
      },
      socialMedia: settings.socialMedia,
      business: {
        hours: settings.business.hours
      },
      statistics: settings.statistics,
      heroContent: settings.heroContent,
      services: settings.services,
      seo: settings.seo,
      // Include branding data for logos and colors
      branding: {
        logo: {
          primary: settings.branding?.logo?.primary || '',
          secondary: settings.branding?.logo?.secondary || '',
          loginLogo: settings.branding?.logo?.loginLogo || '',
          favicon: settings.branding?.logo?.favicon || ''
        },
        colors: {
          primary: settings.branding?.colors?.primary || '#64ffda',
          secondary: settings.branding?.colors?.secondary || '#0A192F',
          accent: settings.branding?.colors?.accent || '#ffffff'
        }
      }
    };

    console.log('Public settings branding data:', publicData.branding);

    res.status(200).json({
      success: true,
      data: publicData,
      message: 'Public hotel settings retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching public hotel settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public hotel settings',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Bulk update specific sections
const updateHotelSection = async (req, res) => {
  try {
    const { section } = req.params;
    const userId = req.user?.id;
    const updateData = req.body;

    const validSections = ['contact', 'socialMedia', 'business', 'statistics', 'heroContent', 'services', 'seo'];
    
    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: `Invalid section. Valid sections are: ${validSections.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    // Prepare update object
    const sectionUpdate = {
      [section]: updateData
    };

    const updatedSettings = await HotelSettings.updateSingleton(sectionUpdate, userId);

    res.status(200).json({
      success: true,
      data: updatedSettings,
      message: `Hotel ${section} updated successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error updating hotel ${req.params.section}:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to update hotel ${req.params.section}`,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Get settings metadata (admin only)
const getHotelSettingsMetadata = async (req, res) => {
  try {
    const settings = await HotelSettings.getSingleton().populate('settings.updatedBy', 'name email');
    
    const metadata = {
      lastUpdated: settings.settings.lastUpdated,
      updatedBy: settings.settings.updatedBy,
      isActive: settings.settings.isActive,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
      totalServices: settings.services.length,
      hasAllContactInfo: !!(
        settings.contact.address.fullAddress &&
        settings.contact.phone.primary &&
        settings.contact.email.primary
      )
    };

    res.status(200).json({
      success: true,
      data: metadata,
      message: 'Hotel settings metadata retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching hotel settings metadata:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hotel settings metadata',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Helper function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Upload logo endpoint
const uploadLogo = async (req, res) => {
  try {
    const { logoType } = req.body; // 'primary', 'secondary', 'loginLogo', 'favicon'
    const userId = req.user?.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No logo file provided',
        timestamp: new Date().toISOString()
      });
    }

    const validLogoTypes = ['primary', 'secondary', 'loginLogo', 'favicon'];
    if (!logoType || !validLogoTypes.includes(logoType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid logo type. Valid types are: ${validLogoTypes.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    // Handle logo upload - PRODUCTION HACK using base64 data URLs
    let logoUrl = null;

    if (req.file.filename) {
      // Disk storage (development)
      logoUrl = `/uploads/${req.file.filename}`;
      console.log('Development logo upload - saved to disk:', logoUrl);
    } else if (req.file.buffer) {
      // Production hack: Convert to base64 data URL
      const base64Data = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;
      logoUrl = `data:${mimeType};base64,${base64Data}`;

      console.log('Production logo upload - converted to base64 data URL');
      console.log('File size:', req.file.size, 'bytes');

      // Optional: Warn if file is too large (>1MB)
      if (req.file.size > 1024 * 1024) {
        console.warn('Large file detected. Consider using external image hosting for better performance.');
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'File processing failed. Please try again.',
        timestamp: new Date().toISOString()
      });
    }

    // Update hotel settings with new logo URL
    const settings = await HotelSettings.getSingleton();
    if (!settings.branding) {
      settings.branding = { logo: {}, colors: {}, fonts: {} };
    }
    if (!settings.branding.logo) {
      settings.branding.logo = {};
    }

    settings.branding.logo[logoType] = logoUrl;
    settings.settings.lastUpdated = new Date();
    if (userId) {
      settings.settings.updatedBy = userId;
    }

    console.log(`Saving logo to database: ${logoType} = ${logoUrl.substring(0, 50)}...`);
    await settings.save();

    // Verify the save worked
    const verifySettings = await HotelSettings.getSingleton();
    console.log(`Verification - Logo saved: ${logoType} = ${verifySettings.branding?.logo?.[logoType] ? 'YES' : 'NO'}`);

    res.status(200).json({
      success: true,
      data: {
        logoType,
        logoUrl,
        branding: settings.branding
      },
      message: `${logoType} logo uploaded successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload logo',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Update branding settings (including logo URLs)
const updateBrandingSettings = async (req, res) => {
  try {
    const userId = req.user?.id;
    const brandingData = req.body;

    // Validate branding data structure
    const allowedFields = ['logo', 'colors', 'fonts'];
    const updateData = {};

    allowedFields.forEach(field => {
      if (brandingData[field]) {
        updateData[field] = brandingData[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid branding data provided',
        timestamp: new Date().toISOString()
      });
    }

    // Update settings
    const settings = await HotelSettings.getSingleton();
    if (!settings.branding) {
      settings.branding = { logo: {}, colors: {}, fonts: {} };
    }

    // Merge the branding data
    Object.keys(updateData).forEach(key => {
      if (updateData[key]) {
        settings.branding[key] = { ...settings.branding[key], ...updateData[key] };
      }
    });

    settings.settings.lastUpdated = new Date();
    if (userId) {
      settings.settings.updatedBy = userId;
    }

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings.branding,
      message: 'Branding settings updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating branding settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update branding settings',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  getHotelSettings,
  updateHotelSettings,
  resetHotelSettings,
  getPublicHotelSettings,
  updateHotelSection,
  getHotelSettingsMetadata,
  uploadLogo,
  updateBrandingSettings
};
