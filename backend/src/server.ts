import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { evaluateRouter } from "./routes/evaluate.js";
import { interviewRouter } from "./routes/interview.js";

// Load environment variables
dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

// --- Middleware Configuration ---
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
  })
);

// Increased limit to 1mb to handle AI-related data payloads
app.use(express.json({ limit: "1mb" }));

// --- Basic Routes ---
app.get("/", (_req, res) => {
  res.send("Backend is running successfully!");
});

// Health check for Render's zero-downtime deployments
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// --- API Routes ---
app.use("/api/interview", interviewRouter);
app.use("/api/evaluate", evaluateRouter);

// --- Server Activation ---
// We listen on "0.0.0.0" to allow Render's load balancer to connect
app.listen(port, "0.0.0.0", () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on port ${port}`);
});