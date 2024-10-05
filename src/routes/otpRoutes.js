
import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Otp from '../models/otpModel.js';
import session from 'express-session';

dotenv.config();
const router = express.Router();

// Session Configuration
router.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 10 * 60 * 1000 } // Session expires in 10 minutes
}));

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Middleware to Check if Email Exists in Session
const checkSessionEmail = (req, res, next) => {
  if (!req.session.email) {
    return res.status(403).json({ success: false, message: 'Session expired. Please request a new OTP.' });
  }
  next();
};

// Route: Send OTP
router.post('/send', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Generate OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

  // Store OTP in database
  await Otp.updateOne({ email }, { email, otp, otpExpires }, { upsert: true });

  // Store email in session
  req.session.email = email;

  // Send OTP via email
  await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL, // Sender address
  to: email, // Receiver's email
  subject: 'OTP for Password Update',
  html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title></title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
          color: #333;
          background-color: #fff;
        }
        .container {
          margin: 0 auto;
          width: 100%;
          max-width: 600px;
          padding: 0 20px;
          padding-bottom: 10px;
          border-radius: 5px;
          line-height: 1.8;
        }
        .header {
          border-bottom: 1px solid #eee;
        }
        .header a {
          font-size: 1.4em;
          color: #000;
          text-decoration: none;
          font-weight: 600;
        }
        .content {
          min-width: 700px;
          overflow: auto;
          line-height: 2;
        }
        .otp {
          background: linear-gradient(to right, #00bc69 0, #00bc88 50%, #00bca8 100%);
          margin: 0 auto;
          width: max-content;
          padding: 0 10px;
          color: #fff;
          border-radius: 4px;
        }
        .footer {
          color: #aaa;
          font-size: 0.8em;
          line-height: 1;
          font-weight: 300;
        }
        .email-info {
          color: #666666;
          font-weight: 400;
          font-size: 13px;
          line-height: 18px;
          padding-bottom: 6px;
        }
        .email-info a {
          text-decoration: none;
          color: #00bc69;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <a>Password Update Verification</a>
        </div>
        <br />
        <strong>Dear Staff,</strong>
        <p>
          We have received an update password request for your YHAM account. For
          security purposes, please verify your identity by providing the
          following One-Time Password (OTP).
          <br />
          <b>Your One-Time Password (OTP) verification code is:</b>
        </p>
        <h2 class="otp">${otp}</h2>
        <p style="font-size: 0.9em">
          <strong>One-Time Password (OTP) is valid for 10 minutes.</strong>
          <br /><br />
          If you did not initiate this login request, please disregard this
          message. Please ensure the confidentiality of your OTP and do not share
          it with anyone.<br />
          <strong>Do not forward or give this code to anyone.</strong>
          <br /><br />
          <strong>Thank you for using YHAM.</strong>
          <br /><br />
          Best regards,<br />
          <strong>Team NeBots</strong>
        </p>
        <hr style="border: none; border-top: 0.5px solid #131111" />
        <div class="footer">
          <p>This email can't receive replies.</p>
          <p>
            <strong><a href="https://netbots.tech/">NetBots</a> | 
</strong>
          </p>
        </div>
      </div>
      <div style="text-align: center">
    
        <div class="email-info">
          &copy; 2023 YHAM. All rights
          reserved.
        </div>
      </div>
    </body>
    </html>
  `,
  
  });

  res.status(200).json({ success: true, message: 'OTP sent successfully' });
}));

// Route: Verify OTP
router.post('/verify-otp', asyncHandler(async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ success: false, message: 'OTP is required' });
  }

  // Find OTP in database
  const otpEntry = await Otp.findOne({ otp, email: req.session.email });

  if (!otpEntry || otpEntry.otpExpires < Date.now()) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  }

  // OTP is valid, clear OTP from database
  await Otp.deleteOne({ otp });

  res.status(200).json({ success: true, message: 'OTP verified successfully' });
}));

// Route: Update Password
router.post('/update-password', checkSessionEmail, asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  console.log("req.session.email",req.session.email);
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
  }

  const user = await User.findOne({ email: req.session.email });
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  // Clear session after successful password update
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to update session' });
    }

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  });
}));

export default router;
