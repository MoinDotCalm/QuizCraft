import axios from "axios";

// const API_URL = "https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6";
const API_URL =
  "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";

const headers = {
  Authorization: `Bearer ${import.meta.env.VITE_HF_API_KEY}`, // Secure API key usage
  "Content-Type": "application/json",
};

export const summarizeText = async (text) => {
  try {
    const response = await axios.post(API_URL, { inputs: text }, { headers });
    return response.data[0].summary_text;
  } catch (error) {
    console.error(
      "Summarization failed:",
      error.response?.data || error.message
    );
    return "Summarization error.";
  }
};
