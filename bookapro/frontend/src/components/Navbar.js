import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isProvider, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">BookAPro</Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/browse">Browse Services</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/profile">Profile</Link>
              {isProvider && <Link to="/my-listings">My Listings</Link>}
              <span className="user-name">👋 Hello, {user?.name}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          ) : (
            <>
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