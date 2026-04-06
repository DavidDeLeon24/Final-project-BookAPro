import React, { useState, useEffect, useCallback } from 'react';
import listingService from '../services/listingService';
import ListingCard from '../components/ListingCard';

const Browse = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'plumber', 'electrician', 'tutor', 'photographer', 'carpenter', 'painter', 'cleaner', 'gardener'];

  const loadListings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listingService.getAll({ keyword: searchTerm, category: selectedCategory });
      setListings(data);
    } catch (error) {
      console.error('Error loading listings:', error);
    }
    setLoading(false);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  return (
    <div className="browse-container">
      <h1>Browse All Services</h1>
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
      {loading ? (
        <div className="loading">Loading services...</div>
      ) : listings.length === 0 ? (
        <div className="no-results">
          <h3>No services found</h3>
          <p>Try adjusting your search or check back later for new services.</p>
        </div>
      ) : (
        <div className="listings-grid">
          {listings.map(listing => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Browse;