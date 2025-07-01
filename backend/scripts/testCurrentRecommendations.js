const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

async function testRecommendations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.Mongo_Conn);
    console.log('✅ Connected to MongoDB');

    // Test Food Recommendations
    console.log('\n🍽️ Testing Food Recommendations...');
    try {
      const foodResponse = await axios.get('http://localhost:8080/api/food-recommendations/popular?count=5');
      console.log(`✅ Food recommendations: ${foodResponse.data.popularItems?.length || 0} items`);
      if (foodResponse.data.popularItems?.length > 0) {
        foodResponse.data.popularItems.forEach((item, index) => {
          console.log(`  ${index + 1}. ${item.name} - Rs.${item.price}`);
        });
      }
    } catch (error) {
      console.log('❌ Food recommendations failed:', error.message);
      console.log('Trying alternative endpoint...');
      try {
        const altResponse = await axios.get('http://localhost:8080/api/recommendations/popular?count=5');
        console.log(`✅ Food recommendations (alt): ${altResponse.data.popularItems?.length || 0} items`);
        if (altResponse.data.popularItems?.length > 0) {
          altResponse.data.popularItems.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.name} - Rs.${item.price}`);
          });
        }
      } catch (altError) {
        console.log('❌ Alternative food endpoint also failed:', altError.message);
      }
    }

    // Test Table Recommendations
    console.log('\n🍽️ Testing Table Recommendations...');
    try {
      const tableResponse = await axios.get('http://localhost:8080/api/tables/popular?limit=3');
      console.log(`✅ Table recommendations: ${tableResponse.data.popularTables?.length || 0} tables`);
      if (tableResponse.data.popularTables?.length > 0) {
        tableResponse.data.popularTables.forEach((table, index) => {
          console.log(`  ${index + 1}. ${table.tableName} - Capacity: ${table.capacity}`);
        });
      }
    } catch (error) {
      console.log('❌ Table recommendations failed:', error.message);
    }

    // Test Room Recommendations
    console.log('\n🏨 Testing Room Recommendations...');
    try {
      const roomResponse = await axios.get('http://localhost:8080/api/rooms/popular?count=3');
      console.log(`✅ Room recommendations: ${roomResponse.data.popularRooms?.length || 0} rooms`);
      if (roomResponse.data.popularRooms?.length > 0) {
        roomResponse.data.popularRooms.forEach((room, index) => {
          console.log(`  ${index + 1}. ${room.roomNumber} (${room.roomType}) - Rs.${room.price}`);
        });
      }
    } catch (error) {
      console.log('❌ Room recommendations failed:', error.message);
    }

    console.log('\n🎉 Recommendation test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

// Run the test
if (require.main === module) {
  testRecommendations();
}

module.exports = { testRecommendations };
