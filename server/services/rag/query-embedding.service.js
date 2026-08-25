import genAI from "../../config/gemini.js";

const EMBEDDING_MODEL = "gemini-embedding-001";

export const generateQueryEmbedding = async (query) => {
  if (!query || !query.trim()) {
    throw new Error(
      "Query is required for embedding generation."
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
            text: query.trim(),
          },
        ],
      },
      taskType: "RETRIEVAL_QUERY",
    });

    return result.embedding.values;
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