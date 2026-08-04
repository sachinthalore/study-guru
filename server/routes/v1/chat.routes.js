import { Router } from "express";
import { chatWithAI } from "../../controllers/chat.controller.js";
import { validatePrompt } from "../../middleware/validate.middleware.js";

const router = Router();

router.post("/chat", validatePrompt, chatWithAI);

export default router;