import express from "express";
import {
  generateQuestion,
  scoreSkillAssessment
} from "../agents/assessmentAgent.js";

import { extractSkillsFromJD } from "../agents/skillExtractor.js";

export const assessRouter = express.Router();

let sessions = {};

// INIT
assessRouter.post("/init", async (req, res) => {
  try {
    const { jobDescription, resumeText } = req.body;

    const skills = await extractSkillsFromJD(jobDescription);
    const seen = new Set();
    const uniqueSkills = skills.filter(skill => {
      const key =
        typeof skill === "string"
          ? skill.toLowerCase().trim()
          : skill?.skill?.toLowerCase().trim();

      if (!key || seen.has(key)) return false;

      seen.add(key);
      return true;
    });

    const sessionId = Date.now().toString();

    sessions[sessionId] = {
      jobDescription,
      resumeText,
      skills: uniqueSkills,
      currentSkillIndex: 0,
      questionCount: 1,
      history: [],
      results: []
    };

    const firstSkill = uniqueSkills[0];

    let question;
    try {
      question = await generateQuestion(firstSkill, 1, [], jobDescription, skills);
    } catch {
      question = "Explain your understanding of this skill.";
    }

    res.json({
      sessionId,
      question,
      skill: firstSkill,
      questionNumber: 1,
      jobDescription,
      resumeText
    });

  } catch (err) {
    console.error("INIT ERROR:", err.message);
    res.status(500).json({ error: "Init failed" });
  }
});

// REPLY
assessRouter.post("/reply", async (req, res) => {
  try {
    const { sessionId, answer } = req.body;

    const session = sessions[sessionId];
    if (!session) return res.json({ error: "Invalid session" });

    const skill = session.skills[session.currentSkillIndex];
    session.history.push({ role: "user", content: answer || "" });

    // Ask 2 questions per skill
    if (session.questionCount < 2) {
      session.questionCount++;

      let nextQ;
      try {
        nextQ = await generateQuestion(
          skill,
          session.questionCount,
          session.history,
          session.jobDescription,
          session.skills
        );
      } catch {
        nextQ = "Explain your approach to this skill.";
      }

      return res.json({
        question: nextQ,
        skill,
        questionNumber: session.questionCount
      });
    }

    // Score
    let result;
    try {
      result = await scoreSkillAssessment(
        skill,
        session.history,
        session.jobDescription,
        session.resumeText
      );
    } catch {
      result = {
        skill,
        score: 20,
        level: "Beginner",
        strengths: [],
        gaps: ["Invalid or insufficient answers"],
        summary: "Unable to evaluate due to poor responses."
      };
    }

    session.results.push(result);

    // Move to next skill
    session.currentSkillIndex++;
    session.questionCount = 1;
    session.history = [];

    if (session.currentSkillIndex >= session.skills.length) {
      return res.json({
        done: true,
        scores: session.results
      });
    }

    const nextSkill = session.skills[session.currentSkillIndex];

    let nextQ;
    try {
      nextQ = await generateQuestion(nextSkill, 1, [], session.jobDescription, session.skills);
    } catch {
      nextQ = "Explain this concept.";
    }

    res.json({
      question: nextQ,
      skill: nextSkill,
      questionNumber: 1
    });

  } catch (err) {
    console.error("REPLY ERROR:", err.message);
    res.json({
      question: "Continue explaining your approach.",
      skill: "General",
      questionNumber: 1
    });
  }
});