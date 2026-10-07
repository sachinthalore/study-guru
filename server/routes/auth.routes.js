import { Router } from "express";
import {
  register,
  login,
  logout,
  forgotPasswordController,
  resetPasswordController,
  sendVerificationEmailController,
  verifyEmailController,
  changePasswordController,
} from "../controllers/auth.controller.js";

import { validateChangePassword } from "../validators/changePassword.validator.js";

import { validateResetPassword } from "../validators/resetPassword.validator.js";
import { validateForgotPassword } from "../validators/password.validator.js";
import {
  validateRegister,
  validateLogin,
} from "../validators/auth.validator.js";
import {
    authenticate,
    authorize,
  } from "../middleware/auth.middleware.js";

  import {
    authLimiter,
    passwordLimiter,
  } from "../middleware/rateLimit.middleware.js";
  
const router = Router();

router.post(
  "/register",
  authLimiter,
  validateRegister,
  register
);

router.post(
  "/login",
  authLimiter,
  validateLogin,
  login
);

router.post(
  "/logout",
  authenticate,
  logout
);

router.post(
  "/reset-password/:token",
  passwordLimiter,
  validateResetPassword,
  resetPasswordController
);

router.post(
  "/forgot-password",
  passwordLimiter,
  validateForgotPassword,
  forgotPasswordController
); 

router.post(
  "/send-verification",
  authenticate,
  passwordLimiter,
  sendVerificationEmailController
);

router.get(
  "/verify-email/:token",
  passwordLimiter,
  verifyEmailController
);

router.patch(
  "/change-password",
  authenticate,
  validateChangePassword,
  changePasswordController
);


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

  export default router;