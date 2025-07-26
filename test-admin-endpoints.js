const axios = require('axios');

const API_BASE_URL = 'https://hrms-bace.vercel.app';

async function testAdminEndpoints() {
  console.log('🔍 Testing Admin Endpoints...\n');

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
      email: loginResponse.data.email
    };
    
    console.log('✅ Admin login successful');
    console.log('👤 User info:', userInfo);

    const headers = {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Test Reservations (working)
    console.log('\n2. Testing Reservations (should work)...');
    try {
      const reservationsResponse = await axios.get(`${API_BASE_URL}/api/reservations`, { headers });
      console.log('✅ Reservations:', reservationsResponse.data.length, 'items found');
      if (reservationsResponse.data.length > 0) {
        console.log('📋 Sample reservation:', {
          id: reservationsResponse.data[0]._id,
          tableNumber: reservationsResponse.data[0].tableNumber,
          fullName: reservationsResponse.data[0].fullName
        });
      }
    } catch (error) {
      console.log('❌ Reservations failed:', error.response?.status, error.response?.data);
    }

    // Step 3: Test Orders (not working)
    console.log('\n3. Testing Orders (problematic)...');
    try {
      const ordersResponse = await axios.get(`${API_BASE_URL}/api/orders`, { headers });
      console.log('✅ Orders:', ordersResponse.data.length || 'unknown', 'items found');
      console.log('📋 Orders response structure:', Object.keys(ordersResponse.data));
      if (ordersResponse.data.orders && ordersResponse.data.orders.length > 0) {
        console.log('📋 Sample order:', {
          id: ordersResponse.data.orders[0]._id,
          status: ordersResponse.data.orders[0].status,
          totalPrice: ordersResponse.data.orders[0].totalPrice
        });
      } else if (Array.isArray(ordersResponse.data) && ordersResponse.data.length > 0) {
        console.log('📋 Sample order:', {
          id: ordersResponse.data[0]._id,
          status: ordersResponse.data[0].status,
          totalPrice: ordersResponse.data[0].totalPrice
        });
      }
    } catch (error) {
      console.log('❌ Orders failed:', error.response?.status, error.response?.data);
    }

    // Step 4: Test Bookings (not working)
    console.log('\n4. Testing Bookings (problematic)...');
    try {
      const bookingsResponse = await axios.get(`${API_BASE_URL}/api/bookings`, { headers });
      console.log('✅ Bookings:', bookingsResponse.data.length || 'unknown', 'items found');
      if (Array.isArray(bookingsResponse.data) && bookingsResponse.data.length > 0) {
        console.log('📋 Sample booking:', {
          id: bookingsResponse.data[0]._id,
          roomNumber: bookingsResponse.data[0].roomNumber,
          fullName: bookingsResponse.data[0].fullName
        });
      }
    } catch (error) {
      console.log('❌ Bookings failed:', error.response?.status, error.response?.data);
    }

    // Step 5: Test if there's actual data in the database
    console.log('\n5. Testing database check endpoints...');
    
    // Check if there's a debug endpoint for bookings
    try {
      const bookingDebugResponse = await axios.get(`${API_BASE_URL}/api/bookings/debug/db-check`, { headers });
      console.log('✅ Booking DB check:', bookingDebugResponse.data);
    } catch (error) {
      console.log('ℹ️ No booking debug endpoint available');
    }

    console.log('\n🎯 Summary:');
    console.log('- Reservations: Working ✅');
    console.log('- Orders: Check the response above ⚠️');
    console.log('- Bookings: Check the response above ⚠️');
    console.log('\nIf Orders/Bookings show 0 items but Reservations work, the issue is likely:');
    console.log('1. Admin role detection in the controllers');
    console.log('2. Different authentication middleware requirements');
    console.log('3. No actual data in orders/bookings tables');

  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testAdminEndpoints();
}

module.exports = { testAdminEndpoints };
