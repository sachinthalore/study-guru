import genAI from "../config/gemini.js";
import logger from "../config/logger.js";
import ApiError from "../utils/apiError.js";
import Chat from "../models/chat.model.js";
import Document from "../models/document.model.js";

export const generateAIResponse = async (prompt, history = []) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
    });

    const chat = model.startChat({
      history: history.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [
          {
            text: message.content,
          },
        ],
      })),
    });
    
    const result = await chat.sendMessage(prompt);

    const response = await result.response;

    return {
      text: response.text(),
      totalTokens: response.usageMetadata?.totalTokenCount || 0,
    };

  } catch (error) {
    logger.error(error.stack || error.message);

    if (error.message?.includes("429")) {
      throw new ApiError(
        429,
        "AI service is temporarily busy. Please try again in a minute."
      );
    }

    if (error.message?.includes("503")) {
      throw new ApiError(
        503,
        "AI service is temporarily unavailable. Please try again later."
      );
    }

    if (error.message?.includes("API_KEY")) {
      throw new ApiError(
        500,
        "AI service configuration error."
      );
    }

    throw new ApiError(
      500,
      "Unable to generate AI response at this time."
    );
  }
};

export const createChat = async (userId, data) => {
  if (data.document) {
    const document = await Document.findOne({
      _id: data.document,
      uploadedBy: userId,
    });

    if (!document) {
      throw new ApiError(404, "Document not found.");
    }
  }

  const chat = await Chat.create({
    ...data,
    user: userId,
  });

  return chat;
};

export const getAllChats = async (userId) => {
  return await Chat.find({
    user: userId,
  })
    .populate("document", "title originalFileName")
    .sort({
      updatedAt: -1,
    });
};

export const getSingleChat = async (chatId, userId) => {
  const chat = await Chat.findOne({
    _id: chatId,
    user: userId,
  }).populate("document", "title originalFileName");

  if (!chat) {
    throw new ApiError(404, "Chat not found.");
  }

  return chat;
};

export const updateChat = async (chatId, userId, data) => {
  if (data.document) {
    const document = await Document.findOne({
      _id: data.document,
      uploadedBy: userId,
    });

    if (!document) {
      throw new ApiError(404, "Document not found.");
    }
  }

  const chat = await Chat.findOneAndUpdate(
    {
      _id: chatId,
      user: userId,
    },
    data,
    {
      returnDocument: "after",
      runValidators: true,
    }
  ).populate("document", "title originalFileName");

  if (!chat) {
    throw new ApiError(404, "Chat not found.");
  }

  return chat;
};

export const deleteChat = async (chatId, userId) => {
  const chat = await Chat.findOneAndDelete({
    _id: chatId,
    user: userId,
  });

  if (!chat) {
    throw new ApiError(404, "Chat not found.");
  }

  return chat;
};