import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    originalFileName: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      required: true,
      enum: [
        "pdf",
        "doc",
        "docx",
        "ppt",
        "pptx",
        "txt",
        "md",
        "csv",
        "xls",
        "xlsx",
        "jpg",
        "jpeg",
        "png",
        "webp",
      ],
    },

    mimeType: {
      type: String,
      required: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      required: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    totalPages: {
      type: Number,
      default: 0,
    },

    extractedText: {
      type: String,
      default: "",
    },

    aiProcessed: {
      type: Boolean,
      default: false,
    },

    processingStatus: {
      type: String,
      enum: [
        "pending",
        "uploading",
        "extracting",
        "processing",
        "completed",
        "failed",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model("Document", documentSchema);

export default Document;