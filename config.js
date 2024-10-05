export const config = {
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017',
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    s3BucketName: process.env.S3_BUCKET_NAME,
  }
}
