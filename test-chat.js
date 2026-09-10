import "dotenv/config";
import connectDB from "./server/config/db.js";
import mongoose from "mongoose";
import Chat from "./server/models/chat.model.js";

const userId = process.env.TEST_USER_ID;

if (!userId) {
  throw new Error("TEST_USER_ID must be set in .env");
}

let chatId;

try {
  await connectDB();

  console.log("\n==============================");
  console.log("1. CREATE CHAT");
  console.log("==============================\n");

  const createdChat = await Chat.create({
    title: "Test Chat",
    user: userId,
    messages: [
      {
        role: "user",
        content: "Explain machine learning.",
      },
      {
        role: "assistant",
        content: "Machine learning allows computers to learn from data.",
      },
    ],
    model: "gemini",
  });

  chatId = createdChat._id;

  console.log(createdChat);

  console.log("\n==============================");
  console.log("2. GET ALL CHATS");
  console.log("==============================\n");

  const chats = await Chat.find({
    user: userId,
  }).sort({
    updatedAt: -1,
  });

  console.log(chats);

  console.log("\n==============================");
  console.log("3. GET SINGLE CHAT");
  console.log("==============================\n");

  const chat = await Chat.findOne({
    _id: chatId,
    user: userId,
  });

  console.log(chat);

  console.log("\n==============================");
  console.log("4. UPDATE CHAT");
  console.log("==============================\n");

  const updatedChat = await Chat.findOneAndUpdate(
    {
      _id: chatId,
      user: userId,
    },
    {
      title: "Updated Test Chat",
      isPinned: true,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  console.log(updatedChat);

  console.log("\n==============================");
  console.log("5. DELETE CHAT");
  console.log("==============================\n");

  const deletedChat = await Chat.findOneAndDelete({
    _id: chatId,
    user: userId,
  });

  console.log(deletedChat);

  console.log("\n==============================");
  console.log("6. VERIFY DELETE");
  console.log("==============================\n");

  const deletedCheck = await Chat.findOne({
    _id: chatId,
    user: userId,
  });

  console.log(
    deletedCheck === null
      ? "Chat successfully deleted."
      : "Chat still exists."
  );

} catch (error) {
  console.error("\nChat Test Error:", error);
} finally {
  await mongoose.connection.close();
}