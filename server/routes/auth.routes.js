import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import {
  validateRegister,
  validateLogin,
} from "../validators/auth.validator.js";
import {
    authenticate,
    authorize,
  } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", validateRegister, register);

router.post("/login", validateLogin, login);

export default router;

router.get("/me", authenticate, (req, res) => {
    res.json({
      success: true,
      user: req.user,
    });
  });

  router.get(
    "/admin",
    authenticate,
    authorize("admin"),
    (req, res) => {
      res.json({
        success: true,
        message: "Welcome Admin!",
      });
    }
  );