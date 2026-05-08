// Morning Briefing API route (Vercel serverless function).
const {
  parseJson,
  geminiGenerate,
  fetchNews,
  combineArticles,
  toIsoDate
} = require("./_utils");

const fallbackRanges = [0, 1, 3, 7];

function buildDateRange(daysBack) {
  const today = new Date();
  const from = new Date();
  from.setDate(today.getDate() - daysBack);
  return {
    fromDate: toIsoDate(from),
    toDate: toIsoDate(today)
  };
}

async function fetchWithFallback(query) {
  for (const daysBack of fallbackRanges) {
    const range = buildDateRange(daysBack);
    const articles = await fetchNews({ query, ...range });
    if (articles.length) {
      return { articles, range };
    }
  }
  return { articles: [], range: buildDateRange(0) };
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { mode, deepDiveTopic } = await parseJson(req);
    const isDeepDive = mode === "deep-dive";
    const query = isDeepDive ? (deepDiveTopic || "").trim() : "world news today";

    if (!query) {
      return res.status(400).json({ error: "Deep dive topic is required." });
    }

    const { articles, range } = await fetchWithFallback(query);
    if (!articles.length) {
      return res.json({
        briefing: "No articles found for the selected date range.",
        articleCount: 0,
        fromDate: range.fromDate,
        toDate: range.toDate
      });
    }

    const combined = combineArticles(articles);

    const briefingPrompt = isDeepDive
      ? "Summarize the following news articles about the topic in 3-4 paragraphs, "
        + "using a clear and engaging tone. No bullet points, no headings, no markdown.\n\nArticles:\n"
      : "You are a friendly morning news anchor. Summarize the following world news articles in 3-4 paragraphs. "
        + "No bullet points, no headings, no markdown.\n\nArticles:\n";

    const briefing = await geminiGenerate(briefingPrompt + combined);

    return res.json({
      briefing,
      articleCount: articles.length,
      fromDate: range.fromDate,
      toDate: range.toDate
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || "Server error." });
  }
};
