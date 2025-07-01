const mongoose = require('mongoose');
const HotelSettings = require('../Models/HotelSettings');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://mhuzaifatariq7:zqdaRL05TfaNgD8x@cluster0.kyswp.mongodb.net/hrms?retryWrites=true&w=majority';

async function fixContactFields() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Get the current settings
    const settings = await HotelSettings.findOne();
    if (!settings) {
      console.log('❌ No hotel settings found');
      return;
    }

    console.log('📋 Current contact structure:', JSON.stringify(settings.contact, null, 2));

    // Ensure all contact fields exist
    if (!settings.contact.phone.secondary) {
      settings.contact.phone.secondary = '+92 123 456 7890';
      console.log('✅ Added secondary phone');
    }

    if (!settings.contact.email.support) {
      settings.contact.email.support = 'support@hotelroyal.com';
      console.log('✅ Added support email');
    }

    if (!settings.contact.email.reservations) {
      settings.contact.email.reservations = 'reservations@hotelroyal.com';
      console.log('✅ Added reservations email');
    }

    if (!settings.contact.website) {
      settings.contact.website = 'https://hotelroyal.com';
      console.log('✅ Added website');
    }

    // Save the updated settings
    await settings.save();
    console.log('✅ Contact fields updated successfully');

    console.log('📋 Updated contact structure:', JSON.stringify(settings.contact, null, 2));

  } catch (error) {
    console.error('❌ Error fixing contact fields:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the fix
fixContactFields();
