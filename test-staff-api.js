const axios = require('axios');

// Test configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://hrms-bace.vercel.app/api';
const TEST_EMAIL = 'test.staff@example.com';
const TEST_PASSWORD = 'testpassword123';

// Test data
const testStaffData = {
  name: 'John Doe',
  email: TEST_EMAIL,
  phone: '+1234567890',
  position: 'Waiter',
  department: 'Kitchen',
  status: 'Active',
  salary: 30000,
  hireDate: '2024-01-15'
};

async function testStaffAPI() {
  console.log('🧪 Testing Staff API...\n');

  try {
    // Step 1: Try to get staff without authentication (should fail)
    console.log('1. Testing unauthenticated access...');
    try {
      await axios.get(`${API_BASE_URL}/staff`);
      console.log('❌ ERROR: Unauthenticated access should have failed');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly blocked unauthenticated access');
      } else {
        console.log(`❌ Unexpected error: ${error.response?.status || 'Network error'}`);
      }
    }

    // Step 2: Login as admin (you'll need to replace with actual admin credentials)
    console.log('\n2. Attempting admin login...');
    let adminToken = null;
    try {
      // You'll need to replace these with actual admin credentials
      const loginResponse = await axios.post(`${API_BASE_URL.replace('/api', '')}/auth/login`, {
        email: 'admin@example.com', // Replace with actual admin email
        password: 'admin123' // Replace with actual admin password
      });
      adminToken = loginResponse.data.jwtToken;
      console.log('✅ Admin login successful');
    } catch (error) {
      console.log('❌ Admin login failed. Please check credentials.');
      console.log('   You may need to update the admin credentials in this test file.');
      return;
    }

    // Step 3: Test getting staff with authentication
    console.log('\n3. Testing authenticated staff retrieval...');
    try {
      const response = await axios.get(`${API_BASE_URL}/staff`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log(`✅ Successfully retrieved ${response.data.length} staff members`);
    } catch (error) {
      console.log(`❌ Failed to retrieve staff: ${error.response?.data?.message || error.message}`);
    }

    // Step 4: Test adding new staff
    console.log('\n4. Testing staff creation...');
    let createdStaffId = null;
    try {
      const response = await axios.post(`${API_BASE_URL}/staff`, testStaffData, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      createdStaffId = response.data._id;
      console.log('✅ Successfully created staff member');
      console.log(`   ID: ${createdStaffId}`);
      console.log(`   Name: ${response.data.name}`);
      console.log(`   Position: ${response.data.position}`);
      console.log(`   Department: ${response.data.department}`);
    } catch (error) {
      console.log(`❌ Failed to create staff: ${error.response?.data?.message || error.message}`);
      if (error.response?.data?.details) {
        console.log(`   Details: ${error.response.data.details}`);
      }
    }

    // Step 5: Test updating staff (if creation was successful)
    if (createdStaffId) {
      console.log('\n5. Testing staff update...');
      try {
        const updateData = {
          ...testStaffData,
          name: 'John Doe Updated',
          salary: 35000
        };
        const response = await axios.put(`${API_BASE_URL}/staff/${createdStaffId}`, updateData, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Successfully updated staff member');
        console.log(`   New name: ${response.data.name}`);
        console.log(`   New salary: ${response.data.salary}`);
      } catch (error) {
        console.log(`❌ Failed to update staff: ${error.response?.data?.message || error.message}`);
      }

      // Step 6: Test deleting staff
      console.log('\n6. Testing staff deletion...');
      try {
        await axios.delete(`${API_BASE_URL}/staff/${createdStaffId}`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Successfully deleted staff member');
      } catch (error) {
        console.log(`❌ Failed to delete staff: ${error.response?.data?.message || error.message}`);
      }
    }

    console.log('\n🎉 Staff API testing completed!');

  } catch (error) {
    console.error('💥 Unexpected error during testing:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testStaffAPI();
}

module.exports = { testStaffAPI };
