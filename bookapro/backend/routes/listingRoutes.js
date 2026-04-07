const router = require('express').Router();
const Listing = require('../models/Listing');
const auth = require('../middleware/auth');

// GET / - Get all listings with optional search and category filters
router.get('/', async (req, res) => {
  try {
    let query = {};
    
    // Search by keyword in title or description
    if (req.query.keyword) {
      query.$or = [
        { title: { $regex: req.query.keyword, $options: 'i' } },
        { description: { $regex: req.query.keyword, $options: 'i' } }
      ];
    }
    
    // Filter by category
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category;
    }
    
    const listings = await Listing.find(query)
      .populate('provider', 'name businessName')
      .sort('-createdAt');
    
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /:id - Get single listing by ID with provider details
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('provider', 'name businessName email phone');
    
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST / - Create a new listing (providers only)
router.post('/', auth, async (req, res) => {
  try {
    // Only providers can create listings
    if (!req.user || req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers can create listings' });
    }
    
    const { title, category, description, price, priceUnit, location } = req.body;
    
    // Validate required fields
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
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /:id - Update a listing (owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    
    // Only the provider who owns this listing can update it
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

// DELETE /:id - Delete a listing (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    
    // Only the provider who owns this listing can delete it
    if (listing.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await listing.deleteOne();
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /my/listings - Get all listings for the authenticated provider
router.get('/my/listings', auth, async (req, res) => {
  try {
    const listings = await Listing.find({ provider: req.user.id });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;