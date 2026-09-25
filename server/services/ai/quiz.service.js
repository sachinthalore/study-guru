import genAI from "../../config/gemini.js";
import ApiError from "../../utils/apiError.js";
import { generateContentWithRetry } from "../../utils/geminiRetry.js";

const GEMINI_MODEL = "gemini-3.8-flash";

export const generateDocumentQuiz = async (
  extractedText
) => {
  if (!extractedText || !extractedText.trim()) {
    throw new ApiError(
      400,
      "No extracted text available for quiz generation."
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
      "This document does not contain enough meaningful study material to generate a useful quiz."
    );
  }

  /*
   * Estimate quiz size based on document content.
   * This is only a guideline for Gemini.
   */
  const wordCount =
    normalizedText.split(/\s+/).length;

  let suggestedQuestionCount;

  if (wordCount < 1000) {
    suggestedQuestionCount = "5-10";
  } else if (wordCount < 3000) {
    suggestedQuestionCount = "10-20";
  } else if (wordCount < 6000) {
    suggestedQuestionCount = "20-30";
  } else if (wordCount < 10000) {
    suggestedQuestionCount = "30-50";
  } else {
    suggestedQuestionCount = "50-75";
  }

  try {
    const prompt = `
You are an AI quiz generator for Study Guru.

Create an appropriate number of multiple-choice
questions from the study material below.

The estimated study-material size suggests
approximately:
${suggestedQuestionCount} questions.

This is only a guideline. Decide the final number
based on:
- Amount of meaningful study material.
- Number of distinct concepts.
- Complexity of the material.
- Important exam-relevant topics.

Requirements:
- Generate enough questions to cover important concepts.
- Do not generate unnecessary questions just to
  increase the count.
- Avoid duplicate or nearly identical questions.
- Each question must have exactly 4 options.
- Only one option must be correct.
- Include the correct answer.
- Include a short explanation for the correct answer.
- Questions should be useful for college exam preparation.
- Cover important concepts from the material.
- Use simple and clear English.
- Do not add information that is not present
  in the study material.
- Do not create questions from irrelevant,
  placeholder, or meaningless content.
- Every question must be supported by the
  provided study material.
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
      !parsed.quiz ||
      !Array.isArray(parsed.quiz)
    ) {
      throw new Error(
        "Invalid quiz response format."
      );
    }

    if (parsed.quiz.length === 0) {
      throw new Error(
        "Gemini returned an empty quiz."
      );
    }

    // Safety limit
    if (parsed.quiz.length > 100) {
      throw new Error(
        "Gemini returned too many quiz questions."
      );
    }

    // Validate every question
    for (const question of parsed.quiz) {
      if (
        !question.question ||
        !Array.isArray(question.options) ||
        question.options.length !== 4 ||
        !question.correctAnswer ||
        !question.explanation
      ) {
        throw new Error(
          "Invalid quiz question format."
        );
      }

      // Correct answer must exist inside options
      if (
        !question.options.includes(
          question.correctAnswer
        )
      ) {
        throw new Error(
          "Correct answer does not match any quiz option."
        );
      }
    }

    return parsed.quiz;
  } catch (error) {
    console.error(
      "Gemini Quiz Error:",
      error
    );

    // Preserve intentional API errors such as 400
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
      "Failed to generate document quiz."
    );
  }
};