// models/logModel.js

import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  level: { type: String, required: true }, // Info, Error, Warning
  message: { type: String, required: true },
  method: { type: String },
  route: { type: String },
  ip: { type: String },
  location: { type: String }, // New field for geo-location
  userAgent: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // If available
  action: { type: String }, // Action type (GET, POST, DELETE)
  timestamp: { type: Date, default: Date.now },
});

const Log = mongoose.model('Log', logSchema);

export default Log;
