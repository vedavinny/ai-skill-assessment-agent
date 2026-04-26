import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateFinalVerdict(scores, jobDescription) {
  const summary = scores
    .map(s => `${s.skill}: ${s.score} (${s.level})`)
    .join("\n");

  // 🔥 deterministic readiness
  const avgScore =
    scores.reduce((sum, s) => sum + (s.score || 0), 0) / scores.length;
  const readiness = Math.max(20, Math.round(avgScore));

  const prompt = `
You are an AI hiring expert.

Job Description:
${jobDescription}

Scores:
${summary}

TASK:
1. Provide a concise hiring verdict
2. Generate a PERSONALISED LEARNING PLAN

RULES:
- Focus ONLY on LOW scoring skills (score < 40)
- For each recommendation:
  → Mention WHAT to learn
  → Mention HOW (tool/resource/practice)
  → Mention TIME estimate
- Be specific and actionable

GOOD example:
"Improve [Skill] → learn [specific concept] (2–3 days) using relevant tools/resources"

Return ONLY JSON:
{
  "verdict": "short text",
  "recommendations": ["...", "...", "..."]
}
`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }]
    });

    let text = response.choices[0].message.content;
    text = text.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(text);

    return {
      readiness,
      verdict: parsed.verdict || "Partial readiness",
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : []
    };
  } catch (err) {
    console.error("Verdict Error:", err.message);

    return {
      readiness,
      verdict: "Candidate shows partial readiness but needs improvement.",
      recommendations: [
        "Focus on weakest skills and practice real-world tasks (2–3 days)",
        "Use role-specific tools/resources to build hands-on experience",
        "Align learning with job requirements and repeat assessment"
      ]
    };
  }
}