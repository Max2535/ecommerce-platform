const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const cors = require('cors');
require('dotenv').config();

const { pool, initializeDatabase } = require('./config/database');
const { authenticate } = require('./middleware/auth');
const typeDefs = require('./schema/typeDefs');
const userResolvers = require('./resolvers/userResolvers');

/**
 * Start the server
 */
async function startServer() {
  // Initialize database
  await initializeDatabase();

  // Create Express app
  const app = express();

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers: userResolvers,
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
      };
    },
  });

  // Start Apollo Server
  await server.start();

  // Apply middleware
  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const { user } = await authenticate(req);
        return { user, pool };
      },
    })
  );

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'user-service',
      timestamp: new Date().toISOString(),
    });
  });

  // Start listening
  const PORT = process.env.PORT || 4001;
  app.listen(PORT, () => {
    console.log(`🚀 User Service ready at http://localhost:${PORT}/graphql`);
    console.log(`📊 Health check at http://localhost:${PORT}/health`);
  });
}

// Handle shutdown gracefully
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await pool.end();
  process.exit(0);
});

// Start server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});