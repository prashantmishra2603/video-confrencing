import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Configure mongoose for better compatibility
    mongoose.set('strictQuery', false);
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if can't connect
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // Provide helpful tips for common issues
    if (error.message.includes('IP')) {
      console.error('💡 Tip: Make sure your IP is whitelisted in MongoDB Atlas Network Access');
    }
    if (error.message.includes('authentication')) {
      console.error('💡 Tip: Check your MongoDB username and password in MONGODB_URI');
    }
    
    // Don't exit on Render - let it retry
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Retrying MongoDB connection in 10 seconds...');
      setTimeout(() => connectDB(), 10000);
    } else {
      process.exit(1);
    }
  }
};

export default connectDB;
