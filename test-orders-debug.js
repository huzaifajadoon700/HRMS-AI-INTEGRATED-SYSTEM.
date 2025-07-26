const axios = require('axios');

const API_BASE_URL = 'https://hrms-bace.vercel.app/api';

async function testOrdersDebug() {
  console.log('🔍 Testing Orders Debug Route...\n');

  try {
    // Test the debug route (no auth required)
    console.log('1. Testing orders debug route...');
    try {
      const debugResponse = await axios.get(`${API_BASE_URL}/orders/debug`);
      console.log('✅ Orders debug route works!');
      console.log('📋 Response:', debugResponse.data);
    } catch (error) {
      console.log('❌ Orders debug route failed:', error.response?.status, error.response?.data);
    }

    // Test the main orders route with auth
    console.log('\n2. Testing main orders route with auth...');
    try {
      // Login first
      const loginResponse = await axios.post('https://hrms-bace.vercel.app/auth/login', {
        email: 'admin@example.com',
        password: 'admin123'
      });
      
      const token = loginResponse.data.jwtToken;
      console.log('✅ Login successful');

      // Test orders endpoint
      const ordersResponse = await axios.get(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Orders endpoint works!');
      console.log('📋 Response type:', typeof ordersResponse.data);
      console.log('📋 Response keys:', Object.keys(ordersResponse.data || {}));
      
      if (ordersResponse.data && ordersResponse.data.orders) {
        console.log('📋 Orders found:', ordersResponse.data.orders.length);
      } else if (Array.isArray(ordersResponse.data)) {
        console.log('📋 Orders found:', ordersResponse.data.length);
      }
      
    } catch (error) {
      console.log('❌ Main orders route failed:', error.response?.status);
      console.log('📋 Error details:', error.response?.data);
    }

    console.log('\n🎯 Debug Summary:');
    console.log('- If debug route works but main route fails: Authentication or controller issue');
    console.log('- If both fail: Route not loaded in deployment');
    console.log('- If both work: Frontend issue');

  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testOrdersDebug();
}

module.exports = { testOrdersDebug };
