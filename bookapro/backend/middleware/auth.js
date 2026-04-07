const jwt = require('jsonwebtoken');

// AUTHENTICATION MIDDLEWARE - Verifies JWT token before allowing access to protected routes
module.exports = (req, res, next) => {
  // Get token from request header (sent by frontend)
  const token = req.header('x-auth-token');
  
  // If no token, deny access
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  try {
    // Verify token using secret key from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user data to request object for use in route handlers
    req.user = decoded;  // Contains: { id, role, iat, exp }
    
    // Continue to the next middleware or route handler
    next();
  } catch (err) {
    // Token is invalid or expired
    res.status(401).json({ message: 'Token is not valid' });
  }
};