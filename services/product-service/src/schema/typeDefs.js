const { gql } = require('graphql-tag');

const typeDefs = gql`
  scalar DateTime
  scalar JSON

  # Product Types
  type Product {
    id: ID!
    name: String!
    slug: String!
    description: String!
    shortDescription: String
    price: Float!
    compareAtPrice: Float
    cost: Float
    category: String!
    subcategory: String
    brand: String
    images: [ProductImage!]!
    stock: Int!
    sku: String!
    barcode: String
    weight: Weight
    dimensions: Dimensions
    tags: [String!]!
    features: [Feature!]!
    specifications: JSON
    isActive: Boolean!
    isFeatured: Boolean!
    seo: SEO
    viewCount: Int!
    salesCount: Int!
    rating: Rating!
    inStock: Boolean!
    onSale: Boolean!
    discountPercentage: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ProductImage {
    url: String!
    alt: String
    position: Int!
  }

  type Weight {
    value: Float
    unit: String
  }

  type Dimensions {
    length: Float
    width: Float
    height: Float
    unit: String
  }

  type Feature {
    name: String!
    value: String!
  }

  type SEO {
    title: String
    description: String
    keywords: [String!]
  }

  type Rating {
    average: Float!
    count: Int!
  }

  # Pagination Types
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

  # Input Types
  input CreateProductInput {
    name: String!
    description: String!
    shortDescription: String
    price: Float!
    compareAtPrice: Float
    cost: Float
    category: String!
    subcategory: String
    brand: String
    images: [ProductImageInput!]
    stock: Int!
    sku: String!
    barcode: String
    weight: WeightInput
    dimensions: DimensionsInput
    tags: [String!]
    features: [FeatureInput!]
    specifications: JSON
    isFeatured: Boolean
    seo: SEOInput
  }

  input UpdateProductInput {
    name: String
    description: String
    shortDescription: String
    price: Float
    compareAtPrice: Float
    cost: Float
    category: String
    subcategory: String
    brand: String
    images: [ProductImageInput!]
    stock: Int
    barcode: String
    weight: WeightInput
    dimensions: DimensionsInput
    tags: [String!]
    features: [FeatureInput!]
    specifications: JSON
    isActive: Boolean
    isFeatured: Boolean
    seo: SEOInput
  }

  input ProductImageInput {
    url: String!
    alt: String
    position: Int
  }

  input WeightInput {
    value: Float
    unit: String
  }

  input DimensionsInput {
    length: Float
    width: Float
    height: Float
    unit: String
  }

  input FeatureInput {
    name: String!
    value: String!
  }

  input SEOInput {
    title: String
    description: String
    keywords: [String!]
  }

  # Filter Input
  input ProductFilterInput {
    category: String
    subcategory: String
    brand: String
    minPrice: Float
    maxPrice: Float
    inStock: Boolean
    isFeatured: Boolean
    tags: [String!]
    search: String
  }

  # Sort Options
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

  input SortInput {
    field: ProductSortField!
    order: SortOrder!
  }

  # Queries
  type Query {
    # Get single product
    product(id: ID, slug: String): Product

    # Get products with filters and pagination
    products(
      filter: ProductFilterInput
      sort: SortInput
      page: Int = 1
      limit: Int = 10
    ): ProductConnection!

    # Get featured products
    featuredProducts(limit: Int = 10): [Product!]!

    # Get products by category
    productsByCategory(category: String!, limit: Int = 10): [Product!]!

    # Search products
    searchProducts(query: String!, limit: Int = 10): [Product!]!

    # Get product categories
    categories: [String!]!
  }

  # Mutations
  type Mutation {
    # Create product
    createProduct(input: CreateProductInput!): Product!

    # Update product
    updateProduct(id: ID!, input: UpdateProductInput!): Product!

    # Delete product (soft delete)
    deleteProduct(id: ID!): Boolean!

    # Update stock
    updateStock(id: ID!, quantity: Int!): Product!

    # Increment view count
    incrementViewCount(id: ID!): Product!
  }
`;

module.exports = typeDefs;