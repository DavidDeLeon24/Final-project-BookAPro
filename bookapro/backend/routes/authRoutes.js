const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// REGISTER - Create a new user account
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, businessName, phone } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user (password will be hashed by User model pre-save hook)
    const user = new User({ name, email, password, role, businessName, phone });
    await user.save();
    
    // Generate JWT token for auto-login after registration
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    // Return token and user data (excluding password)
    res.status(201).json({
      token,
      user: { id: user._id, name, email, role, businessName }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN - Authenticate existing user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Verify password using comparePassword method
    const isMatch = user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token for authenticated session
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    // Return token and user data
    res.json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        businessName: user.businessName 
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET CURRENT USER - Get authenticated user's profile (protected route)
router.get('/me', auth, async (req, res) => {
  try {
    // Find user by ID from token (excluding password field)
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;