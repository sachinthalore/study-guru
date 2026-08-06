import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    document: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
        default: null,
      },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    noteType: {
      type: String,
      enum: [
        "manual",
        "summary",
        "ai-note",
      ],
      default: "manual",
    },

    isFavorite: {
      type: Boolean,
      default: false,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Note = mongoose.model("Note", noteSchema);

export default Note;