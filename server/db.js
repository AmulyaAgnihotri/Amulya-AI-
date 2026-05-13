import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/amulya-ai';

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  try {
    let uriToConnect = MONGODB_URI;
    
    // Check if using the default placeholder URI
    if (uriToConnect.includes('xxxxx.mongodb.net') || uriToConnect.includes('YOUR_PASSWORD')) {
      console.log('⚠️  Placeholder MongoDB URI detected. Starting local memory server...');
      const mongoServer = await MongoMemoryServer.create();
      uriToConnect = mongoServer.getUri();
    }
    
    const conn = await mongoose.connect(uriToConnect);
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
