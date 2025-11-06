import express from "express";
import path from "path";

const app = express();
const __dirname = path.resolve();

// Serve frontend static files
app.use(express.static(path.join(__dirname, "frontend", "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

// API routes
// app.use("/api", apiRoutes);

app.listen(process.env.PORT || 10000, () => {
  console.log("Server running...");
});

