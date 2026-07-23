import genAI from "../config/gemini.js";

export const generateAIResponse = async (prompt) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
  });

  const result = await model.generateContent(prompt);

  const response = await result.response;

  return response.text();
};