import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.API_KEY) {
  console.error("❌ API_KEY not found in .env file!");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

export default genAI;