import logger from "../config/logger.js";

export const errorHandler = (err, req, res, next) => {
  // Log complete error for developers
  logger.error(err.stack || err.message);

  const statusCode = err.statusCode || 500;

  let message = err.message || "Internal Server Error";

  // Hide internal server errors from users
  if (statusCode === 500) {
    message = "Something went wrong. Please try again later.";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};