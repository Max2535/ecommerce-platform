import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
  query GetProducts(
    $filter: ProductFilterInput
    $sort: ProductSortInput
    $page: Int
    $limit: Int
  ) {
    products(filter: $filter, sort: $sort, page: $page, limit: $limit) {
      edges {
        node {
          id
          name
          slug
          description
          shortDescription
          price
          compareAtPrice
          category
          brand
          images {
            url
            alt
          }
          stock
          rating {
            average
            count
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      slug
      description
      price
      compareAtPrice
      category
      subcategory
      brand
      images {
        url
        alt
      }
      stock
      sku
      weight {
        value
        unit
      }
      dimensions {
        length
        width
        height
        unit
      }
      tags
      attributes
      rating {
        average
        count
      }
      createdAt
    }
  }
`;

export const GET_FEATURED_PRODUCTS = gql`
  query GetFeaturedProducts($limit: Int) {
    featuredProducts(limit: $limit) {
      id
      name
      slug
      price
      compareAtPrice
      images {
        url
        alt
      }
      stock
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories
  }
`;

export const SEARCH_PRODUCTS = gql`
  query SearchProducts($query: String!, $limit: Int) {
    searchProducts(query: $query, limit: $limit) {
      id
      name
      slug
      price
      images {
        url
        alt
      }
      stock
    }
  }
`;
