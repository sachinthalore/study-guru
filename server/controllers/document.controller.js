import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
} from "../services/document.service.js";

import { reprocessDocumentAI } from "../services/ai/reprocess.service.js";
import { generateStudyTool } from "../services/ai/study-tool.service.js";

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

export const reprocessDocumentAIController = asyncHandler(
  async (req, res) => {
    const document = await reprocessDocumentAI(
      req.params.id,
      req.user._id
    );

    const message = document.aiProcessed
      ? "Document AI processing completed successfully."
      : "Document AI processing completed partially.";

    res.status(200).json(
      new ApiResponse(
        true,
        message,
        document
      )
    );
  }
);

export const generateStudyToolController = asyncHandler(
  async (req, res) => {
    const { resource } = req.params;
    const regenerate = req.validatedData.regenerate;

    const result = await generateStudyTool(
      req.params.id,
      req.user._id,
      resource,
      regenerate
    );

    res.status(200).json(
      new ApiResponse(
        true,
        result.cached
          ? "Saved study resource fetched successfully."
          : "Study resource generated successfully.",
        {
          resource: result.resource,
          result: result.result,
          cached: result.cached,
        }
      )
    );
  }
);