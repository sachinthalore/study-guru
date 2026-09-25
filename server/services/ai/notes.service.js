import genAI from "../../config/gemini.js";
import ApiError from "../../utils/apiError.js";
import { generateContentWithRetry } from "../../utils/geminiRetry.js";

const DIRECT_NOTES_LIMIT = 12000;
const AI_CHUNK_SIZE = 10000;
const AI_CHUNK_OVERLAP = 500;

const GEMINI_MODEL = "gemini-3.8-flash";

const splitTextForNotes = (
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

const generateSingleNotes = async (text) => {
  const prompt = `
You are an AI study assistant for Study Guru.

Create detailed and well-structured study notes
from the following study material.

Requirements:
- Use clear headings and subheadings.
- Explain important concepts in simple English.
- Include important definitions.
- Include key points and important facts.
- Use bullet points where appropriate.
- Keep the notes focused on exam preparation.
- Preserve important technical terminology from
  the study material.
- Do not add information that is not present
  in the study material.
- Do not skip important concepts.
- Make the notes easy to revise.
- Avoid unnecessary repetition.

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

export const generateDocumentNotes = async (
  extractedText
) => {
  if (!extractedText || !extractedText.trim()) {
    throw new ApiError(
      400,
      "No extracted text available for notes."
    );
  }

  const normalizedText = extractedText
    .replace(/\s+/g, " ")
    .trim();

  try {
    /*
     * Small document:
     * Generate notes directly.
     */
    if (
      normalizedText.length <=
      DIRECT_NOTES_LIMIT
    ) {
      return await generateSingleNotes(
        normalizedText
      );
    }

    /*
     * Large document:
     * Split the material into manageable sections.
     */
    const chunks = splitTextForNotes(
      normalizedText
    );

    if (!chunks.length) {
      throw new Error(
        "Unable to create notes chunks."
      );
    }

    /*
     * Generate notes for every section.
     */
    const sectionNotes = [];

    for (
      let index = 0;
      index < chunks.length;
      index++
    ) {
      const notes = await generateSingleNotes(
        chunks[index]
      );

      sectionNotes.push(
        `Section ${index + 1}:\n${notes}`
      );
    }

    /*
     * Combine section notes into one
     * final document-level notes.
     */
    const combinedNotes =
      sectionNotes.join("\n\n");

    const finalPrompt = `
You are an AI study assistant for Study Guru.

Create one final, well-structured set of study
notes from the section notes below.

Requirements:
- Preserve all important concepts.
- Remove duplicate information.
- Organize related concepts together.
- Use clear headings and subheadings.
- Include important definitions.
- Include key points and important facts.
- Use bullet points where appropriate.
- Preserve important technical terminology.
- Use simple English.
- Keep the notes focused on college exam preparation.
- Make the notes easy to revise.
- Do not add information that is not present
  in the provided section notes.
- Do not mention that the material was processed
  in sections.
- Return only the final study notes.

Section Notes:

${combinedNotes}
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
      "Gemini Notes Error:",
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
      "Failed to generate document notes."
    );
  }
};