const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const cors = require('cors');
require('dotenv').config();

const { initializeDatabase, closeConnection } = require('./config/database');
const { authenticate } = require('./middleware/auth');
const typeDefs = require('./schema/typeDefs');
const orderResolvers = require('./resolvers/orderResolvers');

/**
 * Start the server
 */
async function startServer() {
  // Initialize database
  await initializeDatabase();

  // Create Express app
  const app = express();

  // Build federated schema
  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers: orderResolvers }),
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
        const { user, token } = await authenticate(req);
        return { user, token };
      },
    })
  );

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'order-service',
      timestamp: new Date().toISOString(),
    });
  });

  // Start listening
  const PORT = process.env.PORT || 4003;
  app.listen(PORT, () => {
    console.log(`🚀 Order Service ready at http://localhost:${PORT}/graphql`);
    console.log(`📊 Health check at http://localhost:${PORT}/health`);
  });
}

// Handle shutdown gracefully
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await closeConnection();
  process.exit(0);
});

// Start server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});