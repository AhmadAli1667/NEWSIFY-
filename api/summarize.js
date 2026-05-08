// Summarize Text API route (Vercel serverless function).
const { parseJson, geminiGenerate } = require("./_utils");

const lengthPrompts = {
  short: "Keep it short: write 1-2 paragraphs.",
  medium: "Make it medium-length: write 3-4 paragraphs.",
  long: "Make it long: write 5-7 paragraphs."
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { text, length } = await parseJson(req);
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Text is required." });
    }

    const preset = lengthPrompts[length] || lengthPrompts.medium;

    // Prompt must match user specification exactly.
    const prompt = "Summarize the following content clearly and accurately. "
      + preset
      + " Write in flowing, well-developed paragraphs. "
      + "Preserve key names, numbers, quotes, and cause-and-effect. "
      + "No bullet points, no headings, no markdown.\n\n"
      + "Text:\n"
      + text.trim();

    const summary = await geminiGenerate(prompt);
    return res.json({ summary });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || "Server error." });
  }
};
