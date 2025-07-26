const mongoose = require('mongoose');
require('dotenv').config();

async function fixStaffDatabaseIndex() {
  console.log('🔧 Fixing Staff Database Index Issue...\n');

  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || process.env.Mongo_Conn;
    if (!mongoUri) {
      console.error('❌ No MongoDB connection string found in environment variables');
      return;
    }

    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get the staff collection
    const db = mongoose.connection.db;
    const staffCollection = db.collection('staffs');

    // Check existing indexes
    console.log('\n📋 Checking existing indexes on staff collection...');
    const indexes = await staffCollection.indexes();
    console.log('Current indexes:', indexes.map(idx => ({ name: idx.name, key: idx.key })));

    // Check if userId index exists
    const userIdIndex = indexes.find(idx => idx.name === 'userId_1' || JSON.stringify(idx.key).includes('userId'));
    
    if (userIdIndex) {
      console.log('\n🎯 Found problematic userId index:', userIdIndex);
      
      // Drop the userId index
      console.log('🗑️ Dropping userId index...');
      try {
        await staffCollection.dropIndex('userId_1');
        console.log('✅ Successfully dropped userId_1 index');
      } catch (error) {
        if (error.message.includes('index not found')) {
          console.log('ℹ️ userId_1 index was already removed');
        } else {
          console.error('❌ Error dropping index:', error.message);
        }
      }
    } else {
      console.log('ℹ️ No userId index found - this might not be the issue');
    }

    // Check for any documents with userId field
    console.log('\n🔍 Checking for documents with userId field...');
    const docsWithUserId = await staffCollection.find({ userId: { $exists: true } }).toArray();
    console.log(`Found ${docsWithUserId.length} documents with userId field`);

    if (docsWithUserId.length > 0) {
      console.log('📋 Sample document with userId:', docsWithUserId[0]);
      
      // Remove userId field from all documents
      console.log('🧹 Removing userId field from all staff documents...');
      const result = await staffCollection.updateMany(
        { userId: { $exists: true } },
        { $unset: { userId: "" } }
      );
      console.log(`✅ Updated ${result.modifiedCount} documents`);
    }

    // Verify the fix by trying to create a test staff member
    console.log('\n🧪 Testing staff creation after fix...');
    const Staff = require('./backend/Models/staff');
    
    const testStaff = new Staff({
      name: 'Test Staff Fix',
      email: `test.fix.${Date.now()}@example.com`,
      phone: '+1234567890',
      role: 'waiter',
      position: 'Test Position',
      department: 'Kitchen',
      status: 'Active'
    });

    try {
      await testStaff.save();
      console.log('✅ Test staff creation successful!');
      
      // Clean up test staff
      await Staff.findByIdAndDelete(testStaff._id);
      console.log('🧹 Test staff cleaned up');
    } catch (error) {
      console.error('❌ Test staff creation still failing:', error.message);
    }

    // Show final index state
    console.log('\n📋 Final indexes on staff collection:');
    const finalIndexes = await staffCollection.indexes();
    finalIndexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    console.log('\n🎉 Staff database index fix completed!');

  } catch (error) {
    console.error('💥 Error during fix:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the fix
if (require.main === module) {
  fixStaffDatabaseIndex();
}

module.exports = { fixStaffDatabaseIndex };
