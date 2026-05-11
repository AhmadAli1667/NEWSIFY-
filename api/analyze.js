// Content Analyzer API route (Vercel serverless function).
const { parseJson, getHeaderKey, geminiGenerate } = require("./_utils");

const prompts = {
  newspaper: {
    summarize: "Summarize the article and extract key facts in clear prose.",
    facts: "Extract the key facts from the article and present them in clear prose."
  },
  lyrics: {
    main: "Analyze the main message of these song lyrics in clear prose.",
    insights: "Provide artist insights based on these lyrics in clear prose.",
    creative: "Suggest creative uses for these lyrics in clear prose."
  },
  book: {
    summarize: "Summarize the excerpt in clear prose.",
    themes: "Identify themes in the excerpt and explain them in clear prose."
  }
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { content, type, analysisType } = await parseJson(req);
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Content is required." });
    }

    const typeConfig = prompts[type];
    if (!typeConfig) {
      return res.status(400).json({ error: "Invalid content type." });
    }

    const analysisPrompt = typeConfig[analysisType];
    if (!analysisPrompt) {
      return res.status(400).json({ error: "Invalid analysis type." });
    }

    // Prompt must match user specification exactly.
    const prompt = analysisPrompt + "\n\nContent:\n" + content.trim();

    // Get API key from user header or fall back to environment variable
    const geminiKey = req.headers['x-user-api-key'] || process.env.GEMINI_API_KEY;
    const result = await geminiGenerate(prompt, geminiKey);
    return res.json({ result });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || "Server error." });
  }
};
