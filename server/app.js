import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import chatRoutes from "./routes/v1/chat.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import morgan from "morgan";
import logger from "./config/logger.js";
import compression from "compression";
import env from "./config/env.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import tokenRoutes from "./routes/token.routes.js";

const app = express();

// ---------------- Middleware ----------------

app.use(express.json());
app.use(cookieParser());
app.use(compression());
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use(cors({
  origin: env.CLIENT_ORIGINS,
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(
  helmet({
    crossOriginResourcePolicy: false,

    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        scriptSrc: [
          "'self'",
          "'unsafe-inline'"
        ],

        styleSrc: [
          "'self'",
          "'unsafe-inline'"
        ],

        imgSrc: [
          "'self'",
          "data:",
          "blob:"
        ],

        connectSrc: [
          "'self'",
          "http://localhost:3000",
          "https://study-guru-pi.vercel.app"
        ],

        objectSrc: ["'none'"],

        upgradeInsecureRequests: [],
      },
    },

    referrerPolicy: {
      policy: "strict-origin-when-cross-origin",
    },
  })
);

app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW,
max: env.RATE_LIMIT_MAX,
  })
);

app.use("/health", healthRoutes); 



app.use("/api/v1", chatRoutes);

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/token", tokenRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

export default app;