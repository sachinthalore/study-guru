import { z } from "zod";

export const createStudySessionSchema = z.object({
  document: z
    .string()
    .trim()
    .min(1, "Document ID is required.")
    .optional(),

  activity: z
    .enum([
      "reading",
      "chat",
      "quiz",
      "flashcards",
      "notes",
    ])
    .optional(),
});

export const studySessionIdSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid study session ID."),
});