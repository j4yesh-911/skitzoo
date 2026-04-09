// const { GoogleGenerativeAI } = require("@google/generative-ai");

// console.log("🔥 USING GEMINI SERVICE - PRO MODEL 🔥");

// async function generateBio(prompt) {
//   try {
//     // ✅ Check API key first
//     if (!process.env.GEMINI_API_KEY) {
//       console.error("❌ GEMINI_API_KEY is missing in .env file");
//       throw new Error("AI service configuration error. Contact support.");
//     }

//     console.log("📝 Generating bio with prompt:", prompt.substring(0, 50) + "...");

//     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

//     const model = genAI.getGenerativeModel({
//      model: "gemini-1.0-pro",
//     });

//     // ✅ Enhanced prompt for better bios
//     const enhancedPrompt = `Write a professional and engaging bio (max 500 characters) based on this description: "${prompt}".
//     Make it personal, authentic, and highlight key skills or interests.
//     Do not use phrases like "Here's a bio" or include meta-commentary.
//     Just write the bio directly.`;

//     const result = await model.generateContent(enhancedPrompt);

//     // ✅ Better response handling
//     if (!result || !result.response) {
//       throw new Error("No response from AI service");
//     }

//     const text = result.response.text();

//     if (!text || text.trim().length === 0) {
//       throw new Error("AI returned empty response");
//     }

//     console.log("✅ Bio generated successfully:", text.substring(0, 50) + "...");

//     // ✅ Clean and trim response
//     const cleanedText = text
//       .replace(/^(Here's a bio|Here is a bio)[:\-\s]*/i, "")
//       .trim();

//     // ✅ Enforce character limit
//     return cleanedText.length > 500
//       ? cleanedText.slice(0, 497) + "..."
//       : cleanedText;

//   } catch (err) {
//     console.error("❌ GEMINI SERVICE ERROR:", {
//       message: err.message,
//       stack: err.stack,
//       apiKey: process.env.GEMINI_API_KEY ? "Present" : "Missing"
//     });

//     // ✅ User-friendly error messages
//     if (err.message.includes("API key")) {
//       throw new Error("AI service configuration error");
//     } else if (err.message.includes("quota") || err.message.includes("limit")) {
//       throw new Error("AI service quota exceeded. Try again later.");
//     } else if (err.message.includes("network") || err.message.includes("ENOTFOUND")) {
//       throw new Error("Network error. Check your internet connection.");
//     } else {
//       throw new Error("AI generation failed. Please try again.");
//     }
//   }
// }

// module.exports = { generateBio };
