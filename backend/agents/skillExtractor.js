import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function extractSkillsFromJD(jobDescription) {
  const prompt = `
You are an expert recruiter.

Extract the TOP 5 most important skills required for this job.

RULES:
- Skills must be short (1–3 words)
- No sentences
- No explanations
- Only include skills explicitly or strongly implied

Job Description:
${jobDescription}

Return ONLY JSON:
{
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"]
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
    return Array.isArray(parsed.skills) && parsed.skills.length
      ? parsed.skills.slice(0, 5)
      : ["Communication", "Problem Solving", "Domain Knowledge", "Execution", "Collaboration"];
  } catch (err) {
    console.error("Skill Extraction Error:", err.message);
    return ["Communication", "Problem Solving", "Domain Knowledge", "Execution", "Collaboration"];
  }
}