import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import listingService from '../services/listingService';

// CreateListing Page - Allows providers to create a new service listing
const CreateListing = () => {
  const navigate = useNavigate();
  
  // Form state for listing data
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    priceUnit: 'hour',
    location: { city: '' }
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Available service categories
  const categories = ['plumber', 'electrician', 'tutor', 'photographer', 'carpenter', 'painter', 'cleaner', 'gardener', 'other'];

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await listingService.create(formData);
      alert('Listing created successfully!');
      navigate('/my-listings');
    } catch (err) {
      console.error('Create error:', err);
      setError(err.response?.data?.message || 'Failed to create listing');
    }
    setLoading(false);
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h2>Create New Listing</h2>
        
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
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.toUpperCase()}</option>
            ))}
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
              <option value="session">Per Session</option>
              <option value="day">Per Day</option>
            </select>
          </div>
          
          {/* Location city input */}
          <input
            type="text"
            placeholder="City"
            value={formData.location.city}
            onChange={(e) => setFormData({
              ...formData,
              location: { city: e.target.value }
            })}
          />
          
          {/* Submit and Cancel buttons */}
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
          <button type="button" className="cancel-btn" onClick={() => navigate('/my-listings')}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;