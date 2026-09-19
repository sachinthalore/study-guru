import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";

import {
  startStudySession,
  endStudySession,
  getStudySessions,
  getStudySession,
  deleteStudySession,
} from "../services/studySession.service.js";

export const startStudySessionController = asyncHandler(
  async (req, res) => {
    const session = await startStudySession(
      req.user._id,
      req.validatedData
    );

    res
      .status(201)
      .json(
        new ApiResponse(
          true,
          "Study session started successfully.",
          session
        )
      );
  }
);

export const endStudySessionController = asyncHandler(
  async (req, res) => {
    const session = await endStudySession(
      req.params.id,
      req.user._id
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          true,
          "Study session ended successfully.",
          session
        )
      );
  }
);

export const getStudySessionsController = asyncHandler(
  async (req, res) => {
    const sessions = await getStudySessions(req.user._id);

    res
      .status(200)
      .json(
        new ApiResponse(
          true,
          "Study sessions fetched successfully.",
          sessions
        )
      );
  }
);

export const getStudySessionController = asyncHandler(
  async (req, res) => {
    const session = await getStudySession(
      req.params.id,
      req.user._id
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          true,
          "Study session fetched successfully.",
          session
        )
      );
  }
);

export const deleteStudySessionController = asyncHandler(
  async (req, res) => {
    await deleteStudySession(
      req.params.id,
      req.user._id
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          true,
          "Study session deleted successfully.",
          null
        )
      );
  }
);