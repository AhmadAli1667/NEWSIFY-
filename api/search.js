// Search News — Gemini keyword extract → NewsAPI → (GNews fallback) → Gemini summarise.
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

    const geminiKey  = getHeaderKey(req, "x-user-api-key") || process.env.GEMINI_API_KEY;
    const newsKey    = getHeaderKey(req, "x-news-key");

    if (!geminiKey) {
      const err = new Error("No Gemini API key configured.");
      err.status = 429;
      throw err;
    }

    // Step 1: extract search keywords
    const keywordPrompt =
      "Extract the most important search keywords from this question for a news API query. " +
      "Return only the keywords, no explanation, no punctuation, just space-separated words. Question: " +
      question.trim();

    const keywords = await geminiGenerate(keywordPrompt, geminiKey);

    // Step 2: fetch articles — last 7 days, with GNews fallback if NewsAPI fails/empty
    const today   = new Date();
    const fromDay = new Date(today); fromDay.setDate(fromDay.getDate() - 7);
    const fromDate = toIsoDate(fromDay);
    const toDate   = toIsoDate(today);

    let articles = [];

    // Try NewsAPI
    try {
      articles = await fetchNews({ query: keywords, fromDate, toDate, overrideKey: newsKey });
    } catch (newsErr) {
      console.warn("NewsAPI error, trying GNews:", newsErr.message);
    }

    // GNews fallback
    if (!articles.length) {
      const gnewsKey = process.env.GNEWS_API_KEY;
      if (gnewsKey) {
        try {
          const gRes = await fetch(
            `https://gnews.io/api/v4/search?q=${encodeURIComponent(keywords)}&token=${gnewsKey}&lang=en&max=10`
          );
          if (gRes.ok) {
            const gData = await gRes.json();
            articles = (gData.articles || []).map(a => ({
              title:       a.title || "",
              description: a.description || "",
              url:         a.url || "#",
              urlToImage:  a.image || null,
              publishedAt: a.publishedAt || null,
              source:      { name: a.source?.name || "" }
            }));
          }
        } catch (gErr) {
          console.warn("GNews fallback error:", gErr.message);
        }
      }
    }

    if (!articles.length) {
      return res.json({
        summary: "No articles found for this topic in the past 7 days. Try a broader search term.",
        articleCount: 0,
        fromDate,
        toDate
      });
    }

    const combined = combineArticles(articles);

    const summaryPrompt =
      "You are a senior news editor writing a reader-friendly briefing. " +
      "Below are multiple news article titles and descriptions on a related topic. " +
      "Read them all and write a thorough, engaging briefing of FIVE to SEVEN well-developed paragraphs " +
      "(at least 350 words total). Structure it as: " +
      "(1) an opening paragraph that frames the story and why it matters now; " +
      "(2) two or three paragraphs unpacking the key facts, players, numbers, and direct details from the articles; " +
      "(3) a paragraph on context, background, or broader implications; " +
      "(4) a closing paragraph on what to watch for next. " +
      "Use clear, vivid language. Write in flowing paragraphs only — no bullet points, no headings, no markdown. " +
      "Do not invent facts; rely only on what the articles say.\n\nArticles:\n" + combined;

    const summary = await geminiGenerate(summaryPrompt, geminiKey);

    return res.json({ summary, articleCount: articles.length, fromDate, toDate });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || "Server error." });
  }
};
