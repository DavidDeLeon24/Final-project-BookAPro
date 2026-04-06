import React, { useState, useEffect, useCallback } from 'react';
import listingService from '../services/listingService';
import ListingCard from '../components/ListingCard';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'plumber', 'electrician', 'tutor', 'photographer', 'carpenter', 'painter', 'cleaner', 'gardener'];

  const loadListings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching listings with:', { searchTerm, selectedCategory });
      const data = await listingService.getAll({ 
        keyword: searchTerm, 
        category: selectedCategory 
      });
      console.log('Listings received:', data);
      setListings(data);
    } catch (err) {
      console.error('Error loading listings:', err);
      setError(err.message || 'Failed to load listings');
    }
    setLoading(false);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  return (
    <div>
      <div className="hero">
        <h1>Find Trusted Local Professionals</h1>
        <p>Connect with skilled service providers in your community</p>
        {isAuthenticated && (
          <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.2)', borderRadius: '5px', display: 'inline-block' }}>
            Welcome back, {user?.name}! 👋
          </div>
        )}
      </div>
      
      <div className="search-section">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search for services..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="listings-section">
        <h2>Popular Services</h2>
        {error && <div className="error-message">{error}</div>}
        {loading ? (
          <div className="loading">Loading services...</div>
        ) : listings.length === 0 ? (
          <div className="no-results">
            <h3>No services found</h3>
            <p>Try adjusting your search or check back later for new services.</p>
            {!isAuthenticated && (
              <p style={{ marginTop: '1rem' }}>
                <a href="/register" style={{ color: '#007bff' }}>Register as a provider</a> to add your services!
              </p>
            )}
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map(listing => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;