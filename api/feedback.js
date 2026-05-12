// Feedback API — writes to feedback.txt (local dev) and logs to console (Vercel).
const { parseJson } = require("./_utils");
const fs   = require("fs");
const path = require("path");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const { name, email, rating, message } = await parseJson(req);
    const cleanMessage = (message || "").trim();
    const cleanName    = (name    || "Anonymous").trim();
    const cleanEmail   = (email   || "N/A").trim();
    const stars        = Number(rating) || 0;

    if (!cleanMessage) {
      return res.status(400).json({ error: "Message is required." });
    }

    const stamp = new Date().toISOString();
    const starStr = "★".repeat(stars) + "☆".repeat(Math.max(0, 5 - stars));
    const line = `[${stamp}] ${cleanName} | ${cleanEmail} | ${starStr} (${stars}/5) | ${cleanMessage}\n`;

    // Log to console (captured by Vercel function logs)
    console.log(`[FEEDBACK] ${line.trim()}`);

    // Write to feedback.txt (works in local dev; read-only on Vercel — silently ignored)
    try {
      const feedbackPath = path.join(process.cwd(), "feedback.txt");
      fs.appendFileSync(feedbackPath, line, "utf8");
    } catch {
      // Vercel or other read-only environment — skip file write
    }

    return res.json({ status: "saved" });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || "Server error." });
  }
};
