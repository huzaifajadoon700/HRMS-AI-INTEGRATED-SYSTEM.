const axios = require('axios');

const API_BASE_URL = 'https://hrms-bace.vercel.app';

async function testOrdersOnly() {
  console.log('🔍 Testing Orders Endpoint Only...\n');

  try {
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
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

    // Step 2: Test Orders with detailed logging
    console.log('\n2. Testing Orders endpoint...');
    try {
      console.log('📡 Making request to:', `${API_BASE_URL}/api/orders`);
      console.log('🔑 With headers:', { Authorization: `Bearer ${adminToken.substring(0, 20)}...` });
      
      const ordersResponse = await axios.get(`${API_BASE_URL}/api/orders`, { 
        headers,
        timeout: 30000 // 30 second timeout
      });
      
      console.log('✅ Orders request successful!');
      console.log('📊 Response status:', ordersResponse.status);
      console.log('📊 Response headers:', ordersResponse.headers['content-type']);
      console.log('📊 Response data type:', typeof ordersResponse.data);
      console.log('📊 Response data keys:', Object.keys(ordersResponse.data || {}));
      
      if (ordersResponse.data && typeof ordersResponse.data === 'object') {
        if (Array.isArray(ordersResponse.data.orders)) {
          console.log('✅ Found orders array in response.data.orders:', ordersResponse.data.orders.length, 'items');
          
          if (ordersResponse.data.orders.length > 0) {
            console.log('📋 Sample order structure:', {
              id: ordersResponse.data.orders[0]._id,
              hasUser: !!ordersResponse.data.orders[0].user,
              userType: typeof ordersResponse.data.orders[0].user,
              status: ordersResponse.data.orders[0].status,
              totalPrice: ordersResponse.data.orders[0].totalPrice,
              itemsCount: ordersResponse.data.orders[0].items?.length || 0
            });
          } else {
            console.log('ℹ️ Orders array is empty');
          }
          
          if (ordersResponse.data.pagination) {
            console.log('📄 Pagination info:', ordersResponse.data.pagination);
          }
        } else if (Array.isArray(ordersResponse.data)) {
          console.log('✅ Found orders array directly in response.data:', ordersResponse.data.length, 'items');
        } else {
          console.log('❌ Response data is not in expected format');
          console.log('📋 Full response data:', JSON.stringify(ordersResponse.data, null, 2));
        }
      } else {
        console.log('❌ Response data is not an object');
        console.log('📋 Response data:', ordersResponse.data);
      }
      
    } catch (error) {
      console.log('❌ Orders request failed');
      console.log('📊 Error status:', error.response?.status);
      console.log('📊 Error message:', error.response?.data?.message);
      console.log('📊 Error details:', error.response?.data?.error);
      console.log('📊 Full error response:', JSON.stringify(error.response?.data, null, 2));
      
      if (error.code === 'ECONNABORTED') {
        console.log('⏰ Request timed out - server might be slow');
      }
    }

    console.log('\n🎯 Orders Test Summary:');
    console.log('- Check the detailed logs above for specific issues');
    console.log('- If you see "Orders array is empty", there might be no orders in the database');
    console.log('- If you see server errors, check the backend logs');

  } catch (error) {
    console.error('💥 Login failed:', error.message);
    if (error.response?.data) {
      console.error('Login error details:', error.response.data);
    }
  }
}

// Run the test
if (require.main === module) {
  testOrdersOnly();
}

module.exports = { testOrdersOnly };
