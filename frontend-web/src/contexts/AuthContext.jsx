import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useMutation } from '@apollo/client/react';
import { LOGIN_MUTATION, REGISTER_MUTATION } from '@graphql/mutations/auth';

/**
 * Authentication Context
 * Manages user authentication state and operations
 */
const AuthContext = createContext(null);

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/**
 * Check if token is valid
 */
const isTokenValid = (token) => {
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};

/**
 * Authentication Provider Component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);

  /**
   * Initialize auth state from localStorage
   */
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('token');

      if (token && isTokenValid(token)) {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } else {
        localStorage.removeItem('token');
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (email, password) => {
    try {
      const { data } = await loginMutation({
        variables: {
          input: { email, password },
        },
      });

      const { token, user: userData } = data.login;

      // Save token
      localStorage.setItem('token', token);

      // Decode and set user
      const decoded = jwtDecode(token);
      setUser(decoded);

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  }, [loginMutation]);

  /**
   * Register new user
   */
  const register = useCallback(async (input) => {
    try {
      const { data } = await registerMutation({
        variables: { input },
      });

      const { token, user: userData } = data.register;

      // Save token
      localStorage.setItem('token', token);

      // Decode and set user
      const decoded = jwtDecode(token);
      setUser(decoded);

      return { success: true, user: userData };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'Registration failed'
      };
    }
  }, [registerMutation]);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = useCallback(() => {
    return user !== null;
  }, [user]);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};