import "dotenv/config"; // Isko sabse upar rakhna best practice hai
import app from "./server/app.js";

import logger from "./server/config/logger.js";
import env from "./server/config/env.js";
logger.info("SERVER FILE LOADED");

const PORT = env.PORT;

// ---------------- Health Route ----------------
app.get("/", (req, res) => {
  console.log("GET / route hit");
  res.send("Backend Working Perfectly!");
});

// ---------------- Start Server ----------------
app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});