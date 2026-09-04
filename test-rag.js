import connectDB from "./server/config/db.js";
import mongoose from "mongoose";
import "dotenv/config";

import { generateRagAnswer } from "./server/services/rag/rag-answer.service.js";

const documentId = process.env.TEST_DOCUMENT_ID;
const userId = process.env.TEST_USER_ID;

if (!documentId || !userId) {
  throw new Error(
    "TEST_DOCUMENT_ID and TEST_USER_ID must be set in .env"
  );
}

const query =
  "What is the difference between descriptive statistics and inferential statistics?";

try {
  await connectDB();

  const result = await generateRagAnswer(
    query,
    documentId,
    userId
  );

  console.log("\n==============================");
  console.log("RAG ANSWER");
  console.log("==============================\n");

  console.log(result.answer);

  console.log("\n==============================");
  console.log("SOURCES");
  console.log("==============================\n");

  console.log(result.sources);
} catch (error) {
  console.error("\nRAG Test Error:", error);
} finally {
  await mongoose.connection.close();
}