const Availability = require('../models/Availability');

// GET AVAILABILITY - Get all availability slots for a specific provider
const getAvailability = async (req, res) => {
  try {
    const { providerId } = req.params;
    // Find all availability records for this provider
    const availability = await Availability.find({ provider: providerId });
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE AVAILABILITY - Provider marks dates as available/unavailable
const updateAvailability = async (req, res) => {
  try {
    // Only providers can update availability
    if (req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers can update availability' });
    }
    
    const { date, status } = req.body;
    
    // Find existing or create new availability record
    const availability = await Availability.findOneAndUpdate(
      { provider: req.user.id, date: new Date(date) },  // Find by provider and date
      { provider: req.user.id, date: new Date(date), status },  // Update data
      { upsert: true, new: true }  // Create if doesn't exist, return updated record
    );
    
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REQUEST BOOKING - Customer books an available time slot
const requestBooking = async (req, res) => {
  try {
    // Only customers can book services
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can request bookings' });
    }
    
    const { providerId, listingId, date, message } = req.body;
    
    // Find an available slot for the requested date
    const availability = await Availability.findOne({
      provider: providerId,
      date: new Date(date),
      status: 'available'  // Must be available
    });
    
    // No available slot found
    if (!availability) {
      return res.status(400).json({ message: 'This date is not available for booking' });
    }
    
    // Book the slot
    availability.status = 'booked';
    availability.bookingRequest = {
      customer: req.user.id,
      listing: listingId,
      message,
      requestedAt: new Date()
    };
    
    await availability.save();
    
    res.json({ message: 'Booking request sent successfully', availability });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAvailability, updateAvailability, requestBooking };