import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return user;
};

export const updateCurrentUser = async (userId, data) => {
  const user = await User.findByIdAndUpdate(
    userId,
    data,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return user;
};

export const deleteCurrentUser = async (userId) => {
  await User.findByIdAndDelete(userId);
};