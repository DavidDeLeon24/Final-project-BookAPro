import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import listingService from '../services/listingService';
import { useAuth } from '../context/AuthContext';

// MyListings Page - Provider dashboard to manage their service listings
// Allows providers to view, edit, delete, and create new listings
const MyListings = () => {
  const [listings, setListings] = useState([]);  // Array of provider's listings
  const [loading, setLoading] = useState(true);  // Loading state
  const [error, setError] = useState('');        // Error message state
  const navigate = useNavigate();
  const { isProvider } = useAuth();              // Check if user is a provider

  // Load provider's listings from API
  const loadListings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listingService.getMyListings();
      setListings(data);
    } catch (err) {
      console.error('Error loading listings:', err);
      setError('Failed to load listings. Please make sure you are logged in as a provider.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load listings when component mounts and user is a provider
  useEffect(() => {
    if (isProvider) {
      loadListings();
    }
  }, [isProvider, loadListings]);

  // Handle listing deletion with confirmation
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await listingService.delete(id);
        loadListings();  // Refresh the list
        alert('Listing deleted successfully!');
      } catch (err) {
        alert('Failed to delete listing');
      }
    }
  };

  // Show access denied message if user is not a provider
  if (!isProvider) {
    return (
      <div className="my-listings-container">
        <div className="error-message">
          This page is only for service providers. Please register as a provider to manage listings.
        </div>
      </div>
    );
  }

  // Show loading indicator
  if (loading) {
    return <div className="loading">Loading your listings...</div>;
  }

  return (
    <div className="my-listings-container">
      {/* Header with Add button */}
      <div className="dashboard-header">
        <h1>My Listings</h1>
        <button className="add-btn" onClick={() => navigate('/create-listing')}>
          + Add New Listing
        </button>
      </div>

      {/* Display error message if any */}
      {error && <div className="error-message">{error}</div>}

      {/* Show appropriate content based on listings count */}
      {listings.length === 0 ? (
        // Empty state - no listings yet
        <div className="no-listings">
          <h3>No listings yet</h3>
          <p>Click the "Add New Listing" button above to create your first service listing!</p>
        </div>
      ) : (
        // Display listings in grid
        <div className="listings-grid">
          {listings.map(listing => (
            <div key={listing._id} className="listing-card">
              {/* Listing details */}
              <h3>{listing.title}</h3>
              <p className="category">{listing.category}</p>
              <p className="description">{listing.description?.substring(0, 100)}...</p>
              <div className="price">💰 ${listing.price}/{listing.priceUnit}</div>
              <div className="rating">⭐ {listing.averageRating?.toFixed(1) || 'No ratings'}</div>
              
              {/* Action buttons */}
              <div className="card-actions">
                <button className="edit-btn" onClick={() => navigate(`/edit-listing/${listing._id}`)}>
                  Edit
                </button>
                <button className="delete-btn" onClick={() => handleDelete(listing._id)}>
                  Delete
                </button>
                <button className="view-btn" onClick={() => navigate(`/listing/${listing._id}`)}>
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;