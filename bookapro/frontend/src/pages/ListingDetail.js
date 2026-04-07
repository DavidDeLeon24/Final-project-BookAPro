import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import listingService from '../services/listingService';
import reviewService from '../services/reviewService';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import { useAuth } from '../context/AuthContext';

// ListingDetail Page - Shows detailed information about a specific service listing
// Includes service details, provider info, availability calendar, and customer reviews
const ListingDetail = () => {
  const { id } = useParams();           // Get listing ID from URL
  const navigate = useNavigate();
  const { isAuthenticated, isCustomer } = useAuth();
  
  // State variables
  const [listing, setListing] = useState(null);      // Listing data
  const [reviews, setReviews] = useState([]);        // Customer reviews
  const [rating, setRating] = useState(5);           // Selected rating for new review
  const [comment, setComment] = useState('');        // Review comment text
  const [showReviewForm, setShowReviewForm] = useState(false); // Toggle review form
  const [loading, setLoading] = useState(true);      // Loading state

  // Load listing data and reviews
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const listingData = await listingService.getOne(id);
      setListing(listingData);
      
      // Get reviews for this provider
      const reviewsData = await reviewService.getProviderReviews(listingData.provider._id);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await reviewService.create({
        providerId: listing.provider._id,
        listingId: listing._id,
        rating,
        comment
      });
      setShowReviewForm(false);
      setRating(5);
      setComment('');
      loadData();  // Refresh data to show new review
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    }
  };

  // Show loading indicator while fetching data
  if (loading) return <div className="loading">Loading...</div>;
  if (!listing) return <div className="loading">Listing not found</div>;

  return (
    <div className="detail-container">
      {/* Back button */}
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      
      <div className="detail-content">
        <div className="detail-main">
          {/* Listing Title */}
          <h1>{listing.title}</h1>
          
          {/* Provider Information */}
          <p className="provider">Provider: {listing.provider?.businessName || listing.provider?.name}</p>
          
          {/* Service Description */}
          <p className="description">{listing.description}</p>
          
          {/* Price and Rating Summary */}
          <div className="detail-info">
            <span>💰 ${listing.price}/{listing.priceUnit}</span>
            <span>⭐ {listing.averageRating?.toFixed(1) || 'No ratings yet'}</span>
          </div>

          {/* Availability Calendar Component */}
          <AvailabilityCalendar listingId={listing._id} />

          {/* Reviews Section */}
          <div className="reviews-section">
            <h3>Customer Reviews ({reviews.length})</h3>
            
            {/* Write Review Button - only visible to authenticated customers */}
            {isAuthenticated && isCustomer && !showReviewForm && (
              <button className="write-review-btn" onClick={() => setShowReviewForm(true)}>
                Write a Review
              </button>
            )}
            
            {/* Review Form - appears when Write Review is clicked */}
            {showReviewForm && (
              <form className="review-form" onSubmit={handleSubmitReview}>
                <select value={rating} onChange={(e) => setRating(parseInt(e.target.value))}>
                  {[5,4,3,2,1].map(r => (
                    <option key={r} value={r}>{r} Stars {r === 5 ? '⭐' : ''}</option>
                  ))}
                </select>
                <textarea 
                  placeholder="Share your experience..." 
                  value={comment} 
                  onChange={(e) => setComment(e.target.value)} 
                  required 
                  rows="3"
                />
                <button type="submit">Submit Review</button>
                <button type="button" onClick={() => setShowReviewForm(false)}>Cancel</button>
              </form>
            )}

            {/* Display Reviews List */}
            {reviews.length === 0 ? (
              <p>No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map(review => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <strong>{review.customer?.name}</strong>
                    <span>⭐ {review.rating}/5</span>
                  </div>
                  <p>{review.comment}</p>
                  <small>{new Date(review.createdAt).toLocaleDateString()}</small>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;