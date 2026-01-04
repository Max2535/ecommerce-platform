const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { validateEmail, validatePassword } = require('../utils/validators');

/**
 * Generate JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

/**
 * User Resolvers
 */
const userResolvers = {
  Query: {
    /**
     * Get current authenticated user
     */
    me: async (_, __, { user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [user.id]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return result.rows[0];
    },

    /**
     * Get user by ID
     */
    user: async (_, { id }, { user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return result.rows[0];
    },

    /**
     * Get all users with pagination
     */
    users: async (_, { limit, offset }, { user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const result = await pool.query(
        'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );

      return result.rows;
    },
  },

  Mutation: {
    /**
     * Register new user
     */
    register: async (_, { input }) => {
      const { email, password, firstName, lastName, phone } = input;

      // Validate input
      if (!validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      if (!validatePassword(password)) {
        throw new Error('Password must be at least 8 characters long and contain uppercase, lowercase, and numbers');
      }

      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('Email already registered');
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [email.toLowerCase(), passwordHash, firstName, lastName, phone]
      );

      const newUser = result.rows[0];

      // Generate token
      const token = generateToken(newUser);

      return {
        token,
        user: newUser,
      };
    },

    /**
     * Login user
     */
    login: async (_, { input }) => {
      const { email, password } = input;

      // Find user
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND is_active = true',
        [email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = result.rows[0];

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        throw new Error('Invalid email or password');
      }

      // Generate token
      const token = generateToken(user);

      return {
        token,
        user,
      };
    },

    /**
     * Update user profile
     */
    updateProfile: async (_, { input }, { user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { firstName, lastName, phone } = input;

      const updates = [];
      const values = [];
      let paramCount = 1;

      if (firstName !== undefined) {
        updates.push(`first_name = $${paramCount++}`);
        values.push(firstName);
      }

      if (lastName !== undefined) {
        updates.push(`last_name = $${paramCount++}`);
        values.push(lastName);
      }

      if (phone !== undefined) {
        updates.push(`phone = $${paramCount++}`);
        values.push(phone);
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(user.id);

      const result = await pool.query(
        `UPDATE users
         SET ${updates.join(', ')}
         WHERE id = $${paramCount}
         RETURNING *`,
        values
      );

      return result.rows[0];
    },

    /**
     * Add new address
     */
    addAddress: async (_, { input }, { user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { street, city, state, postalCode, country, isDefault } = input;

      // If this is set as default, unset other default addresses
      if (isDefault) {
        await pool.query(
          'UPDATE addresses SET is_default = false WHERE user_id = $1',
          [user.id]
        );
      }

      const result = await pool.query(
        `INSERT INTO addresses (user_id, street, city, state, postal_code, country, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [user.id, street, city, state, postalCode, country, isDefault || false]
      );

      return result.rows[0];
    },

    /**
     * Update address
     */
    updateAddress: async (_, { id, input }, { user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Check if address belongs to user
      const existingAddress = await pool.query(
        'SELECT * FROM addresses WHERE id = $1 AND user_id = $2',
        [id, user.id]
      );

      if (existingAddress.rows.length === 0) {
        throw new Error('Address not found');
      }

      const { street, city, state, postalCode, country, isDefault } = input;

      // If setting as default, unset others
      if (isDefault) {
        await pool.query(
          'UPDATE addresses SET is_default = false WHERE user_id = $1 AND id != $2',
          [user.id, id]
        );
      }

      const result = await pool.query(
        `UPDATE addresses
         SET street = $1, city = $2, state = $3, postal_code = $4, country = $5, is_default = $6
         WHERE id = $7
         RETURNING *`,
        [street, city, state, postalCode, country, isDefault || false, id]
      );

      return result.rows[0];
    },

    /**
     * Delete address
     */
    deleteAddress: async (_, { id }, { user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const result = await pool.query(
        'DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, user.id]
      );

      return result.rows.length > 0;
    },

    /**
     * Set default address
     */
    setDefaultAddress: async (_, { id }, { user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Unset all default addresses
      await pool.query(
        'UPDATE addresses SET is_default = false WHERE user_id = $1',
        [user.id]
      );

      // Set new default
      const result = await pool.query(
        `UPDATE addresses SET is_default = true
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [id, user.id]
      );

      if (result.rows.length === 0) {
        throw new Error('Address not found');
      }

      return result.rows[0];
    },
  },

  /**
   * Field resolvers
   */
  User: {
    firstName: (parent) => parent.first_name,
    lastName: (parent) => parent.last_name,
    isActive: (parent) => parent.is_active,
    emailVerified: (parent) => parent.email_verified,
    createdAt: (parent) => parent.created_at,
    updatedAt: (parent) => parent.updated_at,
    addresses: async (parent) => {
      const result = await pool.query(
        'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
        [parent.id]
      );

      return result.rows;
    },
  },

  Address: {
    userId: (parent) => parent.user_id,
    postalCode: (parent) => parent.postal_code,
    isDefault: (parent) => parent.is_default,
    createdAt: (parent) => parent.created_at,
    updatedAt: (parent) => parent.updated_at,
  },
};

module.exports = userResolvers;