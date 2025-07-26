const axios = require('axios');

const API_BASE_URL = 'https://hrms-bace.vercel.app/api';

async function debugDeployedAPI() {
  console.log('🔍 Debugging Deployed API...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ Health check passed:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health check failed:', error.response?.status, error.response?.data);
    }

    // Test 2: Staff debug endpoint (no auth required)
    console.log('\n2. Testing staff debug endpoint...');
    try {
      const debugResponse = await axios.get(`${API_BASE_URL}/staff/debug`);
      console.log('✅ Staff debug passed:', debugResponse.data);
    } catch (error) {
      console.log('❌ Staff debug failed:', error.response?.status, error.response?.data);
    }

    // Test 3: Try to get staff without auth (should fail with 401)
    console.log('\n3. Testing staff endpoint without auth...');
    try {
      const staffResponse = await axios.get(`${API_BASE_URL}/staff`);
      console.log('❌ ERROR: Should have failed without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected unauthenticated request');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Test 4: Try to create staff without auth (should fail with 401)
    console.log('\n4. Testing staff creation without auth...');
    try {
      const createResponse = await axios.post(`${API_BASE_URL}/staff`, {
        name: 'Test Staff',
        email: 'test@example.com',
        phone: '123-456-7890',
        position: 'Waiter',
        department: 'Kitchen'
      });
      console.log('❌ ERROR: Should have failed without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected unauthenticated creation request');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
        console.log('Error details:', error.response?.data);
      }
    }

    // Test 5: Check if routes are loaded
    console.log('\n5. Testing route loading info...');
    try {
      const infoResponse = await axios.get(`${API_BASE_URL}/info`);
      console.log('✅ API info:', infoResponse.data);
    } catch (error) {
      console.log('❌ API info failed:', error.response?.status, error.response?.data);
    }

    // Test 6: Test simple endpoint
    console.log('\n6. Testing simple test endpoint...');
    try {
      const simpleResponse = await axios.get(`${API_BASE_URL}/simple-test`);
      console.log('✅ Simple test passed:', simpleResponse.data);
    } catch (error) {
      console.log('❌ Simple test failed:', error.response?.status, error.response?.data);
    }

    console.log('\n🎯 Debug Summary:');
    console.log('- If health check passes: API is deployed and running');
    console.log('- If staff debug passes: Staff routes are loaded');
    console.log('- If auth rejection works: Authentication middleware is working');
    console.log('- Check the logs above for any specific errors');

  } catch (error) {
    console.error('💥 Unexpected error during debugging:', error.message);
  }
}

// Run the debug
if (require.main === module) {
  debugDeployedAPI();
}

module.exports = { debugDeployedAPI };
