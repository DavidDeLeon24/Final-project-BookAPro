import React, { useState, useEffect, useCallback } from 'react';
import listingService from '../services/listingService';
import ListingCard from '../components/ListingCard';

// Browse Page - Displays all available service listings with search and filter functionality
const Browse = () => {
  const [listings, setListings] = useState([]);           // Array of service listings
  const [loading, setLoading] = useState(true);           // Loading state indicator
  const [searchTerm, setSearchTerm] = useState('');       // Current search keyword
  const [selectedCategory, setSelectedCategory] = useState('all'); // Selected category filter

  // Available service categories for filtering
  const categories = ['all', 'plumber', 'electrician', 'tutor', 'photographer', 'carpenter', 'painter', 'cleaner', 'gardener'];

  // Load listings from API based on search term and category
  const loadListings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listingService.getAll({ 
        keyword: searchTerm, 
        category: selectedCategory 
      });
      setListings(data);
    } catch (error) {
      console.error('Error loading listings:', error);
    }
    setLoading(false);
  }, [searchTerm, selectedCategory]);

  // Reload listings when search term or category changes
  useEffect(() => {
    loadListings();
  }, [loadListings]);

  return (
    <div className="browse-container">
      <h1>Browse All Services</h1>
      
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
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Content Display Section */}
      {loading ? (
        // Show loading spinner while fetching data
        <div className="loading">Loading services...</div>
      ) : listings.length === 0 ? (
        // Show message when no listings match the criteria
        <div className="no-results">
          <h3>No services found</h3>
          <p>Try adjusting your search or check back later for new services.</p>
        </div>
      ) : (
        // Display listings in a responsive grid
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