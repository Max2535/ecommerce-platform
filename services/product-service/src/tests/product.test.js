const request = require('supertest');
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const database = require('../config/database');
const Product = require('../models/Product');
const typeDefs = require('../schema/typeDefs');
const productResolvers = require('../resolvers/productResolvers');

let app;
let server;

beforeAll(async () => {
  await database.connect();

  app = express();

  server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers: productResolvers }),
  });

  await server.start();

  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server)
  );

  // Clear test data
  await Product.deleteMany({});
});

afterAll(async () => {
  await database.disconnect();
  await server.stop();
});

describe('Product Management', () => {
  let productId;

  it('should create a new product', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `
          mutation CreateProduct($input: CreateProductInput!) {
            createProduct(input: $input) {
              id
              name
              price
              sku
              stock
            }
          }
        `,
        variables: {
          input: {
            name: 'Test Product',
            description: 'This is a test product',
            price: 999,
            category: 'Electronics',
            stock: 100,
            sku: 'TEST-001',
          },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createProduct.name).toBe('Test Product');
    expect(response.body.data.createProduct.price).toBe(999);

    productId = response.body.data.createProduct.id;
  });

  it('should not create product with duplicate SKU', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `
          mutation CreateProduct($input: CreateProductInput!) {
            createProduct(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            name: 'Another Product',
            description: 'Test',
            price: 500,
            category: 'Electronics',
            stock: 50,
            sku: 'TEST-001',
          },
        },
      });

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('SKU already exists');
  });

  it('should get product by ID', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `
          query GetProduct($id: ID!) {
            product(id: $id) {
              id
              name
              price
              stock
            }
          }
        `,
        variables: {
          id: productId,
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.product.id).toBe(productId);
  });

  it('should update product', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `
          mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
            updateProduct(id: $id, input: $input) {
              id
              name
              price
            }
          }
        `,
        variables: {
          id: productId,
          input: {
            name: 'Updated Product',
            price: 1299,
          },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateProduct.name).toBe('Updated Product');
    expect(response.body.data.updateProduct.price).toBe(1299);
  });

  it('should update stock', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `
          mutation UpdateStock($id: ID!, $quantity: Int!) {
            updateStock(id: $id, quantity: $quantity) {
              id
              stock
            }
          }
        `,
        variables: {
          id: productId,
          quantity: -10,
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateStock.stock).toBe(90);
  });

  it('should get all products with filters', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `
          query GetProducts($filter: ProductFilterInput) {
            products(filter: $filter) {
              edges {
                node {
                  id
                  name
                }
              }
              totalCount
            }
          }
        `,
        variables: {
          filter: {
            category: 'Electronics',
          },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.products.totalCount).toBeGreaterThan(0);
  });

  it('should delete product (soft delete)', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `
          mutation DeleteProduct($id: ID!) {
            deleteProduct(id: $id)
          }
        `,
        variables: {
          id: productId,
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteProduct).toBe(true);
  });
});