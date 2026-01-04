const { gql } = require('graphql-tag');

const typeDefs = gql`
  # Scalar types
  scalar DateTime

  # User type
  type User {
    id: ID!
    email: String!
    firstName: String
    lastName: String
    phone: String
    isActive: Boolean!
    emailVerified: Boolean!
    addresses: [Address!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Address type
  type Address {
    id: ID!
    userId: ID!
    street: String!
    city: String!
    state: String
    postalCode: String!
    country: String!
    isDefault: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Authentication payload
  type AuthPayload {
    token: String!
    user: User!
  }

  # Input types
  input RegisterInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    phone: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateProfileInput {
    firstName: String
    lastName: String
    phone: String
  }

  input AddressInput {
    street: String!
    city: String!
    state: String
    postalCode: String!
    country: String!
    isDefault: Boolean
  }

  # Queries
  type Query {
    # Get current authenticated user
    me: User

    # Get user by ID (admin only)
    user(id: ID!): User

    # Get all users (admin only)
    users(limit: Int = 10, offset: Int = 0): [User!]!
  }

  # Mutations
  type Mutation {
    # Authentication
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    # Profile management
    updateProfile(input: UpdateProfileInput!): User!

    # Address management
    addAddress(input: AddressInput!): Address!
    updateAddress(id: ID!, input: AddressInput!): Address!
    deleteAddress(id: ID!): Boolean!
    setDefaultAddress(id: ID!): Address!
  }
`;

module.exports = typeDefs;