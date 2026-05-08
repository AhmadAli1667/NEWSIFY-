// Search News API route (Vercel serverless function).
const {
  parseJson,
  getHeaderKey,
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

    const geminiKey = getHeaderKey(req, "x-gemini-key");
    const newsKey = getHeaderKey(req, "x-news-key");

    const keywords = await geminiGenerate(keywordPrompt, geminiKey);

    const today = new Date();
    const fromDate = toIsoDate(today);
    const toDate = toIsoDate(today);

    const articles = await fetchNews({ query: keywords, fromDate, toDate, overrideKey: newsKey });
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
      + "Below are multiple news article titles and descriptions on a related topic. "
      + "Read them all and write a thorough, engaging briefing of FIVE to SEVEN well-developed paragraphs "
      + "(at least 350 words total). Structure it as: "
      + "(1) an opening paragraph that frames the story and why it matters now; "
      + "(2) two or three paragraphs unpacking the key facts, players, numbers, and direct details from the articles; "
      + "(3) a paragraph on context, background, or broader implications; "
      + "(4) a closing paragraph on what to watch for next. "
      + "Use clear, vivid language. Write in flowing paragraphs only — no bullet points, no headings, no markdown. "
      + "Do not invent facts; rely only on what the articles say.\n\n"
      + "Articles:\n"
      + combined;

    const summary = await geminiGenerate(summaryPrompt, geminiKey);

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
