const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is missing in environment variables.');
  }

  await mongoose.connect(uri, {
    autoIndex: true
  });
};

module.exports = connectDB;
