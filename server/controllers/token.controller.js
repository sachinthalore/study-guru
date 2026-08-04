import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";

export const refreshToken = asyncHandler(async (req, res) => {
  // Logic next step me implement karenge
  res.status(200).json(
    new ApiResponse(
      true,
      "Refresh token endpoint is ready.",
      {}
    )
  );
});