import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

// Helper function to parse cookies from headers
const parseCookies = (cookieHeader) => {
  const cookies = {};
  cookieHeader && cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    cookies[parts[0].trim()] = (parts[1] || '').trim();
  });
  return cookies;
};

// Middleware to protect routes (check token)
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  console.log("Headers: ", req.headers);

  // Check if the cookie exists in headers
  if (req.headers.cookie) {
    // Parse the cookies from the header
    const cookies = parseCookies(req.headers.cookie);
    token = cookies.token; // Assuming the token cookie is named 'token'
    
    console.log("Token from cookies: ", token);

    if (token) {
      try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        
        console.log("User from token: ", req.user);
        if (!req.user) {
          return res.status(401).json({ message: 'User not found' });
        }
        
        next(); // Proceed to the next middleware/route handler
        console.log("User authorized");
      } catch (error) {
        console.error('Error in token verification:', error);
        return res.status(401).json({ message: 'Not authorized, token failed' });
      }
    } else {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no cookies found' });
  }
});

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role (${req.user.role}) is not authorized to access this resource` });
    }
    next();
  };
};
