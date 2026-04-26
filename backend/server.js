import express from "express";
import cors from "cors";

import { assessRouter } from "./routes/assess.js";
import { verdictRouter } from "./routes/verdict.js";  // ✅ NEW

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/assess", assessRouter);
app.use("/api/verdict", verdictRouter);  // ✅ NEW

app.get("/", (req, res) => {
  res.send("Server running...");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});