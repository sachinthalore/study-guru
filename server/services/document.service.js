import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import Document from "../models/document.model.js";
import ApiError from "../utils/apiError.js";
import { extractText } from "./extraction/extract.service.js";

export const uploadDocument = async (file, data, userId) => {
  // 1. Upload to Cloudinary
  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "study-guru/documents",
        resource_type: "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });

  // 2. Create initial document
  const document = await Document.create({
    title: data.title,
    originalFileName: file.originalname,
    fileType: file.originalname.split(".").pop().toLowerCase(),
    mimeType: file.mimetype,
    fileUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    uploadedBy: userId,
    fileSize: file.size,
    processingStatus: "extracting",
  });

  try {
    // 3. Extract text
    const extractedText = await extractText(file);

    document.extractedText = extractedText;
    document.aiProcessed = true;
    document.processingStatus = "completed";

    // PDF pages (optional)
    if (document.fileType === "pdf") {
      document.totalPages =
        extractedText.split("\f").length || 0;
    }

    await document.save();
  } catch (error) {
    document.processingStatus = "failed";
    await document.save();

    console.error("Extraction Error:", error.message);
  }

  return document;
};

export const getDocuments = async (userId) => {
  return await Document.find({
    uploadedBy: userId,
  }).sort({
    createdAt: -1,
  });
};


export const getDocumentById = async (id, userId) => {
  const document = await Document.findOne({
    _id: id,
    uploadedBy: userId,
  });

  if (!document) {
    throw new ApiError(404, "Document not found.");
  }

  return document;
};

export const updateDocument = async (id, userId, data) => {
  const document = await Document.findOneAndUpdate(
    {
      _id: id,
      uploadedBy: userId,
    },
    data,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!document) {
    throw new ApiError(404, "Document not found.");
  }

  return document;
};
export const deleteDocument = async (id, userId) => {
  const document = await Document.findOneAndDelete({
    _id: id,
    uploadedBy: userId,
  });

  if (!document) {
    throw new ApiError(404, "Document not found.");
  }

  return document;
};
