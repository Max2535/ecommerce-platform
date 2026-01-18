const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * MySQL Database Configuration using Sequelize ORM
 */
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',

    // Connection Pool Configuration
    pool: {
      max: 10,        // Maximum number of connections
      min: 2,         // Minimum number of connections
      acquire: 30000, // Maximum time (ms) to get connection
      idle: 10000,    // Maximum idle time before releasing connection
    },

    // Logging
    logging: process.env.NODE_ENV === 'development' ? console.log : false,

    // Timezone
    timezone: '+07:00', // Bangkok timezone

    // Define options
    define: {
      timestamps: true,
      underscored: true, // Use snake_case for column names
      freezeTableName: true, // Prevent Sequelize from pluralizing table names
    },
  }
);

/**
 * Test database connection
 */
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connection established successfully');
  } catch (error) {
    console.error('❌ Unable to connect to MySQL:', error);
    process.exit(1);
  }
}

/**
 * Initialize database and sync models
 */
async function initializeDatabase() {
  try {
    await testConnection();

    // Sync all models
    // In production, use migrations instead of sync
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
async function closeConnection() {
  try {
    await sequelize.close();
    console.log('👋 Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
}

module.exports = {
  sequelize,
  initializeDatabase,
  closeConnection,
};