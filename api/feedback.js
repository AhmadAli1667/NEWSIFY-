// Feedback API route (appends to feedback.txt).
const fs = require("fs");
const path = require("path");
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

    const feedbackPath = path.join(process.cwd(), "feedback.txt");
    const stamp = new Date().toISOString();
    const entry = [
      `--- ${stamp} ---`,
      `Name: ${(name || "Anonymous").trim() || "Anonymous"}`,
      `Email: ${(email || "Not provided").trim() || "Not provided"}`,
      `Message: ${cleanMessage}`,
      ""
    ].join("\n");

    fs.appendFileSync(feedbackPath, entry, { encoding: "utf8" });

    return res.json({ status: "saved" });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ error: error.message || "Server error." });
  }
};
