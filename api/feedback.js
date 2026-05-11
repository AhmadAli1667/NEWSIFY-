// Feedback API route (logs to console — Vercel captures these in function logs).
const { parseJson } = require("./_utils");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { name, email, message } = await parseJson(req);
    const cleanMessage = (message || "").trim();

    if (!cleanMessage) {
      return res.status(400).json({ error: "Message is required." });
    }

    const stamp = new Date().toISOString();
    console.log(`[FEEDBACK] ${stamp} | Name: ${(name || "Anonymous").trim()} | Email: ${(email || "N/A").trim()} | Message: ${cleanMessage}`);

    return res.json({ status: "saved" });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || "Server error." });
  }
};
