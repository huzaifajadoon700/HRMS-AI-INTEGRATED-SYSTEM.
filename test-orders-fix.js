const axios = require('axios');

const API_BASE_URL = 'https://hrms-bace.vercel.app/api';

async function testOrdersFix() {
  console.log('🔍 Testing Orders Fix (Admin-Only Access)...\n');

  try {
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('https://hrms-bace.vercel.app/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const adminToken = loginResponse.data.jwtToken;
    const userInfo = {
      name: loginResponse.data.name,
      role: loginResponse.data.role,
      email: loginResponse.data.email,
      isAdmin: loginResponse.data.isAdmin
    };
    
    console.log('✅ Admin login successful');
    console.log('👤 User info:', userInfo);

    const headers = {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Test Orders (should now work like bookings)
    console.log('\n2. Testing Orders endpoint (admin-only)...');
    try {
      const ordersResponse = await axios.get(`${API_BASE_URL}/orders`, { 
        headers,
        timeout: 30000
      });
      
      console.log('✅ Orders request successful!');
      console.log('📊 Response status:', ordersResponse.status);
      console.log('📊 Response data type:', typeof ordersResponse.data);
      console.log('📊 Response data keys:', Object.keys(ordersResponse.data || {}));
      
      if (ordersResponse.data && ordersResponse.data.orders) {
        console.log('✅ Found orders array:', ordersResponse.data.orders.length, 'items');
        if (ordersResponse.data.pagination) {
          console.log('📄 Pagination:', ordersResponse.data.pagination);
        }
        if (ordersResponse.data.orders.length > 0) {
          console.log('📋 Sample order:', {
            id: ordersResponse.data.orders[0]._id,
            user: ordersResponse.data.orders[0].user?.name || 'No user',
            status: ordersResponse.data.orders[0].status,
            totalPrice: ordersResponse.data.orders[0].totalPrice
          });
        }
      } else if (Array.isArray(ordersResponse.data)) {
        console.log('✅ Found orders array (direct):', ordersResponse.data.length, 'items');
      } else {
        console.log('❌ Unexpected response format');
        console.log('📋 Response:', ordersResponse.data);
      }
      
    } catch (error) {
      console.log('❌ Orders request failed');
      console.log('📊 Error status:', error.response?.status);
      console.log('📊 Error message:', error.response?.data?.message);
      console.log('📊 Error details:', error.response?.data);
    }

    // Step 3: Compare with working Bookings
    console.log('\n3. Testing Bookings (for comparison)...');
    try {
      const bookingsResponse = await axios.get(`${API_BASE_URL}/bookings`, { headers });
      console.log('✅ Bookings work:', bookingsResponse.data.length, 'items');
    } catch (error) {
      console.log('❌ Bookings failed:', error.response?.status, error.response?.data);
    }

    // Step 4: Test Reservations (for comparison)
    console.log('\n4. Testing Reservations (for comparison)...');
    try {
      const reservationsResponse = await axios.get(`${API_BASE_URL}/reservations`, { headers });
      console.log('✅ Reservations work:', reservationsResponse.data.length, 'items');
    } catch (error) {
      console.log('❌ Reservations failed:', error.response?.status, error.response?.data);
    }

    console.log('\n🎯 Fix Test Summary:');
    console.log('- Orders now use admin-only access like bookings');
    console.log('- Simplified controller logic removes user-specific filtering');
    console.log('- Should work consistently with other admin endpoints');

  } catch (error) {
    console.error('💥 Login failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testOrdersFix();
}

module.exports = { testOrdersFix };
