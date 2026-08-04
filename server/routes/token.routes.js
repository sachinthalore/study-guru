import { Router } from "express";
import { refreshToken } from "../controllers/token.controller.js";

const router = Router();

router.post("/refresh", refreshToken);

export default router;