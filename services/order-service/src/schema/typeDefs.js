const { gql } = require('graphql-tag');

const typeDefs = gql`
  scalar DateTime
  scalar JSON

  # Order Types
  type Order {
    id: ID!
    orderNumber: String!
    userId: ID!
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

  # Enums
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

  # Input Types
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

  # Queries
  type Query {
    # Get single order
    order(id: ID!): Order

    # Get user's orders
    myOrders(
      status: OrderStatus
      limit: Int = 10
      offset: Int = 0
    ): OrderConnection!

    # Get all orders (admin)
    orders(
      status: OrderStatus
      userId: ID
      limit: Int = 10
      offset: Int = 0
    ): OrderConnection!
  }

  # Pagination
  type OrderConnection {
    orders: [Order!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  # Mutations
  type Mutation {
    # Create new order
    createOrder(input: CreateOrderInput!): Order!

    # Update order status
    updateOrderStatus(id: ID!, input: UpdateOrderStatusInput!): Order!

    # Cancel order
    cancelOrder(id: ID!, reason: String): Order!

    # Mark as paid
    markAsPaid(id: ID!): Order!

    # Process refund
    refundOrder(id: ID!, reason: String): Order!
  }
`;

module.exports = typeDefs;