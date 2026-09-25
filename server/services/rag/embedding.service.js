import genAI from "../../config/gemini.js";

const EMBEDDING_MODEL = "gemini-embedding-001";

export const generateDocumentEmbedding = async (
  text
) => {
  if (!text || !text.trim()) {
    throw new Error(
      "Text is required for embedding generation."
    );
  }

  try {
    const result = await genAI.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text.trim(),
      config: {
        taskType: "RETRIEVAL_DOCUMENT",
      },
    });

    return result.embeddings[0].values;
  } catch (error) {
    console.error(
      "Gemini Embedding Error:",
      error
    );

    throw new Error(
      "Failed to generate document embedding."
    );
  }
};