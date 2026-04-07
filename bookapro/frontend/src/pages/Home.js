import React, { useState, useEffect, useCallback } from 'react';
import listingService from '../services/listingService';
import ListingCard from '../components/ListingCard';
import { useAuth } from '../context/AuthContext';

// Home Page - Landing page with hero section, search, and listing display
const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [listings, setListings] = useState([]);      // List of service listings
  const [loading, setLoading] = useState(true);      // Loading state
  const [error, setError] = useState('');             // Error message state
  const [searchTerm, setSearchTerm] = useState('');   // Search keyword input
  const [selectedCategory, setSelectedCategory] = useState('all'); // Category filter

  // Available service categories
  const categories = ['all', 'plumber', 'electrician', 'tutor', 'photographer', 'carpenter', 'painter', 'cleaner', 'gardener'];

  // Load listings based on search term and category filter
  const loadListings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listingService.getAll({ 
        keyword: searchTerm, 
        category: selectedCategory 
      });
      setListings(data);
    } catch (err) {
      console.error('Error loading listings:', err);
      setError(err.message || 'Failed to load listings');
    }
    setLoading(false);
  }, [searchTerm, selectedCategory]);

  // Reload listings when search term or category changes
  useEffect(() => {
    loadListings();
  }, [loadListings]);

  return (
    <div>
      {/* Hero Section - Welcome banner */}
      <div className="hero">
        <h1>Find Trusted Local Professionals</h1>
        <p>Connect with skilled service providers in your community</p>
        {/* Show welcome message for authenticated users */}
        {isAuthenticated && (
          <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.2)', borderRadius: '5px', display: 'inline-block' }}>
            Welcome back, {user?.name}! 👋
          </div>
        )}
      </div>
      
      {/* Search and Filter Section */}
      <div className="search-section">
        <div className="search-bar">
          {/* Search input field */}
          <input 
            type="text" 
            placeholder="Search for services..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          {/* Category filter dropdown */}
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Listings Display Section */}
      <div className="listings-section">
        <h2>Popular Services</h2>
        
        {/* Display error message if any */}
        {error && <div className="error-message">{error}</div>}
        
        {/* Loading state */}
        {loading ? (
          <div className="loading">Loading services...</div>
        ) : listings.length === 0 ? (
          // No results message
          <div className="no-results">
            <h3>No services found</h3>
            <p>Try adjusting your search or check back later for new services.</p>
            {/* Encourage unauthenticated users to register as provider */}
            {!isAuthenticated && (
              <p style={{ marginTop: '1rem' }}>
                <a href="/register" style={{ color: '#007bff' }}>Register as a provider</a> to add your services!
              </p>
            )}
          </div>
        ) : (
          // Display listings in grid
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