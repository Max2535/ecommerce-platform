const mongoose = require('mongoose');
require('dotenv').config();

/**
 * MongoDB Connection Configuration
 * Using Mongoose ODM for better schema validation and queries
 */
class Database {
  constructor() {
    this.connection = null;
  }

  /**
   * Connect to MongoDB
   */
  async connect() {
    try {
      const uri = process.env.NODE_ENV === 'test'
        ? process.env.MONGODB_TEST_URI
        : process.env.MONGODB_URI;

      const options = {
        maxPoolSize: 10, // Maximum number of connections
        minPoolSize: 5,  // Minimum number of connections
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      };

      this.connection = await mongoose.connect(uri, options);

      console.log('✅ MongoDB connected successfully');
      console.log(`📊 Database: ${this.connection.connection.name}`);

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected');
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

      return this.connection;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      process.exit(1);
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    if (this.connection) {
      await mongoose.connection.close();
      console.log('👋 MongoDB connection closed');
    }
  }

  /**
   * Clear all collections (for testing)
   */
  async clearDatabase() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('Cannot clear database in non-test environment');
    }

    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
}

module.exports = new Database();