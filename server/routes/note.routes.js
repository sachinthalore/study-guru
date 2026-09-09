import { Router } from "express";

import {
  createNoteController,
  getAllNotesController,
  getSingleNoteController,
  updateNoteController,
  deleteNoteController,
} from "../controllers/note.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

import {
  validateCreateNote,
  validateUpdateNote,
} from "../middleware/validate.middleware.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  validateCreateNote,
  createNoteController
);

router.get(
  "/",
  getAllNotesController
);

router.get(
  "/:id",
  getSingleNoteController
);

router.patch(
  "/:id",
  validateUpdateNote,
  updateNoteController
);

router.delete(
  "/:id",
  deleteNoteController
);

export default router;