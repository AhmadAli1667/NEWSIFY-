// GNews proxy — keeps GNEWS_API_KEY off the browser. Returns normalized articles.
module.exports = async (req, res) => {
  try {
    const gnewsKey = process.env.GNEWS_API_KEY;
    if (!gnewsKey) return res.json({ articles: [] });

    const response = await fetch(
      `https://gnews.io/api/v4/top-headlines?token=${gnewsKey}&lang=en&max=20`
    );
    if (!response.ok) return res.json({ articles: [] });

    const data = await response.json();
    // Normalize GNews format to match NewsAPI shape (urlToImage instead of image)
    const articles = (data.articles || []).map(a => ({
      title:       a.title || "",
      description: a.description || "",
      url:         a.url || "#",
      urlToImage:  a.image || null,
      publishedAt: a.publishedAt || null,
      source:      { name: a.source?.name || "" }
    }));
    return res.json({ articles });
  } catch {
    return res.json({ articles: [] });
  }
};
