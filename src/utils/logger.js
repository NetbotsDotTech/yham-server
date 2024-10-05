// logger.js

import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

// Set up Daily Rotate File transport for log rotation
const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join('logs', 'app-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',  // Keep logs for 14 days
  zippedArchive: true,  // Compress old logs
});

// Define the log format
const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// Create Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    logFormat
  ),
  transports: [
    dailyRotateFileTransport, // Routine logs with rotation
    new winston.transports.Console(), // Also log to console in development
  ],
});

export default logger;
