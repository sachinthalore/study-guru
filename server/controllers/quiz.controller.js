import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import {
    createQuiz,
    getAllQuizzes,
    getSingleQuiz,
    deleteQuiz,
    submitQuiz,
    getQuizResult,
  } from "../services/quiz.service.js";

  export const createQuizController = asyncHandler(async (req, res) => {
    const quiz = await createQuiz(req.user._id, req.validatedData);
  
    const safeQuiz = quiz.toObject();
  
    safeQuiz.questions = safeQuiz.questions.map((question) => {
      const { correctAnswer, explanation, ...safeQuestion } = question;
      return safeQuestion;
    });
  
    res
      .status(201)
      .json(new ApiResponse(true, "Quiz created successfully.", safeQuiz));
  });

export const getAllQuizzesController = asyncHandler(async (req, res) => {
  const quizzes = await getAllQuizzes(req.user._id);

  res.status(200).json(
    new ApiResponse(
      true,
      "Quizzes fetched successfully.",
      quizzes
    )
  );
});

export const getSingleQuizController = asyncHandler(async (req, res) => {
  const quiz = await getSingleQuiz(
    req.params.id,
    req.user._id
  );

  res.status(200).json(
    new ApiResponse(
      true,
      "Quiz fetched successfully.",
      quiz
    )
  );
});

export const deleteQuizController = asyncHandler(async (req, res) => {
  await deleteQuiz(
    req.params.id,
    req.user._id
  );

  res.status(200).json(
    new ApiResponse(
      true,
      "Quiz deleted successfully.",
      null
    )
  );
});

export const submitQuizController = asyncHandler(async (req, res) => {
    const result = await submitQuiz(
      req.params.id,
      req.user._id,
      req.validatedData.answers,
      req.validatedData.timeTaken
    );
  
    res.status(200).json(
      new ApiResponse(
        true,
        "Quiz submitted successfully.",
        result
      )
    );
  });

  export const getQuizResultController = asyncHandler(async (req, res) => {
    const result = await getQuizResult(
      req.params.id,
      req.user._id
    );
  
    res
      .status(200)
      .json(new ApiResponse(true, "Quiz result fetched successfully.", result));
  });