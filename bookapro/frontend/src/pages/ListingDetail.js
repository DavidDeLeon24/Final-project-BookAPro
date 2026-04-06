import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import listingService from '../services/listingService';
import reviewService from '../services/reviewService';  // ← Make sure this is correct
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import { useAuth } from '../context/AuthContext';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isCustomer } = useAuth();
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const listingData = await listingService.getOne(id);
      setListing(listingData);
      
      // Fix: Use correct method name
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
      loadData();
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!listing) return <div className="loading">Listing not found</div>;

  return (
    <div className="detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      <div className="detail-content">
        <div className="detail-main">
          <h1>{listing.title}</h1>
          <p className="provider">Provider: {listing.provider?.businessName || listing.provider?.name}</p>
          <p className="description">{listing.description}</p>
          <div className="detail-info">
            <span>💰 ${listing.price}/{listing.priceUnit}</span>
            <span>⭐ {listing.averageRating?.toFixed(1) || 'No ratings yet'}</span>
          </div>

          <AvailabilityCalendar listingId={listing._id} />

          <div className="reviews-section">
            <h3>Customer Reviews ({reviews.length})</h3>
            {isAuthenticated && isCustomer && !showReviewForm && (
              <button className="write-review-btn" onClick={() => setShowReviewForm(true)}>
                Write a Review
              </button>
            )}
            
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