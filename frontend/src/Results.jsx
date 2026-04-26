import { useEffect, useState } from "react";

// 🎨 Color based on score
function getColor(score) {
  if (score <= 30) return "#ef4444"; // red
  if (score <= 55) return "#f97316"; // orange
  if (score <= 79) return "#7c6af7"; // purple
  return "#10b981"; // green
}

// 📊 Level mapping
function getLevel(score) {
  if (score <= 30) return "Beginner";
  if (score <= 55) return "Intermediate";
  if (score <= 79) return "Advanced";
  return "Expert";
}

// 🧠 Readiness label
function getReadinessLabel(score) {
  if (score < 40) return "Not Ready";
  if (score < 70) return "Partially Ready";
  return "Job Ready";
}

export default function Results({ scores, sessionData }) {
  const [verdict, setVerdict] = useState(null);

  useEffect(() => {
    if (!scores?.length) return;

    fetch("http://localhost:5000/api/verdict/final", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        scores,
        jobDescription: sessionData?.jobDescription || ""
      })
    })
      .then(res => res.json())
      .then(data => {
        setVerdict({
          readiness: data?.readiness || 50,
          verdict: data?.verdict || "",
          recommendations: Array.isArray(data?.recommendations)
            ? data.recommendations
            : []
        });
      })
      .catch(() => {
        setVerdict({
          readiness: 50,
          verdict: "Fallback verdict",
          recommendations: ["Retry"]
        });
      });
  }, [scores]);

  const weakSkills = scores.filter(s => (s.score || 0) < 40);
  const strongSkills = scores.filter(s => (s.score || 0) >= 70);

  const isStrongCandidate = verdict?.readiness >= 70;

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>📊 Assessment Results</h1>

      {/* Skill Cards */}
      {scores.map((s, i) => (
        <div
          key={i}
          style={{
            border: "1px solid #ddd",
            borderLeft: `6px solid ${getColor(s.score)}`,
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "12px"
          }}
        >
          <h3>{s.skill}</h3>

          <p>
            <strong>Score:</strong> {s.score} ({getLevel(s.score)})
          </p>

          {/* 📊 Progress bar */}
          <div
            style={{
              height: "6px",
              background: "#eee",
              borderRadius: "3px",
              marginTop: "6px",
              marginBottom: "10px"
            }}
          >
            <div
              style={{
                width: `${s.score}%`,
                height: "100%",
                background: getColor(s.score),
                borderRadius: "3px"
              }}
            />
          </div>

          <p>{s.summary}</p>
        </div>
      ))}

      {/* Strength vs Weak */}
      <div style={{ marginTop: "20px" }}>
        {strongSkills.length > 0 && (
          <>
            <h3>🟢 Strong Skills</h3>
            <p>{strongSkills.map(s => s.skill).join(", ")}</p>
          </>
        )}

        {weakSkills.length > 0 && (
          <>
            <h3 style={{ marginTop: "10px" }}>🔴 Needs Improvement</h3>
            <p>{weakSkills.map(s => s.skill).join(", ")}</p>
          </>
        )}
      </div>

      {/* Final Verdict */}
      <h2 style={{ marginTop: "30px", textAlign: "center" }}>
        📌 Final Verdict
      </h2>

      {verdict ? (
        <div
          style={{
            background: "#f5f5f5",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "center"
          }}
        >
          {/* 🔥 Big readiness */}
          <div
            style={{
              fontSize: "42px",
              fontWeight: "bold",
              color: getColor(verdict.readiness)
            }}
          >
            {verdict.readiness}%
          </div>

          {/* Label */}
          <div style={{ fontSize: "16px", color: "#555" }}>
            {getReadinessLabel(verdict.readiness)}
          </div>

          {/* Verdict text */}
          <p style={{ fontWeight: "bold", marginTop: "10px" }}>
            {verdict.verdict}
          </p>

          {/* 🎯 Learning Plan / 🚀 Growth Suggestions */}
          {verdict.recommendations.length > 0 && (
            <>
              <h3 style={{ marginTop: "20px" }}>
                {isStrongCandidate
                  ? "🚀 Growth Suggestions"
                  : "🎯 Learning Plan"}
              </h3>

              <ul style={{ textAlign: "left" }}>
                {verdict.recommendations.map((r, i) => (
                  <li key={i} style={{ marginBottom: "6px" }}>
                    {r}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ) : (
        <p style={{ textAlign: "center" }}>Loading verdict...</p>
      )}
    </div>
  );
}