import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";

import {
  createFlashcard,
  getFlashcards,
  getFlashcard,
  updateFlashcard,
  reviewFlashcard,
  deleteFlashcard,
} from "../services/flashcards.service.js";

export const createFlashcardController = asyncHandler(
  async (req, res) => {
    const flashcard = await createFlashcard(
      req.user._id,
      req.validatedData
    );

    res
      .status(201)
      .json(
        new ApiResponse(
          true,
          "Flashcard created successfully.",
          flashcard
        )
      );
  }
);

export const getFlashcardsController = asyncHandler(
  async (req, res) => {
    const flashcards = await getFlashcards(
      req.user._id,
      req.query.document
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          true,
          "Flashcards fetched successfully.",
          flashcards
        )
      );
  }
);

export const getFlashcardController = asyncHandler(
  async (req, res) => {
    const flashcard = await getFlashcard(
      req.params.id,
      req.user._id
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          true,
          "Flashcard fetched successfully.",
          flashcard
        )
      );
  }
);

export const updateFlashcardController = asyncHandler(
  async (req, res) => {
    const flashcard = await updateFlashcard(
      req.params.id,
      req.user._id,
      req.validatedData
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          true,
          "Flashcard updated successfully.",
          flashcard
        )
      );
  }
);

export const reviewFlashcardController = asyncHandler(
  async (req, res) => {
    const flashcard = await reviewFlashcard(
      req.params.id,
      req.user._id
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          true,
          "Flashcard reviewed successfully.",
          flashcard
        )
      );
  }
);

export const deleteFlashcardController = asyncHandler(
  async (req, res) => {
    await deleteFlashcard(
      req.params.id,
      req.user._id
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          true,
          "Flashcard deleted successfully.",
          null
        )
      );
  }
);