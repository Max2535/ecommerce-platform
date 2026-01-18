const { gql } = require('graphql-tag');

const typeDefs = gql`
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.3", import: ["@key", "@shareable", "@external"])

  scalar DateTime
  scalar JSON

  # Extended types from other services
  type User @key(fields: "id") {
    id: ID! @external
    orders: [Order!]!
  }

  type Product @key(fields: "id") {
    id: ID! @external
  }

  # Order Types
  type Order @key(fields: "id") {
    id: ID!
    orderNumber: String!
    userId: ID!
    user: User
    status: OrderStatus!
    subtotal: Float!
    tax: Float!
    shippingCost: Float!
    discount: Float!
    totalAmount: Float!
    shippingAddress: ShippingAddress!
    paymentMethod: PaymentMethod
    paymentStatus: PaymentStatus!
    paidAt: DateTime
    trackingNumber: String
    shippedAt: DateTime
    deliveredAt: DateTime
    cancelledAt: DateTime
    cancellationReason: String
    customerNotes: String
    internalNotes: String
    items: [OrderItem!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type OrderItem {
    id: ID!
    orderId: ID!
    productId: ID!
    product: Product
    productName: String!
    productSku: String!
    productImage: String
    unitPrice: Float!
    quantity: Int!
    subtotal: Float!
    discount: Float!
    total: Float!
  }

  type ShippingAddress {
    street: String!
    city: String!
    state: String
    postalCode: String!
    country: String!
  }

  enum OrderStatus {
    PENDING
    CONFIRMED
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
    REFUNDED
  }

  enum PaymentMethod {
    CREDIT_CARD
    DEBIT_CARD
    BANK_TRANSFER
    CASH_ON_DELIVERY
    E_WALLET
  }

  enum PaymentStatus {
    PENDING
    PAID
    FAILED
    REFUNDED
  }

  input CreateOrderInput {
    items: [OrderItemInput!]!
    shippingAddressId: ID
    shippingAddress: ShippingAddressInput
    paymentMethod: PaymentMethod!
    customerNotes: String
  }

  input OrderItemInput {
    productId: ID!
    quantity: Int!
  }

  input ShippingAddressInput {
    street: String!
    city: String!
    state: String
    postalCode: String!
    country: String!
  }

  input UpdateOrderStatusInput {
    status: OrderStatus!
    trackingNumber: String
    internalNotes: String
  }

  type Query {
    order(id: ID!): Order
    myOrders(
      status: OrderStatus
      limit: Int = 10
      offset: Int = 0
    ): OrderConnection!
    orders(
      status: OrderStatus
      userId: ID
      limit: Int = 10
      offset: Int = 0
    ): OrderConnection!
  }

  type OrderConnection {
    orders: [Order!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  type Mutation {
    createOrder(input: CreateOrderInput!): Order!
    updateOrderStatus(id: ID!, input: UpdateOrderStatusInput!): Order!
    cancelOrder(id: ID!, reason: String): Order!
    markAsPaid(id: ID!): Order!
    refundOrder(id: ID!, reason: String): Order!
  }
`;

module.exports = typeDefs;