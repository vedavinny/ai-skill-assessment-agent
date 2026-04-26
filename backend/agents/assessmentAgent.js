import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});


// 🔹 Generate Question
export async function generateQuestion(
  skill,
  questionNumber,
  conversationHistory,
  jobTitle,
  allSkills = []
) {
  const otherSkills = allSkills.filter(s => s !== skill);

  const systemPrompt = `
You are an expert interviewer.

STRICT RULE:
You are ONLY assessing "${skill}".
Do NOT ask about: ${otherSkills.join(", ")}

Ask ONE focused question.

Difficulty:
- Q1 → basic
- Q2 → intermediate

Return ONLY the question text.
`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        {
          role: "user",
          content: `Ask question ${questionNumber} for ${skill}`
        }
      ]
    });

    return response.choices[0].message.content;

  } catch (err) {
    console.error("Question Error:", err.message);
    return "Explain your understanding of this concept.";
  }
}


// 🔹 Score Skill
export async function scoreSkillAssessment(
  skill,
  history,
  jobDescription,
  resumeText
) {

  const conversation = history.map(h => h.content).join("\n");

  const prompt = `
You are a fair and strict evaluator.

Be consistent in scoring. Do not vary randomly.

Skill: ${skill}

Conversation:
${conversation}

RULES:

- PRIMARY SIGNAL = answers

- If answers are completely random or irrelevant:
  → score 0–20

- If answers show partial understanding but lack depth:
  → score 20–40

- If answers are mostly correct but missing some details:
  → score 40–70

- If answers are clear, correct, and well explained:
  → score 70–90

- If answers are excellent with depth and examples:
  → score 90–100

- Resume can ONLY cap score, NOT increase it

- DO NOT mark "Unable to evaluate" if answer has meaningful content

- Use "Unable to evaluate" ONLY if:
  → answer is empty OR completely irrelevant

Return ONLY JSON:
{
  "skill": "${skill}",
  "score": number,
  "level": "Beginner | Intermediate | Advanced | Expert",
  "strengths": ["..."],
  "gaps": ["..."],
  "summary": "short explanation"
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
      skill,
      score: parsed.score || 20,
      level: parsed.level || "Beginner",
      strengths: parsed.strengths || [],
      gaps: parsed.gaps || [],
      summary: parsed.summary || "Unable to evaluate."
    };

  } catch (err) {
    console.error("Scoring Error:", err.message);

    return {
      skill,
      score: 20,
      level: "Beginner",
      strengths: [],
      gaps: ["Invalid or insufficient answers"],
      summary: "Unable to evaluate due to poor responses."
    };
  }
}