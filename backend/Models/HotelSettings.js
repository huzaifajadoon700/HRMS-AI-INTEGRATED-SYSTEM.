const mongoose = require('mongoose');

// Hotel Settings Schema for centralized branding and contact management
const hotelSettingsSchema = new mongoose.Schema({
  // Basic Hotel Information
  hotelName: {
    type: String,
    required: true,
    default: 'Hotel Royal',
    trim: true,
    maxlength: 100
  },
  hotelSubtitle: {
    type: String,
    default: 'Luxury & Comfort Experience',
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    default: 'Experience luxury and comfort with our world-class hospitality services.',
    trim: true,
    maxlength: 1000
  },
  
  // Contact Information
  contact: {
    address: {
      street: {
        type: String,
        default: '123 Luxury Street',
        trim: true
      },
      city: {
        type: String,
        default: 'Lahore',
        trim: true
      },
      country: {
        type: String,
        default: 'Pakistan',
        trim: true
      },
      fullAddress: {
        type: String,
        default: '123 Luxury Street, Lahore, Pakistan',
        trim: true
      }
    },
    phone: {
      primary: {
        type: String,
        default: '+92 336 945 769',
        trim: true
      },
      secondary: {
        type: String,
        default: '+92 123 456 7890',
        trim: true
      },
      whatsapp: {
        type: String,
        default: '+92 336 945 769',
        trim: true
      }
    },
    email: {
      primary: {
        type: String,
        default: 'info@hotelroyal.com',
        trim: true,
        lowercase: true
      },
      support: {
        type: String,
        default: 'support@hotelroyal.com',
        trim: true,
        lowercase: true
      },
      reservations: {
        type: String,
        default: 'reservations@hotelroyal.com',
        trim: true,
        lowercase: true
      }
    },
    website: {
      type: String,
      default: 'https://hotelroyal.com',
      trim: true
    }
  },

  // Social Media Links
  socialMedia: {
    facebook: {
      type: String,
      default: 'https://facebook.com/hotelroyal',
      trim: true
    },
    twitter: {
      type: String,
      default: 'https://twitter.com/hotelroyal',
      trim: true
    },
    instagram: {
      type: String,
      default: 'https://instagram.com/hotelroyal',
      trim: true
    },
    linkedin: {
      type: String,
      default: 'https://linkedin.com/company/hotelroyal',
      trim: true
    },
    youtube: {
      type: String,
      default: 'https://youtube.com/hotelroyal',
      trim: true
    }
  },

  // Business Information
  business: {
    hours: {
      type: String,
      default: '24/7 Available',
      trim: true
    },
    established: {
      type: String,
      default: '2020',
      trim: true
    },
    license: {
      type: String,
      default: 'HL-2024-001',
      trim: true
    }
  },

  // Statistics for About/Home page
  statistics: {
    totalRooms: {
      type: Number,
      default: 150,
      min: 0
    },
    totalStaff: {
      type: Number,
      default: 85,
      min: 0
    },
    totalClients: {
      type: Number,
      default: 2500,
      min: 0
    },
    yearsOfService: {
      type: Number,
      default: 5,
      min: 0
    }
  },

  // Hero/Carousel Content
  heroContent: {
    mainTitle: {
      type: String,
      default: 'Luxury Hotel Experience',
      trim: true
    },
    subtitle: {
      type: String,
      default: 'WELCOME TO LUXURY',
      trim: true
    },
    description: {
      type: String,
      default: 'Premium accommodations with world-class hospitality',
      trim: true
    }
  },

  // Services List
  services: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    icon: {
      type: String,
      trim: true
    }
  }],

  // SEO and Meta Information
  seo: {
    metaTitle: {
      type: String,
      default: 'Hotel Royal - Luxury Hotel & Restaurant',
      trim: true
    },
    metaDescription: {
      type: String,
      default: 'Experience luxury and comfort at Hotel Royal. Premium rooms, fine dining, and exceptional service.',
      trim: true
    },
    keywords: {
      type: String,
      default: 'hotel, luxury, restaurant, accommodation, booking',
      trim: true
    }
  },

  // System Settings
  settings: {
    isActive: {
      type: Boolean,
      default: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

// Default services data
hotelSettingsSchema.pre('save', function(next) {
  if (this.services.length === 0) {
    this.services = [
      {
        name: 'Fine Dining',
        description: 'Experience exquisite cuisine prepared by world-class chefs',
        icon: 'FaUtensils'
      },
      {
        name: 'Luxury Rooms',
        description: 'Comfortable and elegant accommodations',
        icon: 'FaHotel'
      },
      {
        name: 'Spa & Wellness',
        description: 'Relax and rejuvenate with our premium spa services',
        icon: 'FaSpa'
      },
      {
        name: 'Event Hosting',
        description: 'Perfect venues for your special occasions',
        icon: 'FaCalendarAlt'
      },
      {
        name: 'Concierge Service',
        description: '24/7 personalized assistance for all your needs',
        icon: 'FaConciergeBell'
      },
      {
        name: 'Free WiFi',
        description: 'High-speed internet access throughout the property',
        icon: 'FaWifi'
      }
    ];
  }
  next();
});

// Ensure only one settings document exists
hotelSettingsSchema.statics.getSingleton = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this({});
    await settings.save();
  }
  return settings;
};

// Update singleton settings
hotelSettingsSchema.statics.updateSingleton = async function(updateData, userId) {
  let settings = await this.getSingleton();
  
  // Update the settings
  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined) {
      settings[key] = updateData[key];
    }
  });
  
  // Set metadata
  settings.settings.lastUpdated = new Date();
  if (userId) {
    settings.settings.updatedBy = userId;
  }
  
  await settings.save();
  return settings;
};

const HotelSettings = mongoose.model('HotelSettings', hotelSettingsSchema);

module.exports = HotelSettings;
