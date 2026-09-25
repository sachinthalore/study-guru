import { GoogleGenAI } from "@google/genai";
import env from "./env.js";

const genAI = new GoogleGenAI({
  apiKey: env.API_KEY,
});

export default genAI;