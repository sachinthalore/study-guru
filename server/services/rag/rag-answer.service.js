import mongoose from "mongoose";
import genAI from "../../config/gemini.js";
import ApiError from "../../utils/apiError.js";
import { retrieveRelevantChunks } from "./retrieval.service.js";
import Document from "../../models/document.model.js";
import { generateContentWithRetry } from "../../utils/geminiRetry.js";

const GEMINI_MODEL = "gemini-3.8-flash";

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

  if (!mongoose.isValidObjectId(documentId)) {
    throw new ApiError(
      400,
      "Invalid document ID."
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

    // 2. Retrieve relevant document chunks
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

    // 3. Build context
    const context = chunks
      .map(
        (chunk, index) =>
          `Source ${index + 1}:\n${chunk.content}`
      )
      .join("\n\n");

    // 4. Build prompt
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

    // 5. Generate answer with retry
    const result =
      await generateContentWithRetry(
        () =>
          genAI.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
          })
      );

    const answer = result.text?.trim();

    if (!answer) {
      throw new Error(
        "Gemini returned an empty RAG answer."
      );
    }

    // 6. Return answer + sources
    return {
      answer,

      sources: chunks.map((chunk) => ({
        chunkIndex: chunk.chunkIndex,
        score: Number(
          chunk.score.toFixed(4)
        ),
        preview: chunk.content.slice(0, 200),
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

    const statusCode =
      error?.status ||
      error?.statusCode ||
      error?.response?.status ||
      error?.code;

    if (statusCode === 429) {
      throw new ApiError(
        429,
        "AI service quota or rate limit reached. Please try again later."
      );
    }

    if (
      typeof statusCode === "number" &&
      statusCode >= 500 &&
      statusCode < 600
    ) {
      throw new ApiError(
        503,
        "AI service is temporarily unavailable. Please try again later."
      );
    }


    throw new ApiError(
      500,
      "Failed to generate RAG answer."
    );
  }
};