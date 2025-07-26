const axios = require('axios');

const API_BASE_URL = 'https://hrms-bace.vercel.app/api';

async function testOrdersFinal() {
  console.log('🔍 Testing Orders Final Fix...\n');

  try {
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('https://hrms-bace.vercel.app/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const adminToken = loginResponse.data.jwtToken;
    console.log('✅ Admin login successful');

    const headers = {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Test Orders endpoint
    console.log('\n2. Testing Orders endpoint...');
    try {
      const ordersResponse = await axios.get(`${API_BASE_URL}/orders`, { 
        headers,
        timeout: 30000
      });
      
      console.log('🎉 SUCCESS! Orders endpoint is working!');
      console.log('📊 Response status:', ordersResponse.status);
      console.log('📊 Response type:', typeof ordersResponse.data);
      
      if (ordersResponse.data && ordersResponse.data.orders) {
        console.log('✅ Orders found:', ordersResponse.data.orders.length);
        console.log('📄 Pagination:', ordersResponse.data.pagination);
        
        if (ordersResponse.data.orders.length > 0) {
          console.log('📋 Sample order:', {
            id: ordersResponse.data.orders[0]._id,
            user: ordersResponse.data.orders[0].user?.name || 'No user',
            status: ordersResponse.data.orders[0].status,
            totalPrice: ordersResponse.data.orders[0].totalPrice
          });
        }
      } else if (Array.isArray(ordersResponse.data)) {
        console.log('✅ Orders found (direct array):', ordersResponse.data.length);
      } else {
        console.log('⚠️ Unexpected response format:', ordersResponse.data);
      }
      
    } catch (error) {
      console.log('❌ Orders endpoint still failing');
      console.log('📊 Error status:', error.response?.status);
      console.log('📊 Error message:', error.response?.data?.message);
      console.log('📊 Error details:', error.response?.data);
      
      if (error.response?.status === 404) {
        console.log('\n🔍 404 Error Analysis:');
        console.log('- Route not loading in serverless deployment');
        console.log('- Possible causes:');
        console.log('  1. Syntax error in orderRoutes.js or orderControllers.js');
        console.log('  2. Import/export mismatch');
        console.log('  3. Serverless deployment not picking up changes');
        console.log('  4. Route registration failing silently');
      }
    }

    // Step 3: Compare with working endpoints
    console.log('\n3. Comparing with working endpoints...');
    
    // Test Bookings
    try {
      const bookingsResponse = await axios.get(`${API_BASE_URL}/bookings`, { headers });
      console.log('✅ Bookings working:', bookingsResponse.data.length, 'items');
    } catch (error) {
      console.log('❌ Bookings failed:', error.response?.status);
    }

    // Test Reservations
    try {
      const reservationsResponse = await axios.get(`${API_BASE_URL}/reservations`, { headers });
      console.log('✅ Reservations working:', reservationsResponse.data.length, 'items');
    } catch (error) {
      console.log('❌ Reservations failed:', error.response?.status);
    }

    // Test debug route if it exists
    console.log('\n4. Testing debug route...');
    try {
      const debugResponse = await axios.get(`${API_BASE_URL}/orders/debug`);
      console.log('✅ Debug route working:', debugResponse.data);
    } catch (error) {
      console.log('❌ Debug route failed:', error.response?.status);
    }

    console.log('\n🎯 Final Analysis:');
    console.log('Key fixes applied:');
    console.log('✅ 1. Removed duplicate mongoose import');
    console.log('✅ 2. Simplified route imports (removed try-catch)');
    console.log('✅ 3. Fixed admin/user logic in controller');
    console.log('✅ 4. Added proper error handling');
    console.log('');
    console.log('If orders still fail after deployment:');
    console.log('- Check Vercel deployment logs');
    console.log('- Verify all files are being deployed');
    console.log('- Check for any remaining syntax errors');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testOrdersFinal();
}

module.exports = { testOrdersFinal };
