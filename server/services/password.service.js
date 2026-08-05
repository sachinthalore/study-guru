import crypto from "crypto";
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import { sendEmail } from "./email.service.js";
import env from "../config/env.js";

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email }).select(
    "+passwordResetToken +passwordResetExpires"
  );

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  // Generate random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash token for DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

  await user.save();

  const resetURL = `${env.FRONTEND_URL}/reset-password/${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: "Study Guru Password Reset",
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetURL}">
        ${resetURL}
      </a>
      <p>This link expires in 15 minutes.</p>
    `,
  });
};

// ---------------- Reset Password ----------------
export const resetPassword = async (token, newPassword) => {
    // Hash incoming token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
  
    // Find user
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+password +refreshToken");
  
    if (!user) {
      throw new ApiError(400, "Invalid or expired reset token.");
    }
  
    // Set new password
    user.password = newPassword;
  
    // Clear reset token
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
  
    // Invalidate refresh token
    user.refreshToken = null;
  
    await user.save();
  };