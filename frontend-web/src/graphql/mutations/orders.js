import { gql } from '@apollo/client';

export const CREATE_ORDER_MUTATION = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      orderNumber
      status
      totalAmount
      items {
        productName
        quantity
        total
      }
    }
  }
`;

export const CANCEL_ORDER_MUTATION = gql`
  mutation CancelOrder($id: ID!, $reason: String) {
    cancelOrder(id: $id, reason: $reason) {
      id
      status
      cancelledAt
    }
  }
`;