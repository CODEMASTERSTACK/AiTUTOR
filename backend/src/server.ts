import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { evaluateRouter } from "./routes/evaluate.js";
import { interviewRouter } from "./routes/interview.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/interview", interviewRouter);
app.use("/api/evaluate", evaluateRouter);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`);
});
