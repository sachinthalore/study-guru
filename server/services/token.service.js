import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { hashToken } from "../utils/token.js";

export const refreshUserToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required.");
  }

  // Verify JWT
  const decoded = verifyRefreshToken(refreshToken);

  // Find user
  const user = await User.findById(decoded.id).select("+refreshToken");

  if (!user) {
    throw new ApiError(401, "User not found.");
  }

  // Compare hashed token
  const incomingHash = hashToken(refreshToken);

  if (user.refreshToken !== incomingHash) {
    throw new ApiError(401, "Invalid refresh token.");
  }

  // Generate new tokens
  const newAccessToken = generateAccessToken({
    id: user._id,
    role: user.role,
  });

  const newRefreshToken = generateRefreshToken({
    id: user._id,
    role: user.role,
  });

  // Rotate refresh token
  user.refreshToken = hashToken(newRefreshToken);

  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};