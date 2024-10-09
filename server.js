import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { requestLogger, errorLogger } from './src/middlewares/logger.js';
import { errorHandler } from './src/middlewares/errorHandler.js';
import connectDB from './db.js';
import cookieParser from 'cookie-parser';

import userRoutes from './src/routes/userRoutes.js';
import artifactRoutes from './src/routes/artifactRoutes.js';
import qrRoutes from './src/routes/qrCodes.js';
import timeTableRoutes from './src/routes/timeTableRoutes.js';
import otpRoutes from './src/routes/otpRoutes.js';
import FeedbackRoutes from './src/routes/feedbackRoutes.js';
const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url)));


const { version } = pkg;

import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cookieParser());

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'https://ec2-35-153-210-209.compute-1.amazonaws.com',
  'http://ec2-35-153-210-209.compute-1.amazonaws.com',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((err) => {
    console.error('Database connection failed');
    console.error(err);
    process.exit(1);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Hello from Yousuf Hussain Abadi Museum Server</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
        }
        h1 {
          color: #333;
        }
        p {
          color: #666;
        }
      </style>
    </head>
    <body>
      <h1>Hello from Yousuf Hussain Abadi Museum Server</h1>
      <p>The server is running on port 3000.</p>
      <p>App Version: ${version}</p>
    </body>
    </html>
  `);
});

app.use('/api/user', userRoutes);
app.use('/api/artifacts', artifactRoutes);
app.use('/api/feedback', FeedbackRoutes);
app.use('/api/qr-codes', qrRoutes);
app.use('/api/time-table', timeTableRoutes);
app.use('/api/otp', otpRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
