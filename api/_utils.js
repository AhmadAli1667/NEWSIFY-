// Shared helpers for Vercel serverless functions.
const GEMINI_ENDPOINT_BASE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=";
const NEWS_API_ENDPOINT = "https://newsapi.org/v2/everything";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    const error = new Error(`${name} is not set.`);
    error.status = 500;
    throw error;
  }
  return value;
}

async function parseJson(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch (error) {
    error.status = 400;
    throw error;
  }
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

async function geminiGenerate(prompt) {
  const geminiKey = requireEnv("GEMINI_API_KEY");
  const response = await fetch(`${GEMINI_ENDPOINT_BASE}${geminiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    const error = new Error(`Gemini error: ${text}`);
    error.status = 502;
    throw error;
  }

  const data = await response.json();
  const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidate) {
    const error = new Error("Gemini returned an empty response.");
    error.status = 502;
    throw error;
  }
  return candidate.trim();
}

async function fetchNews({ query, fromDate, toDate }) {
  const newsKey = requireEnv("NEWS_API_KEY");
  const url = new URL(NEWS_API_ENDPOINT);
  url.searchParams.set("q", query);
  url.searchParams.set("from", fromDate);
  url.searchParams.set("to", toDate);
  url.searchParams.set("sortBy", "publishedAt");
  url.searchParams.set("language", "en");
  url.searchParams.set("apiKey", newsKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    const text = await response.text();
    const error = new Error(`NewsAPI error: ${text}`);
    error.status = 502;
    throw error;
  }

  const data = await response.json();
  const articles = Array.isArray(data.articles) ? data.articles : [];
  return articles;
}

function combineArticles(articles) {
  return articles
    .map(article => {
      const title = (article.title || "").trim();
      const description = (article.description || "").trim();
      if (!title && !description) return "";
      return `Title: ${title || "N/A"}\nDescription: ${description || "N/A"}`;
    })
    .filter(Boolean)
    .join("\n\n");
}

module.exports = {
  parseJson,
  geminiGenerate,
  fetchNews,
  combineArticles,
  toIsoDate
};
