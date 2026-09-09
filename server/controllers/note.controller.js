import ApiResponse from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createNote,
  getAllNotes,
  getSingleNote,
  updateNote,
  deleteNote,
} from "../services/note.service.js";

export const createNoteController = asyncHandler(
  async (req, res) => {
    const note = await createNote(
      req.user._id,
      req.validatedData
    );

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          note,
          "Note created successfully."
        )
      );
  }
);

export const getAllNotesController = asyncHandler(
  async (req, res) => {
    const notes = await getAllNotes(req.user._id);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          notes,
          "Notes fetched successfully."
        )
      );
  }
);

export const getSingleNoteController = asyncHandler(
  async (req, res) => {
    const note = await getSingleNote(
      req.params.id,
      req.user._id
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          note,
          "Note fetched successfully."
        )
      );
  }
);

export const updateNoteController = asyncHandler(
  async (req, res) => {
    const note = await updateNote(
      req.params.id,
      req.user._id,
      req.validatedData
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          note,
          "Note updated successfully."
        )
      );
  }
);

export const deleteNoteController = asyncHandler(
  async (req, res) => {
    const note = await deleteNote(
      req.params.id,
      req.user._id
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          note,
          "Note deleted successfully."
        )
      );
  }
);