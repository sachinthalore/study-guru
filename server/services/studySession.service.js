import mongoose from "mongoose";
import StudySession from "../models/studySession.model.js";
import Document from "../models/document.model.js";
import ApiError from "../utils/apiError.js";

export const startStudySession = async (userId, data) => {
  const { document: documentId, activity } = data;

  if (documentId) {
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
  }

  const activeSession = await StudySession.findOne({
    user: userId,
    endedAt: null,
  });

  if (activeSession) {
    throw new ApiError(400, "You already have an active study session.");
  }

  const session = await StudySession.create({
    user: userId,
    document: documentId || null,
    activity: activity || "reading",
    startedAt: new Date(),
  });

  return session;
};

export const endStudySession = async (sessionId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw new ApiError(400, "Invalid study session ID.");
  }

  const session = await StudySession.findOne({
    _id: sessionId,
    user: userId,
  });

  if (!session) {
    throw new ApiError(404, "Study session not found.");
  }

  if (session.endedAt) {
    throw new ApiError(400, "Study session has already ended.");
  }

  const endedAt = new Date();

  const duration = Math.max(
    0,
    Math.floor((endedAt.getTime() - session.startedAt.getTime()) / 1000)
  );

  session.endedAt = endedAt;
  session.duration = duration;

  await session.save();

  return session;
};

export const getStudySessions = async (userId) => {
  return await StudySession.find({
    user: userId,
  })
    .populate("document", "title originalFileName")
    .sort({ createdAt: -1 });
};

export const getStudySession = async (sessionId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw new ApiError(400, "Invalid study session ID.");
  }

  const session = await StudySession.findOne({
    _id: sessionId,
    user: userId,
  }).populate("document", "title originalFileName");

  if (!session) {
    throw new ApiError(404, "Study session not found.");
  }

  return session;
};

export const deleteStudySession = async (sessionId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw new ApiError(400, "Invalid study session ID.");
  }

  const session = await StudySession.findOneAndDelete({
    _id: sessionId,
    user: userId,
  });

  if (!session) {
    throw new ApiError(404, "Study session not found.");
  }

  return session;
};