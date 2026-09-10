import {
  generateAIResponse,
  createChat,
  getAllChats,
  getSingleChat,
  updateChat,
  deleteChat,
} from "../services/chat.service.js";

import asyncHandler from "../utils/asyncHandler.js";
import logger from "../config/logger.js";
import ApiResponse from "../utils/apiResponse.js";
import { generateRagAnswer } from "../services/rag/rag-answer.service.js";

export const chatWithAI = asyncHandler(async (req, res) => {
  const {
    prompt,
    chatId,
    mode,
    notesContent,
  } = req.validatedData;

  const userId = req.user._id;

  let chat = null;

  // Continue existing chat
  if (chatId) {
    chat = await getSingleChat(chatId, userId);
  }

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

  logger.info(
    `Generating AI response | User: ${userId} | Chat: ${chat?._id || "new"} | Mode: ${mode || "global"}`
  );

  // Generate AI response BEFORE creating a new chat
  const history = chat ? chat.messages : [];

  const { text, totalTokens } = await generateAIResponse(
    finalPrompt,
    history
  );

  // Create new chat only after AI response succeeds
  if (!chat) {
    chat = await createChat(userId, {
      title: prompt.slice(0, 50),
      messages: [
        { role: "user", content: prompt },
        { role: "assistant", content: text },
      ],
      model: "gemini",
      totalTokens,
    });
  } else {
    // Existing chat → append messages
    chat.messages.push({ role: "user", content: prompt });
chat.messages.push({ role: "assistant", content: text });

chat.totalTokens += totalTokens;

await chat.save();
  }

  logger.info(
    `AI response generated successfully | User: ${userId} | Chat: ${chat._id}`
  );

  return res.status(200).json(
    new ApiResponse(
      true,
      "AI response generated successfully.",
      {
        chatId: chat._id,
        reply: text,
      }
    )
  );
});

export const getChatsController = asyncHandler(
  async (req, res) => {
    const chats = await getAllChats(req.user._id);

    return res.status(200).json(
      new ApiResponse(
        true,
        "Chats fetched successfully.",
        chats
      )
    );
  }
);

export const getSingleChatController = asyncHandler(
  async (req, res) => {
    const chat = await getSingleChat(
      req.params.id,
      req.user._id
    );

    return res.status(200).json(
      new ApiResponse(
        true,
        "Chat fetched successfully.",
        chat
      )
    );
  }
);

export const updateChatController = asyncHandler(
  async (req, res) => {
    const chat = await updateChat(
      req.params.id,
      req.user._id,
      req.validatedData
    );

    return res.status(200).json(
      new ApiResponse(
        true,
        "Chat updated successfully.",
        chat
      )
    );
  }
);

export const deleteChatController = asyncHandler(
  async (req, res) => {
    const chat = await deleteChat(
      req.params.id,
      req.user._id
    );

    return res.status(200).json(
      new ApiResponse(
        true,
        "Chat deleted successfully.",
        chat
      )
    );
  }
);

export const chatWithDocument = asyncHandler(async (req, res) => {
  const { prompt, documentId } = req.validatedData;
  const userId = req.user._id;

  logger.info(
    `Generating RAG response | Document: ${documentId}`
  );

  const result = await generateRagAnswer(
    prompt,
    documentId,
    userId
  );

  logger.info(
    `RAG response generated successfully | Document: ${documentId}`
  );

  return res.status(200).json(
    new ApiResponse(
      true,
      "RAG response generated successfully.",
      {
        reply: result.answer,
        sources: result.sources,
      }
    )
  );
});