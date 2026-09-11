import mongoose from "mongoose";

import Quiz from "../models/quiz.model.js";
import Document from "../models/document.model.js";
import ApiError from "../utils/apiError.js";

export const createQuiz = async (userId, data) => {
  const { document: documentId, title, difficulty } = data;

  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    throw new ApiError(400, "Invalid document ID.");
  }

  const document = await Document.findOne({
    _id: documentId,
    uploadedBy: userId,
  });

  if (!document) {
    throw new ApiError(404, "Document not found.");
  }

  if (!document.quiz || document.quiz.length === 0) {
    throw new ApiError(400, "No quiz is available for this document.");
  }

  const questions = document.quiz.map((question) => ({
    question: question.question,
    options: question.options,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
  }));

  const quiz = await Quiz.create({
    title: title || `${document.title} Quiz`,
    document: document._id,
    createdBy: userId,
    questions,
    difficulty: difficulty || "medium",
    totalQuestions: questions.length,
  });

  return quiz;
};

export const getAllQuizzes = async (userId) => {
    return await Quiz.find({ createdBy: userId })
      .select("-questions.correctAnswer -questions.explanation")
      .populate("document", "title originalFileName")
      .sort({ createdAt: -1 });
  };

export const getSingleQuiz = async (quizId, userId) => {
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      throw new ApiError(400, "Invalid quiz ID.");
    }
  
    const quiz = await Quiz.findOne({
      _id: quizId,
      createdBy: userId,
    })
      .select("-questions.correctAnswer -questions.explanation")
      .populate("document", "title originalFileName");
  
    if (!quiz) {
      throw new ApiError(404, "Quiz not found.");
    }
  
    return quiz;
  };

export const deleteQuiz = async (quizId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(quizId)) {
    throw new ApiError(400, "Invalid quiz ID.");
  }

  const quiz = await Quiz.findOneAndDelete({
    _id: quizId,
    createdBy: userId,
  });

  if (!quiz) {
    throw new ApiError(404, "Quiz not found.");
  }

  return quiz;
};

export const submitQuiz = async (quizId, userId, answers, timeTaken) => {
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      throw new ApiError(400, "Invalid quiz ID.");
    }
  
    const quiz = await Quiz.findOne({
      _id: quizId,
      createdBy: userId,
    });
  
    if (!quiz) {
      throw new ApiError(404, "Quiz not found.");
    }
  
    if (quiz.completed) {
      throw new ApiError(400, "Quiz has already been submitted.");
    }
  
    if (!Array.isArray(answers)) {
      throw new ApiError(400, "Answers must be an array.");
    }
  
    if (answers.length !== quiz.questions.length) {
      throw new ApiError(
        400,
        "Please submit an answer for every question."
      );
    }
  
    let score = 0;
  
    const results = quiz.questions.map((question, index) => {
  const selectedAnswer = answers[index];

  if (!question.options.includes(selectedAnswer)) {
    throw new ApiError(
      400,
      `Invalid answer for question ${index + 1}.`
    );
  }

  const isCorrect = selectedAnswer === question.correctAnswer;

  if (isCorrect) score++;

  return {
    question: question.question,
    selectedAnswer,
    correctAnswer: question.correctAnswer,
    isCorrect,
    explanation: question.explanation,
  };
});
  
    quiz.score = score;
    quiz.completed = true;
    quiz.timeTaken = timeTaken || 0;
  
    await quiz.save();
  
    return {
      quizId: quiz._id,
      score,
      totalQuestions: quiz.questions.length,
      completed: true,
      timeTaken: quiz.timeTaken,
      results,
    };
  };

  export const getQuizResult = async (quizId, userId) => {
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      throw new ApiError(400, "Invalid quiz ID.");
    }
  
    const quiz = await Quiz.findOne({
      _id: quizId,
      createdBy: userId,
    }).populate("document", "title originalFileName");
  
    if (!quiz) {
      throw new ApiError(404, "Quiz not found.");
    }
  
    if (!quiz.completed) {
      throw new ApiError(400, "Quiz has not been submitted yet.");
    }
  
    const results = quiz.questions.map((question) => ({
      question: question.question,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
    }));
  
    return {
      quizId: quiz._id,
      title: quiz.title,
      document: quiz.document,
      score: quiz.score,
      totalQuestions: quiz.questions.length,
      percentage: Math.round((quiz.score / quiz.questions.length) * 100),
      completed: quiz.completed,
      timeTaken: quiz.timeTaken,
      results,
    };
  };