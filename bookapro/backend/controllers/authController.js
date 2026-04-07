const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token for authenticated user
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'  // Token expires in 30 days
  });
};

// REGISTER - Create a new user account
const register = async (req, res) => {
  try {
    const { name, email, password, role, businessName, phone } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role,
      businessName: role === 'provider' ? businessName : undefined,  // Only providers need business name
      phone
    });

    // Return user data with token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessName: user.businessName,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN - Authenticate existing user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');

    // User not found
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Return user data with token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessName: user.businessName,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET CURRENT USER - Get authenticated user's profile
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);  // req.user comes from auth middleware
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe };