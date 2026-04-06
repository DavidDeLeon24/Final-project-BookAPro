import api from './api';

const reviewService = {
  // Create a new review
  create: async (reviewData) => {
    try {
      const response = await api.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  // Get all reviews for a specific provider
  getProviderReviews: async (providerId) => {
    try {
      const response = await api.get(`/reviews/provider/${providerId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting provider reviews:', error);
      throw error;
    }
  },

  // Get all reviews for a specific listing
  getListingReviews: async (listingId) => {
    try {
      const response = await api.get(`/reviews/listing/${listingId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting listing reviews:', error);
      throw error;
    }
  },

  // Delete a review (owner only)
  deleteReview: async (reviewId) => {
    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }
};

export default reviewService;