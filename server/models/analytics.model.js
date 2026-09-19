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

    totalDocuments: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalQuizzes: {
      type: Number,
      default: 0,
      min: 0,
    },

    completedQuizzes: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalQuizQuestions: {
      type: Number,
      default: 0,
      min: 0,
    },

    correctQuizAnswers: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalStudyTime: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalNotes: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalFlashcards: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalChatMessages: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Analytics = mongoose.model("Analytics", analyticsSchema);

export default Analytics;