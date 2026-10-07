import { Router } from "express";
import { refreshToken } from "../controllers/token.controller.js";
import { refreshLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();

router.post(
    "/refresh",
    refreshLimiter,
    refreshToken
  );

export default router;