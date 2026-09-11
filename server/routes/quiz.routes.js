import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";

import {
    validateCreateQuiz,
    validateQuizId,
    validateSubmitQuiz,
  } from "../middleware/validate.middleware.js";

  import {
    createQuizController,
    getAllQuizzesController,
    getSingleQuizController,
    deleteQuizController,
    submitQuizController,
    getQuizResultController,
  } from "../controllers/quiz.controller.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validateCreateQuiz,
  createQuizController
);

router.get(
  "/",
  authenticate,
  getAllQuizzesController
);

router.get(
    "/:id/result",
    authenticate,
    validateQuizId,
    getQuizResultController
  );
  
router.get(
  "/:id",
  authenticate,
  validateQuizId,
  getSingleQuizController
);

router.post(
    "/:id/submit",
    authenticate,
    validateQuizId,
    validateSubmitQuiz,
    submitQuizController
  );

router.delete(
  "/:id",
  authenticate,
  validateQuizId,
  deleteQuizController
);

export default router;