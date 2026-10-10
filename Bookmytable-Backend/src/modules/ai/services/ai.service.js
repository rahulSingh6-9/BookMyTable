import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../../config/env.js";

export const generateDescriptionService = async (name, cuisine) => {
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error("GEMINI_API_KEY is not configured on the server");
    error.status = 503;
    throw error;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Write a professional, attractive restaurant description.
Restaurant Name: ${name || "Restaurant"}
Cuisine: ${cuisine || "Multi-Cuisine"}
Keep it short, elegant, and engaging (2-3 sentences).
`;

    const result = await model.generateContent(prompt);
    const description = result.response.text();

    return description.trim();
  } catch (err) {
    console.error("❌ [AI Service Error]:", err.message);
    const error = new Error(`AI generation failed: ${err.message}`);
    error.status = 502;
    throw error;
  }
};

