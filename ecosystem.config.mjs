import dotenv from 'dotenv';

dotenv.config();

export default {
  apps: [
    {
      name: "backend-api",
      script: "./server.js",
      env: {
        NODE_ENV: "production",
        SESSION_SECRET: process.env.SESSION_SECRET,
        MONGO_URI: process.env.MONGO_URI,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_REGION: process.env.AWS_REGION,
        S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
        JWT_SECRET: process.env.JWT_SECRET,
        PORT: process.env.PORT,
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_SECURE: process.env.SMTP_SECURE,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASS: process.env.SMTP_PASS,
        SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL,
      },
    },
  ],
};
