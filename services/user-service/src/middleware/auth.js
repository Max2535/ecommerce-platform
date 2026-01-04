const jwt = require('jsonwebtoken');

/**
 * Authentication middleware for GraphQL context
 * Extracts and verifies JWT token from Authorization header
 */
async function authenticate(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return { user: null };
  }

  // Extract token from "Bearer <token>"
  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    return { user: null };
  }

  try {
    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return { user: decoded };
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return { user: null };
  }
}

module.exports = { authenticate };