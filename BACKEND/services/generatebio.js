const axios = require("axios");

console.log("🔥 USING OPENROUTER + DEEPSEEK CHAT MODEL 🔥");

async function generateBio(prompt) {
  try {
    // ✅ Check API key
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("❌ OPENROUTER_API_KEY is missing in .env file");
      throw new Error("AI service configuration error. Contact support.");
    }

    console.log("📝 Generating bio with prompt:", prompt.substring(0, 50) + "...");

    // ✅ Enhanced prompt (UNCHANGED)
    const enhancedPrompt = `Write a professional and engaging bio (max 500 characters) based on this description: "${prompt}".
Make it personal, authentic, and highlight key skills or interests.
Do not use phrases like "Here's a bio" or include meta-commentary.
Just write the bio directly.`;

    // ✅ OpenRouter API call
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat",
        messages: [
          { role: "user", content: enhancedPrompt }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000", // optional but recommended
          "X-Title": "AI Bio Generator"
        }
      }
    );

    // ✅ Response handling (NEW but simple)
    const text = response.data?.choices?.[0]?.message?.content;

    if (!text || text.trim().length === 0) {
      throw new Error("AI returned empty response");
    }

    console.log("✅ Bio generated successfully:", text.substring(0, 50) + "...");

    // ✅ Clean response (UNCHANGED)
    const cleanedText = text
      .replace(/^(Here's a bio|Here is a bio)[:\-\s]*/i, "")
      .trim();

    // ✅ Enforce character limit (UNCHANGED)
    return cleanedText.length > 500
      ? cleanedText.slice(0, 497) + "..."
      : cleanedText;

  } catch (err) {
    console.error("❌ OPENROUTER SERVICE ERROR:", {
      message: err.message,
      stack: err.stack,
      apiKey: process.env.OPENROUTER_API_KEY ? "Present" : "Missing"
    });

    // ✅ Friendly errors (UNCHANGED logic)
    if (err.message.includes("401") || err.message.includes("Unauthorized")) {
      throw new Error("Invalid AI API key");
    } else if (err.message.includes("quota") || err.message.includes("limit")) {
      throw new Error("AI service quota exceeded. Try again later.");
    } else if (err.message.includes("network") || err.message.includes("ENOTFOUND")) {
      throw new Error("Network error. Check your internet connection.");
    } else {
      throw new Error("AI generation failed. Please try again.");
    }
  }
}

module.exports = { generateBio };
