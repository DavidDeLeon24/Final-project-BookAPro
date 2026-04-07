import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Register Page - Allows new users to create either a customer or provider account
const Register = () => {
  // Form state for all registration fields
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    role: 'customer',      // Default role is customer
    businessName: '',      // Only required for providers
    phone: '' 
  });
  const [error, setError] = useState('');      // Error message state
  const [loading, setLoading] = useState(false); // Loading state for form submission
  const { register } = useAuth();              // Get register function from auth context
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password match
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setError('');
    setLoading(true);
    
    // Remove confirmPassword before sending to API
    const { confirmPassword, ...userData } = form;
    const result = await register(userData);
    
    if (result.success) {
      // Redirect to home page on successful registration
      navigate('/');
    } else {
      // Display error message
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create an Account</h2>
        
        {/* Display error message if any */}
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* Full Name input */}
          <input 
            type="text" 
            placeholder="Full Name" 
            value={form.name} 
            onChange={(e) => setForm({...form, name: e.target.value})} 
            required 
          />
          
          {/* Email input */}
          <input 
            type="email" 
            placeholder="Email" 
            value={form.email} 
            onChange={(e) => setForm({...form, email: e.target.value})} 
            required 
          />
          
          {/* Password input */}
          <input 
            type="password" 
            placeholder="Password" 
            value={form.password} 
            onChange={(e) => setForm({...form, password: e.target.value})} 
            required 
          />
          
          {/* Confirm Password input */}
          <input 
            type="password" 
            placeholder="Confirm Password" 
            value={form.confirmPassword} 
            onChange={(e) => setForm({...form, confirmPassword: e.target.value})} 
            required 
          />
          
          {/* Role selection dropdown */}
          <select 
            value={form.role} 
            onChange={(e) => setForm({...form, role: e.target.value})}
          >
            <option value="customer">Customer - Looking for services</option>
            <option value="provider">Service Provider - Offering services</option>
          </select>
          
          {/* Business Name field - only shown when role is provider */}
          {form.role === 'provider' && (
            <input 
              type="text" 
              placeholder="Business Name" 
              value={form.businessName} 
              onChange={(e) => setForm({...form, businessName: e.target.value})} 
              required 
            />
          )}
          
          {/* Phone number field - optional */}
          <input 
            type="tel" 
            placeholder="Phone (Optional)" 
            value={form.phone} 
            onChange={(e) => setForm({...form, phone: e.target.value})} 
          />
          
          {/* Submit button - disabled while loading */}
          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        {/* Link to login page for existing users */}
        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;