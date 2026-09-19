import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";

import {
  validateCreateStudySession,
  validateStudySessionId,
} from "../middleware/validate.middleware.js";

import {
  startStudySessionController,
  endStudySessionController,
  getStudySessionsController,
  getStudySessionController,
  deleteStudySessionController,
} from "../controllers/studySession.controller.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validateCreateStudySession,
  startStudySessionController
);

router.get(
  "/",
  authenticate,
  getStudySessionsController
);

router.get(
  "/:id",
  authenticate,
  validateStudySessionId,
  getStudySessionController
);

router.post(
  "/:id/end",
  authenticate,
  validateStudySessionId,
  endStudySessionController
);

router.delete(
  "/:id",
  authenticate,
  validateStudySessionId,
  deleteStudySessionController
);

export default router;