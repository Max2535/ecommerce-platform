const jwt = require('jsonwebtoken');

/**
 * Authentication middleware for GraphQL context
 */
async function authenticate(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return { user: null, token: null };
  }

  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    return { user: null, token: null };
  }

  try {
    // Use the same JWT_SECRET as User Service
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');

    return { user: decoded, token };
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return { user: null, token: null };
  }
}

module.exports = { authenticate };