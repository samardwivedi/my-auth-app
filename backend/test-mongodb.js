const mongoose = require('mongoose');
require('dotenv').config();

async function testMongoDBConnection() {
  try {
    // Hardcode the connection string from .env for direct testing
    const mongoURI = 'mongodb+srv://Gunjan25:samar2005@project-database.vmvk8za.mongodb.net/react-app';
    
    console.log('Testing MongoDB Atlas connection...');
    console.log('Connection string:', mongoURI);
    
    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully!');
    
    // Check which collections exist
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAvailable collections:');
    
    if (collections.length === 0) {
      console.log('No collections found in the database. Database is empty.');
    } else {
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    }
    
    console.log('\nConnection details:');
    console.log(`- Database name: ${mongoose.connection.name}`);
    console.log(`- Host: ${mongoose.connection.host}`);
    console.log(`- Port: ${mongoose.connection.port}`);
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\nConnection closed.');
  }
}

// Run the test
testMongoDBConnection();
