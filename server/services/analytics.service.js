import Analytics from "../models/analytics.model.js";
import Document from "../models/document.model.js";
import Quiz from "../models/quiz.model.js";
import Note from "../models/note.model.js";
import Chat from "../models/chat.model.js";
import Flashcard from "../models/flashcard.model.js";
import StudySession from "../models/studySession.model.js";

export const getUserAnalytics = async (userId) => {
  const [
    totalDocuments,
    totalQuizzes,
    completedQuizzes,
    quizStats,
    totalNotes,
    totalFlashcards,
    totalChatMessages,
    studyStats,
  ] = await Promise.all([
    Document.countDocuments({ uploadedBy: userId }),

    Quiz.countDocuments({ createdBy: userId }),

    Quiz.countDocuments({
      createdBy: userId,
      completed: true,
    }),

    Quiz.aggregate([
      {
        $match: {
          createdBy: userId,
          completed: true,
        },
      },
      {
        $group: {
          _id: null,
          totalQuestions: { $sum: "$totalQuestions" },
          correctAnswers: { $sum: "$score" },
        },
      },
    ]),

    Note.countDocuments({ createdBy: userId }),

    Flashcard.countDocuments({ createdBy: userId }),

    Chat.countDocuments({ user: userId }),

    StudySession.aggregate([
      {
        $match: {
          user: userId,
        },
      },
      {
        $group: {
          _id: null,
          totalStudyTime: { $sum: "$duration" },
        },
      },
    ]),
  ]);

  const totalQuizQuestions = quizStats[0]?.totalQuestions || 0;
  const correctQuizAnswers = quizStats[0]?.correctAnswers || 0;
  const totalStudyTime = studyStats[0]?.totalStudyTime || 0;

  const quizAccuracy =
    totalQuizQuestions > 0
      ? Math.round((correctQuizAnswers / totalQuizQuestions) * 100)
      : 0;

  const analyticsData = {
    user: userId,
    totalDocuments,
    totalQuizzes,
    completedQuizzes,
    totalQuizQuestions,
    correctQuizAnswers,
    totalStudyTime,
    totalNotes,
    totalFlashcards,
    totalChatMessages,
  };

  await Analytics.findOneAndUpdate(
    { user: userId },
    analyticsData,
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return {
    totalDocuments,
    totalQuizzes,
    completedQuizzes,
    totalQuizQuestions,
    correctQuizAnswers,
    quizAccuracy,
    totalStudyTime,
    totalNotes,
    totalFlashcards,
    totalChatMessages,
  };
};