const Listing = require('../models/Listing');
const Review = require('../models/Review');

// GET ALL LISTINGS - Get all active listings with search and filter
const getListings = async (req, res) => {
  try {
    let query = { isActive: true };  // Only show active listings
    
    // Search by keyword (title or description)
    if (req.query.keyword) {
      query.$or = [
        { title: { $regex: req.query.keyword, $options: 'i' } },      // Case-insensitive title search
        { description: { $regex: req.query.keyword, $options: 'i' } }  // Case-insensitive description search
      ];
    }
    
    // Filter by category
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }
    
    // Get listings with provider info, sorted by newest first
    const listings = await Listing.find(query)
      .populate('provider', 'name businessName')  // Include provider name and business name
      .sort('-createdAt');  // Newest first
    
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE LISTING - Get detailed view of one listing with its reviews
const getListing = async (req, res) => {
  try {
    // Get listing with provider details
    const listing = await Listing.findById(req.params.id)
      .populate('provider', 'name businessName email phone');
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Get all reviews for this provider
    const reviews = await Review.find({ provider: listing.provider._id })
      .populate('customer', 'name');
    
    res.json({ listing, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE LISTING - Provider creates a new service listing
const createListing = async (req, res) => {
  try {
    // Only providers can create listings
    if (req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers can create listings' });
    }
    
    // Set the provider ID from authenticated user
    req.body.provider = req.user.id;
    const listing = await Listing.create(req.body);
    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE LISTING - Provider edits their own listing
const updateListing = async (req, res) => {
  try {
    let listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Check if current user owns this listing
    if (listing.provider.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Update listing
    listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,           // Return updated document
      runValidators: true  // Validate before updating
    });
    
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE LISTING - Provider removes their own listing
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Check if current user owns this listing
    if (listing.provider.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await listing.deleteOne();
    res.json({ message: 'Listing removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY LISTINGS - Get all listings for the authenticated provider
const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ provider: req.user.id });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getMyListings
};