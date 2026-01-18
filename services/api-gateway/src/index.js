const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const { ApolloGateway, IntrospectAndCompose, RemoteGraphQLDataSource } = require('@apollo/gateway');
const cors = require('cors');
require('dotenv').config();

/**
 * API Gateway - GraphQL Federation
 * Combines all microservices into a single unified API
 */
async function startGateway() {
  const app = express();

  // Custom data source to forward headers to subgraphs
  class AuthenticatedDataSource extends RemoteGraphQLDataSource {
    willSendRequest({ request, context }) {
      // Forward authorization header to subgraphs
      if (context.authorization) {
        request.http.headers.set('authorization', context.authorization);
      }
    }
  }

  // Create Apollo Gateway
  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: [
        {
          name: 'users',
          url: process.env.USER_SERVICE_URL,
        },
        {
          name: 'products',
          url: process.env.PRODUCT_SERVICE_URL,
        },
        {
          name: 'orders',
          url: process.env.ORDER_SERVICE_URL,
        },
      ],
      // Poll for schema updates
      pollIntervalInMs: parseInt(process.env.SCHEMA_POLL_INTERVAL) || 10000,
    }),
    buildService({ url }) {
      return new AuthenticatedDataSource({ url });
    },
  });

  // Create Apollo Server with Gateway
  const server = new ApolloServer({
    gateway,
    // Disable subscriptions (not needed for this workshop)
    // In production, you might want to enable them
  });

  await server.start();

  console.log('✅ Gateway started successfully');
  console.log('📡 Subgraphs:');
  console.log(`   - Users: ${process.env.USER_SERVICE_URL}`);
  console.log(`   - Products: ${process.env.PRODUCT_SERVICE_URL}`);
  console.log(`   - Orders: ${process.env.ORDER_SERVICE_URL}`);

  // Apply middleware
  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        // Extract authorization header to forward to subgraphs
        return {
          authorization: req.headers.authorization,
        };
      },
    })
  );

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      subgraphs: {
        users: process.env.USER_SERVICE_URL,
        products: process.env.PRODUCT_SERVICE_URL,
        orders: process.env.ORDER_SERVICE_URL,
      },
    });
  });

  // Gateway info endpoint
  app.get('/info', (req, res) => {
    res.json({
      name: 'E-Commerce API Gateway',
      version: '1.0.0',
      description: 'Unified GraphQL API using Apollo Federation',
      endpoints: {
        graphql: '/graphql',
        health: '/health',
      },
    });
  });

  // Start listening
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`\n🚀 API Gateway ready at http://localhost:${PORT}/graphql`);
    console.log(`📊 Health check at http://localhost:${PORT}/health`);
    console.log(`ℹ️  Info at http://localhost:${PORT}/info\n`);
  });
}

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Start gateway
startGateway().catch((error) => {
  console.error('Failed to start gateway:', error);
  process.exit(1);
});