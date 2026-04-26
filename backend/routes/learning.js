import express from "express";
import { generateShadowResume } from "../agents/shadowResumeAgent.js";
import { generateLearningPlan } from "../agents/learningPlanAgent.js";

export const learningRouter = express.Router();

learningRouter.post("/generate", async (req, res) => {
  try {
    const { scores, resumeText, jobDescription } = req.body;

    const plan = await generateLearningPlan(
        scores,
        "Role",
        resumeText,
        jobDescription
    );

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
learningRouter.post("/shadow", async (req, res) => {
  try {
    const { scores } = req.body;

    const shadow = await generateShadowResume(scores, "Role");

    res.json(shadow);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});