import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Spa } from '../models/Spa';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully. Cleaning spas collection...');
    
    await Spa.deleteMany({});
    console.log('Spas collection cleared.');

    const seedFilePath = path.join(__dirname, 'lucknow-spas.seed.json');
    if (!fs.existsSync(seedFilePath)) {
      throw new Error(`Seed data file not found at ${seedFilePath}`);
    }

    const rawData = fs.readFileSync(seedFilePath, 'utf8');
    const spasData = JSON.parse(rawData);

    console.log(`Seeding ${spasData.length} spa documents...`);
    await Spa.insertMany(spasData);
    console.log('Database seeded successfully!');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
};

void seedDatabase();
