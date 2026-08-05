import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import { registerUser, loginUser } from "../services/auth.service.js";
import { refreshCookieOptions } from "../utils/cookie.js";
import { logoutUser } from "../services/auth.service.js";
import { clearRefreshCookieOptions } from "../utils/cookie.js";
import {
  forgotPassword,
  resetPassword,
} from "../services/password.service.js";

export const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.validatedData);

  res.status(201).json(
    new ApiResponse(
      true,
      "User registered successfully.",
      {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      }
    )
  );
});

export const login = asyncHandler(async (req, res) => {
    const { user, accessToken, refreshToken } = await loginUser(
      req.validatedData
    );
  
    // Refresh Token -> HTTP Only Cookie
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
  
    res.status(200).json(
      new ApiResponse(
        true,
        "Login successful.",
        {
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
          },
          accessToken,
        }
      )
    );
  });

  export const logout = asyncHandler(async (req, res) => {
    await logoutUser(req.user._id);
  
    res.clearCookie("refreshToken", clearRefreshCookieOptions);
  
    res.status(200).json(
      new ApiResponse(
        true,
        "Logout successful.",
        null
      )
    );
  });

  export const forgotPasswordController = asyncHandler(async (req, res) => {
    await forgotPassword(req.validatedData.email);
  
    res.status(200).json(
      new ApiResponse(
        true,
        "Password reset link sent successfully.",
        null
      )
    );
  });

  export const resetPasswordController = asyncHandler(async (req, res) => {
    const { token, password } = req.validatedData;
  
    await resetPassword(token, password);
  
    res.status(200).json(
      new ApiResponse(
        true,
        "Password reset successfully. Please login again.",
        null
      )
    );
  });