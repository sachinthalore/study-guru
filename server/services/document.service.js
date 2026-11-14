import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import Document from "../models/document.model.js";
import ApiError from "../utils/apiError.js";
import { extractText } from "./extraction/extract.service.js";

import { createDocumentChunks } from "./rag/chunk-storage.service.js";
import { generateAndStoreDocumentEmbeddings } from "./rag/embedding-storage.service.js";
import { isGeminiQuotaError } from "../utils/geminiRetry.js";


export const uploadDocument = async (file, data, userId) => {
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

  const document = await Document.create({
    title: data.title,
    subject: data.subject || "Other",
    originalFileName: file.originalname,
    fileType: file.originalname.split(".").pop().toLowerCase(),
    mimeType: file.mimetype,
    fileUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    cloudinaryResourceType: uploadResult.resource_type,
    uploadedBy: userId,
    fileSize: file.size,
    processingStatus: "extracting",
  });

  try {
    // 1. Extract text from the uploaded file.
    const extractedText = await extractText(file);

    if (!extractedText || !extractedText.trim()) {
      throw new ApiError(
        422,
        "No readable text could be extracted from this document."
      );
    }

    document.extractedText = extractedText;
    document.processingStatus = "processing";
    await document.save();

    // 2. Preserve RAG chunk creation and embedding processing.
    await createDocumentChunks(document._id, extractedText);

    let embeddingsReady = false;

    try {
      const embeddedChunks =
        await generateAndStoreDocumentEmbeddings(document._id);

      const totalChunks = await Document.countDocuments({
        documentId: document._id,
      });

      embeddingsReady =
        totalChunks > 0 && embeddedChunks.length === totalChunks;

      if (!embeddingsReady) {
        console.warn(
          `Document ${document._id}: embeddings are incomplete.`
        );
      }
    } catch (error) {
      console.error("Document embedding processing failed:", error);

      if (isGeminiQuotaError(error)) {
        console.warn(
          "Gemini quota exhausted. Document upload will continue without complete embeddings."
        );
      } else {
        console.warn(
          "Document upload will continue despite embedding failure."
        );
      }
    }

    // 3. Do not generate AI resources during upload.
    // They remain pending until explicitly requested in Study Tools.
    document.aiProcessed = false;
    document.processingStatus = "completed";

    await document.save();

    return document;
  } catch (error) {
    console.error("Document Processing Error:", error);

    document.processingStatus = "failed";
    await document.save();

    throw error;
  }
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
      returnDocument: "after",
      runValidators: true,
    }
  );

  if (!document) {
    throw new ApiError(404, "Document not found.");
  }

  return document;
};
export const deleteDocument = async (id, userId) => {
  const document = await Document.findOne({
    _id: id,
    uploadedBy: userId,
  });

  if (!document) {
    throw new ApiError(404, "Document not found.");
  }

  const cloudinaryResult = await cloudinary.uploader.destroy(
    document.publicId,
    {
      resource_type: document.cloudinaryResourceType,
      invalidate: true,
    }
  );

  if (
    cloudinaryResult.result !== "ok" &&
    cloudinaryResult.result !== "not found"
  ) {
    throw new ApiError(
      500,
      "Failed to delete document from cloud storage."
    );
  }

  await Document.deleteOne({
    _id: document._id,
  });

  return document;
};