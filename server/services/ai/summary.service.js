import genAI from "../../config/gemini.js";
import ApiError from "../../utils/apiError.js";
import { generateContentWithRetry } from "../../utils/geminiRetry.js";

const DIRECT_SUMMARY_LIMIT = 12000;
const AI_CHUNK_SIZE = 10000;
const AI_CHUNK_OVERLAP = 500;

const GEMINI_MODEL = "gemini-3.8-flash";

const splitTextForSummary = (
  text,
  chunkSize = AI_CHUNK_SIZE,
  chunkOverlap = AI_CHUNK_OVERLAP
) => {
  const chunks = [];

  let start = 0;

  while (start < text.length) {
    let end = Math.min(
      start + chunkSize,
      text.length
    );

    if (end < text.length) {
      const sentenceBreak = text.lastIndexOf(
        ". ",
        end
      );

      if (
        sentenceBreak > start + chunkSize * 0.6
      ) {
        end = sentenceBreak + 1;
      } else {
        const wordBreak = text.lastIndexOf(
          " ",
          end
        );

        if (
          wordBreak > start + chunkSize * 0.6
        ) {
          end = wordBreak;
        }
      }
    }

    const chunk = text
      .slice(start, end)
      .trim();

    if (chunk) {
      chunks.push(chunk);
    }

    if (end >= text.length) {
      break;
    }

    start = Math.max(
      0,
      end - chunkOverlap
    );
  }

  return chunks;
};

const generateSingleSummary = async (text) => {
  const prompt = `
You are an AI study assistant for Study Guru.

Summarize the following study material clearly and accurately.

Requirements:
- Keep the important concepts.
- Use simple English.
- Organize the summary with headings and bullet points.
- Do not add information that is not present in the document.
- Make it useful for a college student preparing for exams.
- Do not repeat the same information unnecessarily.

Study Material:

${text}
`;

  const result = await generateContentWithRetry(
    () =>
      genAI.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      })
  );

  return result.text.trim();
};

export const generateDocumentSummary = async (
  extractedText
) => {
  if (!extractedText || !extractedText.trim()) {
    throw new ApiError(
      400,
      "No extracted text available for summary."
    );
  }

  const normalizedText = extractedText
    .replace(/\s+/g, " ")
    .trim();

  try {
    /*
     * Small document:
     * Generate the summary directly.
     */
    if (
      normalizedText.length <=
      DIRECT_SUMMARY_LIMIT
    ) {
      return await generateSingleSummary(
        normalizedText
      );
    }

    /*
     * Large document:
     * Split the material into manageable sections.
     */
    const chunks = splitTextForSummary(
      normalizedText
    );

    if (!chunks.length) {
      throw new Error(
        "Unable to create summary chunks."
      );
    }

    /*
     * Generate a summary for every section.
     */
    const chunkSummaries = [];

    for (
      let index = 0;
      index < chunks.length;
      index++
    ) {
      const chunkSummary =
        await generateSingleSummary(
          chunks[index]
        );

      chunkSummaries.push(
        `Section ${index + 1}:\n${chunkSummary}`
      );
    }

    /*
     * Combine section summaries into one
     * final document summary.
     */
    const combinedSummaries =
      chunkSummaries.join("\n\n");

    const finalPrompt = `
You are an AI study assistant for Study Guru.

Create one final, well-structured summary from
the section summaries below.

Requirements:
- Preserve all important concepts.
- Remove duplicate information.
- Organize related concepts together.
- Use clear headings and bullet points.
- Use simple English.
- Keep the summary useful for college exam preparation.
- Do not add information that is not present
  in the provided section summaries.
- Do not mention that the material was processed
  in sections.
- Return only the final summary.

Section Summaries:

${combinedSummaries}
`;

    const finalResult =
      await generateContentWithRetry(
        () =>
          genAI.models.generateContent({
            model: GEMINI_MODEL,
            contents: finalPrompt,
          })
      );

    return finalResult.text.trim();
  } catch (error) {
    console.error(
      "Gemini Summary Error:",
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
      "Failed to generate document summary."
    );
  }
};