# NEWSIFY — Complete Project Documentation

**Built by:** Ahmad Ali · Team Leader, NUST SEECS, Semester 2  
**Stack:** Vanilla HTML/CSS/JS · Vercel Serverless Functions (Node.js) · Google Gemini AI · NewsAPI · GNews API · Pexels API

---

## Project Overview

NEWSIFY is a fully deployed, AI-powered news intelligence platform. It fetches real-time headlines from live news APIs, synthesises them with Google Gemini AI, and presents them in a dark editorial interface with animated visualisations and seven distinct AI tools.

**Live deployment:** Vercel (serverless, edge-optimised)  
**No build step** — plain HTML/CSS/JS served directly

---

## File Structure

```
/
├── index.html          — Single-page app shell, all views, all modals
├── style.css           — Complete dark-first design system
├── app.js              — All frontend logic (~800 lines)
├── logo.png            — Brand logo
├── feedback.txt        — Local feedback log (ignored by Vercel read-only FS)
├── vercel.json         — Vercel routing + function config
├── package.json        — Node deps (no build)
├── pictures/           — Static image assets
├── frontend pictures/  — Hero images used across inner pages
└── api/
    ├── _utils.js       — Shared server utilities
    ├── search.js       — AI News Search endpoint
    ├── briefing.js     — Daily Briefing endpoint
    ├── summarize.js    — Article Summarizer endpoint
    ├── analyze.js      — Content Analyzer / Lyrics endpoint
    ├── essay.js        — Essay Writer endpoint
    ├── dictionary.js   — Smart Dictionary proxy
    ├── gnews.js        — GNews headlines proxy
    ├── pexels.js       — Pexels image proxy
    └── feedback.js     — Feedback submission + file write
```

---

## Frontend (app.js) — Function Reference

### Image Helpers

| Function | Purpose |
|---|---|
| `extractKeyword(title)` | Strips stop-words from an article title, returns 1–2 meaningful keywords for Pexels search |
| `fetchPexelsImage(query)` | Calls `/api/pexels` with a query, caches result in `pexelsCache`, returns image URL or local fallback |
| `getArticleImage(article, category)` | Priority chain: (1) article.urlToImage, (2) title keywords via Pexels, (3) category keyword via Pexels, (4) LOCAL_FALLBACK. Deduplicates URLs across the page via `usedImageUrls` Set |

### Utilities

| Function | Purpose |
|---|---|
| `timeAgo(isoString)` | Converts ISO date to human-readable relative time ("2h ago", "just now") |
| `categoryFromSource(article)` | Regex-matches article source name + title to classify into: sports, health, technology, business, politics, entertainment, science, or general |
| `safeText(str, max)` | Truncates text to `max` chars and appends "…" if needed |

### News Loaders

| Function | Purpose |
|---|---|
| `fetchTopHeadlines()` | Primary: fetches `/api/gnews`. Fallback: hits `/api/briefing`. Returns array of article objects |
| `loadHomeNews()` | Orchestrates the full homepage: (1) editorial hero, (2) editorial sidebar, (3) trending cards, (4) editor's pick feature, (5) updates list, (6) ticker. Calls `getArticleImage` in parallel for each section |
| `refreshTickerFromGNews()` | Re-fetches `/api/gnews` and repopulates the ticker content. Called on page load and after every search |

### Navigation

| Function | Purpose |
|---|---|
| `setPage(name)` | Switches active page with fade transition. Updates `data-view` active states on nav links. Scrolls to top |
| `buildHeroDots()` | Generates hero carousel dot indicators |
| `setHeroIndex(index)` | Sets active slide + dot in the hero carousel |
| `startHeroRotation()` | Starts 5-second interval to auto-rotate hero slides |

### Tool Handlers

| Function | Purpose |
|---|---|
| `handleSearch()` | Takes question input → POSTs to `/api/search` → renders AI summary with article count and date range |
| `handleSummarize()` | Takes pasted text + length choice → POSTs to `/api/summarize` → renders summary |
| `handleLyrics()` | Takes pasted lyrics + analysis type → POSTs to `/api/analyze` → renders lyric breakdown |
| `lookupWord(word)` | GETs from public DictionaryAPI.dev (free, no key) → returns entry object |
| `handleDictionary()` | Calls `lookupWord`, renders definition card with POS badge, phonetics, example, synonyms |
| `handleDictionaryGemini()` | Sends a follow-up prompt about the looked-up word to `/api/summarize` → renders Gemini expansion |
| `handleAnalyzer()` | Takes content + type + focus → POSTs to `/api/analyze` → renders deep analysis |
| `handleBriefing()` | POSTs to `/api/briefing` → renders today's AI-written news briefing |
| `handleEssay()` | Takes topic + type + word count → POSTs to `/api/essay` → renders formatted essay |
| `handleHeadlines()` | POSTs to `/api/briefing` → renders clickable headline list |

### UI Helpers

| Function | Purpose |
|---|---|
| `setLoading(button, card, body)` | Disables button, stores original innerHTML in dataset, shows spinner icon. Clears result body |
| `clearLoading(button, body)` | Re-enables button, restores original innerHTML from dataset |
| `showResult(card, body, content)` | Sets textContent and adds `.show` class to result card |
| `setButtonGroup(group, value)` | Toggles `.active` on the matching button in a button group |
| `updateAnalyzerOptions()` | Dynamically re-renders the analysis focus dropdown based on selected content type |
| `showApiKeyModal()` | Mounts the Gemini API key modal, wires all internal button handlers |
| `showToast(message, type)` | Creates and auto-removes a floating toast notification (3s) |
| `updateScrollProgress()` | Updates the top progress bar width based on scroll position |
| `postJson(url, payload)` | Shared fetch wrapper: injects user Gemini key header, handles 429/401/403 → shows API key modal |
| `initFeedback()` | Wires star rating hover/click, form submit, star count display, sends POST to `/api/feedback` |

### Animations

| Function | What it does |
|---|---|
| Neural network canvas (IIFE in `<script>`) | 80 animated nodes (7 hub nodes), O(n²) edge drawing with alpha fade by distance. Hub nodes have a pulsing violet glow ring. Color scheme reads `data-theme` each frame to adapt to dark/light mode. `requestAnimationFrame` loop. Resize handler keeps canvas full-width |
| World heatmap canvas (IIFE in `<script>`) | Flat Mercator world map rendered on canvas. 180 data-point dots at real coordinates. Hover tooltip shows news headline. Canvas height = `W * 0.65`. Pulsing dot animation |

---

## Backend API Routes (api/)

### `api/_utils.js` — Shared Utilities

| Export | Purpose |
|---|---|
| `parseJson(req)` | Buffers raw request body and parses JSON. Rejects if body exceeds 2MB |
| `getHeaderKey(req, name)` | Safely reads a header by name |
| `geminiGenerate(prompt, key)` | Calls Gemini `gemini-2.5-flash-lite` with the given prompt and API key. Returns generated text |
| `fetchNews(opts)` | Calls NewsAPI `/everything` with query, date range, and optional override key. Returns normalised article array |
| `combineArticles(articles)` | Joins article titles + descriptions into one prompt-ready string for Gemini |
| `toIsoDate(date)` | Formats a Date object as `YYYY-MM-DD` |

### `api/search.js` — AI News Search

**Flow:** User question → Gemini extracts keywords → NewsAPI (last 7 days) → GNews fallback → Gemini writes 5–7 paragraph editorial briefing  
**Inputs:** `{ question }` via POST body  
**Outputs:** `{ summary, articleCount, fromDate, toDate }`  
**Auth:** Reads `x-user-api-key` header first, falls back to `GEMINI_API_KEY` env var

### `api/briefing.js` — Daily Briefing

**Flow:** Fetches today's top headlines from NewsAPI → Gemini writes a 4-paragraph morning briefing  
**Inputs:** None (POST with empty body)  
**Outputs:** `{ briefing, headlines }` — briefing is the AI text, headlines is the raw array

### `api/summarize.js` — Article Summarizer

**Flow:** Receives raw text → Gemini summarises to requested length (short/medium/long)  
**Inputs:** `{ text, length }`  
**Outputs:** `{ summary }`

### `api/analyze.js` — Content Analyzer

**Flow:** Receives content + analysis type/focus → Gemini performs deep analysis  
**Types:** `newspaper` (summarize/facts), `lyrics` (main message/artist insights/creative), `book` (summarize/themes)  
**Inputs:** `{ type, analysisType, content }`  
**Outputs:** `{ analysis }`

### `api/essay.js` — Essay Writer

**Flow:** Receives topic + type + word count → Gemini writes a structured essay  
**Types:** academic, persuasive, narrative, descriptive, expository  
**Inputs:** `{ topic, wordCount, essayType }`  
**Outputs:** `{ essay }`

### `api/gnews.js` — GNews Proxy

**Flow:** Fetches top English headlines from GNews API (max 10). Maps `article.image → urlToImage` for frontend compatibility  
**Inputs:** GET request (no body)  
**Outputs:** `{ articles }` — array of normalised article objects  
**Key:** `GNEWS_API_KEY` env var (never exposed to browser)

### `api/pexels.js` — Pexels Image Proxy

**Flow:** Receives a search query → hits Pexels API → returns first result image URL  
**Inputs:** `{ query }` via POST  
**Outputs:** `{ url }` — Pexels CDN image URL  
**Key:** `PEXELS_API_KEY` env var (never exposed to browser)

### `api/feedback.js` — Feedback Submission

**Flow:** Receives name + email + rating + message → formats with star glyphs → logs to console (Vercel captures) → writes to `feedback.txt` locally (silently skipped on Vercel read-only FS)  
**Inputs:** `{ name, email, rating, message }`  
**Outputs:** `{ status: "saved" }`  
**Format:** `[ISO timestamp] Name | Email | ★★★★☆ (4/5) | Message text`

---

## Security Notes

- `GNEWS_API_KEY`, `PEXELS_API_KEY`, `GEMINI_API_KEY`, `NEWS_API_KEY` — all Vercel environment variables, never in browser code
- All API routes run server-side (Node.js); keys are never sent to the client
- User-provided Gemini keys are stored only in `sessionStorage` (cleared on tab close)
- Request body size capped at 2MB in `parseJson`

---

## Theme System

- Default theme: **dark** (`:root` defines dark variables)
- Light theme: `[data-theme="light"]` overrides CSS variables
- Theme stored in `localStorage` key `nf_theme`
- Inline script in `<head>` applies theme synchronously before CSS renders (prevents FOUC)
- Neural network animation reads `data-theme` each frame to adapt colours

---

## LinkedIn Caption

---

🚀 **Built NEWSIFY — an AI-powered news intelligence platform, deployed live on Vercel.**

As a Semester 2 student at NUST SEECS, I built a full-stack web application from scratch — no frameworks, no shortcuts — combining real-time news APIs with Google Gemini AI to create something genuinely useful.

**What NEWSIFY does:**

🗞️ **AI News Search** — Ask any question, get a 5–7 paragraph editorial briefing synthesised from live headlines (NewsAPI + GNews fallback)

📋 **Daily AI Briefing** — One click to get today's world summarised in 4 paragraphs by Gemini AI

✂️ **Article Summarizer** — Paste any article or essay, choose length (short/medium/long), get an instant Gemini summary

🎵 **Lyrics Analyzer** — Paste song lyrics, choose analysis mode (main message / artist insights / creative ideas), get AI-powered music intelligence

📖 **Smart Dictionary** — Free word definitions via DictionaryAPI.dev, with AI-powered usage examples from Gemini — no API key required

📊 **Content Analyzer** — Deep analysis of newspaper articles, book excerpts, or song lyrics with multiple analysis focuses

✍️ **Essay Writer** — Generate structured essays (academic, persuasive, narrative, descriptive, expository) by topic and word count

🌍 **Global News Pulse** — Interactive world heatmap with 180 news dots, hover to read stories, rendered on HTML5 Canvas

🧠 **Neural Network Hero** — 80-node animated network rendered via Canvas API, adapts to dark/light theme in real time

The frontend is pure vanilla JS — no React, no bundler. The backend runs on Vercel Serverless Functions (Node.js). All API keys are server-side only. Dark editorial design is the default, with a light mode toggle.

**Tech Stack:** HTML · CSS · Vanilla JS · Node.js · Vercel · Google Gemini AI (`gemini-2.5-flash-lite`) · NewsAPI · GNews · Pexels API · DictionaryAPI.dev · HTML5 Canvas

Huge thanks to my team. If you're a NUST student or a dev curious about serverless AI apps — let's connect!

#WebDevelopment #AI #GoogleGemini #NUST #JavaScript #FullStack #NewsAPI #Vercel #StudentProject

---

*Last updated: May 2026*
