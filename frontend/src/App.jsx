import { useState } from "react";
import Results from "./Results.jsx";

function App() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");

  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState("");
  const [skill, setSkill] = useState("");
  const [answer, setAnswer] = useState("");

  const [done, setDone] = useState(false);
  const [scores, setScores] = useState([]);
  const [sessionData, setSessionData] = useState(null);

  const startAssessment = async () => {
    const res = await fetch("http://localhost:5000/api/assess/init", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        jobDescription,
        resumeText
      })
    });

    const data = await res.json();

    setSessionId(data.sessionId);
    setQuestion(data.question);
    setSkill(data.skill);

    setSessionData({
      ...data,
      jobDescription: jobDescription,   // ✅ IMPORTANT
      questionNumber: 1
    });

    setDone(false);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;

    const res = await fetch("http://localhost:5000/api/assess/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sessionId,
        answer
      })
    });

    const data = await res.json();

    if (data.done) {
      setDone(true);
      setScores(data.scores);
    } else {
      setQuestion(data.question);
      setSkill(data.skill);

      setSessionData(prev => ({
        ...prev,
        questionNumber: data.questionNumber
      }));
    }

    setAnswer("");
  };

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>🤖 AI Skill Assessment</h1>

      {!sessionId && (
        <div>
          <textarea
            placeholder="Paste Job Description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={5}
            style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
          />

          <textarea
            placeholder="Paste Resume"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={5}
            style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
          />

          <button onClick={startAssessment}>Start Assessment</button>
        </div>
      )}

      {sessionId && !done && (
        <div>
          <h3>🧠 Skill: {skill}</h3>

          <div style={{
            background: "#f5f5f5",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "10px"
          }}>
            <p>
              <strong>Q{sessionData?.questionNumber || 1}:</strong>{" "}
              {question.replace(/^Q\d+:\s*/, "")}
            </p>
          </div>

          <textarea
            placeholder="Your answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={4}
            style={{ width: "100%", marginBottom: "10px" }}
          />

          <button onClick={submitAnswer}>Submit</button>
        </div>
      )}

      {done && (
        <Results
          scores={scores}
          sessionData={sessionData}
        />
      )}
    </div>
  );
}

export default App;