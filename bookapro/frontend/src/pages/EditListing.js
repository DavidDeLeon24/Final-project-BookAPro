import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import listingService from '../services/listingService';

// EditListing Page - Allows providers to edit their existing service listing
const EditListing = () => {
  const { id } = useParams();        // Get listing ID from URL
  const navigate = useNavigate();
  
  // Form state for listing data
  const [formData, setFormData] = useState({
    title: '', category: '', description: '', price: '', priceUnit: 'hour', location: { city: '' }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);    // Loading state for fetching listing
  const [submitting, setSubmitting] = useState(false); // Loading state for form submission

  // Available service categories
  const categories = ['plumber', 'electrician', 'tutor', 'photographer', 'carpenter', 'painter', 'cleaner', 'gardener', 'other'];

  // Load existing listing data
  const loadListing = useCallback(async () => {
    try {
      const data = await listingService.getOne(id);
      setFormData({
        title: data.title,
        category: data.category,
        description: data.description,
        price: data.price,
        priceUnit: data.priceUnit,
        location: data.location || { city: '' }
      });
    } catch (error) {
      setError('Failed to load listing');
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadListing();
  }, [loadListing]);

  // Handle form submission - update listing
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await listingService.update(id, formData);
      alert('Listing updated successfully!');
      navigate('/my-listings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update listing');
    }
    setSubmitting(false);
  };

  // Show loading indicator while fetching listing data
  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="form-container">
      <div className="form-card">
        <h2>Edit Listing</h2>
        
        {/* Display error message if any */}
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* Title input */}
          <input 
            type="text" 
            placeholder="Title" 
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})} 
            required 
          />
          
          {/* Category dropdown */}
          <select 
            value={formData.category} 
            onChange={(e) => setFormData({...formData, category: e.target.value})} 
            required
          >
            <option value="">Select Category</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
          </select>
          
          {/* Description textarea */}
          <textarea 
            placeholder="Description" 
            rows="5" 
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})} 
            required 
          />
          
          {/* Price and Price Unit row */}
          <div className="form-row">
            <input 
              type="number" 
              placeholder="Price" 
              value={formData.price} 
              onChange={(e) => setFormData({...formData, price: e.target.value})} 
              required 
            />
            <select 
              value={formData.priceUnit} 
              onChange={(e) => setFormData({...formData, priceUnit: e.target.value})}
            >
              <option value="hour">Per Hour</option>
              <option value="project">Per Project</option>
              <option value="day">Per Day</option>
            </select>
          </div>
          
          {/* Location city input */}
          <input 
            type="text" 
            placeholder="City" 
            value={formData.location.city} 
            onChange={(e) => setFormData({...formData, location: { city: e.target.value }})} 
          />
          
          {/* Submit and Cancel buttons */}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Updating...' : 'Update Listing'}
          </button>
          <button type="button" className="cancel-btn" onClick={() => navigate('/my-listings')}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditListing;