import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// PrivateRoute Component - Protects routes that require authentication
// Redirects to login if not authenticated, or to home if role doesn't match
const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading indicator while checking authentication status
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Redirect to login if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If a specific role is required and user doesn't have it, redirect to home
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  // User is authenticated and has required role (if any) - render protected content
  return children;
};

export default PrivateRoute;