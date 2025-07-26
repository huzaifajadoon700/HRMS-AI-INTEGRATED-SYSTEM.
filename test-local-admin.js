const axios = require('axios');

// Test against localhost
const API_BASE_URL = 'http://localhost:5000/api';
const AUTH_BASE_URL = 'http://localhost:5000/auth';

async function testLocalAdmin() {
  console.log('🔍 Testing Local Admin Endpoints...\n');

  try {
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${AUTH_BASE_URL}/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const adminToken = loginResponse.data.jwtToken;
    const userInfo = {
      name: loginResponse.data.name,
      role: loginResponse.data.role,
      email: loginResponse.data.email
    };
    
    console.log('✅ Admin login successful');
    console.log('👤 User info:', userInfo);

    const headers = {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Test Orders
    console.log('\n2. Testing Orders...');
    try {
      const ordersResponse = await axios.get(`${API_BASE_URL}/orders`, { headers });
      console.log('✅ Orders Response Type:', typeof ordersResponse.data);
      console.log('✅ Orders Response Keys:', Object.keys(ordersResponse.data || {}));
      
      if (ordersResponse.data && Array.isArray(ordersResponse.data.orders)) {
        console.log('✅ Found orders array in response.data.orders:', ordersResponse.data.orders.length, 'items');
        if (ordersResponse.data.orders.length > 0) {
          console.log('📋 Sample order:', {
            id: ordersResponse.data.orders[0]._id,
            user: ordersResponse.data.orders[0].user,
            status: ordersResponse.data.orders[0].status,
            totalPrice: ordersResponse.data.orders[0].totalPrice
          });
        }
      } else if (Array.isArray(ordersResponse.data)) {
        console.log('✅ Found orders array in response.data:', ordersResponse.data.length, 'items');
      } else {
        console.log('❌ No orders array found');
        console.log('Response structure:', ordersResponse.data);
      }
    } catch (error) {
      console.log('❌ Orders Error:', error.response?.status, '-', error.response?.data);
    }

    // Step 3: Test Bookings
    console.log('\n3. Testing Bookings...');
    try {
      const bookingsResponse = await axios.get(`${API_BASE_URL}/bookings`, { headers });
      console.log('✅ Bookings Response Type:', typeof bookingsResponse.data);
      
      if (Array.isArray(bookingsResponse.data)) {
        console.log('✅ Found bookings array:', bookingsResponse.data.length, 'items');
        if (bookingsResponse.data.length > 0) {
          console.log('📋 Sample booking:', {
            id: bookingsResponse.data[0]._id,
            roomType: bookingsResponse.data[0].roomType,
            totalPrice: bookingsResponse.data[0].totalPrice,
            checkInDate: bookingsResponse.data[0].checkInDate
          });
        }
      } else {
        console.log('❌ Bookings response is not an array');
        console.log('Response structure:', bookingsResponse.data);
      }
    } catch (error) {
      console.log('❌ Bookings Error:', error.response?.status, '-', error.response?.data);
    }

    // Step 4: Test Reservations (should work)
    console.log('\n4. Testing Reservations...');
    try {
      const reservationsResponse = await axios.get(`${API_BASE_URL}/reservations`, { headers });
      console.log('✅ Reservations Response Type:', typeof reservationsResponse.data);
      
      if (Array.isArray(reservationsResponse.data)) {
        console.log('✅ Found reservations array:', reservationsResponse.data.length, 'items');
      } else {
        console.log('❌ Reservations response is not an array');
      }
    } catch (error) {
      console.log('❌ Reservations Error:', error.response?.status, '-', error.response?.data);
    }

    console.log('\n🎯 Local Test Summary:');
    console.log('- If all work locally but not on deployment: Need to redeploy');
    console.log('- If some fail locally: Need to fix the backend code');

  } catch (error) {
    console.error('💥 Login failed:', error.message);
    console.log('Make sure your local backend server is running on port 5000');
  }
}

// Run the test
if (require.main === module) {
  testLocalAdmin();
}

module.exports = { testLocalAdmin };
