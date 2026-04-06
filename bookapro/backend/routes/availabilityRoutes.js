const router = require('express').Router();
const Availability = require('../models/Availability');
const Listing = require('../models/Listing');
const auth = require('../middleware/auth');

// Helper function to create date without timezone issues
function createUTCDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
}

// Get availability for a specific listing (public)
router.get('/listing/:listingId', async (req, res) => {
  try {
    const availability = await Availability.find({ listing: req.params.listingId });
    res.json(availability);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my bookings (customer only)
router.get('/my-bookings', auth, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can view bookings' });
    }
    
    const bookings = await Availability.find({ 
      bookedBy: req.user.id,
      status: 'booked'
    }).populate('listing provider', 'title name businessName price');
    
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update availability (provider only) - WITH OWNERSHIP CHECK
router.post('/', auth, async (req, res) => {
  try {
    console.log('=== UPDATE AVAILABILITY ===');
    console.log('User:', req.user);
    console.log('Request body:', req.body);
    
    // Check if user is provider
    if (req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers can update availability' });
    }
    
    const { listingId, date, timeSlot, status } = req.body;
    
    if (!listingId || !date || !timeSlot) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // CRITICAL SECURITY CHECK: Verify the listing belongs to this provider
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Check if the current user owns this listing
    if (listing.provider.toString() !== req.user.id) {
      console.log(`Security violation: User ${req.user.id} tried to update availability for listing ${listingId} owned by ${listing.provider}`);
      return res.status(403).json({ message: 'You can only update availability for your own listings' });
    }
    
    const targetDate = createUTCDate(date);
    
    let availability = await Availability.findOne({ 
      provider: req.user.id,
      listing: listingId,
      date: targetDate,
      timeSlot: timeSlot
    });
    
    if (availability) {
      availability.status = status;
      await availability.save();
      console.log('Updated existing availability');
    } else {
      availability = new Availability({ 
        provider: req.user.id,
        listing: listingId,
        date: targetDate, 
        timeSlot,
        status 
      });
      await availability.save();
      console.log('Created new availability');
    }
    
    res.json({ success: true, availability });
  } catch (err) {
    console.error('Error updating availability:', err);
    res.status(500).json({ message: err.message });
  }
});

// Cancel booking (customer only)
router.delete('/booking/:bookingId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can cancel bookings' });
    }
    
    const booking = await Availability.findOne({
      _id: req.params.bookingId,
      bookedBy: req.user.id,
      status: 'booked'
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    booking.status = 'available';
    booking.bookedBy = null;
    booking.message = null;
    await booking.save();
    
    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Request booking (customer only)
router.post('/book', auth, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can book services' });
    }
    
    const { listingId, providerId, date, timeSlot, message } = req.body;
    
    const targetDate = createUTCDate(date);
    
    const availability = await Availability.findOne({ 
      listing: listingId,
      provider: providerId, 
      date: targetDate,
      timeSlot: timeSlot,
      status: 'available' 
    });
    
    if (!availability) {
      return res.status(400).json({ message: 'This time slot is not available' });
    }
    
    availability.status = 'booked';
    availability.bookedBy = req.user.id;
    availability.message = message;
    await availability.save();
    
    res.json({ message: 'Booking request sent successfully' });
  } catch (err) {
    console.error('Error booking:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;