
import mongoose from "mongoose";
import DocumentChunk from "../../models/documentChunk.model.js";
import { generateQueryEmbedding } from "./query-embedding.service.js";

export const retrieveRelevantChunks = async (
  query,
  documentIds,
  limit = 5
) => {
  if (!query || !query.trim()) {
    throw new Error("Query is required.");
  }

  if (!documentIds) {
    throw new Error("Document ID(s) are required.");
  }

  // Support both one document ID and an array of IDs.
  const ids = Array.isArray(documentIds)
    ? documentIds
    : [documentIds];

  if (
    ids.length === 0 ||
    ids.some((id) => !mongoose.isValidObjectId(id))
  ) {
    throw new Error("Invalid document ID(s).");
  }

  const objectIds = ids.map(
    (id) => new mongoose.Types.ObjectId(id)
  );

  const safeLimit = Math.min(
    10,
    Math.max(1, Math.floor(Number(limit) || 5))
  );

  const queryEmbedding = await generateQueryEmbedding(query);

  const documentFilter =
    objectIds.length === 1
      ? { $eq: objectIds[0] }
      : { $in: objectIds };

  return await DocumentChunk.aggregate([
    {
      $vectorSearch: {
        index: "document_vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        filter: {
          documentId: documentFilter,
        },
        numCandidates: Math.max(50, safeLimit * 10),
        limit: safeLimit,
      },
    },
    {
      $project: {
        _id: 1,
        content: 1,
        chunkIndex: 1,
        documentId: 1,
        score: {
          $meta: "vectorSearchScore",
        },
      },
    },
  ]);
};
