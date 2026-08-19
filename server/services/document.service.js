import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import Document from "../models/document.model.js";
import ApiError from "../utils/apiError.js";
import { extractText } from "./extraction/extract.service.js";
import { generateDocumentSummary } from "./ai/summary.service.js";
import { generateDocumentNotes } from "./ai/notes.service.js";
import { generateDocumentQuiz } from "./ai/quiz.service.js";
import { generateDocumentFlashcards } from "./ai/flashcards.service.js";

export const uploadDocument = async (file, data, userId) => {
  // 1. Upload file to Cloudinary
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

  // 2. Create document in MongoDB
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
    document.processingStatus = "processing";

    await document.save();

    // 4. Generate AI summary
    const summary = await generateDocumentSummary(extractedText);

    document.summary = summary;

    // 5. Generate AI notes
    const notes = await generateDocumentNotes(extractedText);

    document.aiNotes = notes;

    // 6. Generate AI quiz
    const quiz = await generateDocumentQuiz(extractedText);

    document.quiz = quiz;

    // 7. Generate AI flashcards
    const flashcards = await generateDocumentFlashcards(extractedText);

    document.flashcards = flashcards;

    // 8. Mark AI processing as completed
    document.aiProcessed = true;
    document.processingStatus = "completed";

    // 9. Save final document
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
