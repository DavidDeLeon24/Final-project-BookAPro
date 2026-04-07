import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

// Create Auth Context for global authentication state
const AuthContext = createContext();

// Custom hook to use auth context anywhere in the app
export const useAuth = () => useContext(AuthContext);

// Auth Provider component - wraps the app and provides auth state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);      // Current user data
  const [loading, setLoading] = useState(true); // Loading state while checking token

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set token in axios headers and load user data
      api.defaults.headers.common['x-auth-token'] = token;
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Load user data from backend using stored token
  const loadUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      // Token invalid - clear storage
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  // Register new user
  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      // Store token and set user
      localStorage.setItem('token', res.data.token);
      api.defaults.headers.common['x-auth-token'] = res.data.token;
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  // Login existing user
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      // Store token and set user
      localStorage.setItem('token', res.data.token);
      api.defaults.headers.common['x-auth-token'] = res.data.token;
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  // Logout user - clear token and user state
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['x-auth-token'];
    setUser(null);
  };

  // Provide auth state and methods to children components
  return (
    <AuthContext.Provider value={{ 
      user,           // Current user object
      loading,        // Loading state
      register,       // Register function
      login,          // Login function
      logout,         // Logout function
      isAuthenticated: !!user,  // Boolean - whether user is logged in
      isProvider: user?.role === 'provider',  // Boolean - if user is provider
      isCustomer: user?.role === 'customer'   // Boolean - if user is customer
    }}>
      {children}
    </AuthContext.Provider>
  );
};