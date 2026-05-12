// Essay generator — Gemini writes a structured essay based on topic, word count, type.
const { parseJson, geminiGenerate, getHeaderKey } = require("./_utils");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { topic, wordCount, essayType } = await parseJson(req);
    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: "Topic is required." });
    }

    const type  = (essayType || "academic").toLowerCase();
    const words = Math.min(Math.max(parseInt(wordCount) || 500, 100), 2000);

    const prompt = `Write a ${type} essay on the following topic: "${topic.trim()}".

Target approximately ${words} words. Structure it with a clear introduction, well-developed body paragraphs, and a strong conclusion. Use vocabulary and tone appropriate for a ${type} essay. Do not include a title, headings, or any meta-commentary — write only the essay text itself.`;

    const overrideKey = getHeaderKey(req, "x-user-api-key");
    const essay = await geminiGenerate(prompt, overrideKey);

    return res.json({ essay });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || "Server error." });
  }
};
