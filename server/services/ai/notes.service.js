import genAI from "../../config/gemini.js";
import ApiError from "../../utils/apiError.js";

export const generateDocumentNotes = async (extractedText) => {
  if (!extractedText || !extractedText.trim()) {
    throw new ApiError(
      400,
      "No extracted text available for notes."
    );
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
    });

    const prompt = `
You are an AI study assistant for Study Guru.

Create detailed and well-structured study notes from the following study material.

Requirements:
- Use clear headings and subheadings.
- Explain important concepts in simple English.
- Include important definitions.
- Include key points and important facts.
- Use bullet points where appropriate.
- Keep the notes focused on exam preparation.
- Preserve important technical terminology from the study material.
- Do not add information that is not present in the document.
- Do not skip important concepts.
- Make the notes easy to revise.

Study Material:

${extractedText}
`;

    const result = await model.generateContent(prompt);

    const response = result.response;
    const notes = response.text();

    return notes.trim();
  } catch (error) {
    console.error("Gemini Notes Error:", error);

    throw new ApiError(
      500,
      "Failed to generate document notes."
    );
  }
};