import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateUpdateProfile } from "../validators/user.validator.js";
import {
  getMe,
  updateMe,
  deleteMe,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/me", authenticate, getMe);

router.patch(
  "/me",
  authenticate,
  validateUpdateProfile,
  updateMe
);

router.delete(
  "/me",
  authenticate,
  deleteMe
);

export default router;