import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const primaryURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vibevault';
  
  try {
    // Attempt standard connection to MongoDB Server / Atlas
    console.log(`Connecting to MongoDB at: ${primaryURI} ...`);
    await mongoose.connect(primaryURI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`✓ Connected to primary MongoDB at: ${primaryURI}`);
    console.log(`✓ You can open MongoDB Compass and connect to: ${primaryURI}`);
    return;
  } catch (primaryErr) {
    console.warn(`! Primary MongoDB connection failed (${primaryErr.message}).`);
    console.log(`! Initializing embedded MongoDB server instance for seamless development & Compass...`);

    try {
      // Fallback: Start embedded MongoDB server
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          port: 27017, // Try standard port first so Compass connects immediately
          dbName: 'vibevault'
        }
      });
      const memoryURI = mongoMemoryServer.getUri();
      await mongoose.connect(memoryURI);
      console.log(`✓ Embedded MongoDB started and connected successfully!`);
      console.log(`✓ Compass Connection URI: ${memoryURI}`);
    } catch (memErr) {
      // If port 27017 was taken or had permission issues, start with dynamic port
      console.log(`! Retrying embedded MongoDB with dynamic port...`);
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'vibevault'
        }
      });
      const memoryURI = mongoMemoryServer.getUri();
      await mongoose.connect(memoryURI);
      console.log(`✓ Embedded MongoDB connected successfully!`);
      console.log(`✓ Compass Connection URI: ${memoryURI}`);
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
