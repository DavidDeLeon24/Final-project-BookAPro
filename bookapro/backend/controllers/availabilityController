const Availability = require('../models/Availability');

const getAvailability = async (req, res) => {
  try {
    const { providerId } = req.params;
    const availability = await Availability.find({ provider: providerId });
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAvailability = async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers can update availability' });
    }
    
    const { date, status } = req.body;
    
    const availability = await Availability.findOneAndUpdate(
      { provider: req.user.id, date: new Date(date) },
      { provider: req.user.id, date: new Date(date), status },
      { upsert: true, new: true }
    );
    
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const requestBooking = async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can request bookings' });
    }
    
    const { providerId, listingId, date, message } = req.body;
    
    const availability = await Availability.findOne({
      provider: providerId,
      date: new Date(date),
      status: 'available'
    });
    
    if (!availability) {
      return res.status(400).json({ message: 'This date is not available for booking' });
    }
    
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