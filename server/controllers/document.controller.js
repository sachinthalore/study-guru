import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
} from "../services/document.service.js";

export const uploadDocumentController = asyncHandler(async (req, res) => {
  const document = await uploadDocument(
    req.file,
    req.validatedData,
    req.user._id
  );

  res.status(201).json(
    new ApiResponse(
      true,
      "Document uploaded successfully.",
      document
    )
  );
});


export const getAllDocuments = asyncHandler(async (req, res) => {
  const documents = await getDocuments(req.user._id);

  res.status(200).json(
    new ApiResponse(
      true,
      "Documents fetched successfully.",
      documents
    )
  );
});

export const getSingleDocument = asyncHandler(async (req, res) => {
  const document = await getDocumentById(
    req.params.id,
    req.user._id
  );

  res.status(200).json(
    new ApiResponse(
      true,
      "Document fetched successfully.",
      document
    )
  );
});

export const updateDocumentController = asyncHandler(async (req, res) => {
  const document = await updateDocument(
    req.params.id,
    req.user._id,
    req.validatedData
  );

  res.status(200).json(
    new ApiResponse(
      true,
      "Document updated successfully.",
      document
    )
  );
});

export const deleteDocumentController = asyncHandler(async (req, res) => {
  await deleteDocument(
    req.params.id,
    req.user._id
  );

  res.status(200).json(
    new ApiResponse(
      true,
      "Document deleted successfully.",
      null
    )
  );
});