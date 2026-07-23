import { generateAIResponse } from "../services/chat.service.js";
import asyncHandler from "../utils/asyncHandler.js";

export const chatWithAI = asyncHandler(async (req, res) => {

  const { prompt, mode } = req.validatedData;

  let finalPrompt = prompt;

  if (mode === "notes" && req.body.notesContent) {
     // notes prompt
  }

  const text = await generateAIResponse(finalPrompt);

  res.json({
     message: text
  });

});