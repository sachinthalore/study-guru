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
import { generateRagAnswerFromDocuments } from "../services/rag/rag-answer.service.js";


export const chatWithAI = asyncHandler(async (req, res) => {
  const { prompt, chatId, mode = "global", subject } =
    req.validatedData;

  const userId = req.user._id;

  let chat = null;

  if (chatId) {
    chat = await getSingleChat(chatId, userId);
  }

  let text;
  let totalTokens = 0;

  if (mode === "all" || mode === "subject") {
    if (mode === "subject" && !subject) {
      return res.status(400).json({
        success: false,
        message: "Please select a subject.",
      });
    }

    const result = await generateRagAnswerFromDocuments(
      prompt,
      userId,
      mode === "subject" ? subject : undefined
    );

    text = result.answer;
  } else {
    const history = chat ? chat.messages : [];

    const result = await generateAIResponse(prompt, history);

    text = result.text;
    totalTokens = result.totalTokens;
  }

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
    chat.messages.push({ role: "user", content: prompt });
    chat.messages.push({ role: "assistant", content: text });
    chat.totalTokens += totalTokens;
    await chat.save();
  }

  logger.info(
    `Chat response generated | User: ${userId} | Chat: ${chat._id} | Mode: ${mode}`
  );

  return res.status(200).json(
    new ApiResponse(true, "AI response generated successfully.", {
      chatId: chat._id,
      reply: text,
    })
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