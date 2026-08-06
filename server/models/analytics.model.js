import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    documentsUploaded: {
      type: Number,
      default: 0,
    },

    notesCreated: {
      type: Number,
      default: 0,
    },

    quizzesCompleted: {
      type: Number,
      default: 0,
    },

    flashcardsReviewed: {
      type: Number,
      default: 0,
    },

    aiChats: {
      type: Number,
      default: 0,
    },

    totalStudyTime: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Analytics = mongoose.model("Analytics", analyticsSchema);

export default Analytics;