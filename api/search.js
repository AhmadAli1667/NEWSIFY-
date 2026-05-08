// Search News API route (Vercel serverless function).
const {
  parseJson,
  geminiGenerate,
  fetchNews,
  combineArticles,
  toIsoDate
} = require("./_utils");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { question } = await parseJson(req);
    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Question is required." });
    }

    // Prompt must match user specification exactly.
    const keywordPrompt = "Extract the most important search keywords from this question for a news API query. "
      + "Return only the keywords, no explanation, no punctuation, just space-separated words. Question: "
      + question.trim();

    const keywords = await geminiGenerate(keywordPrompt);

    const today = new Date();
    const fromDate = toIsoDate(today);
    const toDate = toIsoDate(today);

    const articles = await fetchNews({ query: keywords, fromDate, toDate });
    if (!articles.length) {
      return res.json({
        summary: "No articles found for today.",
        articleCount: 0,
        fromDate,
        toDate
      });
    }

    const combined = combineArticles(articles);

    const summaryPrompt = "You are a senior news editor writing a reader-friendly briefing. "
      + "Read the combined article titles and descriptions below and write a 5-7 paragraph news briefing. "
      + "Use clear, vivid language. Write in flowing paragraphs only — no bullet points, no headings, no markdown. "
      + "Do not invent facts; rely only on what the articles say.\n\n"
      + "Articles:\n"
      + combined;

    const summary = await geminiGenerate(summaryPrompt);

    return res.json({
      summary,
      articleCount: articles.length,
      fromDate,
      toDate
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || "Server error." });
  }
};
