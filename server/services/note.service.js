import Note from "../models/note.model.js";
import Document from "../models/document.model.js";
import ApiError from "../utils/apiError.js";

export const createNote = async (userId, data) => {
  if (data.document) {
    const document = await Document.findOne({
      _id: data.document,
      uploadedBy: userId,
    });

    if (!document) {
      throw new ApiError(404, "Document not found.");
    }
  }

  const note = await Note.create({
    ...data,
    createdBy: userId,
  });

  return note;
};

export const getAllNotes = async (userId) => {
  return await Note.find({
    createdBy: userId,
  })
    .populate("document", "title originalFileName")
    .sort({
      createdAt: -1,
    });
};

export const getSingleNote = async (noteId, userId) => {
  const note = await Note.findOne({
    _id: noteId,
    createdBy: userId,
  }).populate("document", "title originalFileName");

  if (!note) {
    throw new ApiError(404, "Note not found.");
  }

  return note;
};

export const updateNote = async (noteId, userId, data) => {
  if (data.document) {
    const document = await Document.findOne({
      _id: data.document,
      uploadedBy: userId,
    });

    if (!document) {
      throw new ApiError(404, "Document not found.");
    }
  }

  const note = await Note.findOneAndUpdate(
    {
      _id: noteId,
      createdBy: userId,
    },
    data,
    {
      new: true,
      runValidators: true,
    }
  ).populate("document", "title originalFileName");

  if (!note) {
    throw new ApiError(404, "Note not found.");
  }

  return note;
};

export const deleteNote = async (noteId, userId) => {
  const note = await Note.findOneAndDelete({
    _id: noteId,
    createdBy: userId,
  });

  if (!note) {
    throw new ApiError(404, "Note not found.");
  }

  return note;
};