import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(8, "Current password is required"),

  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(50)
    .regex(/[A-Z]/, "Password must contain one uppercase letter")
    .regex(/[a-z]/, "Password must contain one lowercase letter")
    .regex(/[0-9]/, "Password must contain one number"),
});

export const validateChangePassword = (req, res, next) => {
  const result = changePasswordSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.validatedData = result.data;

  next();
};