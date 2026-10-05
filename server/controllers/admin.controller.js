import User from "../models/user.model.js";
import Document from "../models/document.model.js";
import Quiz from "../models/quiz.model.js";

export const updateUserRole = async (req, res) => {
    const { userId } = req.params;
    const { role } = req.validatedData;
  
    const user = await User.findById(userId);
  
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
  
    if (user._id.equals(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role.",
      });
    }
  
    user.role = role;
    await user.save();
  
    res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  };
  
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

export const getAdminStats = async (req, res) => {
  const [
    totalUsers,
    totalAdmins,
    verifiedUsers,
    totalDocuments,
    totalQuizzes,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ isEmailVerified: true }),
    Document.countDocuments(),
    Quiz.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        admins: totalAdmins,
        students: totalUsers - totalAdmins,
        verified: verifiedUsers,
      },
      documents: totalDocuments,
      quizzes: totalQuizzes,
    },
  });
};