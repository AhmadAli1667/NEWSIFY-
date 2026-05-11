// Pexels image proxy — keeps PEXELS_API_KEY off the browser.
const { parseJson } = require("./_utils");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { query } = await parseJson(req);
    const pexelsKey = process.env.PEXELS_API_KEY;

    if (!query || !pexelsKey) {
      return res.json({ url: null });
    }

    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`,
      { headers: { Authorization: pexelsKey } }
    );

    if (!response.ok) return res.json({ url: null });

    const data = await response.json();
    const photos = data.photos || [];
    if (!photos.length) return res.json({ url: null });

    const photo = photos[Math.floor(Math.random() * photos.length)];
    const url = photo.src?.large || photo.src?.medium || null;
    return res.json({ url });
  } catch {
    return res.json({ url: null });
  }
};
