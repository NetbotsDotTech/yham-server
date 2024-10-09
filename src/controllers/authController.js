import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../utils/token.js';

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password,phoneNo, role } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({ name, email, password,phoneNo, role });

  if (user) {
    res.cookie('token', generateToken(user._id), {
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'Strict', 
      maxAge: 30 * 24 * 60 * 60 * 1000, 
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNo: user.phoneNo,
      role: user.role,
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
});




export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.cookie('token', generateToken(user._id), {
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'Strict', 
      maxAge: 30 * 24 * 60 * 60 * 1000, 
    });

    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});


export const logoutUser = (req, res) => {
    res.cookie('token', '', {
      expires: new Date(0), 
    });
  
    res.status(200).json({ message: 'Logged out successfully' });
  };
  

