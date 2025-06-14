import axios from "axios";

const API_URL =
  "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";
const API_KEY = import.meta.env.VITE_HF_API_KEY;


const headers = {
  Authorization: `Bearer ${import.meta.env.VITE_HF_API_KEY}`,
  "Content-Type": "application/json",
};


export async function generateSummary(text) {
  try {
    const response = await axios.post(API_URL, { inputs: text }, { headers });
    return response.data[0]?.summary_text || "No summary generated.";
  } catch (error) {
    console.error(
      "Error generating summary:",
      error.response?.data || error.message
    );
    throw new Error("Failed to summarize text.");
  }
}

// Helper to chunk text into smaller parts (~500 words each)
function chunkText(text, maxWords = 500) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(" "));
  }
  return chunks;
}

// Long text summarization using chunking
export async function generateLongSummary(text) {
  const chunks = chunkText(text, 500);
  const chunkSummaries = [];

  for (const chunk of chunks) {
    const summary = await generateSummary(chunk);
    chunkSummaries.push(summary);
  }

  const combinedSummary = chunkSummaries.join(" ");

  if (chunkSummaries.length > 1) {
    const finalSummary = await generateSummary(combinedSummary);
    return finalSummary;
  } else {
    return chunkSummaries[0];
  }
}
export async function generateMCQs(text) {
  const sentences = text
    .split(". ")
    .filter((s) => s.length > 50)
    .slice(0, 3);
  const mcqs = [];

  // Extended blacklist of common small words that shouldn't be answers
  const blacklist = new Set([
    "the",
    "and",
    "with",
    "that",
    "this",
    "these",
    "such",
    "for",
    "from",
    "like",
    "is",
    "are",
    "was",
    "were",
    "be",
    "to",
    "into",
    "on",
    "in",
    "at",
    "by",
    "as",
    "of",
    "a",
    "an",
    "but",
    "or",
    "if",
    "then",
    "so",
  ]);

  for (const sentence of sentences) {
    const words = sentence.split(" ");

    // Find a good answer word index, skipping blacklist words
    let answerIndex = Math.floor(words.length / 2);
    let attempts = 0;
    while (
      answerIndex < words.length &&
      (blacklist.has(words[answerIndex].toLowerCase()) ||
        words[answerIndex].length <= 3)
    ) {
      answerIndex++;
      attempts++;
      if (attempts > 10) break; // prevent infinite loop
    }
    if (answerIndex >= words.length) {
      // fallback: pick first non-blacklist longer word
      answerIndex = words.findIndex(
        (w) => !blacklist.has(w.toLowerCase()) && w.length > 3
      );
      if (answerIndex === -1) answerIndex = Math.floor(words.length / 2);
    }

    let answer = words[answerIndex].replace(/[.,;:"()]/g, "");

    // Generate distractors — get nearby words or fallback meaningful words
    const distractors = new Set();

    // Try neighboring words if valid and not blacklisted
    if (answerIndex > 0) {
      const prevWord = words[answerIndex - 1]
        .replace(/[.,;:"()]/g, "")
        .toLowerCase();
      if (
        !blacklist.has(prevWord) &&
        prevWord !== answer.toLowerCase() &&
        prevWord.length > 3
      )
        distractors.add(prevWord);
    }
    if (answerIndex < words.length - 1) {
      const nextWord = words[answerIndex + 1]
        .replace(/[.,;:"()]/g, "")
        .toLowerCase();
      if (
        !blacklist.has(nextWord) &&
        nextWord !== answer.toLowerCase() &&
        nextWord.length > 3
      )
        distractors.add(nextWord);
    }

    // Add some generic distractors if needed
    const genericDistractors = [
      "different",
      "various",
      "several",
      "another",
      "some",
    ];
    for (const gd of genericDistractors) {
      if (distractors.size >= 3) break;
      if (gd !== answer.toLowerCase()) distractors.add(gd);
    }

    // Remove the actual answer if present
    distractors.delete(answer.toLowerCase());

    // Fill up distractors if less than 3 by adding random options
    while (distractors.size < 3) {
      const randOpt = "option" + Math.random().toString(36).slice(2, 5);
      if (randOpt !== answer.toLowerCase()) distractors.add(randOpt);
    }

    // Prepare options and shuffle
    const options = Array.from(distractors);

    // Make sure answer is included exactly once (original case)
    if (!options.includes(answer)) {
      options.push(answer);
    }

    // Fisher-Yates shuffle
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    // Create question by replacing answer word with blank (case-insensitive)
    const question = sentence.replace(
      new RegExp(`\\b${answer}\\b`, "i"),
      "_____"
    );

    mcqs.push({
      question: question.trim(),
      options,
      answer,
    });
  }

  return mcqs;
}

// FIB generator using different sentences than MCQs
export async function generateFIBs(text) {
  const sentences = text
    .split(". ")
    .filter((s) => s.length > 40)
    .slice(3, 6); // different slice than MCQs

  return sentences.map((sentence) => {
    const words = sentence.split(" ");
    const midIndex = Math.floor(words.length / 2);
    const answer = words[midIndex];
    const question = sentence.replace(answer, "_____");

    return {
      question,
      answer,
    };
  });
}
