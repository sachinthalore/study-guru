import { generateAIResponse } from "../services/chat.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import logger from "../config/logger.js";
import ApiResponse from "../utils/apiResponse.js";
export const chatWithAI = asyncHandler(async (req, res) => {
  const { prompt, mode, notesContent } = req.validatedData;

  let finalPrompt = prompt;

  if (mode === "notes" && notesContent) {
    finalPrompt = `
You are an AI Study Assistant.
Use ONLY the notes below.
If the answer is not found, reply exactly:
"I couldn't find the answer in your notes."

Notes:
${notesContent}

Question:
${prompt}
`;
  }

  // AI request start log
  logger.info(`Generating AI response | Mode: ${mode || "global"}`);

  const text = await generateAIResponse(finalPrompt);

  // AI request success log
  logger.info(`AI response generated successfully | Mode: ${mode || "global"}`);

  res.status(200).json(
    new ApiResponse(
      true,
      "AI response generated successfully",
      {
        reply: text,
      }
    )
  );
});