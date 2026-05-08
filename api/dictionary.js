// Dictionary API route (free, no API key required).
const { parseJson } = require("./_utils");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { word } = await parseJson(req);
    const cleanWord = (word || "").trim();
    if (!cleanWord) {
      return res.status(400).json({ error: "Word is required." });
    }

    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`;
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({ error: `Dictionary error: ${text}` });
    }

    const data = await response.json();
    const entry = Array.isArray(data) ? data[0] : null;
    const meanings = entry?.meanings || [];
    const phonetic = entry?.phonetic || entry?.phonetics?.[0]?.text || "";

    const definitions = meanings.slice(0, 3).map(meaning => {
      const def = meaning?.definitions?.[0] || {};
      return {
        partOfSpeech: meaning.partOfSpeech || "",
        definition: def.definition || "",
        example: def.example || ""
      };
    }).filter(item => item.definition);

    return res.json({
      word: entry?.word || cleanWord,
      phonetic,
      definitions
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || "Server error." });
  }
};
