/* ═══════════════════════════════════════════════════════
   NEWSIFY — app.js  (full rewrite)
   • Real headlines from NewsAPI via /api/search + /api/briefing
   • Images: article.urlToImage → Pexels API → local fallback
   • Real relative timestamps
═══════════════════════════════════════════════════════ */

// ─── CONFIG ────────────────────────────────────────────
const LOCAL_FALLBACK = "pictures/frontpage.jpg";

// ─── STATE ─────────────────────────────────────────────
const state = {
  activePage: "home",
  heroIndex: 0,
  heroTimer: null,
  length: "medium",
  lyricsFocus: "main",
  analyzerType: "newspaper",
  analyzerFocus: "summarize",
  aboutText: "Ahmad Ali — Team Leader, NUST SEECS, Semester 2.\nBuilt NEWSIFY combining Gemini AI, NewsAPI, and modern web development."
};

const heroSlides = [
  { title: "Stay Informed. Stay Ahead.",        text: "AI-powered news briefings in seconds" },
  { title: "Summarize Any Article",              text: "Paste it. Choose length. Get the gist." },
  { title: "Analyze Lyrics & Literature",        text: "Deep insights from songs, books, and articles" },
  { title: "Your Morning Briefing",              text: "One click. Today's world in 4 paragraphs." },
  { title: "Built at NUST SEECS",                text: "Ahmad Ali & Team · Semester 2 Project" }
];

// ─── DOM REFS ──────────────────────────────────────────
const pages       = document.querySelectorAll(".page");
const navLinks    = document.querySelectorAll(".nav-link");
const logoButton  = document.querySelector(".logo-button");
const heroDots    = document.getElementById("heroDots");
const heroCarousel= document.getElementById("heroCarousel");
const menuBtn     = document.getElementById("menuBtn");
const menuDropdown= document.getElementById("menuDropdown");
const aboutCreator= document.getElementById("aboutCreator");
const exampleBtn  = document.getElementById("exampleBtn");
const helpBtn     = document.getElementById("helpBtn");
const tourOverlay = document.getElementById("tourOverlay");
const tourTooltip = document.getElementById("tourTooltip");
const tourTitle   = document.getElementById("tourTitle");
const tourText    = document.getElementById("tourText");
const tourPrev    = document.getElementById("tourPrev");
const tourNext    = document.getElementById("tourNext");
const tourClose   = document.getElementById("tourClose");
const scrollProgress = document.getElementById("scrollProgress");
const backToTop   = document.getElementById("backToTop");
const modal       = document.getElementById("expandModal");
const modalContent= document.getElementById("modalContent");
const modalClose  = document.getElementById("modalClose");

const searchInput      = document.getElementById("searchInput");
const searchBtn        = document.getElementById("searchBtn");
const searchResult     = document.getElementById("searchResult");
const searchResultCard = document.getElementById("searchResultCard");

const summarizeInput      = document.getElementById("summarizeInput");
const summarizeBtn        = document.getElementById("summarizeBtn");
const summarizeResult     = document.getElementById("summarizeResult");
const summarizeResultCard = document.getElementById("summarizeResultCard");

const lyricsInput      = document.getElementById("lyricsInput");
const lyricsBtn        = document.getElementById("lyricsBtn");
const lyricsResult     = document.getElementById("lyricsResult");
const lyricsResultCard = document.getElementById("lyricsResultCard");

const dictionaryInput      = document.getElementById("dictionaryInput");
const dictionaryBtn        = document.getElementById("dictionaryBtn");
const dictionaryResult     = document.getElementById("dictionaryResult");
const dictionaryResultCard = document.getElementById("dictionaryResultCard");
const dictionaryPrompt     = document.getElementById("dictionaryPrompt");
const dictionaryAsk        = document.getElementById("dictionaryAsk");
const dictionaryGemini     = document.getElementById("dictionaryGemini");
const dictionaryGeminiCard = document.getElementById("dictionaryGeminiCard");

const analyzerInput      = document.getElementById("analyzerInput");
const analyzerBtn        = document.getElementById("analyzerBtn");
const analyzerResult     = document.getElementById("analyzerResult");
const analyzerResultCard = document.getElementById("analyzerResultCard");
const analyzerType       = document.getElementById("analyzerType");
const analyzerFocus      = document.getElementById("analyzerFocus");
const analyzerLabel      = document.getElementById("analyzerLabel");

const briefingBtn   = document.getElementById("briefingBtn");
const headlinesBtn  = document.getElementById("headlinesBtn");
const briefingText  = document.getElementById("briefingText");
const briefingResult= document.getElementById("briefingResult");
const headlineList  = document.getElementById("headlineList");

// ─── TOUR STEPS ────────────────────────────────────────
const tourSteps = [
  { selector: '[data-view="home"]',       title: "Home",             text: "Welcome to NEWSIFY — your AI-powered news companion" },
  { selector: '[data-view="search"]',     title: "Search News",      text: "Ask any question, get a full AI briefing from real headlines" },
  { selector: '[data-view="summarize"]',  title: "Summarize Text",   text: "Paste anything — article, essay, research — get the gist in seconds" },
  { selector: '[data-view="lyrics"]',     title: "Lyrics Analysis",  text: "Paste song lyrics for message analysis, artist insights, and creative ideas" },
  { selector: '[data-view="dictionary"]', title: "Dictionary",       text: "Instant word definitions — free, no API key needed" },
  { selector: '[data-view="analyzer"]',   title: "Content Analyzer", text: "Deep analysis of newspaper articles, book excerpts, or song lyrics" }
];

let tourIndex = 0;

// ═══════════════════════════════════════════════════════
//  IMAGE HELPERS
// ═══════════════════════════════════════════════════════

const pexelsCache = {};

// Map broad categories to Pexels search keywords
const CATEGORY_KEYWORDS = {
  technology: "technology innovation",
  tech: "technology innovation",
  business: "business finance",
  politics: "politics government",
  world: "world news global",
  sports: "sports stadium",
  health: "health medicine",
  entertainment: "entertainment cinema",
  science: "science research",
  general: "newspaper news"
};

function extractKeyword(title) {
  const stop = new Set(["the","a","an","in","on","at","to","for","of","and","is","are","was","were","with","that","this","has","have","its","as","by","from","it","be","he","she","they","we"]);
  const words = title.toLowerCase().replace(/[^a-z\s]/g, "").split(" ");
  const meaningful = words.filter(w => w.length > 3 && !stop.has(w));
  return meaningful.slice(0, 2).join(" ") || "news";
}

async function fetchPexelsImage(query) {
  const key = query.toLowerCase().trim();
  if (pexelsCache[key]) return pexelsCache[key];
  try {
    const res = await fetch("/api/pexels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: key })
    });
    if (!res.ok) throw new Error("Pexels error");
    const data = await res.json();
    const url = data.url || LOCAL_FALLBACK;
    pexelsCache[key] = url;
    return url;
  } catch {
    return LOCAL_FALLBACK;
  }
}

async function getArticleImage(article, category) {
  // 1. Use urlToImage if present
  if (article.urlToImage && article.urlToImage.startsWith("http")) {
    return article.urlToImage;
  }
  // 2. Fall back to Pexels
  const keyword = CATEGORY_KEYWORDS[category] || extractKeyword(article.title || "news");
  return await fetchPexelsImage(keyword);
}

// ═══════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════

function timeAgo(isoString) {
  if (!isoString) return "";
  const diff = (Date.now() - new Date(isoString)) / 1000;
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

function categoryFromSource(article) {
  const src = (article.source?.name || "").toLowerCase();
  const title = (article.title || "").toLowerCase();
  const all = src + " " + title;
  if (/sport|cricket|football|soccer|nba|nfl|tennis|f1|psl/.test(all)) return "sports";
  if (/health|medic|hospital|vaccine|disease|covid/.test(all)) return "health";
  if (/tech|ai |software|apple|google|meta|microsoft|openai|robot/.test(all)) return "technology";
  if (/business|economy|market|stock|finance|bank|gdp/.test(all)) return "business";
  if (/politic|election|parliament|congress|government|minister|senate/.test(all)) return "politics";
  if (/entertain|film|movie|music|celebrity|bollywood|hollywood/.test(all)) return "entertainment";
  if (/science|space|nasa|climate|planet|research/.test(all)) return "science";
  return "general";
}

function safeText(str, max = 120) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "…" : str;
}

// ═══════════════════════════════════════════════════════
//  REAL NEWS LOADER
// ═══════════════════════════════════════════════════════

async function fetchTopHeadlines(pageSize = 10) {
  try {
    // We use our own backend briefing endpoint which calls NewsAPI
    const data = await postJson("/api/briefing", {});
    return data.headlines || [];
  } catch {
    return [];
  }
}

// Build the homepage with real data
async function loadHomeNews() {
  const topStoryCard = document.querySelector(".top-story-card");
  const sideCardsEl  = document.querySelector(".side-cards");
  const latestItemsEl= document.querySelector(".latest-news-items");
  const tickerContent= document.querySelector(".ticker-content");

  // Show skeleton while loading
  if (topStoryCard) {
    topStoryCard.style.opacity = "0.5";
  }

  let headlines = [];
  try {
    headlines = await fetchTopHeadlines(10);
  } catch (e) {
    console.warn("Could not fetch headlines:", e);
  }

  // If API failed or returned nothing, keep the static fallback content as-is
  if (!headlines || headlines.length === 0) {
    if (topStoryCard) topStoryCard.style.opacity = "1";
    return;
  }

  // headlines may be strings (titles) or objects — normalise
  const articles = headlines.map(h => typeof h === "string" ? { title: h, urlToImage: null, publishedAt: null, url: "#", source: { name: "" } } : h);

  // ── TOP STORY (article[0]) ──────────────────────────
  const top = articles[0];
  if (top && topStoryCard) {
    const cat = categoryFromSource(top);
    const img = await getArticleImage(top, cat);

    topStoryCard.innerHTML = `
      <span class="top-story-badge">🔥 TOP STORY</span>
      <div class="story-meta">
        <span class="story-time">⏱ ${timeAgo(top.publishedAt) || "Recent"}</span>
        <span class="category-chip ${cat}">${cat.charAt(0).toUpperCase()+cat.slice(1)}</span>
      </div>
      <h2 class="top-story-headline">${safeText(top.title, 140)}</h2>
      <p class="top-story-description">${safeText(top.description || top.title, 220)}</p>
      <div class="top-story-image">
        <img src="${img}" alt="Top story"
          onerror="this.onerror=null;this.src='${LOCAL_FALLBACK}';" />
      </div>
    `;
    topStoryCard.style.opacity = "1";
    if (top.url && top.url !== "#") {
      topStoryCard.style.cursor = "pointer";
      topStoryCard.onclick = () => window.open(top.url, "_blank", "noopener");
    }
  }

  // ── SIDE CARDS (articles 1-4) ───────────────────────
  const sideArticles = articles.slice(1, 5);
  if (sideCardsEl && sideArticles.length) {
    const sideImgs = await Promise.all(sideArticles.map(a => getArticleImage(a, categoryFromSource(a))));
    sideCardsEl.innerHTML = sideArticles.map((a, i) => {
      const cat = categoryFromSource(a);
      return `
        <div class="side-card-item" onclick="window.open('${a.url || "#"}','_blank','noopener')" style="cursor:pointer">
          <img src="${sideImgs[i]}" alt="${safeText(a.title,40)}"
            onerror="this.onerror=null;this.src='${LOCAL_FALLBACK}';"
            style="width:76px;height:76px;border-radius:10px;object-fit:cover;flex-shrink:0;" />
          <div class="side-card-text">
            <span class="category-chip ${cat}" style="width:fit-content;margin-bottom:4px;">${cat.charAt(0).toUpperCase()+cat.slice(1)}</span>
            <strong>${safeText(a.title, 80)}</strong>
            <span>${timeAgo(a.publishedAt) || "Recent"}</span>
          </div>
        </div>`;
    }).join("");
  }

  // ── LATEST NEWS (articles 5-9) ──────────────────────
  const latestArticles = articles.slice(5, 10);
  if (latestItemsEl && latestArticles.length) {
    const latestImgs = await Promise.all(latestArticles.map(a => getArticleImage(a, categoryFromSource(a))));
    latestItemsEl.innerHTML = latestArticles.map((a, i) => {
      const cat = categoryFromSource(a);
      return `
        <div class="latest-news-item ${cat}" onclick="window.open('${a.url || "#"}','_blank','noopener')" style="cursor:pointer">
          <img src="${latestImgs[i]}" alt="${safeText(a.title,40)}"
            onerror="this.onerror=null;this.src='${LOCAL_FALLBACK}';"
            style="width:54px;height:54px;border-radius:9px;object-fit:cover;flex-shrink:0;" />
          <div class="latest-news-text">
            <span class="category-chip ${cat}" style="width:fit-content;margin-bottom:4px;">${cat.charAt(0).toUpperCase()+cat.slice(1)}</span>
            <strong>${safeText(a.title, 90)}</strong>
            <span>${timeAgo(a.publishedAt) || "Recent"}</span>
          </div>
        </div>`;
    }).join("");
  }

  // ── BREAKING TICKER (all article titles) ────────────
  if (tickerContent && articles.length) {
    const titles = articles.map(a => safeText(a.title, 80)).filter(Boolean);
    // Duplicate for seamless loop
    const doubled = [...titles, ...titles];
    tickerContent.innerHTML = doubled.map(t => `<span>${t} &nbsp;·&nbsp;</span>`).join("");
  }
}

// ═══════════════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════════════

function setPage(name) {
  if (state.activePage === name) return;
  const current = document.getElementById(`page-${state.activePage}`);
  if (current) current.classList.add("fade-out");
  setTimeout(() => {
    pages.forEach(p => p.classList.remove("active", "fade-out"));
    const next = document.getElementById(`page-${name}`);
    if (next) next.classList.add("active");
    navLinks.forEach(l => l.classList.toggle("active", l.dataset.view === name));
    state.activePage = name;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 200);
}

// ═══════════════════════════════════════════════════════
//  HERO CAROUSEL
// ═══════════════════════════════════════════════════════

function buildHeroDots() {
  heroDots.innerHTML = "";
  heroSlides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "hero-dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", () => setHeroIndex(i));
    heroDots.appendChild(dot);
  });
}

function setHeroIndex(index) {
  const slides = heroCarousel.querySelectorAll(".hero-slide");
  const dots   = heroDots.querySelectorAll(".hero-dot");
  slides.forEach(s => s.classList.remove("active"));
  dots.forEach(d => d.classList.remove("active"));
  if (slides[index]) slides[index].classList.add("active");
  if (dots[index])   dots[index].classList.add("active");
  state.heroIndex = index;
}

function startHeroRotation() {
  clearInterval(state.heroTimer);
  state.heroTimer = setInterval(() => {
    setHeroIndex((state.heroIndex + 1) % heroSlides.length);
  }, 5000);
}

// ═══════════════════════════════════════════════════════
//  BUTTON GROUPS / ANALYZER OPTIONS
// ═══════════════════════════════════════════════════════

function setButtonGroup(group, value) {
  group.querySelectorAll("button").forEach(btn => btn.classList.toggle("active", btn.dataset.value === value));
}

function updateAnalyzerOptions() {
  analyzerFocus.innerHTML = "";
  let options = [];
  if (state.analyzerType === "newspaper") {
    options = [{ value: "summarize", label: "Summarize Article" }, { value: "facts", label: "Extract Key Facts" }];
    analyzerLabel.textContent = "Content";
    analyzerInput.placeholder = "Paste the article...";
  }
  if (state.analyzerType === "lyrics") {
    options = [{ value: "main", label: "Main Message" }, { value: "insights", label: "Artist Insights" }, { value: "creative", label: "Creative Suggestions" }];
    analyzerLabel.textContent = "Lyrics";
    analyzerInput.placeholder = "Paste song lyrics here...";
  }
  if (state.analyzerType === "book") {
    options = [{ value: "summarize", label: "Summarize Excerpt" }, { value: "themes", label: "Identify Themes" }];
    analyzerLabel.textContent = "Excerpt";
    analyzerInput.placeholder = "Paste the excerpt...";
  }
  options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.dataset.value = opt.value;
    btn.textContent   = opt.label;
    if (idx === 0) { btn.classList.add("active"); state.analyzerFocus = opt.value; }
    btn.addEventListener("click", () => { state.analyzerFocus = opt.value; setButtonGroup(analyzerFocus, opt.value); });
    analyzerFocus.appendChild(btn);
  });
}

// ═══════════════════════════════════════════════════════
//  LOADING / RESULT HELPERS
// ═══════════════════════════════════════════════════════

function setLoading(button, resultCard, resultBody) {
  button.disabled = true;
  button.dataset.original = button.textContent;
  button.textContent = "⏳ Analyzing...";
  resultBody.textContent = "";
  resultBody.classList.add("shimmer");
  resultCard.classList.add("show");
}

function clearLoading(button, resultBody) {
  button.disabled = false;
  button.textContent = button.dataset.original || "Submit";
  resultBody.classList.remove("shimmer");
}

function showResult(resultCard, resultBody, content) {
  resultBody.textContent = content || "No response returned.";
  resultCard.classList.add("show");
}

// ═══════════════════════════════════════════════════════
//  API CALLS
// ═══════════════════════════════════════════════════════

async function postJson(url, payload) {
  const userKey = sessionStorage.getItem("user_gemini_key");
  const headers = { "Content-Type": "application/json" };
  if (userKey) headers["X-User-API-Key"] = userKey;
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
  if (res.status === 429 || res.status === 401 || res.status === 403) {
    showApiKeyModal();
    throw new Error("API limit reached.");
  }
  if (!res.ok) throw new Error("Request failed");
  return res.json();
}

// ── Tool handlers ──────────────────────────────────────

async function handleSearch() {
  const question = searchInput.value.trim();
  if (!question) { searchInput.focus(); return; }
  setLoading(searchBtn, searchResultCard, searchResult);
  try {
    const data = await postJson("/api/search", { question });
    showResult(searchResultCard, searchResult, data.summary || data.result || data.response || "");
  } catch {
    showResult(searchResultCard, searchResult, "Unable to fetch results right now.");
  } finally {
    clearLoading(searchBtn, searchResult);
  }
}

async function handleSummarize() {
  const text = summarizeInput.value.trim();
  if (!text) { summarizeInput.focus(); showToast("Please paste some text first", "info"); return; }
  setLoading(summarizeBtn, summarizeResultCard, summarizeResult);
  try {
    const data = await postJson("/api/summarize", { text, length: state.length });
    showResult(summarizeResultCard, summarizeResult, data.summary || data.result || data.response || "");
  } catch {
    showResult(summarizeResultCard, summarizeResult, "Unable to summarize right now.");
  } finally {
    clearLoading(summarizeBtn, summarizeResult);
  }
}

async function handleLyrics() {
  const content = lyricsInput.value.trim();
  if (!content) { lyricsInput.focus(); showToast("Please paste some lyrics first", "info"); return; }
  setLoading(lyricsBtn, lyricsResultCard, lyricsResult);
  try {
    const data = await postJson("/api/analyze", { type: "lyrics", analysisType: state.lyricsFocus, content });
    showResult(lyricsResultCard, lyricsResult, data.analysis || data.result || data.response || "");
  } catch {
    showResult(lyricsResultCard, lyricsResult, "Unable to analyze lyrics right now.");
  } finally {
    clearLoading(lyricsBtn, lyricsResult);
  }
}

async function lookupWord(word) {
  const res = await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(word.trim()));
  if (!res.ok) throw new Error("Word not found");
  const data = await res.json();
  return data[0];
}

function buildPartOfSpeechBadge(pos) {
  const colors = { noun: "#2563eb", verb: "#059669", adjective: "#ea580c", adverb: "#6d28d9" };
  const c = colors[pos] || "#2563eb";
  const bg = c + "20";
  return `<span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${bg};color:${c};font-weight:700;font-size:0.78rem;border:1.5px solid ${c}40">${pos || "Definition"}</span>`;
}

async function handleDictionary() {
  const word = dictionaryInput.value.trim();
  if (!word) { dictionaryInput.focus(); return; }
  setLoading(dictionaryBtn, dictionaryResultCard, dictionaryResult);
  try {
    const entry = await lookupWord(word);
    const meaning    = entry.meanings?.[0];
    const definition = meaning?.definitions?.[0];
    const phonetic   = entry.phonetic || entry.phonetics?.[0]?.text || "";
    const synonyms   = definition?.synonyms || meaning?.synonyms || [];
    dictionaryResult.innerHTML = `
      <div style="font-size:2.2rem;font-weight:800;color:#059669;font-family:'Playfair Display',serif;">${entry.word}</div>
      <div style="margin:6px 0;color:#64748b;font-style:italic;font-size:0.9rem;">🔊 ${phonetic}</div>
      ${buildPartOfSpeechBadge(meaning?.partOfSpeech)}
      <div style="margin-top:14px;font-size:1rem;line-height:1.8;color:#0f172a;">${definition?.definition || ""}</div>
      ${definition?.example ? `<div style="margin-top:10px;color:#64748b;font-style:italic;border-left:3px solid #059669;padding-left:12px;font-size:0.93rem;">${definition.example}</div>` : ""}
      ${synonyms.length ? `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;">${synonyms.slice(0,6).map(syn => `<span style="background:#f1f5f9;padding:4px 10px;border-radius:999px;font-size:0.8rem;border:1px solid #e2e8f0;">${syn}</span>`).join("")}</div>` : ""}
    `;
    dictionaryResultCard.classList.add("show");
    dictionaryPrompt.value = `Use the word '${entry.word}' in 3 creative sentences showing different contexts and explain its nuance`;
  } catch {
    showResult(dictionaryResultCard, dictionaryResult, "Word not found. Try another.");
  } finally {
    clearLoading(dictionaryBtn, dictionaryResult);
  }
}

async function handleDictionaryGemini() {
  const prompt = dictionaryPrompt.value.trim();
  if (!prompt) return;
  setLoading(dictionaryAsk, dictionaryGeminiCard, dictionaryGemini);
  try {
    const data = await postJson("/api/summarize", { text: prompt, length: "medium" });
    dictionaryGemini.textContent = data.summary || data.result || "";
    dictionaryGeminiCard.classList.add("show");
  } catch {
    dictionaryGemini.textContent = "Unable to fetch response right now.";
  } finally {
    clearLoading(dictionaryAsk, dictionaryGemini);
  }
}

async function handleAnalyzer() {
  const content = analyzerInput.value.trim();
  if (!content) { analyzerInput.focus(); showToast("Please paste some content first", "info"); return; }
  setLoading(analyzerBtn, analyzerResultCard, analyzerResult);
  try {
    const data = await postJson("/api/analyze", { type: state.analyzerType, analysisType: state.analyzerFocus, content });
    showResult(analyzerResultCard, analyzerResult, data.analysis || data.result || data.response || "");
  } catch {
    showResult(analyzerResultCard, analyzerResult, "Unable to analyze right now.");
  } finally {
    clearLoading(analyzerBtn, analyzerResult);
  }
}

async function handleBriefing() {
  setLoading(briefingBtn, briefingResult, briefingText);
  try {
    const data = await postJson("/api/briefing", {});
    showResult(briefingResult, briefingText, data.briefing || data.summary || data.result || "");
  } catch {
    showResult(briefingResult, briefingText, "Unable to load briefing.");
  } finally {
    clearLoading(briefingBtn, briefingText);
  }
}

async function handleHeadlines() {
  setLoading(headlinesBtn, briefingResult, briefingText);
  try {
    const data = await postJson("/api/briefing", {});
    const list = data.headlines || [];
    headlineList.innerHTML = "";
    list.forEach(item => {
      const btn = document.createElement("button");
      btn.textContent = typeof item === "string" ? item : item.title;
      headlineList.appendChild(btn);
    });
    briefingText.textContent = "";
    briefingResult.classList.add("show");
  } catch {
    showResult(briefingResult, briefingText, "Unable to load headlines.");
  } finally {
    clearLoading(headlinesBtn, briefingText);
  }
}

// ═══════════════════════════════════════════════════════
//  API KEY MODAL
// ═══════════════════════════════════════════════════════

function showApiKeyModal() {
  const modal         = document.getElementById("apiKeyModal");
  const useOwnBtn     = document.getElementById("apiKeyUseOwn");
  const tutorialBtn   = document.getElementById("apiKeyTutorial");
  const inputSection  = document.getElementById("apiKeyInputSection");
  const tutorialSection = document.getElementById("apiKeyTutorialSection");
  const apiKeyInput   = document.getElementById("apiKeyInput");
  const saveBtn       = document.getElementById("apiKeySave");
  const closeBtn      = document.getElementById("apiKeyClose");

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");

  useOwnBtn.onclick = () => { inputSection.style.display = "flex"; tutorialSection.style.display = "none"; };
  tutorialBtn.onclick = () => {
    tutorialSection.style.display = tutorialSection.style.display === "none" ? "block" : "none";
    inputSection.style.display = "none";
  };
  saveBtn.onclick = () => {
    const key = apiKeyInput.value.trim();
    if (key) {
      sessionStorage.setItem("user_gemini_key", key);
      showToast("✓ API key saved for this session", "success");
      closeModal();
    }
  };
  closeBtn.onclick = closeModal;
  modal.onclick = e => { if (e.target === modal) closeModal(); };

  function closeModal() {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    apiKeyInput.value = "";
    inputSection.style.display = "none";
    tutorialSection.style.display = "none";
  }
}

// ─── "Change key" link in API key section ────────────
const changeKeyBtn = document.getElementById("changeKeyBtn");
if (changeKeyBtn) {
  changeKeyBtn.addEventListener("click", () => {
    sessionStorage.removeItem("user_gemini_key");
    showApiKeyModal();
  });
}

// ═══════════════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════════════

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  const bg = type === "success" ? "#059669" : "#2563eb";
  toast.style.cssText = `position:fixed;top:20px;right:20px;background:${bg};color:#fff;padding:14px 22px;border-radius:10px;font-weight:600;z-index:10000;font-family:'DM Sans',sans-serif;font-size:0.92rem;box-shadow:0 4px 16px rgba(0,0,0,0.18);`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = "0"; toast.style.transition = "opacity 0.3s"; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ═══════════════════════════════════════════════════════
//  SCROLL / PROGRESS
// ═══════════════════════════════════════════════════════

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const progress = height > 0 ? (scrollTop / height) * 100 : 0;
  scrollProgress.style.width = `${progress}%`;
  backToTop.classList.toggle("show", scrollTop > 300);
}

// ═══════════════════════════════════════════════════════
//  TOUR
// ═══════════════════════════════════════════════════════

function openTour() { tourOverlay.classList.add("show"); showTourStep(0); }
function closeTour() {
  tourOverlay.classList.remove("show");
  document.querySelectorAll(".tour-highlight").forEach(el => el.classList.remove("tour-highlight"));
}
function showTourStep(index) {
  const step = tourSteps[index];
  if (!step) return;
  document.querySelectorAll(".tour-highlight").forEach(el => el.classList.remove("tour-highlight"));
  const target = document.querySelector(step.selector);
  if (!target) return;
  target.classList.add("tour-highlight");
  const rect = target.getBoundingClientRect();
  tourTitle.textContent = step.title;
  tourText.textContent  = step.text;
  const tw = tourTooltip.offsetWidth || 230;
  tourTooltip.style.top  = `${rect.top + window.scrollY}px`;
  tourTooltip.style.left = `${Math.max(20, Math.min(rect.right + 12, window.innerWidth - tw - 20))}px`;
  tourIndex = index;
}
function initTourControls() {
  if (tourPrev)  tourPrev.addEventListener("click",  () => { if (tourIndex > 0) showTourStep(tourIndex - 1); });
  if (tourNext)  tourNext.addEventListener("click",  () => { if (tourIndex < tourSteps.length - 1) showTourStep(tourIndex + 1); });
  if (tourClose) tourClose.addEventListener("click", closeTour);
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeTour(); modal.classList.remove("show"); } });
}

// ═══════════════════════════════════════════════════════
//  INFO PANELS
// ═══════════════════════════════════════════════════════

function initInfoPanels() {
  document.querySelectorAll(".info-panel").forEach(panel => {
    panel.querySelector(".info-toggle").addEventListener("click", () => panel.classList.toggle("open"));
  });
}

// ═══════════════════════════════════════════════════════
//  BUTTON GROUPS INIT
// ═══════════════════════════════════════════════════════

function initButtonGroups() {
  const lengthGroup = document.getElementById("lengthGroup");
  if (lengthGroup) {
    lengthGroup.addEventListener("click", e => {
      const btn = e.target.closest("button");
      if (!btn) return;
      state.length = btn.dataset.value;
      setButtonGroup(lengthGroup, state.length);
    });
  }
  const lyricsGroup = document.getElementById("lyricsGroup");
  if (lyricsGroup) {
    lyricsGroup.addEventListener("click", e => {
      const btn = e.target.closest("button");
      if (!btn) return;
      state.lyricsFocus = btn.dataset.value;
      setButtonGroup(lyricsGroup, state.lyricsFocus);
    });
  }
  if (analyzerType) {
    analyzerType.addEventListener("click", e => {
      const btn = e.target.closest("button");
      if (!btn) return;
      state.analyzerType = btn.dataset.value;
      setButtonGroup(analyzerType, state.analyzerType);
      updateAnalyzerOptions();
    });
  }
}

// ═══════════════════════════════════════════════════════
//  RESULT ACTIONS (copy / expand)
// ═══════════════════════════════════════════════════════

function initResultsActions() {
  document.querySelectorAll(".result-btn").forEach(button => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.target);
      if (!target) return;
      if (button.dataset.action === "copy") {
        navigator.clipboard.writeText(target.textContent || "");
        const orig = button.textContent;
        button.textContent = "✓ Copied!";
        setTimeout(() => { button.textContent = orig; }, 2000);
      }
      if (button.dataset.action === "expand") {
        modalContent.textContent = target.textContent || "";
        modal.classList.add("show");
      }
    });
  });
}

// ═══════════════════════════════════════════════════════
//  FEEDBACK FORM
// ═══════════════════════════════════════════════════════

function initFeedback() {
  const feedbackForm    = document.getElementById("feedbackForm");
  const feedbackSuccess = document.getElementById("feedbackSuccess");
  const starRating      = document.getElementById("starRating");
  if (!feedbackForm || !starRating) return;

  const stars = starRating.querySelectorAll(".star");
  let feedbackRating = 0;

  const updateStars = () => stars.forEach((s, i) => s.classList.toggle("filled", i < feedbackRating));

  stars.forEach((star, index) => {
    star.addEventListener("click", e => { e.preventDefault(); feedbackRating = index + 1; updateStars(); });
    star.addEventListener("mouseover", () => stars.forEach((s, i) => s.classList.toggle("filled", i <= index)));
  });
  starRating.addEventListener("mouseleave", updateStars);

  feedbackForm.addEventListener("submit", async e => {
    e.preventDefault();
    const name = document.getElementById("feedbackName")?.value.trim();
    const text = document.getElementById("feedbackText")?.value.trim();
    if (!name || !text || !feedbackRating) { showToast("Please fill in all fields and rate us", "info"); return; }
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message: `[${feedbackRating}★] ${text}` })
      });
    } catch {}
    feedbackForm.style.display = "none";
    feedbackSuccess.classList.add("show");
    setTimeout(() => {
      feedbackForm.style.display = "block";
      feedbackSuccess.classList.remove("show");
      feedbackForm.reset();
      feedbackRating = 0;
      updateStars();
    }, 3000);
  });
}

// ═══════════════════════════════════════════════════════
//  EVENTS
// ═══════════════════════════════════════════════════════

function initEvents() {
  // Nav
  navLinks.forEach(link => link.addEventListener("click", () => setPage(link.dataset.view)));
  document.querySelectorAll("[data-view]").forEach(link => {
    link.addEventListener("click", () => { const v = link.dataset.view; if (v) setPage(v); });
  });
  if (logoButton) logoButton.addEventListener("click", () => setPage("home"));

  // Menu
  if (menuBtn) menuBtn.addEventListener("click", () => menuDropdown.classList.toggle("show"));
  if (aboutCreator) aboutCreator.addEventListener("click", () => {
    menuDropdown.classList.remove("show");
    modalContent.textContent = state.aboutText;
    modal.classList.add("show");
  });
  if (exampleBtn) exampleBtn.addEventListener("click", () => {
    menuDropdown.classList.remove("show");
    searchInput.value = "What are the biggest global stories right now?";
    setPage("search");
  });
  if (helpBtn) helpBtn.addEventListener("click", openTour);

  // Modals
  if (modalClose) modalClose.addEventListener("click", () => modal.classList.remove("show"));
  if (modal)      modal.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("show"); });

  // Tools
  if (searchBtn)     searchBtn.addEventListener("click", handleSearch);
  if (searchInput)   searchInput.addEventListener("keydown", e => { if (e.key === "Enter") handleSearch(); });
  if (summarizeBtn)  summarizeBtn.addEventListener("click", handleSummarize);
  if (lyricsBtn)     lyricsBtn.addEventListener("click", handleLyrics);
  if (dictionaryBtn) dictionaryBtn.addEventListener("click", handleDictionary);
  if (dictionaryInput) dictionaryInput.addEventListener("keydown", e => { if (e.key === "Enter") handleDictionary(); });
  if (dictionaryAsk) dictionaryAsk.addEventListener("click", handleDictionaryGemini);
  if (analyzerBtn)   analyzerBtn.addEventListener("click", handleAnalyzer);
  if (briefingBtn)   briefingBtn.addEventListener("click", handleBriefing);
  if (headlinesBtn)  headlinesBtn.addEventListener("click", handleHeadlines);

  // Back to top
  if (backToTop) backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  window.addEventListener("scroll", updateScrollProgress);
  document.addEventListener("click", e => {
    if (menuDropdown && !menuBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
      menuDropdown.classList.remove("show");
    }
  });
}

// ═══════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════

function init() {
  buildHeroDots();
  startHeroRotation();
  initInfoPanels();
  initButtonGroups();
  updateAnalyzerOptions();
  initResultsActions();
  initTourControls();
  initFeedback();
  initEvents();
  updateScrollProgress();

  // Load real news (non-blocking — page renders immediately, news fills in)
  loadHomeNews().catch(() => console.warn("Home news load failed silently"));
}

init();
