import mongoose from 'mongoose';
import dotenv from 'dotenv';


dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://netbotstech:yhamAdmin@cluster0.dej3w.mongodb.net/yham?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
