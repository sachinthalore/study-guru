import genAI from "../../config/gemini.js";
import ApiError from "../../utils/apiError.js";

export const generateDocumentFlashcards = async (extractedText) => {
  if (!extractedText || !extractedText.trim()) {
    throw new ApiError(
      400,
      "No extracted text available for flashcard generation."
    );
  }

  const normalizedText = extractedText
    .replace(/\s+/g, " ")
    .trim();

  const lowerText = normalizedText.toLowerCase();

  const loremIpsumPattern =
    /\b(lorem ipsum|dolor sit amet|consectetur adipiscing elit)\b/g;

  const loremMatches = lowerText.match(loremIpsumPattern) || [];

  if (
    normalizedText.length < 200 ||
    loremMatches.length >= 2
  ) {
    throw new ApiError(
      400,
      "This document does not contain enough meaningful study material to generate useful flashcards."
    );
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `
You are an AI study assistant for Study Guru.

Create 15 flashcards from the following study material.

Requirements:
- Each flashcard must contain one clear question and one accurate answer.
- Focus on important concepts, definitions, facts, formulas, and exam-relevant information.
- Keep questions concise and easy to understand.
- Keep answers clear and informative.
- Use simple English.
- Do not add information that is not present in the study material.
- Do not create flashcards from irrelevant, placeholder, or meaningless content.
- Avoid duplicate or nearly identical flashcards.
- Make the flashcards useful for active recall and quick revision.
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

    const result = await model.generateContent(prompt);

    const response = result.response;
    const text = response.text();

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

    throw new ApiError(
      500,
      "Failed to generate document flashcards."
    );
  }
};