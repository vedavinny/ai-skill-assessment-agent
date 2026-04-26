import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function generateLearningPlan(scores, jobTitle, resumeText, jobDescription) {

  const weakSkills = scores
    .filter(s => s.score < 70)
    .map(s => `${s.skill} (${s.score})`)
    .join(", ");

  const summary = scores
    .map(s => `- ${s.skill}: ${s.score}/100 (${s.level}) | Gaps: ${s.gaps.join(", ")}`)
    .join("\n");

  const prompt = `
You are an expert AI career coach.

Target Role: ${jobTitle}

Job Description:
${jobDescription}

Resume:
${resumeText}

Skill Evaluation:
${summary}

Weak Skills:
${weakSkills}

TASK:
Create a REALISTIC, personalized learning plan.

IMPORTANT RULES:
- Focus ONLY on weak skills
- Suggest ADJACENT SKILLS (skills closely related to weak areas)
- Make it PRACTICAL (projects, hands-on work)
- Include TIME ESTIMATES
- Keep it achievable for a 2–4 year experience candidate

Return ONLY JSON:
{
  "overall_readiness": number (0-100),
  "verdict": "Not Ready | Needs Improvement | Job Ready",
  "priority_skills": ["skill1", "skill2"],
  "learning_plan": [
    {
      "skill": "skill name",
      "priority": "High|Medium|Low",
      "why_needed": "based on JD",
      "time_estimate": "X weeks",
      "adjacent_skills": ["related skill"],
      "tasks": [
        "task 1",
        "task 2"
      ],
      "resources": [
        {
          "title": "resource name",
          "type": "course/video/docs",
          "url": "https://..."
        }
      ]
    }
  ]
}
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }]
  });

  let text = response.choices[0].message.content;

  text = text.replace(/```json|```/g, "").trim();

  return JSON.parse(text);
}