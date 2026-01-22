const request = require('supertest');
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { pool } = require('../config/database');
const typeDefs = require('../schema/typeDefs');
const userResolvers = require('../resolvers/userResolvers');

let app;
let server;

/**
 * Setup test server
 */
beforeAll(async () => {
  app = express();

  server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers: userResolvers }),
  });

  await server.start();

  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization?.replace('Bearer ', '');
        let user = null;

        if (token) {
          try {
            const jwt = require('jsonwebtoken');
            user = jwt.verify(token, process.env.JWT_SECRET);
          } catch (err) {
            // Invalid token
          }
        }

        return { user, pool };
      },
    })
  );

  // Clear test data
  await pool.query('TRUNCATE TABLE users, addresses CASCADE');
});

afterAll(async () => {
  await pool.end();
  await server.stop();
});

/**
 * Test Suite: Authentication
 */
describe('Authentication', () => {
  let authToken;
  let userId;

  describe('Register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation Register($input: RegisterInput!) {
              register(input: $input) {
                token
                user {
                  id
                  email
                  firstName
                  lastName
                }
              }
            }
          `,
          variables: {
            input: {
              email: 'test@example.com',
              password: 'Password123',
              firstName: 'John',
              lastName: 'Doe',
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.register).toHaveProperty('token');
      expect(response.body.data.register.user.email).toBe('test@example.com');

      authToken = response.body.data.register.token;
      userId = response.body.data.register.user.id;
    });

    it('should not register with duplicate email', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation Register($input: RegisterInput!) {
              register(input: $input) {
                token
              }
            }
          `,
          variables: {
            input: {
              email: 'test@example.com',
              password: 'Password123',
              firstName: 'Jane',
              lastName: 'Doe',
            },
          },
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('already registered');
    });

    it('should not register with weak password', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation Register($input: RegisterInput!) {
              register(input: $input) {
                token
              }
            }
          `,
          variables: {
            input: {
              email: 'weak@example.com',
              password: 'weak',
              firstName: 'Weak',
              lastName: 'Password',
            },
          },
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Password must be');
    });
  });

  describe('Login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation Login($input: LoginInput!) {
              login(input: $input) {
                token
                user {
                  id
                  email
                }
              }
            }
          `,
          variables: {
            input: {
              email: 'test@example.com',
              password: 'Password123',
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.login).toHaveProperty('token');
    });

    it('should not login with incorrect password', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation Login($input: LoginInput!) {
              login(input: $input) {
                token
              }
            }
          `,
          variables: {
            input: {
              email: 'test@example.com',
              password: 'WrongPassword123',
            },
          },
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Invalid');
    });

    it('should not login with non-existent email', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            mutation Login($input: LoginInput!) {
              login(input: $input) {
                token
              }
            }
          `,
          variables: {
            input: {
              email: 'nonexistent@example.com',
              password: 'Password123',
            },
          },
        });

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Get Current User', () => {
    it('should get current user with valid token', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: `
            query {
              me {
                id
                email
                firstName
                lastName
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.me.id).toBe(userId);
      expect(response.body.data.me.email).toBe('test@example.com');
    });

    it('should not get user without token', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            query {
              me {
                id
                email
              }
            }
          `,
        });

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Not authenticated');
    });
  });
});

/**
 * Test Suite: Address Management
 */
describe('Address Management', () => {
  let authToken;
  let addressId;

  beforeAll(async () => {
    // Create test user
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `
          mutation {
            register(input: {
              email: "address-test@example.com"
              password: "Password123"
              firstName: "Address"
              lastName: "Test"
            }) {
              token
            }
          }
        `,
      });

    authToken = response.body.data.register.token;
  });

  it('should add a new address', async () => {
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          mutation AddAddress($input: AddressInput!) {
            addAddress(input: $input) {
              id
              street
              city
              isDefault
            }
          }
        `,
        variables: {
          input: {
            street: '123 Test Street',
            city: 'Bangkok',
            state: 'Bangkok',
            postalCode: '10110',
            country: 'Thailand',
            isDefault: true,
          },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.addAddress.street).toBe('123 Test Street');
    expect(response.body.data.addAddress.isDefault).toBe(true);

    addressId = response.body.data.addAddress.id;
  });

  it('should update address', async () => {
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          mutation UpdateAddress($id: ID!, $input: AddressInput!) {
            updateAddress(id: $id, input: $input) {
              id
              street
              city
            }
          }
        `,
        variables: {
          id: addressId,
          input: {
            street: '456 Updated Street',
            city: 'Bangkok',
            state: 'Bangkok',
            postalCode: '10110',
            country: 'Thailand',
          },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateAddress.street).toBe('456 Updated Street');
  });

  it('should delete address', async () => {
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          mutation DeleteAddress($id: ID!) {
            deleteAddress(id: $id)
          }
        `,
        variables: {
          id: addressId,
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.deleteAddress).toBe(true);
  });
});