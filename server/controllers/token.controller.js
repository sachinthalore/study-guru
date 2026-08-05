import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import { refreshUserToken } from "../services/token.service.js";
import { refreshCookieOptions } from "../utils/cookie.js";

export const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  const { accessToken, refreshToken: newRefreshToken } =
    await refreshUserToken(refreshToken);

  // Rotate cookie
  res.cookie(
    "refreshToken",
    newRefreshToken,
    refreshCookieOptions
  );

  res.status(200).json(
    new ApiResponse(
      true,
      "Token refreshed successfully.",
      {
        accessToken,
      }
    )
  );
});