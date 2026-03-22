const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smartcareq_admin_ai";

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
}

module.exports = { connectDB };
