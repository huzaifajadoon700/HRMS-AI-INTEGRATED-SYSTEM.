const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const HotelSettings = require('../Models/HotelSettings');
const { connectDB } = require('../Models/db');

// Default hotel settings data
const defaultHotelData = {
  hotelName: 'Hotel Royal',
  hotelSubtitle: 'Luxury & Comfort Experience',
  description: 'Experience luxury and comfort with our world-class hospitality services. Located in the heart of Lahore, we offer premium accommodations, fine dining, and exceptional service.',
  
  contact: {
    address: {
      street: '123 Luxury Street',
      city: 'Lahore',
      country: 'Pakistan',
      fullAddress: '123 Luxury Street, Lahore, Pakistan'
    },
    phone: {
      primary: '+92 336 945 769',
      secondary: '+92 123 456 7890',
      whatsapp: '+92 336 945 769'
    },
    email: {
      primary: 'info@hotelroyal.com',
      support: 'support@hotelroyal.com',
      reservations: 'reservations@hotelroyal.com'
    },
    website: 'https://hotelroyal.com'
  },

  socialMedia: {
    facebook: 'https://facebook.com/hotelroyal',
    twitter: 'https://twitter.com/hotelroyal',
    instagram: 'https://instagram.com/hotelroyal',
    linkedin: 'https://linkedin.com/company/hotelroyal',
    youtube: 'https://youtube.com/hotelroyal'
  },

  business: {
    hours: '24/7 Available',
    established: '2020',
    license: 'HL-2024-001'
  },

  statistics: {
    totalRooms: 150,
    totalStaff: 85,
    totalClients: 2500,
    yearsOfService: 5
  },

  heroContent: {
    mainTitle: 'Luxury Hotel Experience',
    subtitle: 'WELCOME TO LUXURY',
    description: 'Premium accommodations with world-class hospitality and Pakistani heritage'
  },

  services: [
    {
      name: 'Fine Dining',
      description: 'Experience exquisite cuisine prepared by world-class chefs using the finest ingredients',
      icon: 'FaUtensils'
    },
    {
      name: 'Luxury Rooms',
      description: 'Comfortable and elegant accommodations with modern amenities',
      icon: 'FaHotel'
    },
    {
      name: 'Spa & Wellness',
      description: 'Relax and rejuvenate with our premium spa and wellness services',
      icon: 'FaSpa'
    },
    {
      name: 'Event Hosting',
      description: 'Perfect venues for weddings, conferences, and special occasions',
      icon: 'FaCalendarAlt'
    },
    {
      name: 'Concierge Service',
      description: '24/7 personalized assistance for all your needs and requests',
      icon: 'FaConciergeBell'
    },
    {
      name: 'Free WiFi',
      description: 'High-speed internet access throughout the entire property',
      icon: 'FaWifi'
    }
  ],

  seo: {
    metaTitle: 'Hotel Royal - Luxury Hotel & Restaurant in Lahore, Pakistan',
    metaDescription: 'Experience luxury and comfort at Hotel Royal Lahore. Premium rooms, fine dining, spa services, and exceptional hospitality in the heart of Pakistan.',
    keywords: 'hotel lahore, luxury hotel pakistan, restaurant lahore, accommodation booking, spa services, event venue'
  },

  settings: {
    isActive: true,
    lastUpdated: new Date()
  }
};

// Seeder function
const seedHotelSettings = async () => {
  try {
    console.log('🌱 Starting Hotel Settings Seeder...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Check if settings already exist
    const existingSettings = await HotelSettings.findOne();
    
    if (existingSettings) {
      console.log('⚠️ Hotel settings already exist');
      console.log('🏨 Current Hotel Name:', existingSettings.hotelName);
      console.log('📧 Current Email:', existingSettings.contact.email.primary);
      
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise((resolve) => {
        rl.question('Do you want to overwrite existing settings? (y/N): ', resolve);
      });
      
      rl.close();
      
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log('❌ Seeding cancelled by user');
        process.exit(0);
      }
      
      // Delete existing settings
      await HotelSettings.deleteMany({});
      console.log('🗑️ Existing settings deleted');
    }

    // Create new settings
    const newSettings = new HotelSettings(defaultHotelData);
    await newSettings.save();
    
    console.log('✅ Hotel settings seeded successfully!');
    console.log('📊 Seeded Data Summary:');
    console.log(`   🏨 Hotel Name: ${newSettings.hotelName}`);
    console.log(`   📧 Primary Email: ${newSettings.contact.email.primary}`);
    console.log(`   📱 Primary Phone: ${newSettings.contact.phone.primary}`);
    console.log(`   🏢 Address: ${newSettings.contact.address.fullAddress}`);
    console.log(`   🔗 Services: ${newSettings.services.length} services added`);
    console.log(`   📊 Statistics: ${newSettings.statistics.totalRooms} rooms, ${newSettings.statistics.totalStaff} staff`);
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Test the API endpoints using: node test-hotel-settings.js');
    console.log('   2. Access public settings: GET /api/hotel-settings/public');
    console.log('   3. Admin can manage settings via: /api/hotel-settings (requires auth)');
    
  } catch (error) {
    console.error('❌ Error seeding hotel settings:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedHotelSettings();
}

module.exports = { seedHotelSettings, defaultHotelData };
