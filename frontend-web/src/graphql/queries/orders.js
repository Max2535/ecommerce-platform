import { gql } from '@apollo/client';

export const GET_MY_ORDERS = gql`
  query GetMyOrders($status: OrderStatus, $limit: Int, $offset: Int) {
    myOrders(status: $status, limit: $limit, offset: $offset) {
      orders {
        id
        orderNumber
        status
        totalAmount
        paymentStatus
        shippingAddress {
          street
          city
          country
        }
        items {
          id
          productName
          productImage
          quantity
          unitPrice
          total
          product {
            id
            name
            images {
              url
            }
          }
        }
        createdAt
      }
      totalCount
      hasMore
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      orderNumber
      status
      subtotal
      tax
      shippingCost
      discount
      totalAmount
      paymentMethod
      paymentStatus
      paidAt
      trackingNumber
      shippingAddress {
        street
        city
        state
        postalCode
        country
      }
      items {
        id
        productName
        productSku
        productImage
        quantity
        unitPrice
        total
        product {
          id
          name
          slug
        }
      }
      createdAt
      updatedAt
    }
  }
`;