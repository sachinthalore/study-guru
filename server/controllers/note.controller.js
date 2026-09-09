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

    return res.status(201).json(
      new ApiResponse(
        true,
        "Note created successfully.",
        note
      )
    );
  }
);

export const getAllNotesController = asyncHandler(
  async (req, res) => {
    const notes = await getAllNotes(req.user._id);

    return res.status(200).json(
      new ApiResponse(
        true,
        "Notes fetched successfully.",
        notes
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

    return res.status(200).json(
      new ApiResponse(
        true,
        "Note fetched successfully.",
        note
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

    return res.status(200).json(
      new ApiResponse(
        true,
        "Note updated successfully.",
        note
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

    return res.status(200).json(
      new ApiResponse(
        true,
        "Note deleted successfully.",
        note
      )
    );
  }
);