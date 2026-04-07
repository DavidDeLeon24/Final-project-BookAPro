const router = require('express').Router();
const Review = require('../models/Review');
const Listing = require('../models/Listing');
const auth = require('../middleware/auth');

// POST / - Create a new review (customers only)
router.post('/', auth, async (req, res) => {
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
      return res.status(400).json({ message: 'You already reviewed this provider' });
    }
    
    // Create new review
    const review = new Review({
      customer: req.user.id,
      provider: providerId,
      listing: listingId,
      rating,
      comment
    });
    await review.save();
    
    // Update listing's average rating and review count
    const reviews = await Review.find({ provider: providerId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Listing.findByIdAndUpdate(listingId, { 
      averageRating: avgRating, 
      totalReviews: reviews.length 
    });
    
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /provider/:providerId - Get all reviews for a specific provider
router.get('/provider/:providerId', async (req, res) => {
  try {
    const reviews = await Review.find({ provider: req.params.providerId })
      .populate('customer', 'name')
      .sort('-createdAt');
    
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;