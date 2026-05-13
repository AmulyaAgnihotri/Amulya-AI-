import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  // Skip connection if no URI is configured
  if (!MONGODB_URI || MONGODB_URI.includes('YOUR_PASSWORD') || MONGODB_URI.includes('xxxxx')) {
    console.log('⚠️  No MongoDB URI configured. Running with localStorage fallback.');
    console.log('   Set MONGODB_URI in .env to enable database features.');
    return;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️  App will run without database (localStorage fallback).');
  }
}

export function isDBConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

export default mongoose;
