import { z } from "zod";

export const createFlashcardSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Question is required."),

  answer: z
    .string()
    .trim()
    .min(1, "Answer is required."),

  document: z
    .string()
    .trim()
    .min(1, "Document ID is required.")
    .optional(),

  difficulty: z
    .enum(["easy", "medium", "hard"])
    .optional(),
});

export const updateFlashcardSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Question is required.")
    .optional(),

  answer: z
    .string()
    .trim()
    .min(1, "Answer is required.")
    .optional(),

  difficulty: z
    .enum(["easy", "medium", "hard"])
    .optional(),

  mastered: z
    .boolean()
    .optional(),
});

export const flashcardIdSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid flashcard ID."),
});