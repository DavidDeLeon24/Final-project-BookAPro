import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'customer', businessName: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    setError('');
    setLoading(true);
    const { confirmPassword, ...userData } = form;
    const result = await register(userData);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create an Account</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Full Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
          <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required />
          <input type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={(e) => setForm({...form, confirmPassword: e.target.value})} required />
          <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})}>
            <option value="customer">Customer - Looking for services</option>
            <option value="provider">Service Provider - Offering services</option>
          </select>
          {form.role === 'provider' && <input type="text" placeholder="Business Name" value={form.businessName} onChange={(e) => setForm({...form, businessName: e.target.value})} required />}
          <input type="tel" placeholder="Phone (Optional)" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
          <button type="submit" disabled={loading}>{loading ? 'Creating Account...' : 'Register'}</button>
        </form>
        <p>Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
};

export default Register;