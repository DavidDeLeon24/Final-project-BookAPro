import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Navbar Component - Main navigation bar for the application
// Shows different links based on user authentication status and role
const Navbar = () => {
  const { user, isAuthenticated, isProvider, logout } = useAuth();
  const navigate = useNavigate();

  // Handle user logout - clears auth state and redirects to home
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo - links to home page */}
        <Link to="/" className="logo">BookAPro</Link>
        
        <div className="nav-links">
          {/* Public links - always visible */}
          <Link to="/">Home</Link>
          <Link to="/browse">Browse Services</Link>
          
          {isAuthenticated ? (
            <>
              {/* Authenticated user links */}
              <Link to="/profile">Profile</Link>
              {/* Provider-only link */}
              {isProvider && <Link to="/my-listings">My Listings</Link>}
              {/* Welcome message with user name */}
              <span className="user-name">👋 Hello, {user?.name}</span>
              {/* Logout button */}
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          ) : (
            <>
              {/* Unauthenticated user links */}
              <Link to="/login" className="login-btn">Login</Link>
              <Link to="/register" className="register-btn">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;