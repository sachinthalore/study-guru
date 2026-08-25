import genAI from "../../config/gemini.js";

const EMBEDDING_MODEL = "gemini-embedding-001";

export const generateDocumentEmbedding = async (text) => {
  if (!text || !text.trim()) {
    throw new Error(
      "Text is required for embedding generation."
    );
  }

  try {
    const model = genAI.getGenerativeModel({
      model: EMBEDDING_MODEL,
    });

    const result = await model.embedContent({
      content: {
        parts: [
          {
            text: text.trim(),
          },
        ],
      },
      taskType: "RETRIEVAL_DOCUMENT",
    });

    return result.embedding.values;
  } catch (error) {
    console.error("Gemini Embedding Error:", error);

    throw new Error(
      "Failed to generate document embedding."
    );
  }
};