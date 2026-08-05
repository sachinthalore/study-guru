import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please provide a valid email"),
});

export const validateForgotPassword = (req, res, next) => {
  const result = forgotPasswordSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.validatedData = result.data;

  next();
};