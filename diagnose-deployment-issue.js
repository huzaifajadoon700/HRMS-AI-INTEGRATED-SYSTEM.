const axios = require('axios');

const API_BASE_URL = 'https://hrms-bace.vercel.app';

async function diagnoseDeploymentIssue() {
  console.log('🔍 Diagnosing Deployment Issue...\n');

  try {
    // Step 1: Check if we can login
    console.log('1. Testing admin login...');
    let adminToken = null;
    
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'admin@example.com',
        password: 'admin123'
      });
      adminToken = loginResponse.data.jwtToken;
      console.log('✅ Admin login successful');
    } catch (error) {
      console.log('❌ Admin login failed:', error.response?.data);
      return;
    }

    // Step 2: Check environment and system info
    console.log('\n2. Checking system info...');
    try {
      const infoResponse = await axios.get(`${API_BASE_URL}/api/info`);
      console.log('✅ System info:', JSON.stringify(infoResponse.data, null, 2));
    } catch (error) {
      console.log('❌ System info failed:', error.response?.data);
    }

    // Step 3: Check debug connection info
    console.log('\n3. Checking database connection debug info...');
    try {
      const debugResponse = await axios.get(`${API_BASE_URL}/api/debug/connection`);
      console.log('✅ Debug info:', JSON.stringify(debugResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Debug info failed:', error.response?.data);
    }

    // Step 4: Check route errors
    console.log('\n4. Checking route loading errors...');
    try {
      const errorsResponse = await axios.get(`${API_BASE_URL}/api/debug/errors`);
      console.log('✅ Route errors info:', JSON.stringify(errorsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Route errors check failed:', error.response?.data);
    }

    // Step 5: Test staff creation with detailed error capture
    console.log('\n5. Testing staff creation with detailed error logging...');
    const testStaffData = {
      name: 'Diagnostic Test Staff',
      email: `diagnostic.test.${Date.now()}@example.com`,
      phone: '+1234567890',
      position: 'Test Position',
      department: 'Kitchen',
      status: 'Active',
      salary: 25000
    };

    console.log('📦 Test data:', JSON.stringify(testStaffData, null, 2));

    try {
      const response = await axios.post(`${API_BASE_URL}/api/staff`, testStaffData, {
        headers: { 
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });
      console.log('✅ Staff creation successful!');
      console.log('📋 Created staff:', response.data);
      
      // Clean up
      try {
        await axios.delete(`${API_BASE_URL}/api/staff/${response.data._id}`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('🧹 Test staff cleaned up');
      } catch (deleteError) {
        console.log('⚠️ Could not clean up test staff');
      }
      
    } catch (error) {
      console.log('❌ Staff creation failed');
      console.log('📊 Status:', error.response?.status);
      console.log('📊 Status Text:', error.response?.statusText);
      console.log('📊 Error Data:', JSON.stringify(error.response?.data, null, 2));
      console.log('📊 Error Headers:', error.response?.headers);
      
      if (error.code === 'ECONNABORTED') {
        console.log('⏰ Request timed out - this might be a serverless function timeout issue');
      }
      
      if (error.response?.status === 500) {
        console.log('🔍 This is a server error - likely an issue in the backend code or environment');
      }
    }

    // Step 6: Test a simpler endpoint to see if it's staff-specific
    console.log('\n6. Testing a simpler authenticated endpoint...');
    try {
      const staffListResponse = await axios.get(`${API_BASE_URL}/api/staff`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('✅ Staff list retrieval successful');
      console.log(`📋 Found ${staffListResponse.data.length} existing staff members`);
    } catch (error) {
      console.log('❌ Staff list retrieval failed:', error.response?.status, error.response?.data);
    }

    console.log('\n🎯 Diagnosis Summary:');
    console.log('- Check the logs above for specific error details');
    console.log('- If timeout occurs: Serverless function might be taking too long');
    console.log('- If 500 error: Check environment variables or code issues');
    console.log('- If authentication fails: Check JWT_SECRET environment variable');

  } catch (error) {
    console.error('💥 Unexpected error during diagnosis:', error.message);
  }
}

// Run the diagnosis
if (require.main === module) {
  diagnoseDeploymentIssue();
}

module.exports = { diagnoseDeploymentIssue };
