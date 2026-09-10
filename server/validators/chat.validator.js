import { z } from "zod";

export const updateChatSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title cannot be empty.")
    .max(200, "Title must not exceed 200 characters.")
    .optional(),

  document: z
    .string()
    .trim()
    .min(1, "Document ID cannot be empty.")
    .optional()
    .nullable(),

  model: z
    .string()
    .trim()
    .min(1, "Model cannot be empty.")
    .max(100, "Model must not exceed 100 characters.")
    .optional(),

  isPinned: z
    .boolean()
    .optional(),
});

export const chatIdSchema = z.object({
    id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid chat ID."),
  });