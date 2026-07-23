import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import chatRoutes from "./routes/chat.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// ---------------- Middleware ----------------

app.use(express.json());
app.use(errorHandler);


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
app.use(errorHandler);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(errorHandler);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);
app.use(errorHandler);

app.use("/api", chatRoutes);
app.use(errorHandler);

export default app;