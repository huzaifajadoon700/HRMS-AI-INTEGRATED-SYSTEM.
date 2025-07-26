const axios = require('axios');

const API_BASE_URL = 'https://hrms-bace.vercel.app';

async function testStaffWithAuth() {
  console.log('🔐 Testing Staff API with Authentication...\n');

  try {
    // Step 1: Try to login as admin
    console.log('1. Attempting admin login...');
    let adminToken = null;
    
    try {
      // Try with common admin credentials
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'admin@example.com',
        password: 'admin123'
      });
      adminToken = loginResponse.data.jwtToken;
      console.log('✅ Admin login successful');
      console.log('👤 User info:', {
        name: loginResponse.data.name,
        role: loginResponse.data.role,
        email: loginResponse.data.email
      });
    } catch (error) {
      console.log('❌ Admin login failed with admin@example.com');
      console.log('Response:', error.response?.data);
      
      // Try alternative admin credentials
      try {
        console.log('🔄 Trying alternative admin credentials...');
        const altLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: 'admin@admin.com',
          password: 'password123'
        });
        adminToken = altLoginResponse.data.jwtToken;
        console.log('✅ Admin login successful with alternative credentials');
      } catch (altError) {
        console.log('❌ Alternative admin login also failed');
        console.log('Please check what admin credentials are set up in your system');
        console.log('You can create an admin user or check the database for existing admin users');
        return;
      }
    }

    // Step 2: Test authenticated staff retrieval
    console.log('\n2. Testing authenticated staff retrieval...');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/staff`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log(`✅ Successfully retrieved ${response.data.length} staff members`);
      if (response.data.length > 0) {
        console.log('📋 Sample staff member:', response.data[0]);
      }
    } catch (error) {
      console.log(`❌ Failed to retrieve staff:`, error.response?.status, error.response?.data);
    }

    // Step 3: Test staff creation with detailed logging
    console.log('\n3. Testing staff creation...');
    const testStaffData = {
      name: 'Test Staff Member',
      email: `test.staff.${Date.now()}@example.com`, // Unique email
      phone: '+1234567890',
      position: 'Waiter',
      department: 'Kitchen',
      status: 'Active',
      salary: 30000,
      hireDate: '2024-01-15'
    };

    console.log('📦 Sending staff data:', JSON.stringify(testStaffData, null, 2));

    try {
      const response = await axios.post(`${API_BASE_URL}/api/staff`, testStaffData, {
        headers: { 
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Successfully created staff member');
      console.log('📋 Created staff:', response.data);
      
      // Clean up - delete the test staff member
      try {
        await axios.delete(`${API_BASE_URL}/api/staff/${response.data._id}`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('🧹 Test staff member cleaned up');
      } catch (deleteError) {
        console.log('⚠️ Could not clean up test staff member');
      }
      
    } catch (error) {
      console.log(`❌ Failed to create staff:`, error.response?.status);
      console.log('📊 Error details:', error.response?.data);
      console.log('🔍 Request config:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data
      });
    }

    console.log('\n🎉 Staff API testing with authentication completed!');

  } catch (error) {
    console.error('💥 Unexpected error during testing:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testStaffWithAuth();
}

module.exports = { testStaffWithAuth };
