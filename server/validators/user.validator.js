import { z } from "zod";

const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name must not exceed 50 characters")
    .optional(),

  avatar: z
    .string()
    .trim()
    .optional(),
});

export const validateUpdateProfile = (req, res, next) => {
  const result = updateProfileSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.validatedData = result.data;

  next();
};