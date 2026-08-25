import mongoose from "mongoose";
import DocumentChunk from "../../models/documentChunk.model.js";
import { generateQueryEmbedding } from "./query-embedding.service.js";

export const retrieveRelevantChunks = async (
  query,
  documentId,
  limit = 5
) => {
  if (!query || !query.trim()) {
    throw new Error("Query is required.");
  }

  if (!documentId) {
    throw new Error("Document ID is required.");
  }

  if (!mongoose.isValidObjectId(documentId)) {
    throw new Error("Invalid document ID.");
  }

  const queryEmbedding =
    await generateQueryEmbedding(query);

  const results = await DocumentChunk.aggregate([
    {
      $vectorSearch: {
        index: "document_vector_index",
        path: "embedding",
        queryVector: queryEmbedding,
        filter: {
          documentId: {
            $eq: new mongoose.Types.ObjectId(
              documentId
            ),
          },
        },
        numCandidates: 10,
        limit,
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

  return results;
};