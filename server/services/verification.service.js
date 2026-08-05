import crypto from "crypto";
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import { sendEmail } from "./email.service.js";
import env from "../config/env.js";

export const sendVerificationEmail = async (userId) => {
  const user = await User.findById(userId).select(
    "+emailVerificationToken +emailVerificationExpires"
  );

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, "Email is already verified.");
  }

  // Generate random token
  const verificationToken = crypto.randomBytes(32).toString("hex");

  // Hash token
  const hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  await user.save();

  const verifyURL = `${env.FRONTEND_URL}/verify-email/${verificationToken}`;

  await sendEmail({
    to: user.email,
    subject: "Verify Your Study Guru Email",
    html: `
      <h2>Welcome to Study Guru</h2>

      <p>Please verify your email by clicking the link below:</p>

      <a href="${verifyURL}">
        Verify Email
      </a>

      <p>This link will expire in 24 hours.</p>
    `,
  });
};

export const verifyEmail = async (token) => {
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
  
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    }).select("+emailVerificationToken +emailVerificationExpires");
  
    if (!user) {
      throw new ApiError(400, "Invalid or expired verification link.");
    }
  
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
  
    await user.save();
  
    return user;
  };