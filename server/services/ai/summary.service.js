import genAI from "../../config/gemini.js";
import ApiError from "../../utils/apiError.js";

export const generateDocumentSummary = async (extractedText) => {
  if (!extractedText || !extractedText.trim()) {
    throw new ApiError(
      400,
      "No extracted text available for summary."
    );
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
    });

    const prompt = `
You are an AI study assistant for Study Guru.

Summarize the following study material clearly and accurately.

Requirements:
- Keep the important concepts.
- Use simple English.
- Organize the summary with headings and bullet points.
- Do not add information that is not present in the document.
- Make it useful for a college student preparing for exams.

Study Material:

${extractedText}
`;

    const result = await model.generateContent(prompt);

    const response = result.response;
    const summary = response.text();

    return summary.trim();
  } catch (error) {
    console.error("Gemini Summary Error:", error);

    throw new ApiError(
      500,
      "Failed to generate document summary."
    );
  }
};