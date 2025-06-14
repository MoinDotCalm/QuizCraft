import React, { useState, useEffect } from "react";

export default function QuizGenerator({ mcqs, fibs }) {
  const [fibAnswers, setFibAnswers] = useState([]);
  const [mcqAnswers, setMcqAnswers] = useState([]);

  // Reset answers when questions change
  useEffect(() => {
    setFibAnswers(Array(fibs.length).fill(""));
  }, [fibs]);

  useEffect(() => {
    setMcqAnswers(Array(mcqs.length).fill(""));
  }, [mcqs]);

  const handleFibChange = (index, value) => {
    const updated = [...fibAnswers];
    updated[index] = value;
    setFibAnswers(updated);
  };

  const handleMcqChange = (index, selectedOption) => {
    const updated = [...mcqAnswers];
    updated[index] = selectedOption;
    setMcqAnswers(updated);
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>MCQs</h2>
      {mcqs.length === 0 && <p>No questions generated yet.</p>}
      {mcqs.map((q, i) => (
        <div key={i} style={{ marginBottom: "15px" }}>
          <strong>
            {i + 1}. {q.question}
          </strong>
          <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
            {q.options.map((opt, j) => (
              <li key={j} style={{ marginBottom: "6px" }}>
                <label>
                  <input
                    type="radio"
                    name={`mcq-${i}`}
                    value={opt}
                    checked={mcqAnswers[i] === opt}
                    onChange={() => handleMcqChange(i, opt)}
                    style={{ marginRight: "8px" }}
                  />
                  {opt}
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <h2>Fill in the Blanks</h2>
      {fibs.length === 0 && <p>No blanks generated yet.</p>}
      {fibs.map((fib, i) => (
        <div key={i} style={{ marginBottom: "15px" }}>
          <p>
            <strong>{i + 1}.</strong>{" "}
            {fib.question.replace(fib.answer, "_____")}
          </p>

          <input
            type="text"
            placeholder="Your answer"
            value={fibAnswers[i] || ""}
            onChange={(e) => handleFibChange(i, e.target.value)}
            style={{
              width: "60%",
              padding: "8px 5px 6px 5px",
              fontSize: "14px",
              lineHeight: "20px",
              boxSizing: "border-box",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>
      ))}
    </div>
  );
}
