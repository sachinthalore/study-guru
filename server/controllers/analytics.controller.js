import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import { getUserAnalytics } from "../services/analytics.service.js";

export const getUserAnalyticsController = asyncHandler(async (req, res) => {
  const analytics = await getUserAnalytics(req.user._id);

  res
    .status(200)
    .json(
      new ApiResponse(
        true,
        "Analytics fetched successfully.",
        analytics
      )
    );
});