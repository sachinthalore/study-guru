import User from "../models/user.model.js";

export const getAllUsers = async (req, res) => {
    const users = await User.find({})
    .select(
      "fullName email role isEmailVerified createdAt updatedAt"
    )
    .sort({ createdAt: -1 });
    
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
};