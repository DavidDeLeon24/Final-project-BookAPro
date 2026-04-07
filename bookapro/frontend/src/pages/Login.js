import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Login Page - Allows existing users to authenticate and access their account
const Login = () => {
  const [email, setEmail] = useState('');        // Email input state
  const [password, setPassword] = useState('');  // Password input state
  const [error, setError] = useState('');        // Error message state
  const [loading, setLoading] = useState(false); // Loading state for form submission
  const { login } = useAuth();                   // Get login function from auth context
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Attempt to login with provided credentials
    const result = await login(email, password);
    
    if (result.success) {
      // Redirect to home page on successful login
      navigate('/');
    } else {
      // Display error message on failed login
      setError(result.error || 'Login failed. Please check your credentials.');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to BookAPro</h2>
        
        {/* Display error message if any */}
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* Email input field */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          {/* Password input field */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {/* Submit button - disabled while loading */}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        {/* Link to registration page for new users */}
        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;