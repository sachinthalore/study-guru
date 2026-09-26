import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import Document from "../models/document.model.js";
import ApiError from "../utils/apiError.js";
import { extractText } from "./extraction/extract.service.js";
import { generateDocumentSummary } from "./ai/summary.service.js";
import { generateDocumentNotes } from "./ai/notes.service.js";
import { generateDocumentQuiz } from "./ai/quiz.service.js";
import { generateDocumentFlashcards } from "./ai/flashcards.service.js";
import { createDocumentChunks } from "./rag/chunk-storage.service.js";
import { generateAndStoreDocumentEmbeddings } from "./rag/embedding-storage.service.js";
import { isGeminiQuotaError } from "../utils/geminiRetry.js";
import { generateDocumentMindMap } from "./ai/mindMap.service.js";

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
    // ==========================================
    // 1. TEXT EXTRACTION
    // ==========================================

    const extractedText = await extractText(file);

    document.extractedText = extractedText;
    document.processingStatus = "processing";
    await document.save();

    // ==========================================
    // 2. RAG PROCESSING
    // ==========================================

    await createDocumentChunks(document._id, extractedText);
    await generateAndStoreDocumentEmbeddings(document._id);

    // ==========================================
    // 3. AI SUMMARY
    // ==========================================
    let aiQuotaExceeded = false;
    try {
      const summary = await generateDocumentSummary(extractedText);

      document.summary = summary;
      document.aiProcessing.summary.status = "completed";
      document.aiProcessing.summary.error = "";

      await document.save();
    } catch (error) {
      console.error("AI Summary Error:", error);

      if (isGeminiQuotaError(error)) {
        aiQuotaExceeded = true;
      }

      document.aiProcessing.summary.status = "failed";
      document.aiProcessing.summary.error =
        error?.message || "Failed to generate summary.";

      await document.save();
    }

    // ==========================================
    // 4. AI NOTES
    // ==========================================

    if (aiQuotaExceeded) {
      console.warn("Skipping AI Notes because Gemini quota is exhausted.");

      document.aiProcessing.notes.status = "failed";
      document.aiProcessing.notes.error =
        "AI service quota or rate limit reached. Please try again later.";

      await document.save();
    } else {
      try {
        const notes = await generateDocumentNotes(extractedText);

        document.aiNotes = notes;
        document.aiProcessing.notes.status = "completed";
        document.aiProcessing.notes.error = "";

        await document.save();
      } catch (error) {
        console.error("AI Notes Error:", error);

        if (isGeminiQuotaError(error)) {
          aiQuotaExceeded = true;
        }

        document.aiProcessing.notes.status = "failed";
        document.aiProcessing.notes.error =
          error?.message || "Failed to generate notes.";

        await document.save();
      }
    }

    // ==========================================
    // 5. AI QUIZ
    // ==========================================

    if (aiQuotaExceeded) {
      console.warn("Skipping AI Quiz because Gemini quota is exhausted.");

      document.aiProcessing.quiz.status = "failed";
      document.aiProcessing.quiz.error =
        "AI service quota or rate limit reached. Please try again later.";

      await document.save();
    } else {
      try {
        const quiz = await generateDocumentQuiz(extractedText);

        document.quiz = quiz;
        document.aiProcessing.quiz.status = "completed";
        document.aiProcessing.quiz.error = "";

        await document.save();
      } catch (error) {
        console.error("AI Quiz Error:", error);

        if (isGeminiQuotaError(error)) {
          aiQuotaExceeded = true;
        }

        document.aiProcessing.quiz.status = "failed";
        document.aiProcessing.quiz.error =
          error?.message || "Failed to generate quiz.";

        await document.save();
      }
    }

    // ==========================================
    // 6. AI FLASHCARDS
    // ==========================================

    if (aiQuotaExceeded) {
      console.warn(
        "Skipping AI Flashcards because Gemini quota is exhausted."
      );

      document.aiProcessing.flashcards.status = "failed";
      document.aiProcessing.flashcards.error =
        "AI service quota or rate limit reached. Please try again later.";

      await document.save();
    } else {
      try {
        const flashcards = await generateDocumentFlashcards(extractedText);

        document.flashcards = flashcards;
        document.aiProcessing.flashcards.status = "completed";
        document.aiProcessing.flashcards.error = "";

        await document.save();
      } catch (error) {
        console.error("AI Flashcards Error:", error);

        if (isGeminiQuotaError(error)) {
          aiQuotaExceeded = true;
        }

        document.aiProcessing.flashcards.status = "failed";
        document.aiProcessing.flashcards.error =
          error?.message || "Failed to generate flashcards.";

        await document.save();
      }
    }


    if (aiQuotaExceeded) {
      console.warn(
        "Skipping AI Mind Map because Gemini quota is exhausted."
      );

      document.aiProcessing.mindMap.status = "failed";
      document.aiProcessing.mindMap.error =
        "AI service quota or rate limit reached. Please try again later.";

      await document.save();
    } else {
      try {
        const mindMap = await generateDocumentMindMap(extractedText);

        document.mindMap = mindMap;
        document.aiProcessing.mindMap.status = "completed";
        document.aiProcessing.mindMap.error = "";

        await document.save();
      } catch (error) {
        console.error("AI Mind Map Error:", error);

        if (isGeminiQuotaError(error)) {
          aiQuotaExceeded = true;
        }

        document.aiProcessing.mindMap.status = "failed";
        document.aiProcessing.mindMap.error =
          error?.message || "Failed to generate mind map.";

        await document.save();
      }
    }

    // ==========================================
    // 7. FINAL AI PROCESSING STATUS
    // ==========================================

    const allAIProcessed =
  document.aiProcessing.summary.status === "completed" &&
  document.aiProcessing.notes.status === "completed" &&
  document.aiProcessing.quiz.status === "completed" &&
  document.aiProcessing.flashcards.status === "completed" &&
  document.aiProcessing.mindMap.status === "completed";

document.aiProcessed = allAIProcessed;

document.processingStatus = allAIProcessed
  ? "completed"
  : "partial";

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
