// lib/init.ts
import { Item } from '@/app/models/Item';
import { connectDB } from './mongodb';

export async function initializeDatabase() {
  try {
    await connectDB();
    await Item.syncIndexes(); // This will create missing indexes
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}
