const router = require('express').Router();
const Listing = require('../models/Listing');
const auth = require('../middleware/auth');

// Get all listings
router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.query.keyword) {
      query.$or = [
        { title: { $regex: req.query.keyword, $options: 'i' } },
        { description: { $regex: req.query.keyword, $options: 'i' } }
      ];
    }
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }
    
    const listings = await Listing.find(query).populate('provider', 'name businessName').sort('-createdAt');
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('provider', 'name businessName email phone');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create listing - FIXED
router.post('/', auth, async (req, res) => {
  try {
    console.log('=== CREATE LISTING ===');
    console.log('User:', req.user);
    console.log('Body:', req.body);
    
    // Check if user is provider
    if (!req.user || req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers can create listings' });
    }
    
    const { title, category, description, price, priceUnit, location } = req.body;
    
    // Validate
    if (!title || !category || !description || !price) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const listing = new Listing({
      title,
      category,
      description,
      price: Number(price),
      priceUnit: priceUnit || 'hour',
      location: location || { city: '' },
      provider: req.user.id
    });
    
    await listing.save();
    console.log('Listing created:', listing._id);
    res.status(201).json(listing);
  } catch (err) {
    console.error('Create listing error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update listing
router.put('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    Object.assign(listing, req.body);
    await listing.save();
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete listing
router.delete('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await listing.deleteOne();
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my listings
router.get('/my/listings', auth, async (req, res) => {
  try {
    const listings = await Listing.find({ provider: req.user.id });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;