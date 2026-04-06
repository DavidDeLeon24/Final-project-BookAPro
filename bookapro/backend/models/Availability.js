const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  provider: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  listing: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Listing', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  timeSlot: { 
    type: String, 
    enum: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['available', 'booked', 'unavailable'], 
    default: 'available' 
  },
  bookedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  message: { 
    type: String 
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate bookings per listing
availabilitySchema.index({ provider: 1, listing: 1, date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema);