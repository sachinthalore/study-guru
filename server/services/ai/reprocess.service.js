import Document from "../../models/document.model.js";
import ApiError from "../../utils/apiError.js";

import { generateDocumentSummary } from "./summary.service.js";
import { generateDocumentNotes } from "./notes.service.js";
import { generateDocumentQuiz } from "./quiz.service.js";
import { generateDocumentFlashcards } from "./flashcards.service.js";

import { isGeminiQuotaError } from "../../utils/geminiRetry.js";

const QUOTA_ERROR_MESSAGE =
  "AI service quota or rate limit reached. Please try again later.";

const shouldProcess = (status) => {
  return status === "pending" || status === "failed";
};

export const reprocessDocumentAI = async (documentId, userId) => {
  const document = await Document.findOne({
    _id: documentId,
    uploadedBy: userId,
  });

  if (!document) {
    throw new ApiError(404, "Document not found.");
  }

  if (!document.extractedText) {
    throw new ApiError(
      400,
      "Document does not contain extracted text for AI processing."
    );
  }

  let aiQuotaExceeded = false;

  /*
   * SUMMARY
   */
  if (
    !aiQuotaExceeded &&
    shouldProcess(document.aiProcessing.summary.status)
  ) {
    try {
      const summary = await generateDocumentSummary(
        document.extractedText
      );

      document.summary = summary;
      document.aiProcessing.summary.status = "completed";
      document.aiProcessing.summary.error = "";

      await document.save();
    } catch (error) {
      console.error("AI Summary Reprocess Error:", error);

      document.aiProcessing.summary.status = "failed";
      document.aiProcessing.summary.error =
        isGeminiQuotaError(error)
          ? QUOTA_ERROR_MESSAGE
          : error?.message || "Failed to generate summary.";

      await document.save();

      if (isGeminiQuotaError(error)) {
        aiQuotaExceeded = true;
      }
    }
  }

  /*
   * NOTES
   */
  if (
    !aiQuotaExceeded &&
    shouldProcess(document.aiProcessing.notes.status)
  ) {
    try {
      const notes = await generateDocumentNotes(
        document.extractedText
      );

      document.aiNotes = notes;
      document.aiProcessing.notes.status = "completed";
      document.aiProcessing.notes.error = "";

      await document.save();
    } catch (error) {
      console.error("AI Notes Reprocess Error:", error);

      document.aiProcessing.notes.status = "failed";
      document.aiProcessing.notes.error =
        isGeminiQuotaError(error)
          ? QUOTA_ERROR_MESSAGE
          : error?.message || "Failed to generate notes.";

      await document.save();

      if (isGeminiQuotaError(error)) {
        aiQuotaExceeded = true;
      }
    }
  }

  /*
   * QUIZ
   */
  if (
    !aiQuotaExceeded &&
    shouldProcess(document.aiProcessing.quiz.status)
  ) {
    try {
      const quiz = await generateDocumentQuiz(
        document.extractedText
      );

      document.quiz = quiz;
      document.aiProcessing.quiz.status = "completed";
      document.aiProcessing.quiz.error = "";

      await document.save();
    } catch (error) {
      console.error("AI Quiz Reprocess Error:", error);

      document.aiProcessing.quiz.status = "failed";
      document.aiProcessing.quiz.error =
        isGeminiQuotaError(error)
          ? QUOTA_ERROR_MESSAGE
          : error?.message || "Failed to generate quiz.";

      await document.save();

      if (isGeminiQuotaError(error)) {
        aiQuotaExceeded = true;
      }
    }
  }

  /*
   * FLASHCARDS
   */
  if (
    !aiQuotaExceeded &&
    shouldProcess(document.aiProcessing.flashcards.status)
  ) {
    try {
      const flashcards = await generateDocumentFlashcards(
        document.extractedText
      );

      document.flashcards = flashcards;
      document.aiProcessing.flashcards.status = "completed";
      document.aiProcessing.flashcards.error = "";

      await document.save();
    } catch (error) {
      console.error("AI Flashcards Reprocess Error:", error);

      document.aiProcessing.flashcards.status = "failed";
      document.aiProcessing.flashcards.error =
        isGeminiQuotaError(error)
          ? QUOTA_ERROR_MESSAGE
          : error?.message || "Failed to generate flashcards.";

      await document.save();

      if (isGeminiQuotaError(error)) {
        aiQuotaExceeded = true;
      }
    }
  }

  /*
   * RE-CALCULATE FINAL AI STATUS
   */
  const allAIProcessed =
    document.aiProcessing.summary.status === "completed" &&
    document.aiProcessing.notes.status === "completed" &&
    document.aiProcessing.quiz.status === "completed" &&
    document.aiProcessing.flashcards.status === "completed";

  document.aiProcessed = allAIProcessed;

  document.processingStatus = allAIProcessed
    ? "completed"
    : "partial";

  await document.save();

  return document;
};