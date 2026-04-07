const mongoose = require('mongoose');

// REVIEW SCHEMA - Stores customer ratings and comments for service providers
const reviewSchema = new mongoose.Schema({
  // Customer who wrote the review (references User model)
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Provider being reviewed (references User model)
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Which service listing was reviewed (optional, references Listing model)
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing'
  },
  
  // Rating score (1 to 5 stars)
  rating: {
    type: Number,
    required: true,
    min: 1,    // Minimum 1 star
    max: 5     // Maximum 5 stars
  },
  
  // Written review comment
  comment: {
    type: String,
    required: true
  }
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Review', reviewSchema);