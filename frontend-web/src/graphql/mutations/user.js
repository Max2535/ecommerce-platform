import { gql } from '@apollo/client';

export const ADD_ADDRESS_MUTATION = gql`
  mutation AddAddress($input: AddressInput!) {
    addAddress(input: $input) {
      id
      street
      city
      state
      postalCode
      country
      isDefault
    }
  }
`;

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      firstName
      lastName
      phone
    }
  }
`;