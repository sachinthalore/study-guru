import genAI from "../../config/gemini.js";
import ApiError from "../../utils/apiError.js";

export const generateDocumentQuiz = async (extractedText) => {
  if (!extractedText || !extractedText.trim()) {
    throw new ApiError(
      400,
      "No extracted text available for quiz generation."
    );
  }

  // Basic content-quality check
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
      "This document does not contain enough meaningful study material to generate a useful quiz."
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
You are an AI quiz generator for Study Guru.

Create 10 multiple-choice questions from the study material below.

Requirements:
- Each question must have exactly 4 options.
- Only one option must be correct.
- Include the correct answer.
- Include a short explanation for the correct answer.
- Questions should be useful for college exam preparation.
- Cover important concepts from the material.
- Use simple and clear English.
- Do not add information that is not present in the study material.
- Do not create questions from irrelevant, placeholder, or meaningless content.
- Return ONLY valid JSON.
- Do not use markdown.
- Do not wrap the JSON inside code fences.

Return exactly this JSON structure:

{
  "quiz": [
    {
      "question": "Question text",
      "options": [
        "Option 1",
        "Option 2",
        "Option 3",
        "Option 4"
      ],
      "correctAnswer": "Exactly one option from the options array",
      "explanation": "Short explanation"
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

    if (!parsed.quiz || !Array.isArray(parsed.quiz)) {
      throw new Error("Invalid quiz response format.");
    }

    if (parsed.quiz.length === 0) {
      throw new Error("Gemini returned an empty quiz.");
    }

    for (const question of parsed.quiz) {
      if (
        !question.question ||
        !Array.isArray(question.options) ||
        question.options.length !== 4 ||
        !question.correctAnswer ||
        !question.explanation
      ) {
        throw new Error("Invalid quiz question format.");
      }

      if (!question.options.includes(question.correctAnswer)) {
        throw new Error(
          "Correct answer does not match any quiz option."
        );
      }
    }

    return parsed.quiz;
  } catch (error) {
    console.error("Gemini Quiz Error:", error);

    // Preserve intentional API errors such as 400
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      500,
      "Failed to generate document quiz."
    );
  }
};