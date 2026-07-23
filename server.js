import "dotenv/config"; // Isko sabse upar rakhna best practice hai
import app from "./server/app.js";

console.log("SERVER FILE LOADED");

const PORT = process.env.PORT || 3000;

// ---------------- Health Route ----------------
app.get("/", (req, res) => {
  console.log("GET / route hit");
  res.send("Backend Working Perfectly!");
});

// ---------------- Start Server ----------------
app.listen(PORT, () => {
  console.log(`✅ Server is successfully running on http://localhost:${PORT}`);
});