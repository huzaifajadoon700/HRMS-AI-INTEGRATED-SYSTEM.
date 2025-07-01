const axios = require('axios');

console.log('🔍 Testing API Endpoints for Hotel Settings...\n');

const API_BASE = 'https://hrms-bace.vercel.app/api';

async function testEndpoint(url, method = 'GET', data = null, headers = {}) {
  try {
    console.log(`Testing ${method} ${url}...`);
    const config = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    console.log(`✅ ${method} ${url} - Status: ${response.status}`);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    console.log(`❌ ${method} ${url} - Error: ${error.response?.status || 'Network Error'}`);
    if (error.response?.data) {
      console.log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return { success: false, error: error.response?.data || error.message };
  }
}

async function runTests() {
  console.log('🏥 HOTEL SETTINGS API TESTS');
  console.log('============================\n');
  
  // Test 1: Health Check
  console.log('1. Testing Health Check...');
  await testEndpoint(`${API_BASE}/health`);
  console.log('');
  
  // Test 2: Info endpoint
  console.log('2. Testing Info Endpoint...');
  await testEndpoint(`${API_BASE}/info`);
  console.log('');
  
  // Test 3: Public Hotel Settings (should work without auth)
  console.log('3. Testing Public Hotel Settings...');
  await testEndpoint(`${API_BASE}/hotel-settings/public`);
  console.log('');
  
  // Test 4: Check if hotel-settings route exists
  console.log('4. Testing Hotel Settings Base Route...');
  await testEndpoint(`${API_BASE}/hotel-settings`);
  console.log('');
  
  // Test 5: Test auth login to get token
  console.log('5. Testing Auth Login...');
  const loginResult = await testEndpoint(`${API_BASE}/auth/login`, 'POST', {
    email: 'admin@example.com',
    password: 'admin123'
  });
  
  if (loginResult.success && loginResult.data.token) {
    console.log('✅ Login successful, testing authenticated endpoints...\n');
    
    const token = loginResult.data.token;
    const authHeaders = { 'Authorization': `Bearer ${token}` };
    
    // Test 6: Authenticated hotel settings
    console.log('6. Testing Authenticated Hotel Settings...');
    await testEndpoint(`${API_BASE}/hotel-settings`, 'GET', null, authHeaders);
    console.log('');
    
    // Test 7: Hotel settings metadata
    console.log('7. Testing Hotel Settings Metadata...');
    await testEndpoint(`${API_BASE}/hotel-settings/metadata`, 'GET', null, authHeaders);
    console.log('');
  } else {
    console.log('❌ Login failed, skipping authenticated tests\n');
  }
  
  // Test 8: Check available routes
  console.log('8. Testing Available Routes...');
  await testEndpoint(`${API_BASE}/`);
  console.log('');
  
  console.log('🎯 DIAGNOSIS & SOLUTIONS');
  console.log('========================');
  console.log('If hotel-settings endpoints are failing:');
  console.log('1. Backend may need to be redeployed with new routes');
  console.log('2. Check if routes are properly registered in index.js');
  console.log('3. Verify MongoDB connection is working');
  console.log('4. Check if HotelSettings model is deployed');
  console.log('');
  console.log('💡 QUICK FIXES:');
  console.log('1. Redeploy backend to Vercel');
  console.log('2. Run seeder script after deployment');
  console.log('3. Test endpoints again');
  console.log('');
  console.log('🔧 FOR LOCAL TESTING:');
  console.log('1. Start local backend: cd backend && npm start');
  console.log('2. Update .env: REACT_APP_API_BASE_URL=http://localhost:5000/api');
  console.log('3. Test locally first, then deploy');
}

runTests().catch(console.error);
