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
// Naya change: notesContent ko bhi validation mein add kar diya gaya hai
const promptSchema = z.object({
  prompt: z.string().min(1).max(5000),
  mode: z.string(),
  notesContent: z.string().optional(), 
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

// ---------------- Chat Route (Streaming Enabled) ----------------
app.post("/api/chat", async (req, res) => {
  console.log("POST request received for streaming");
  
  try {
    const validation = promptSchema.safeParse(req.body);

    if (!validation.success) {
      console.log("Validation Failed:", validation.error);
      return res.status(400).json({
        error: validation.error,
      });
    }

    const { prompt, mode, notesContent } = validation.data;
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

    // Model name set to standard 1.5 flash
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
    });

    console.log("Sending request to Gemini API for Streaming...");
    
    // 1. Headers set karein taaki stream chalu ho sake
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    // 2. Stream generation start karein
    const result = await model.generateContentStream(finalPrompt);

    // 3. Jaise-jaise AI sochega, chunks mein data frontend par jayega
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText); 
    }

    // 4. Response poora hone par connection close karein
    res.end();
    console.log("Stream successfully completed!");

  } catch (err) {
    console.error("❌ SERVER ERROR in Gemini API:");
    console.error(err);
    
    // Error handling
    if (!res.headersSent) {
      res.status(500).json({
        error: "Error generating response from AI. Please check terminal for details.",
      });
    } else {
      res.end("\n\n[Error: Connection interrupted]");
    }
  }
});

// ---------------- Start Server / Vercel Export ----------------
// Local testing ke liye
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Server is successfully running on http://localhost:${PORT}`);
  });
}

// Vercel deployment ke liye
export default app;
