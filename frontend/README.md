# AI Skill Assessment & Personalized Learning Plan Agent

## Overview

This project implements an AI-powered system that evaluates a candidate’s actual proficiency against a given job description through a conversational assessment. Instead of relying solely on resumes, the system dynamically extracts required skills, conducts a structured interview, and generates a score-based evaluation along with targeted learning recommendations.

---

## Features

* Dynamic extraction of required skills from job descriptions
* Conversational assessment (multiple questions per skill)
* Answer-driven scoring to minimize resume bias
* Skill-wise evaluation with concise summaries
* Deterministic readiness score based on aggregated results
* Targeted learning recommendations for low-performing skills

---

## Architecture

```text
Job Description → Skill Extraction → Question Generation
→ Candidate Responses → Skill Scoring → Final Verdict
```

The system uses a modular architecture separating extraction, questioning, scoring, and evaluation into independent components.

---

## Tech Stack

* Frontend: React (Vite)
* Backend: Node.js, Express
* LLM Integration: Groq (llama-3.3-70b-versatile)

---

## Project Structure

```text
ai-skill-assessment-agent/
│
├── backend/
│   ├── agents/
│   │   ├── assessmentAgent.js
│   │   ├── skillExtractor.js
│   │   └── verdictAgent.js
│   ├── routes/
│   │   ├── assess.js
│   │   └── verdict.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── Results.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-skill-assessment-agent.git
cd ai-skill-assessment-agent
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
GROQ_API_KEY=your_api_key_here
```

Start the backend server:

```bash
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

---

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

---

## Usage

1. Provide a job description
2. Provide candidate resume text
3. Start the assessment
4. Answer the generated questions
5. Review:

   * Skill-wise scores
   * Evaluation summaries
   * Final readiness verdict
   * Learning recommendations

---

## Sample Output

```text
Communication → 85 (Advanced)
HRIS → 25 (Beginner)
Recruitment → 30 (Beginner)

Final Verdict: Partially Ready (~40%)

Recommendations:
- Improve HRIS → learn reporting dashboards (2–3 days) using relevant tools
- Improve Recruitment → practice screening workflows (1 week)
```

---

## Design Considerations

* Scoring is primarily driven by candidate responses rather than resume claims
* Readiness is computed deterministically using average skill scores
* The system is domain-agnostic and adapts to different job descriptions
* Recommendations are generated only for low-scoring skills to maintain relevance

---

## Limitations

* Recommendations are generated heuristically and are not linked to external course providers
* No persistent storage (session data is held in memory)
* No authentication or multi-user support

---

## Future Work

* Integration with curated learning resources and APIs
* Skill weighting based on job description importance
* Persistent storage and user history tracking
* Analytical dashboards for performance insights

---

## Author

Your Name
GitHub: https://github.com/YOUR_USERNAME
