import { verifyAccessToken } from "../utils/jwt.js";
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";


export const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Authentication required.");
  }

  // Verify JWT
  const decoded = verifyAccessToken(token);

  // Get current user
  const user = await User.findById(decoded.id).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(401, "User not found.");
  }

  // Attach user to request
  req.user = user;

  next();
});

export const authorize = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You do not have permission.",
        });
      }
  
      next();
    };
  };