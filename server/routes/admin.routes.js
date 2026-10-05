import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
    getAllUsers,
    getAdminStats,
    updateUserRole,
  } from "../controllers/admin.controller.js";

import { validateUpdateUserRole } from "../middleware/validate.middleware.js";
import { updateUserRoleSchema } from "../validators/admin.validator.js";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/users", getAllUsers);

router.get("/stats", getAdminStats);

router.patch(
    "/users/:userId/role",
    validateUpdateUserRole,
    updateUserRole
  );
  
export default router;