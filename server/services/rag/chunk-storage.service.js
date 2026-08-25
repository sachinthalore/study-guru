import DocumentChunk from "../../models/documentChunk.model.js";
import { chunkText } from "./chunk.service.js";

export const createDocumentChunks = async (
  documentId,
  extractedText
) => {
  if (!documentId) {
    throw new Error("Document ID is required.");
  }

  if (!extractedText || !extractedText.trim()) {
    return [];
  }

  const chunks = chunkText(extractedText);

  if (!chunks.length) {
    return [];
  }

  // Remove old chunks if the document is being reprocessed.
  await DocumentChunk.deleteMany({
    documentId,
  });

  const chunkDocuments = chunks.map(
    (content, index) => ({
      documentId,
      content,
      chunkIndex: index,
    })
  );

  return await DocumentChunk.insertMany(
    chunkDocuments
  );
};