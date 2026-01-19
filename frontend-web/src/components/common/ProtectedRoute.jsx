import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import Loading from './Loading';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading message="กำลังตรวจสอบสิทธิ์..." />;
  }

  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;