import genAI from "../../config/gemini.js";
import ApiError from "../../utils/apiError.js";
import { retrieveRelevantChunks } from "./retrieval.service.js";
import Document from "../../models/document.model.js";

export const generateRagAnswer = async (
  query,
  documentId,
  userId
) => {
  if (!query || !query.trim()) {
    throw new ApiError(
      400,
      "Question is required."
    );
  }

  if (!documentId) {
    throw new ApiError(
      400,
      "Document ID is required."
    );
  }

  if (!userId) {
    throw new ApiError(
      401,
      "User authentication required."
    );
  }

  try {
    // 1. Verify document ownership
    const document = await Document.findOne({
      _id: documentId,
      uploadedBy: userId,
    });

    if (!document) {
      throw new ApiError(
        404,
        "Document not found."
      );
    }
    // 1. Retrieve relevant document chunks
    const chunks = await retrieveRelevantChunks(
      query,
      documentId,
      5
    );

    if (!chunks.length) {
      return {
        answer:
          "I could not find relevant information in this document.",
        sources: [],
      };
    }

    // 2. Build context from retrieved chunks
    const context = chunks
      .map(
        (chunk, index) =>
          `Source ${index + 1}:\n${chunk.content}`
      )
      .join("\n\n");

    // 3. Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
    });

    const prompt = `
You are Study Guru, an AI study assistant.

Answer the user's question using ONLY the provided
document context.

Rules:
- Do not use outside knowledge.
- Do not invent facts.
- If the answer is not available in the context,
  clearly say that the information is not present
  in the document.
- Give a clear and concise answer.
- Use simple English.
- You may use headings or bullet points when useful.

User Question:
${query}

Document Context:
${context}
`;

    // 4. Generate answer
    const result = await model.generateContent(prompt);

    const answer = result.response.text().trim();

    return {
      answer,
      sources: chunks.map((chunk) => ({
        chunkIndex: chunk.chunkIndex,
        score: chunk.score,
      })),
    };
  } catch (error) {
    console.error(
      "RAG Answer Generation Error:",
      error
    );

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      500,
      "Failed to generate RAG answer."
    );
  }
};