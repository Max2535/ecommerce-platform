const { gql } = require('graphql-tag');

const typeDefs = gql`
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.3", import: ["@key", "@shareable"])

  scalar DateTime
  scalar JSON

  # Product type - owned by this service
  type Product @key(fields: "id") {
    id: ID!
    name: String!
    slug: String!
    description: String!
    shortDescription: String
    sku: String!
    price: Float!
    compareAtPrice: Float
    cost: Float
    category: String!
    subcategory: String
    brand: String
    tags: [String!]
    images: [ProductImage!]
    stock: Int!
    lowStockThreshold: Int
    weight: ProductWeight
    dimensions: ProductDimensions
    attributes: JSON
    isActive: Boolean!
    isFeatured: Boolean!
    rating: ProductRating
    viewCount: Int!
    salesCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ProductImage {
    url: String!
    alt: String
    isPrimary: Boolean!
  }

  type ProductDimensions {
    length: Float
    width: Float
    height: Float
    unit: String
  }

  type ProductWeight {
    value: Float!
    unit: String
  }

  type ProductRating {
    average: Float!
    count: Int!
  }

  # Connection types for pagination
  type ProductConnection {
    edges: [ProductEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type ProductEdge {
    node: Product!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  # Input types
  input ProductFilterInput {
    category: String
    subcategory: String
    brand: String
    tags: [String!]
    minPrice: Float
    maxPrice: Float
    inStock: Boolean
    isFeatured: Boolean
    search: String
  }

  input ProductSortInput {
    field: ProductSortField!
    order: SortOrder!
  }

  enum ProductSortField {
    NAME
    PRICE
    CREATED_AT
    UPDATED_AT
    SALES_COUNT
    VIEW_COUNT
    RATING
  }

  enum SortOrder {
    ASC
    DESC
  }

  input CreateProductInput {
    name: String!
    description: String!
    shortDescription: String
    sku: String!
    price: Float!
    compareAtPrice: Float
    cost: Float
    category: String!
    subcategory: String
    brand: String
    tags: [String!]
    images: [ProductImageInput!]
    stock: Int!
    lowStockThreshold: Int
    weight: ProductWeightInput
    dimensions: ProductDimensionsInput
    attributes: JSON
    isFeatured: Boolean
  }

  input UpdateProductInput {
    name: String
    description: String
    shortDescription: String
    sku: String
    price: Float
    compareAtPrice: Float
    cost: Float
    category: String
    subcategory: String
    brand: String
    tags: [String!]
    images: [ProductImageInput!]
    stock: Int
    lowStockThreshold: Int
    weight: ProductWeightInput
    dimensions: ProductDimensionsInput
    attributes: JSON
    isActive: Boolean
    isFeatured: Boolean
  }

  input ProductImageInput {
    url: String!
    alt: String
    isPrimary: Boolean
  }

  input ProductDimensionsInput {
    length: Float
    width: Float
    height: Float
    unit: String
  }

  input ProductWeightInput {
    value: Float!
    unit: String
  }

  # Queries
  type Query {
    product(id: ID, slug: String): Product
    products(
      filter: ProductFilterInput
      sort: ProductSortInput
      page: Int
      limit: Int
    ): ProductConnection!
    featuredProducts(limit: Int): [Product!]!
    productsByCategory(category: String!, limit: Int): [Product!]!
    searchProducts(query: String!, limit: Int): [Product!]!
    categories: [String!]!
  }

  # Mutations
  type Mutation {
    createProduct(input: CreateProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product!
    deleteProduct(id: ID!): Boolean!
    updateStock(id: ID!, quantity: Int!): Product!
    incrementViewCount(id: ID!): Product!
  }
`;

module.exports = typeDefs;
