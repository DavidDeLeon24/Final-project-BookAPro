import api from './api';

const listingService = {
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

  getOne: async (id) => {
    try {
      const response = await api.get(`/listings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting listing:', error);
      throw error;
    }
  },

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

  update: async (id, listingData) => {
    try {
      const response = await api.put(`/listings/${id}`, listingData);
      return response.data;
    } catch (error) {
      console.error('Error updating listing:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/listings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting listing:', error);
      throw error;
    }
  },

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