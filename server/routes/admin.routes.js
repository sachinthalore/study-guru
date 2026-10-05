import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { getAllUsers } from "../controllers/admin.controller.js";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/users", getAllUsers);

export default router;