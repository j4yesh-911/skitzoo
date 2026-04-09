const express = require("express");
const axios = require("axios");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| POST /api/ai/generate-bio
|--------------------------------------------------------------------------
| Uses OpenRouter + DeepSeek to generate a professional bio
|--------------------------------------------------------------------------
*/
router.post("/generate-bio", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      console.error("❌ OPENROUTER_API_KEY missing");
      return res.status(500).json({ error: "AI service not configured" });
    }

    const enhancedPrompt = `
Write a professional and engaging user bio (max 500 characters).

Rules:
- Write directly, no introductions
- No meta commentary
- Friendly, authentic tone
- Highlight skills or interests

User description:
"${prompt}"
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat",
        messages: [{ role: "user", content: enhancedPrompt }],
        temperature: 0.7,
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "SkillSwap AI Bio Generator",
        },
      }
    );

    const aiText = response.data?.choices?.[0]?.message?.content?.trim();

    if (!aiText) {
      return res.status(500).json({ error: "Empty AI response" });
    }

    const finalBio =
      aiText.length > 500 ? aiText.slice(0, 497) + "..." : aiText;

    return res.json({ result: finalBio });

  } catch (err) {
    console.error("❌ OpenRouter AI error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to generate bio" });
  }
});

module.exports = router;
