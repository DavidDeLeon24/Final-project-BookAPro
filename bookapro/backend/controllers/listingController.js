const Listing = require('../models/Listing');
const Review = require('../models/Review');

const getListings = async (req, res) => {
  try {
    let query = { isActive: true };
    
    if (req.query.keyword) {
      query.$or = [
        { title: { $regex: req.query.keyword, $options: 'i' } },
        { description: { $regex: req.query.keyword, $options: 'i' } }
      ];
    }
    
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }
    
    const listings = await Listing.find(query)
      .populate('provider', 'name businessName')
      .sort('-createdAt');
    
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('provider', 'name businessName email phone');
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    const reviews = await Review.find({ provider: listing.provider._id })
      .populate('customer', 'name');
    
    res.json({ listing, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createListing = async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers can create listings' });
    }
    
    req.body.provider = req.user.id;
    const listing = await Listing.create(req.body);
    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateListing = async (req, res) => {
  try {
    let listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    if (listing.provider.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    if (listing.provider.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await listing.deleteOne();
    res.json({ message: 'Listing removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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