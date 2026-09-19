import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getUserAnalyticsController } from "../controllers/analytics.controller.js";

const router = Router();

router.get(
  "/",
  authenticate,
  getUserAnalyticsController
);

export default router;