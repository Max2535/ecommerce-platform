const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const cors = require('cors');
require('dotenv').config();

const database = require('./config/database');
const typeDefs = require('./schema/typeDefs');
const productResolvers = require('./resolvers/productResolvers');

/**
 * Start the server
 */
async function startServer() {
  // Connect to MongoDB
  await database.connect();

  const app = express();

  // Build federated schema
  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers: productResolvers }),
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
      };
    },
  });

  await server.start();

  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(server)
  );

  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'product-service',
      timestamp: new Date().toISOString(),
    });
  });

  const PORT = process.env.PORT || 4002;
  app.listen(PORT, () => {
    console.log(`🚀 Product Service ready at http://localhost:${PORT}/graphql`);
    console.log(`📊 Health check at http://localhost:${PORT}/health`);
  });
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await database.disconnect();
  process.exit(0);
});

// Start server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});