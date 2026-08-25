import DocumentChunk from "../../models/documentChunk.model.js";
import { generateDocumentEmbedding } from "./embedding.service.js";

export const generateAndStoreDocumentEmbeddings = async (
  documentId
) => {
  if (!documentId) {
    throw new Error("Document ID is required.");
  }

  const chunks = await DocumentChunk.find({
    documentId,
  }).sort({
    chunkIndex: 1,
  });

  if (!chunks.length) {
    return [];
  }

  const updatedChunks = [];

  for (const chunk of chunks) {
    try {
      const embedding = await generateDocumentEmbedding(
        chunk.content
      );

      chunk.embedding = embedding;

      await chunk.save();

      updatedChunks.push(chunk);
    } catch (error) {
      console.error(
        `Embedding failed for chunk ${chunk.chunkIndex}:`,
        error
      );

      throw error;
    }
  }

  return updatedChunks;
};