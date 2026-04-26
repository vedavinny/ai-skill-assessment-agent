import express from "express";
import { generateFinalVerdict } from "../agents/verdictAgent.js";

export const verdictRouter = express.Router();

verdictRouter.post("/final", async (req, res) => {
  try {
    const { scores, jobDescription } = req.body;

    // ✅ Only require scores (not jobDescription)
    if (!scores) {
      return res.status(400).json({
        error: "Missing scores"
      });
    }

    // ✅ fallback if JD missing
    const result = await generateFinalVerdict(
      scores,
      jobDescription || "General Role"
    );

    res.json(result);

  } catch (err) {
    console.error("Verdict Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});