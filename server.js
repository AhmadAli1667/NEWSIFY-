// Local dev server to run NEWSIFY without Vercel.
const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const apiHandlers = {
  "/api/search": require("./api/search"),
  "/api/summarize": require("./api/summarize"),
  "/api/analyze": require("./api/analyze"),
  "/api/briefing": require("./api/briefing"),
  "/api/dictionary": require("./api/dictionary"),
  "/api/feedback": require("./api/feedback")
};

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".txt": "text/plain"
};

function serveStatic(req, res) {
  const parsed = url.parse(req.url);
  let filePath = parsed.pathname === "/" ? "/index.html" : parsed.pathname;
  filePath = path.join(process.cwd(), decodeURIComponent(filePath));

  if (!filePath.startsWith(process.cwd())) {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
    res.end(data);
  });
}

function wrapResponse(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };

  res.json = (payload) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(payload));
  };

  return res;
}

function createServer() {
  return http.createServer((req, res) => {
    const parsed = url.parse(req.url);
    const handler = apiHandlers[parsed.pathname];

    if (handler) {
      return handler(req, wrapResponse(res));
    }

    return serveStatic(req, res);
  });
}

if (require.main === module) {
  const port = process.env.PORT || 3000;
  createServer().listen(port, () => {
    console.log(`NEWSIFY local server running at http://localhost:${port}`);
  });
}

module.exports = { createServer };
