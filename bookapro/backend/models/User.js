const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// USER SCHEMA - Stores user accounts (customers and service providers)
const UserSchema = new mongoose.Schema({
  // User's full name
  name: { 
    type: String, 
    required: true 
  },
  
  // User's email (used for login, must be unique)
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  
  // User's password (stored as hashed value, not plain text)
  password: { 
    type: String, 
    required: true 
  },
  
  // User role - determines what actions they can perform
  role: { 
    type: String, 
    enum: ['customer', 'provider'], 
    required: true 
  },
  
  // Business name (only for providers)
  businessName: { 
    type: String, 
    default: '' 
  },
  
  // Contact phone number
  phone: { 
    type: String, 
    default: '' 
  },
  
  // Account creation timestamp
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// HASH PASSWORD - Runs before saving to database
UserSchema.pre('save', function(next) {
  const user = this;
  
  // Only hash password if it was modified (not on every update)
  if (!user.isModified('password')) return next();
  
  // Generate salt and hash password
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);
      user.password = hash;  // Replace plain password with hash
      next();
    });
  });
});

// COMPARE PASSWORD - Used during login to verify credentials
UserSchema.methods.comparePassword = function(candidatePassword) {
  // Compare plain text password with stored hash
  return bcrypt.compareSync(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);