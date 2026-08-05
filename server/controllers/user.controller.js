import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import {
  getCurrentUser,
  updateCurrentUser,
  deleteCurrentUser,
} from "../services/user.service.js";

export const getMe = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user._id);

  res.status(200).json(
    new ApiResponse(
      true,
      "User fetched successfully.",
      user
    )
  );
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await updateCurrentUser(
    req.user._id,
    req.validatedData
  );

  res.status(200).json(
    new ApiResponse(
      true,
      "Profile updated successfully.",
      user
    )
  );
});

export const deleteMe = asyncHandler(async (req, res) => {
  await deleteCurrentUser(req.user._id);

  res.status(200).json(
    new ApiResponse(
      true,
      "Account deleted successfully.",
      null
    )
  );
});