import api from './api';

// Service for handling availability-related API calls
// Manages provider availability slots and customer bookings
const availabilityService = {
  // Get availability for a specific listing - shows all time slots for a service
  getListingAvailability: async (listingId) => {
    try {
      console.log('Fetching availability for listing:', listingId);
      const response = await api.get(`/availability/listing/${listingId}`);
      console.log('Availability response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting availability:', error);
      throw error;
    }
  },

  // Update availability - provider marks a time slot as available or unavailable
  updateAvailability: async (listingId, date, timeSlot, status) => {
    try {
      console.log('Updating availability:', { listingId, date, timeSlot, status });
      const response = await api.post('/availability', { listingId, date, timeSlot, status });
      console.log('Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating availability:', error);
      throw error;
    }
  },

  // Book a service - customer books an available time slot
  bookService: async (bookingData) => {
    try {
      console.log('Booking service:', bookingData);
      const response = await api.post('/availability/book', bookingData);
      console.log('Booking response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error booking service:', error);
      throw error;
    }
  }
};

export default availabilityService;