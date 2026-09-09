import { z } from "zod";

export const createNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(200, "Title must not exceed 200 characters."),

  content: z
    .string()
    .trim()
    .min(1, "Content is required."),

  document: z
    .string()
    .trim()
    .min(1, "Document ID cannot be empty.")
    .optional()
    .nullable(),

  noteType: z
    .enum(["manual", "summary", "ai-note"])
    .optional(),

  isFavorite: z
    .boolean()
    .optional(),

  tags: z
    .array(z.string().trim())
    .optional(),
});

export const updateNoteSchema = createNoteSchema.partial();