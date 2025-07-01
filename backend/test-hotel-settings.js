const axios = require('axios');

// Test configuration
const API_BASE_URL = process.env.API_BASE_URL || 'https://hrms-bace.vercel.app/api';
const TEST_ADMIN_EMAIL = 'admin@hrms.com';
const TEST_ADMIN_PASSWORD = 'admin123';

let authToken = null;

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
};

// Test functions
const testHealthCheck = async () => {
  console.log('\n🔍 Testing Health Check...');
  const result = await makeRequest('GET', '/health');
  
  if (result.success) {
    console.log('✅ Health check passed');
    console.log('📊 Status:', result.data.status);
  } else {
    console.log('❌ Health check failed:', result.error);
  }
  
  return result.success;
};

const testAdminLogin = async () => {
  console.log('\n🔐 Testing Admin Login...');
  const result = await makeRequest('POST', '/auth/login', {
    email: TEST_ADMIN_EMAIL,
    password: TEST_ADMIN_PASSWORD
  });
  
  if (result.success && result.data.token) {
    authToken = result.data.token;
    console.log('✅ Admin login successful');
    console.log('🎫 Token received');
  } else {
    console.log('❌ Admin login failed:', result.error);
  }
  
  return result.success;
};

const testPublicHotelSettings = async () => {
  console.log('\n🏨 Testing Public Hotel Settings (No Auth)...');
  const result = await makeRequest('GET', '/hotel-settings/public');
  
  if (result.success) {
    console.log('✅ Public hotel settings retrieved');
    console.log('🏨 Hotel Name:', result.data.data.hotelName);
    console.log('📧 Contact Email:', result.data.data.contact.email.primary);
    console.log('📱 Phone:', result.data.data.contact.phone.primary);
  } else {
    console.log('❌ Public hotel settings failed:', result.error);
  }
  
  return result.success;
};

const testAdminHotelSettings = async () => {
  console.log('\n🔒 Testing Admin Hotel Settings (Auth Required)...');
  const result = await makeRequest('GET', '/hotel-settings');
  
  if (result.success) {
    console.log('✅ Admin hotel settings retrieved');
    console.log('🏨 Hotel Name:', result.data.data.hotelName);
    console.log('📊 Total Services:', result.data.data.services.length);
    console.log('⏰ Last Updated:', result.data.data.settings.lastUpdated);
  } else {
    console.log('❌ Admin hotel settings failed:', result.error);
  }
  
  return result.success;
};

const testUpdateHotelSettings = async () => {
  console.log('\n✏️ Testing Hotel Settings Update...');
  
  const updateData = {
    hotelName: 'Hotel Royal - Test Update',
    hotelSubtitle: 'Updated via API Test',
    contact: {
      phone: {
        primary: '+92 300 123 4567'
      }
    }
  };
  
  const result = await makeRequest('PUT', '/hotel-settings', updateData);
  
  if (result.success) {
    console.log('✅ Hotel settings updated successfully');
    console.log('🏨 New Hotel Name:', result.data.data.hotelName);
    console.log('📱 New Phone:', result.data.data.contact.phone.primary);
  } else {
    console.log('❌ Hotel settings update failed:', result.error);
  }
  
  return result.success;
};

const testSectionUpdate = async () => {
  console.log('\n📝 Testing Section Update...');
  
  const sectionData = {
    facebook: 'https://facebook.com/hotelroyal-updated',
    instagram: 'https://instagram.com/hotelroyal-updated'
  };
  
  const result = await makeRequest('PUT', '/hotel-settings/section/socialMedia', sectionData);
  
  if (result.success) {
    console.log('✅ Social media section updated successfully');
    console.log('📘 Facebook:', result.data.data.socialMedia.facebook);
    console.log('📷 Instagram:', result.data.data.socialMedia.instagram);
  } else {
    console.log('❌ Section update failed:', result.error);
  }
  
  return result.success;
};

const testMetadata = async () => {
  console.log('\n📊 Testing Settings Metadata...');
  const result = await makeRequest('GET', '/hotel-settings/metadata');
  
  if (result.success) {
    console.log('✅ Metadata retrieved successfully');
    console.log('⏰ Last Updated:', result.data.data.lastUpdated);
    console.log('🔢 Total Services:', result.data.data.totalServices);
    console.log('✅ Has Contact Info:', result.data.data.hasAllContactInfo);
  } else {
    console.log('❌ Metadata retrieval failed:', result.error);
  }
  
  return result.success;
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Hotel Settings API Tests');
  console.log('🔗 API Base URL:', API_BASE_URL);
  
  const results = {
    healthCheck: false,
    adminLogin: false,
    publicSettings: false,
    adminSettings: false,
    updateSettings: false,
    sectionUpdate: false,
    metadata: false
  };
  
  // Run tests in sequence
  results.healthCheck = await testHealthCheck();
  results.adminLogin = await testAdminLogin();
  results.publicSettings = await testPublicHotelSettings();
  
  if (results.adminLogin) {
    results.adminSettings = await testAdminHotelSettings();
    results.updateSettings = await testUpdateHotelSettings();
    results.sectionUpdate = await testSectionUpdate();
    results.metadata = await testMetadata();
  }
  
  // Summary
  console.log('\n📋 TEST SUMMARY');
  console.log('================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! Hotel Settings API is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above for details.');
  }
};

// Run the tests
runTests().catch(console.error);
