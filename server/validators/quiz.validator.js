import { z } from "zod";

export const createQuizSchema = z.object({
  document: z
    .string()
    .trim()
    .min(1, "Document ID is required."),

  title: z
    .string()
    .trim()
    .max(200, "Title must not exceed 200 characters.")
    .optional(),

  difficulty: z
    .enum(["easy", "medium", "hard"])
    .optional(),
});

export const quizIdSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid quiz ID."),
});

export const submitQuizSchema = z.object({
    answers: z
      .array(z.string().trim())
      .min(1, "At least one answer is required."),
  
    timeTaken: z
      .number()
      .int("Time taken must be an integer.")
      .min(0, "Time taken cannot be negative."),
  });