import { z } from "zod";

const updateDocumentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must not exceed 100 characters")
    .optional(),
});

export const validateUpdateDocument = (req, res, next) => {
  const result = updateDocumentSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.validatedData = result.data;

  next();
};

const uploadDocumentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must not exceed 100 characters"),
});

export const validateUploadDocument = (req, res, next) => {
  const result = uploadDocumentSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please upload a document.",
    });
  }

  req.validatedData = result.data;
  next();
};