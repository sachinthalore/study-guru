import mongoose from "mongoose";
import env from "./env.js";
import logger from "./logger.js";

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    logger.info("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("FULL ERROR:", error);
    process.exit(1);
  }
};

export default connectDB;