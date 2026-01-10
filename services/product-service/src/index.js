const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
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

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers: productResolvers,
    csrfPrevention: false, // Disable CSRF protection for development
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
      };
    },
  });

  // Start Apollo Server with standalone server
  const { url } = await startStandaloneServer(server, {
    listen: { port: parseInt(process.env.PORT || '4002') },
    context: async ({ req }) => ({
      // Add any context you need here
      headers: req.headers,
    }),
  });

  console.log(`🚀 Product Service ready at ${url}`);
}

// Handle shutdown gracefully
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