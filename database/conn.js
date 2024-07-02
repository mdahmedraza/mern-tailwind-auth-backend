

import mongoose from 'mongoose';

async function connectToDatabase() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/theChat', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

export default connectToDatabase;