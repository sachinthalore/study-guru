import { z } from "zod";

export const documentIdSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid document ID."),
});

export const validateDocumentId = (req, res, next) => {
  const result = documentIdSchema.safeParse(req.params);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  next();
};

// Update Document Validation
const updateDocumentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must not exceed 100 characters")
    .optional(),

  subject: z
    .string()
    .trim()
    .min(1, "Subject is required")
    .max(60, "Subject must not exceed 60 characters")
    .optional(),
}).refine(
  data => Object.keys(data).length > 0,
  { message: "At least one field is required." }
);

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


// Upload Document Validation

const uploadDocumentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must not exceed 100 characters"),

  subject: z
    .string()
    .trim()
    .min(1, "Subject is required")
    .max(60, "Subject must not exceed 60 characters")
    .default("Other"),
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

// Study Tool Generation Validation

const studyToolSchema = z.object({
  regenerate: z.boolean().optional().default(false),
});

const allowedStudyTools = [
  "summary",
  "notes",
  "quiz",
  "flashcards",
  "mindMap",
];

export const validateStudyToolRequest = (req, res, next) => {
  if (!allowedStudyTools.includes(req.params.resource)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid study tool. Choose summary, notes, quiz, flashcards, or mindMap.",
    });
  }

  const result = studyToolSchema.safeParse(req.body ?? {});

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.validatedData = result.data;

  next();
};