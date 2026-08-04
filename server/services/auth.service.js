import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import {
    generateAccessToken,
    generateRefreshToken,
  } from "../utils/jwt.js";
  import { hashToken } from "../utils/token.js";
  
export const registerUser = async ({ fullName, email, password }) => {
  // Check if email already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "User already exists with this email.");
  }

  // Create user
  const user = await User.create({
    fullName,
    email,
    password,
  });

  return user;
};

export const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email }).select("+password +refreshToken");
  
    if (!user) {
      throw new ApiError(401, "Invalid email or password.");
    }
  
    const isMatch = await user.comparePassword(password);
  
    if (!isMatch) {
      throw new ApiError(401, "Invalid email or password.");
    }
  
    const accessToken = generateAccessToken({
      id: user._id,
      role: user.role,
    });
  
    const refreshToken = generateRefreshToken({
      id: user._id,
    });
  
    user.refreshToken = hashToken(refreshToken);
    user.lastLogin = new Date();
  
    await user.save();
  
    return {
      user,
      accessToken,
      refreshToken,
    };
  };