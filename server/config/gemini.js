import { GoogleGenerativeAI } from "@google/generative-ai";
import env from "./env.js";

if (!process.env.API_KEY) {
  console.error("❌ API_KEY not found in .env file!");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(env.API_KEY);

export default genAI;