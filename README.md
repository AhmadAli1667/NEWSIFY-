# NEWSIFY — AI-Powered News Intelligence Platform

> Built by Ahmad Ali · Team Leader, NUST SEECS, Semester 2

A fully deployed, AI-powered news SPA that fetches real-time headlines and synthesises them with Google Gemini AI. Dark editorial design, seven AI tools, live global heatmap, neural network animation.

**Live on Vercel** · Vanilla HTML/CSS/JS · No build step · Serverless Node.js backend

---

## Features

| Feature | Description |
|---|---|
| AI News Search | Ask any question — Gemini synthesises a 5–7 paragraph briefing from real live headlines |
| Daily AI Briefing | One click gets today's world summarised in 4 paragraphs |
| Article Summarizer | Paste any text, choose length, get an instant Gemini summary |
| Lyrics Analyzer | AI-powered music analysis: main message, artist insights, creative ideas |
| Smart Dictionary | Free definitions (DictionaryAPI.dev) + Gemini usage examples |
| Content Analyzer | Deep analysis of articles, book excerpts, or song lyrics |
| Essay Writer | Structured essays by topic, type, and word count |
| Global News Pulse | Interactive Canvas world heatmap with 180 live news dots |
| Neural Network Hero | Animated 80-node network on Canvas, dark/light adaptive |
| Breaking Ticker | Live headline ticker updated from GNews after every search |

---

## Tech Stack

- **Frontend:** Vanilla HTML, CSS (dark-first CSS variables), JavaScript (no framework)
- **Backend:** Vercel Serverless Functions (Node.js)
- **AI:** Google Gemini `gemini-2.5-flash-lite`
- **News:** NewsAPI (search) · GNews API (headlines + images)
- **Images:** Pexels API (proxied server-side)
- **Dictionary:** DictionaryAPI.dev (free, no key)
- **Icons:** Tabler Icons webfont
- **Fonts:** Inter + Playfair Display (Google Fonts)

---

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/search` | POST | AI News Search — Gemini keyword extract → NewsAPI → GNews fallback → Gemini summarise |
| `/api/briefing` | POST | Daily Briefing — top headlines → Gemini brief |
| `/api/summarize` | POST | Article Summarizer — paste text, choose length |
| `/api/analyze` | POST | Content Analyzer — newspaper / book / lyrics |
| `/api/essay` | POST | Essay Writer — topic, type, word count |
| `/api/gnews` | GET | GNews proxy — returns 10 latest headlines with images |
| `/api/pexels` | POST | Pexels image proxy — search query → image URL |
| `/api/feedback` | POST | Feedback — writes to feedback.txt with star ratings |

---

## Setup (Local Dev)

```bash
npm install
npm run dev          # Vercel CLI local dev server
```

**Required environment variables** (set in Vercel dashboard or `.env.local`):

```
GEMINI_API_KEY=...
NEWS_API_KEY=...
GNEWS_API_KEY=...
PEXELS_API_KEY=...
```

> Never commit API keys. All keys are server-side only — never sent to the browser.

---

## Security

- All API keys are Vercel environment variables
- User-provided Gemini keys stored in `sessionStorage` only (cleared on tab close)
- Request body capped at 2MB
- Dark theme default applied via inline `<head>` script to prevent flash of unstyled content

---

## Project Docs

See `PROJECTDOCS.md` for the complete function reference, API documentation, and LinkedIn caption.

---

*NUST SEECS · Semester 2 Project · May 2026*
