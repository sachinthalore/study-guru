import mongoose from "mongoose";

import Document from "../../models/document.model.js";
import ApiError from "../../utils/apiError.js";

import { generateDocumentSummary } from "./summary.service.js";
import { generateDocumentNotes } from "./notes.service.js";
import { generateDocumentQuiz } from "./quiz.service.js";
import { generateDocumentFlashcards } from "./flashcards.service.js";
import { generateDocumentMindMap } from "./mindMap.service.js";

const studyTools = {
  summary: {
    generate: generateDocumentSummary,
    hasOutput: (document) =>
      typeof document.summary === "string" &&
      document.summary.trim().length > 0,
    saveOutput: (document, result) => {
      document.summary = result;
    },
  },

  notes: {
    generate: generateDocumentNotes,
    hasOutput: (document) =>
      typeof document.aiNotes === "string" &&
      document.aiNotes.trim().length > 0,
    saveOutput: (document, result) => {
      document.aiNotes = result;
    },
  },

  quiz: {
    generate: generateDocumentQuiz,
    hasOutput: (document) =>
      Array.isArray(document.quiz) && document.quiz.length > 0,
    saveOutput: (document, result) => {
      document.quiz = result;
    },
  },

  flashcards: {
    generate: generateDocumentFlashcards,
    hasOutput: (document) =>
      Array.isArray(document.flashcards) &&
      document.flashcards.length > 0,
    saveOutput: (document, result) => {
      document.flashcards = result;
    },
  },

  mindMap: {
    generate: generateDocumentMindMap,
    hasOutput: (document) =>
      Boolean(document.mindMap?.title && document.mindMap?.root),
    saveOutput: (document, result) => {
      document.mindMap = result;
    },
  },
};

const updateOverallAIStatus = (document) => {
  const resources = Object.keys(studyTools);

  document.aiProcessed = resources.every(
    (resource) =>
      document.aiProcessing?.[resource]?.status === "completed"
  );
};

export const generateStudyTool = async (
  documentId,
  userId,
  resource,
  regenerate = false
) => {
  if (!mongoose.isValidObjectId(documentId)) {
    throw new ApiError(400, "Invalid document ID.");
  }

  const tool = studyTools[resource];

  if (!tool) {
    throw new ApiError(
      400,
      "Invalid study tool. Choose summary, notes, quiz, flashcards, or mindMap."
    );
  }

  const document = await Document.findOne({
    _id: documentId,
    uploadedBy: userId,
  });

  if (!document) {
    throw new ApiError(404, "Document not found.");
  }

  if (!document.extractedText?.trim()) {
    throw new ApiError(
      400,
      "This document has no extracted text to generate study resources from."
    );
  }

  const resourceStatus = document.aiProcessing?.[resource];

  if (!resourceStatus) {
    throw new ApiError(
      500,
      "Study tool processing status is unavailable for this document."
    );
  }

  // Reuse a previously saved result unless regeneration was requested.
  if (
    !regenerate &&
    resourceStatus.status === "completed" &&
    tool.hasOutput(document)
  ) {
    return {
      resource,
      result: document[resource === "notes" ? "aiNotes" : resource],
      cached: true,
      document,
    };
  }

  try {
    const result = await tool.generate(document.extractedText);

    if (
      result == null ||
      (typeof result === "string" && !result.trim()) ||
      (Array.isArray(result) && result.length === 0)
    ) {
      throw new ApiError(
        502,
        "The AI service returned an empty result. Please try again."
      );
    }

    tool.saveOutput(document, result);

    document.aiProcessing[resource].status = "completed";
    document.aiProcessing[resource].error = "";

    updateOverallAIStatus(document);

    await document.save();

    return {
      resource,
      result,
      cached: false,
      document,
    };
  } catch (error) {
    console.error(`Study Tool Generation Error (${resource}):`, error);
  
    const hasPreviousOutput = tool.hasOutput(document);
  
    document.aiProcessing[resource].status = hasPreviousOutput
      ? "completed"
      : "failed";
  
    document.aiProcessing[resource].error =
      error?.message || "Failed to generate this study resource.";
  
    updateOverallAIStatus(document);
  
    await document.save();
  
    throw error;
  }
};
