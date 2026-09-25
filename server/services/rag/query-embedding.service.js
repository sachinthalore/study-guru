import genAI from "../../config/gemini.js";

const EMBEDDING_MODEL = "gemini-embedding-001";

export const generateQueryEmbedding = async (query) => {
  if (!query || !query.trim()) {
    throw new Error(
      "Query is required for embedding generation."
    );
  }

  try {
    const result = await genAI.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: query.trim(),
      config: {
        taskType: "RETRIEVAL_QUERY",
      },
    });

    return result.embeddings[0].values;
  } catch (error) {
    console.error(
      "Gemini Query Embedding Error:",
      error
    );

    throw new Error(
      "Failed to generate query embedding."
    );
  }
};