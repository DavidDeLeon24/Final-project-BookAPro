import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import listingService from '../services/listingService';
import { useAuth } from '../context/AuthContext';

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isProvider } = useAuth();

  const loadListings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listingService.getMyListings();
      console.log('My listings:', data);
      setListings(data);
    } catch (err) {
      console.error('Error loading listings:', err);
      setError('Failed to load listings. Please make sure you are logged in as a provider.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isProvider) {
      loadListings();
    }
  }, [isProvider, loadListings]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await listingService.delete(id);
        loadListings();
        alert('Listing deleted successfully!');
      } catch (err) {
        alert('Failed to delete listing');
      }
    }
  };

  if (!isProvider) {
    return (
      <div className="my-listings-container">
        <div className="error-message">
          This page is only for service providers. Please register as a provider to manage listings.
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading your listings...</div>;
  }

  return (
    <div className="my-listings-container">
      <div className="dashboard-header">
        <h1>My Listings</h1>
        <button className="add-btn" onClick={() => navigate('/create-listing')}>
          + Add New Listing
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {listings.length === 0 ? (
        <div className="no-listings">
          <h3>No listings yet</h3>
          <p>Click the "Add New Listing" button above to create your first service listing!</p>
        </div>
      ) : (
        <div className="listings-grid">
          {listings.map(listing => (
            <div key={listing._id} className="listing-card">
              <h3>{listing.title}</h3>
              <p className="category">{listing.category}</p>
              <p className="description">{listing.description?.substring(0, 100)}...</p>
              <div className="price">💰 ${listing.price}/{listing.priceUnit}</div>
              <div className="rating">⭐ {listing.averageRating?.toFixed(1) || 'No ratings'}</div>
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