import "dotenv/config"; // Isko sabse upar rakhna best practice hai
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

console.log("SERVER FILE LOADED");
const app = express();
const PORT = process.env.PORT || 3000;

// ---------------- Middleware ----------------
app.use(express.json());
app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://localhost:3000",
    "https://study-guru-pi.vercel.app"
  ],
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// ---------------- Validation ----------------
const promptSchema = z.object({
  prompt: z.string().min(1).max(5000),
  mode: z.string(),
});

// ---------------- Gemini Setup ----------------
if (!process.env.API_KEY) {
  console.error("❌ API_KEY not found in .env file!");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// ---------------- Health Route ----------------
app.get("/", (req, res) => {
  console.log("GET / route hit");
  res.send("Backend Working Perfectly!");
});

// ---------------- Chat Route ----------------
app.post("/api/chat", async (req, res) => {
  console.log("POST request received");
  console.log("Request Body:", req.body);

  try {
    const validation = promptSchema.safeParse(req.body);

    if (!validation.success) {
      console.log("Validation Failed:", validation.error);
      return res.status(400).json({
        error: validation.error,
      });
    }

    const { prompt, mode } = validation.data;
    let finalPrompt = prompt;

    if (mode === "notes" && req.body.notesContent) {
      finalPrompt = `
You are an AI Study Assistant.
Use ONLY the notes below.
If the answer is not found, reply exactly:
"I couldn't find the answer in your notes."

Notes:
${req.body.notesContent}

Question:
${prompt}
`;
    }

    // Model name set to standard 1.5 flash
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
    });

    console.log("Sending request to Gemini API...");
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();

    console.log("Reply received from Gemini!");
    res.json({
      message: text,
    });

  } catch (err) {
    console.error("❌ SERVER ERROR in Gemini API:");
    console.error(err);
    res.status(500).json({
      error: "Error generating response from AI. Please check terminal for details.",
    });
  }
});

// ---------------- Start Server ----------------
// Local testing ke liye aap isko uncomment kar sakte hain, par Vercel ke liye iski zaroorat nahi hai
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Server is successfully running on http://localhost:${PORT}`);
  });
}

// Vercel serverless deployment ke liye Express app ko export karna zaroori hai
export default app;
