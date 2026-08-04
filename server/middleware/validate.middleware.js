import { z } from "zod";

const promptSchema = z.object({
  prompt: z.string().min(1).max(1000),
  mode: z.string().optional(),
  notesContent: z.string().optional()
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