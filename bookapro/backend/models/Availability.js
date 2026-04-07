const mongoose = require('mongoose');

// AVAILABILITY SCHEMA - Manages service provider's available time slots and bookings
const availabilitySchema = new mongoose.Schema({
  // Provider (service professional) who owns this availability slot
  provider: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Which service listing this availability belongs to
  listing: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Listing', 
    required: true 
  },
  
  // Date of the availability slot (YYYY-MM-DD)
  date: { 
    type: Date, 
    required: true 
  },
  
  // Time slot (9 AM to 5 PM in 1-hour intervals)
  timeSlot: { 
    type: String, 
    enum: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'], 
    required: true 
  },
  
  // Status of this time slot
  status: { 
    type: String, 
    enum: ['available', 'booked', 'unavailable'], 
    default: 'available' 
  },
  
  // Customer who booked this slot (only if status is 'booked')
  bookedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  // Optional message from customer when booking
  message: { 
    type: String 
  }
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt fields
});

// UNIQUE INDEX - Prevents double-booking the same time slot for the same listing
// Each provider can only have ONE status per (listing, date, timeSlot)
availabilitySchema.index({ provider: 1, listing: 1, date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema);