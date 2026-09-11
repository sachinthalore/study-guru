import { z } from "zod";
import {
  createNoteSchema,
  updateNoteSchema,
} from "../validators/note.validator.js";
import {
  updateChatSchema,
  chatIdSchema,
} from "../validators/chat.validator.js";

import {
  createQuizSchema,
  quizIdSchema,
  submitQuizSchema,
} from "../validators/quiz.validator.js";

const promptSchema = z.object({
  prompt: z.string().min(1).max(1000),

  chatId: z.string().optional(),

  mode: z.string().optional(),

  notesContent: z.string().optional(),
});

const documentChatSchema = z.object({
  prompt: z.string().min(1).max(1000),

  documentId: z.string().min(1),
});

export const validatePrompt = (req, res, next) => {
  const validation = promptSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      error: validation.error,
    });
  }

  req.validatedData = validation.data;

  next();
};

export const validateDocumentChat = (req, res, next) => {
  const validation = documentChatSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      error: validation.error,
    });
  }

  req.validatedData = validation.data;

  next();
};

export const validateCreateNote = (req, res, next) => {
  const validation = createNoteSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      error: validation.error,
    });
  }

  req.validatedData = validation.data;

  next();
};

export const validateUpdateNote = (req, res, next) => {
  const validation = updateNoteSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      error: validation.error,
    });
  }

  req.validatedData = validation.data;

  next();
};

export const validateUpdateChat = (req, res, next) => {
  const validation = updateChatSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      error: validation.error,
    });
  }

  req.validatedData = validation.data;
  next();
};

export const validateChatId = (req, res, next) => {
  const validation = chatIdSchema.safeParse(req.params);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid chat ID.",
    });
  }

  next();
};

export const validateCreateQuiz = (req, res, next) => {
  const validation = createQuizSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: validation.error,
    });
  }

  req.validatedData = validation.data;
  next();
};

export const validateQuizId = (req, res, next) => {
  const validation = quizIdSchema.safeParse(req.params);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid quiz ID.",
    });
  }

  next();
};

export const validateSubmitQuiz = (req, res, next) => {
  const validation = submitQuizSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: validation.error,
    });
  }

  req.validatedData = validation.data;
  next();
};