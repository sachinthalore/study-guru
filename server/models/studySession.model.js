import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      default: null,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    endedAt: {
      type: Date,
      default: null,
    },

    duration: {
      type: Number,
      default: 0,
    },

    activity: {
      type: String,
      enum: [
        "reading",
        "chat",
        "quiz",
        "flashcards",
        "notes",
      ],
      default: "reading",
    },
  },
  {
    timestamps: true,
  }
);

const StudySession = mongoose.model(
  "StudySession",
  studySessionSchema
);

export default StudySession;