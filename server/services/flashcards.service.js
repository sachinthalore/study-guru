import mongoose from "mongoose";
import Flashcard from "../models/flashcard.model.js";
import Document from "../models/document.model.js";
import ApiError from "../utils/apiError.js";

export const createFlashcard = async (userId, data) => {
  const {
    question,
    answer,
    document: documentId,
    difficulty,
  } = data;

  if (documentId) {
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      throw new ApiError(400, "Invalid document ID.");
    }

    const document = await Document.findOne({
      _id: documentId,
      uploadedBy: userId,
    });

    if (!document) {
      throw new ApiError(404, "Document not found.");
    }
  }

  const flashcard = await Flashcard.create({
    question,
    answer,
    document: documentId || null,
    createdBy: userId,
    difficulty: difficulty || "medium",
  });

  return flashcard;
};

export const getFlashcards = async (userId, documentId) => {
  const filter = {
    createdBy: userId,
  };

  if (documentId) {
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      throw new ApiError(400, "Invalid document ID.");
    }

    filter.document = documentId;
  }

  return await Flashcard.find(filter)
    .populate("document", "title originalFileName")
    .sort({ createdAt: -1 });
};

export const getFlashcard = async (flashcardId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(flashcardId)) {
    throw new ApiError(400, "Invalid flashcard ID.");
  }

  const flashcard = await Flashcard.findOne({
    _id: flashcardId,
    createdBy: userId,
  }).populate("document", "title originalFileName");

  if (!flashcard) {
    throw new ApiError(404, "Flashcard not found.");
  }

  return flashcard;
};

export const updateFlashcard = async (
  flashcardId,
  userId,
  data
) => {
  if (!mongoose.Types.ObjectId.isValid(flashcardId)) {
    throw new ApiError(400, "Invalid flashcard ID.");
  }

  const flashcard = await Flashcard.findOne({
    _id: flashcardId,
    createdBy: userId,
  });

  if (!flashcard) {
    throw new ApiError(404, "Flashcard not found.");
  }

  if (data.question !== undefined) {
    flashcard.question = data.question;
  }

  if (data.answer !== undefined) {
    flashcard.answer = data.answer;
  }

  if (data.difficulty !== undefined) {
    flashcard.difficulty = data.difficulty;
  }

  if (data.mastered !== undefined) {
    flashcard.mastered = data.mastered;
  }

  await flashcard.save();

  return flashcard;
};

export const reviewFlashcard = async (
  flashcardId,
  userId
) => {
  if (!mongoose.Types.ObjectId.isValid(flashcardId)) {
    throw new ApiError(400, "Invalid flashcard ID.");
  }

  const flashcard = await Flashcard.findOne({
    _id: flashcardId,
    createdBy: userId,
  });

  if (!flashcard) {
    throw new ApiError(404, "Flashcard not found.");
  }

  flashcard.reviewCount += 1;
  flashcard.lastReviewedAt = new Date();

  await flashcard.save();

  return flashcard;
};

export const deleteFlashcard = async (
  flashcardId,
  userId
) => {
  if (!mongoose.Types.ObjectId.isValid(flashcardId)) {
    throw new ApiError(400, "Invalid flashcard ID.");
  }

  const flashcard = await Flashcard.findOneAndDelete({
    _id: flashcardId,
    createdBy: userId,
  });

  if (!flashcard) {
    throw new ApiError(404, "Flashcard not found.");
  }

  return flashcard;
};