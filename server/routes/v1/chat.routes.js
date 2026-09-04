import { Router } from "express";
import {
    chatWithAI,
    chatWithDocument,
  } from "../../controllers/chat.controller.js";
  import {
    validatePrompt,
    validateDocumentChat,
  } from "../../middleware/validate.middleware.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.post("/chat", validatePrompt, chatWithAI);
router.post(
  "/document-chat",
  authenticate,
  validateDocumentChat,
  chatWithDocument
);

export default router;