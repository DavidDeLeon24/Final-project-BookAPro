const Review = require('../models/Review');
const User = require('../models/User');
const Listing = require('../models/Listing');

// CREATE REVIEW - Customer leaves a rating and comment for a provider
const createReview = async (req, res) => {
  try {
    // Only customers can write reviews
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can leave reviews' });
    }
    
    const { providerId, listingId, rating, comment } = req.body;
    
    // Check if customer already reviewed this provider
    const existingReview = await Review.findOne({
      customer: req.user.id,
      provider: providerId
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this provider' });
    }
    
    // Create new review
    const review = await Review.create({
      customer: req.user.id,
      provider: providerId,
      listing: listingId,
      rating,
      comment
    });
    
    // Calculate new average rating for the provider
    const reviews = await Review.find({ provider: providerId });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    // Update provider's average rating
    await User.findByIdAndUpdate(providerId, { averageRating });
    
    // Update listing's average rating and review count
    if (listingId) {
      await Listing.findByIdAndUpdate(listingId, {
        averageRating,
        totalReviews: reviews.length
      });
    }
    
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET PROVIDER REVIEWS - Get all reviews for a specific provider
const getProviderReviews = async (req, res) => {
  try {
    // Find all reviews for this provider, include customer name, newest first
    const reviews = await Review.find({ provider: req.params.providerId })
      .populate('customer', 'name')  // Include customer's name only
      .sort('-createdAt');           // Newest reviews first
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getProviderReviews };