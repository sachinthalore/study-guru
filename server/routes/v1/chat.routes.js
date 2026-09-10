import { Router } from "express";

import {
  chatWithAI,
  chatWithDocument,
  getChatsController,
  getSingleChatController,
  updateChatController,
  deleteChatController,
} from "../../controllers/chat.controller.js";



import { authenticate } from "../../middleware/auth.middleware.js";


import {
  validatePrompt,
  validateDocumentChat,
  validateUpdateChat,
  validateChatId,
} from "../../middleware/validate.middleware.js";

const router = Router();

// Normal AI Chat
router.post(
  "/chat",
  authenticate,
  validatePrompt,
  chatWithAI
);

// Document RAG Chat
router.post(
  "/document-chat",
  authenticate,
  validateDocumentChat,
  chatWithDocument
);

// Chat History
router.get(
  "/chats",
  authenticate,
  getChatsController
);

router.get(
  "/chats/:id",
  authenticate,
  validateChatId,
  getSingleChatController
);

router.patch(
  "/chats/:id",
  authenticate,
  validateChatId,
  validateUpdateChat,
  updateChatController
);

router.delete(
  "/chats/:id",
  authenticate,
  validateChatId,
  deleteChatController
);

export default router;