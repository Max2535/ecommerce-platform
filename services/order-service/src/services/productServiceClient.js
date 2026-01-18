const axios = require('axios');

/**
 * Product Service Client
 * Communicates with Product Service to fetch product data and update stock
 */
class ProductServiceClient {
  constructor() {
    this.baseURL = process.env.PRODUCT_SERVICE_URL;
  }

  /**
   * Get product by ID
   */
  async getProduct(productId) {
    try {
      const response = await axios.post(
        this.baseURL,
        {
          query: `
            query GetProduct($id: ID!) {
              product(id: $id) {
                id
                name
                price
                stock
                sku
                images {
                  url
                }
                isActive
              }
            }
          `,
          variables: { id: productId },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.product;
    } catch (error) {
      console.error('Product Service Error:', error.message);
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  }

  /**
   * Get multiple products by IDs
   */
  async getProducts(productIds) {
    const products = await Promise.all(
      productIds.map(id => this.getProduct(id))
    );
    return products;
  }

  /**
   * Update product stock
   */
  async updateStock(productId, quantity) {
    try {
      const response = await axios.post(
        this.baseURL,
        {
          query: `
            mutation UpdateStock($id: ID!, $quantity: Int!) {
              updateStock(id: $id, quantity: $quantity) {
                id
                stock
              }
            }
          `,
          variables: {
            id: productId,
            quantity: quantity
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.updateStock;
    } catch (error) {
      console.error('Product Service Error:', error.message);
      throw new Error(`Failed to update stock: ${error.message}`);
    }
  }

  /**
   * Validate products availability and stock
   */
  async validateProducts(items) {
    const validationResults = [];

    for (const item of items) {
      const product = await this.getProduct(item.productId);

      if (!product) {
        validationResults.push({
          productId: item.productId,
          valid: false,
          error: 'Product not found',
        });
        continue;
      }

      if (!product.isActive) {
        validationResults.push({
          productId: item.productId,
          valid: false,
          error: 'Product is not active',
        });
        continue;
      }

      if (product.stock < item.quantity) {
        validationResults.push({
          productId: item.productId,
          valid: false,
          error: `Insufficient stock. Available: ${product.stock}, Requested: ${item.quantity}`,
        });
        continue;
      }

      validationResults.push({
        productId: item.productId,
        valid: true,
        product: product,
      });
    }

    return validationResults;
  }
}

module.exports = new ProductServiceClient();