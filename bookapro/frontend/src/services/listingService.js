import api from './api';

// Service for handling listing-related API calls
// Manages CRUD operations for service listings
const listingService = {
  // Get all listings with optional search and filter parameters
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);
      
      const response = await api.get(`/listings?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error getting listings:', error);
      throw error;
    }
  },

  // Get a single listing by ID
  getOne: async (id) => {
    try {
      const response = await api.get(`/listings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting listing:', error);
      throw error;
    }
  },

  // Create a new listing (provider only)
  create: async (listingData) => {
    try {
      console.log('Creating listing:', listingData);
      const response = await api.post('/listings', listingData);
      console.log('Create response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating listing:', error);
      throw error;
    }
  },

  // Update an existing listing (owner only)
  update: async (id, listingData) => {
    try {
      const response = await api.put(`/listings/${id}`, listingData);
      return response.data;
    } catch (error) {
      console.error('Error updating listing:', error);
      throw error;
    }
  },

  // Delete a listing (owner only)
  delete: async (id) => {
    try {
      const response = await api.delete(`/listings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting listing:', error);
      throw error;
    }
  },

  // Get all listings belonging to the authenticated provider
  getMyListings: async () => {
    try {
      const response = await api.get('/listings/my/listings');
      return response.data;
    } catch (error) {
      console.error('Error getting my listings:', error);
      throw error;
    }
  }
};

export default listingService;