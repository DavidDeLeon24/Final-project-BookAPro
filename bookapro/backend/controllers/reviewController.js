const Review = require('../models/Review');
const User = require('../models/User');
const Listing = require('../models/Listing');

const createReview = async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can leave reviews' });
    }
    
    const { providerId, listingId, rating, comment } = req.body;
    
    const existingReview = await Review.findOne({
      customer: req.user.id,
      provider: providerId
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this provider' });
    }
    
    const review = await Review.create({
      customer: req.user.id,
      provider: providerId,
      listing: listingId,
      rating,
      comment
    });
    
    const reviews = await Review.find({ provider: providerId });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    await User.findByIdAndUpdate(providerId, { averageRating });
    
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

const getProviderReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ provider: req.params.providerId })
      .populate('customer', 'name')
      .sort('-createdAt');
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getProviderReviews };