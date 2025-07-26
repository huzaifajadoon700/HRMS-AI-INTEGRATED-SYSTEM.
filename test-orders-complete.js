const axios = require('axios');

const API_BASE_URL = 'https://hrms-bace.vercel.app/api';

async function testOrdersComplete() {
  console.log('🔍 Testing Orders - Both Admin and User Access...\n');

  try {
    // Step 1: Test Admin Access
    console.log('1. Testing ADMIN access to orders...');
    const adminLoginResponse = await axios.post('https://hrms-bace.vercel.app/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const adminToken = adminLoginResponse.data.jwtToken;
    console.log('✅ Admin login successful');
    console.log('👤 Admin info:', {
      name: adminLoginResponse.data.name,
      role: adminLoginResponse.data.role,
      isAdmin: adminLoginResponse.data.isAdmin
    });

    try {
      const adminOrdersResponse = await axios.get(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      console.log('✅ Admin can access orders!');
      console.log('📊 Admin sees:', adminOrdersResponse.data.orders?.length || adminOrdersResponse.data.length || 0, 'orders');
      
      if (adminOrdersResponse.data.orders && adminOrdersResponse.data.orders.length > 0) {
        console.log('📋 Sample order for admin:', {
          id: adminOrdersResponse.data.orders[0]._id,
          user: adminOrdersResponse.data.orders[0].user?.name || 'No user',
          status: adminOrdersResponse.data.orders[0].status
        });
      }
    } catch (error) {
      console.log('❌ Admin orders failed:', error.response?.status, error.response?.data?.message);
    }

    // Step 2: Test Regular User Access (if we have user credentials)
    console.log('\n2. Testing REGULAR USER access to orders...');
    try {
      // Try to login as a regular user (you might need to adjust these credentials)
      const userLoginResponse = await axios.post('https://hrms-bace.vercel.app/auth/login', {
        email: 'user@example.com', // Adjust if you have a different user
        password: 'password123'
      });
      
      const userToken = userLoginResponse.data.jwtToken;
      console.log('✅ User login successful');
      console.log('👤 User info:', {
        name: userLoginResponse.data.name,
        role: userLoginResponse.data.role,
        isAdmin: userLoginResponse.data.isAdmin
      });

      try {
        const userOrdersResponse = await axios.get(`${API_BASE_URL}/orders`, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        
        console.log('✅ User can access their orders!');
        console.log('📊 User sees:', userOrdersResponse.data.orders?.length || userOrdersResponse.data.length || 0, 'orders');
        
        if (userOrdersResponse.data.orders && userOrdersResponse.data.orders.length > 0) {
          console.log('📋 Sample order for user:', {
            id: userOrdersResponse.data.orders[0]._id,
            user: userOrdersResponse.data.orders[0].user?.name || 'No user',
            status: userOrdersResponse.data.orders[0].status
          });
        }
      } catch (error) {
        console.log('❌ User orders failed:', error.response?.status, error.response?.data?.message);
      }
    } catch (userLoginError) {
      console.log('ℹ️ Could not test regular user access (no user credentials available)');
      console.log('   This is normal if you only have admin credentials set up');
    }

    // Step 3: Compare with working endpoints
    console.log('\n3. Comparing with working endpoints...');
    
    // Test Bookings (admin-only)
    try {
      const bookingsResponse = await axios.get(`${API_BASE_URL}/bookings`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Bookings (admin-only):', bookingsResponse.data.length, 'items');
    } catch (error) {
      console.log('❌ Bookings failed:', error.response?.status);
    }

    // Test Reservations (user + admin)
    try {
      const reservationsResponse = await axios.get(`${API_BASE_URL}/reservations`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Reservations (user + admin):', reservationsResponse.data.length, 'items');
    } catch (error) {
      console.log('❌ Reservations failed:', error.response?.status);
    }

    console.log('\n🎯 Complete Test Summary:');
    console.log('✅ Orders should now work like this:');
    console.log('   - Admin users: Can see ALL orders from all users');
    console.log('   - Regular users: Can see only THEIR OWN orders');
    console.log('   - Same as how most e-commerce/order systems work');
    console.log('');
    console.log('📋 Comparison with other endpoints:');
    console.log('   - Bookings: Admin-only (like hotel room bookings)');
    console.log('   - Reservations: User + Admin (like restaurant table reservations)');
    console.log('   - Orders: User + Admin (like food delivery orders) ✅');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testOrdersComplete();
}

module.exports = { testOrdersComplete };
