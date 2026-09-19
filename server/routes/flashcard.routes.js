import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";

import {
  validateCreateFlashcard,
  validateUpdateFlashcard,
  validateFlashcardId,
} from "../middleware/validate.middleware.js";

import {
  createFlashcardController,
  getFlashcardsController,
  getFlashcardController,
  updateFlashcardController,
  reviewFlashcardController,
  deleteFlashcardController,
} from "../controllers/flashcard.controller.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validateCreateFlashcard,
  createFlashcardController
);

router.get(
  "/",
  authenticate,
  getFlashcardsController
);

router.get(
  "/:id",
  authenticate,
  validateFlashcardId,
  getFlashcardController
);

router.patch(
  "/:id",
  authenticate,
  validateFlashcardId,
  validateUpdateFlashcard,
  updateFlashcardController
);

router.post(
  "/:id/review",
  authenticate,
  validateFlashcardId,
  reviewFlashcardController
);

router.delete(
  "/:id",
  authenticate,
  validateFlashcardId,
  deleteFlashcardController
);

export default router;