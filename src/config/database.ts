import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is required. Add it to your environment or .env file.');
  }

  mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB.');
  });

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected.');
  });

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });
};
