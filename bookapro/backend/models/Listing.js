const mongoose = require('mongoose');

// LISTING SCHEMA - Represents a service offered by a provider (e.g., plumbing, tutoring)
const listingSchema = new mongoose.Schema({
  // Provider who offers this service (references User model)
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Service title (e.g., "Professional Plumbing Services")
  title: {
    type: String,
    required: true
  },
  
  // Service category for filtering and search
  category: {
    type: String,
    required: true,
    enum: ['plumber', 'electrician', 'tutor', 'photographer', 'carpenter', 'painter', 'cleaner', 'gardener', 'other']
  },
  
  // Detailed description of the service
  description: {
    type: String,
    required: true
  },
  
  // Price amount (e.g., 75)
  price: {
    type: Number,
    required: true
  },
  
  // Price unit (hour, project, session, day)
  priceUnit: {
    type: String,
    default: 'hour'
  },
  
  // Service location (city where service is offered)
  location: {
    city: { type: String, default: '' }
  },
  
  // Average rating from customer reviews (calculated automatically)
  averageRating: {
    type: Number,
    default: 0
  },
  
  // Total number of reviews received
  totalReviews: {
    type: Number,
    default: 0
  },
  
  // Whether listing is active (soft delete - false means hidden)
  isActive: {
    type: Boolean,
    default: true
  },
  
  // When the listing was created
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Listing', listingSchema);