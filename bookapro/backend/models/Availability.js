const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'unavailable'],
    default: 'available'
  },
  bookingRequest: {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing'
    },
    message: String,
    requestedAt: Date
  }
}, {
  timestamps: true
});

availabilitySchema.index({ provider: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema);