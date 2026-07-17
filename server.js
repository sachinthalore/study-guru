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
// ---------------- Chat Route (Updated for Streaming) ----------------
app.post("/api/chat", async (req, res) => {
  console.log("POST request received for streaming");

  try {
    const validation = promptSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ error: validation.error });
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

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // 1. Headers set karein taaki browser ko pata chale ki data stream ho raha hai
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    // 2. generateContent ki jagah generateContentStream use karein
    const result = await model.generateContentStream(finalPrompt);

    // 3. Jaise-jaise AI text sochega, waise-waise hum frontend ko bhejenge
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText); 
    }

    // 4. Jab pura answer khatam ho jaye, toh connection close kar dein
    res.end();

  } catch (err) {
    console.error("❌ SERVER ERROR in Gemini API:", err);
    // Error aane par connection close karna zaroori hai
    if (!res.headersSent) {
      res.status(500).json({ error: "Error generating response from AI." });
    } else {
      res.end("\n\n[Error: Connection interrupted]");
    }
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
