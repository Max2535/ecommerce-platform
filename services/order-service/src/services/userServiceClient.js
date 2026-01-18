const axios = require('axios');

/**
 * User Service Client
 * Communicates with User Service to fetch user and address data
 */
class UserServiceClient {
  constructor() {
    this.baseURL = process.env.USER_SERVICE_URL;
  }

  /**
   * Get user by ID
   */
  async getUser(userId, token) {
    try {
      const response = await axios.post(
        this.baseURL,
        {
          query: `
            query GetUser($id: ID!) {
              user(id: $id) {
                id
                email
                firstName
                lastName
                phone
                addresses {
                  id
                  street
                  city
                  state
                  postalCode
                  country
                  isDefault
                }
              }
            }
          `,
          variables: { id: userId },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.user;
    } catch (error) {
      console.error('User Service Error:', error.message);
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }

  /**
   * Get user's default address
   */
  async getUserDefaultAddress(userId, token) {
    const user = await this.getUser(userId, token);

    if (!user.addresses || user.addresses.length === 0) {
      throw new Error('User has no addresses');
    }

    const defaultAddress = user.addresses.find(addr => addr.isDefault);
    return defaultAddress || user.addresses[0];
  }
}

module.exports = new UserServiceClient();