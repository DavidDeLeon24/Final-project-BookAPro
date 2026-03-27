const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['plumber', 'electrician', 'tutor', 'photographer', 'carpenter', 'painter', 'cleaner', 'gardener', 'other']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  priceUnit: {
    type: String,
    default: 'hour',
    enum: ['hour', 'project', 'session', 'day']
  },
  location: {
    city: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Listing', listingSchema);