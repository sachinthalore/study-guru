import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import { registerUser, loginUser } from "../services/auth.service.js";


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
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  
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