import rateLimit from "express-rate-limit";

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });
};

// Authentication-sensitive endpoints
export const authLimiter = createRateLimiter(
  15 * 60 * 1000,
  10,
  "Too many authentication attempts. Please try again later."
);

// Password reset / verification email endpoints
export const passwordLimiter = createRateLimiter(
  15 * 60 * 1000,
  5,
  "Too many password or verification requests. Please try again later."
);

// Token refresh
export const refreshLimiter = createRateLimiter(
  15 * 60 * 1000,
  20,
  "Too many token refresh requests. Please try again later."
);

// AI / Gemini endpoints
export const aiLimiter = createRateLimiter(
  15 * 60 * 1000,
  20,
  "Too many AI requests. Please try again later."
);

// Admin endpoints
export const adminLimiter = createRateLimiter(
  15 * 60 * 1000,
  30,
  "Too many admin requests. Please try again later."
);