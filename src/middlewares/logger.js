// middlewares/logger.js

import logger from '../utils/logger.js'; // Winston logger for file-based logging
import Log from '../models/logs.js'; // Mongoose log model

// Middleware to log requests (routine logs)
export const requestLogger = (req, res, next) => {
  const logMessage = `${req.method} ${req.originalUrl} - ${req.ip}`;
  logger.info(logMessage); // Log the request to a file
  next();
};

// Function to log essential data (errors, etc.) to the database
export const logToDatabase = async (level, message, req) => {
  try {
    const logEntry = new Log({
      level,
      message,
      method: req?.method || 'N/A',
      route: req?.originalUrl || 'N/A',
      ip: req?.ip || 'N/A',
      userAgent: req?.headers['user-agent'] || 'N/A',
    });

    await logEntry.save(); // Save to MongoDB
    logger.info(`Log saved to DB: ${message}`); // Also log to file
  } catch (error) {
    logger.error(`Failed to log to DB: ${error.message}`);
  }
};

// Middleware to log errors (critical logs)
export const errorLogger = async (err, req, res, next) => {
  const errorMessage = `${req.method} ${req.originalUrl} - ${err.message}`;
  
  // Log to file
  logger.error(errorMessage);

  // Log to database (essential log)
  await logToDatabase('error', errorMessage, req);

  res.status(500).json({ message: 'Internal server error' });
};
