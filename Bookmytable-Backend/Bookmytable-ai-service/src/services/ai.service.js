import dotenv from 'dotenv'
dotenv.config()

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY

export const generateDescriptionService = async (name, cuisine) => {

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
  Write a professional restaurant description.
  Name: ${name}
  Cuisine: ${cuisine}
  Keep it short and attractive.
  `;

  const result = await model.generateContent(prompt);
  const description = result.response.text();

  return description

}

