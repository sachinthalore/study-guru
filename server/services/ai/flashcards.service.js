import genAI from "../../config/gemini.js";
import ApiError from "../../utils/apiError.js";
import { generateContentWithRetry } from "../../utils/geminiRetry.js";

const GEMINI_MODEL = "gemini-3.8-flash";

export const generateDocumentFlashcards = async (
  extractedText
) => {
  if (!extractedText || !extractedText.trim()) {
    throw new ApiError(
      400,
      "No extracted text available for flashcard generation."
    );
  }

  // Normalize extracted text
  const normalizedText = extractedText
    .replace(/\s+/g, " ")
    .trim();

  const lowerText =
    normalizedText.toLowerCase();

  // Detect placeholder content
  const loremIpsumPattern =
    /\b(lorem ipsum|dolor sit amet|consectetur adipiscing elit)\b/g;

  const loremMatches =
    lowerText.match(loremIpsumPattern) || [];

  if (
    normalizedText.length < 200 ||
    loremMatches.length >= 2
  ) {
    throw new ApiError(
      400,
      "This document does not contain enough meaningful study material to generate useful flashcards."
    );
  }

  /*
   * Estimate flashcard size based on document content.
   * This is only a guideline for Gemini.
   */
  const wordCount =
    normalizedText.split(/\s+/).length;

  let suggestedFlashcardCount;

  if (wordCount < 1000) {
    suggestedFlashcardCount = "5-10";
  } else if (wordCount < 3000) {
    suggestedFlashcardCount = "10-20";
  } else if (wordCount < 6000) {
    suggestedFlashcardCount = "20-30";
  } else if (wordCount < 10000) {
    suggestedFlashcardCount = "30-50";
  } else {
    suggestedFlashcardCount = "50-75";
  }

  try {
    const prompt = `
You are an AI study assistant for Study Guru.

Create an appropriate number of flashcards from
the study material below.

The estimated study-material size suggests
approximately:
${suggestedFlashcardCount} flashcards.

This is only a guideline. Decide the final number
based on:
- Amount of meaningful study material.
- Number of distinct concepts.
- Complexity of the material.
- Important exam-relevant information.

Requirements:
- Generate enough flashcards to cover important concepts.
- Do not generate unnecessary flashcards just to
  increase the count.
- Avoid duplicate or nearly identical flashcards.
- Focus on important concepts, definitions, facts,
  formulas, and exam-relevant information.
- Each flashcard must contain one clear question
  and one accurate answer.
- Keep questions concise and easy to understand.
- Keep answers clear and informative.
- Use simple English.
- Do not add information that is not present
  in the study material.
- Do not create flashcards from irrelevant,
  placeholder, or meaningless content.
- Every flashcard must be supported by the
  provided study material.
- Make the flashcards useful for active recall
  and quick revision.
- Return ONLY valid JSON.
- Do not use markdown.
- Do not wrap the JSON inside code fences.

Return exactly this JSON structure:

{
  "flashcards": [
    {
      "question": "Question text",
      "answer": "Answer text"
    }
  ]
}

Study Material:

${normalizedText}
`;

    const result =
      await generateContentWithRetry(
        () =>
          genAI.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
              responseMimeType:
                "application/json",
            },
          })
      );

    const text = result.text;

    if (!text || !text.trim()) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    const parsed = JSON.parse(text);

    if (
      !parsed.flashcards ||
      !Array.isArray(parsed.flashcards)
    ) {
      throw new Error(
        "Invalid flashcards response format."
      );
    }

    if (parsed.flashcards.length === 0) {
      throw new Error(
        "Gemini returned an empty flashcard set."
      );
    }

    // Safety limit
    if (parsed.flashcards.length > 100) {
      throw new Error(
        "Gemini returned too many flashcards."
      );
    }

    // Validate every flashcard
    for (const flashcard of parsed.flashcards) {
      if (
        !flashcard.question ||
        !flashcard.answer
      ) {
        throw new Error(
          "Invalid flashcard format."
        );
      }
    }

    return parsed.flashcards;
  } catch (error) {
    console.error(
      "Gemini Flashcards Error:",
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
      "Failed to generate document flashcards."
    );
  }
};