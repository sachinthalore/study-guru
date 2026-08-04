import genAI from "../config/gemini.js";
import logger from "../config/logger.js";
import ApiError from "../utils/apiError.js";

export const generateAIResponse = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
    });

    const result = await model.generateContent(prompt);

    const response = await result.response;

    return response.text();

  } catch (error) {

    // Save full error in logs
    logger.error(error.stack || error.message);

    // Handle Gemini quota exceeded
    if (error.message?.includes("429")) {
      throw new ApiError(
        429,
        "AI service is temporarily busy. Please try again in a minute."
      );
    }

    // Handle invalid API key
    if (error.message?.includes("API_KEY")) {
      throw new ApiError(
        500,
        "AI service configuration error."
      );
    }

    // Generic AI error
    throw new ApiError(
      500,
      "Unable to generate AI response at this time."
    );
  }
};