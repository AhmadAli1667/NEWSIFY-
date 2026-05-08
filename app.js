const state = {
  activePage: "home",
  heroIndex: 0,
  heroTimer: null,
  carouselTimers: new Map(),
  length: "medium",
  lyricsFocus: "main",
  analyzerType: "newspaper",
  analyzerFocus: "summarize",
  aboutText: "Ahmad Ali — Team Leader, NUST SEECS, Semester 2. Built NEWSIFY combining Gemini AI, NewsAPI, and modern web development."
};

const heroSlides = [
  { title: "Stay Informed. Stay Ahead.", text: "AI-powered news briefings in seconds" },
  { title: "Summarize Any Article", text: "Paste it. Choose length. Get the gist." },
  { title: "Analyze Lyrics & Literature", text: "Deep insights from songs, books, and articles" },
  { title: "Your Morning Briefing", text: "One click. Today\'s world in 4 paragraphs." },
  { title: "Built at NUST SEECS", text: "Ahmad Ali & Team · Semester 2 Project" }
];

const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll(".nav-link");
const logoButton = document.querySelector(".logo-button");
const topNewsRow = document.getElementById("topNewsRow");
const heroDots = document.getElementById("heroDots");
const heroCarousel = document.getElementById("heroCarousel");
const menuBtn = document.getElementById("menuBtn");
const menuDropdown = document.getElementById("menuDropdown");
const aboutCreator = document.getElementById("aboutCreator");
const exampleBtn = document.getElementById("exampleBtn");
const helpBtn = document.getElementById("helpBtn");
const tourOverlay = document.getElementById("tourOverlay");
const tourTooltip = document.getElementById("tourTooltip");
const tourTitle = document.getElementById("tourTitle");
const tourText = document.getElementById("tourText");
const tourPrev = document.getElementById("tourPrev");
const tourNext = document.getElementById("tourNext");
const tourClose = document.getElementById("tourClose");
const scrollProgress = document.getElementById("scrollProgress");
const backToTop = document.getElementById("backToTop");
const modal = document.getElementById("expandModal");
const modalContent = document.getElementById("modalContent");
const modalClose = document.getElementById("modalClose");

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const searchResult = document.getElementById("searchResult");
const searchResultCard = document.getElementById("searchResultCard");

const summarizeInput = document.getElementById("summarizeInput");
const summarizeBtn = document.getElementById("summarizeBtn");
const summarizeResult = document.getElementById("summarizeResult");
const summarizeResultCard = document.getElementById("summarizeResultCard");

const lyricsInput = document.getElementById("lyricsInput");
const lyricsBtn = document.getElementById("lyricsBtn");
const lyricsResult = document.getElementById("lyricsResult");
const lyricsResultCard = document.getElementById("lyricsResultCard");

const dictionaryInput = document.getElementById("dictionaryInput");
const dictionaryBtn = document.getElementById("dictionaryBtn");
const dictionaryResult = document.getElementById("dictionaryResult");
const dictionaryResultCard = document.getElementById("dictionaryResultCard");
const dictionaryPrompt = document.getElementById("dictionaryPrompt");
const dictionaryAsk = document.getElementById("dictionaryAsk");
const dictionaryGemini = document.getElementById("dictionaryGemini");
const dictionaryGeminiCard = document.getElementById("dictionaryGeminiCard");

const analyzerInput = document.getElementById("analyzerInput");
const analyzerBtn = document.getElementById("analyzerBtn");
const analyzerResult = document.getElementById("analyzerResult");
const analyzerResultCard = document.getElementById("analyzerResultCard");
const analyzerType = document.getElementById("analyzerType");
const analyzerFocus = document.getElementById("analyzerFocus");
const analyzerLabel = document.getElementById("analyzerLabel");

const briefingBtn = document.getElementById("briefingBtn");
const headlinesBtn = document.getElementById("headlinesBtn");
const briefingText = document.getElementById("briefingText");
const briefingResult = document.getElementById("briefingResult");
const headlineList = document.getElementById("headlineList");

const tourSteps = [
  { selector: "[data-view=\"home\"]", title: "Home", text: "Welcome to NEWSIFY — your AI-powered news companion" },
  { selector: "[data-view=\"search\"]", title: "Search News", text: "Ask any question, get a full AI briefing from real headlines" },
  { selector: "[data-view=\"summarize\"]", title: "Summarize Text", text: "Paste anything — article, essay, research — get the gist in seconds" },
  { selector: "[data-view=\"lyrics\"]", title: "Lyrics Analysis", text: "Paste song lyrics for message analysis, artist insights, and creative ideas" },
  { selector: "[data-view=\"dictionary\"]", title: "Dictionary", text: "Instant word definitions — free, no API key, powered by dictionaryapi.dev" },
  { selector: "[data-view=\"analyzer\"]", title: "Content Analyzer", text: "Deep analysis of newspaper articles, book excerpts, or song lyrics" }
];

let tourIndex = 0;

function setPage(name) {
  if (state.activePage === name) return;
  const current = document.getElementById(`page-${state.activePage}`);
  if (current) current.classList.add("fade-out");
  setTimeout(() => {
    pages.forEach((page) => page.classList.remove("active", "fade-out"));
    const next = document.getElementById(`page-${name}`);
    if (next) next.classList.add("active");
    navLinks.forEach((link) => link.classList.toggle("active", link.dataset.view === name));
    state.activePage = name;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 200);
}

function buildHeroDots() {
  heroDots.innerHTML = "";
  heroSlides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className = "hero-dot" + (index === 0 ? " active" : "");
    dot.addEventListener("click", () => setHeroIndex(index));
    heroDots.appendChild(dot);
  });
}

function setHeroIndex(index) {
  const slides = heroCarousel.querySelectorAll(".hero-slide");
  const dots = heroDots.querySelectorAll(".hero-dot");
  slides.forEach((slide) => slide.classList.remove("active"));
  dots.forEach((dot) => dot.classList.remove("active"));
  slides[index].classList.add("active");
  dots[index].classList.add("active");
  state.heroIndex = index;
}

function startHeroRotation() {
  clearInterval(state.heroTimer);
  state.heroTimer = setInterval(() => {
    const next = (state.heroIndex + 1) % heroSlides.length;
    setHeroIndex(next);
  }, 5000);
}

function startCarousels() {
  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const slides = carousel.querySelectorAll("img");
    let index = 0;
    const interval = Number(carousel.dataset.interval || "4000");
    const timer = setInterval(() => {
      slides.forEach((img) => img.classList.remove("active"));
      index = (index + 1) % slides.length;
      slides[index].classList.add("active");
    }, interval);
    state.carouselTimers.set(carousel, timer);
  });
}

function setupTopNews() {
  const items = [
    { image: "frontpage", title: "Global leaders finalize AI safety pact" },
    { image: "news", title: "Pakistan announces clean energy roadmap" },
    { image: "news2", title: "Markets rally after tech earnings beat" },
    { image: "frontpage2", title: "Election season intensifies across Europe" },
    { image: "frontpage4", title: "Space agencies unveil moon base timeline" }
  ];

  topNewsRow.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("button");
    card.className = "top-news-card";
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    const img = document.createElement("img");
    img.dataset.picture = item.image;
    img.src = `pictures/${item.image}.jpg`;
    attachPictureFallback(img);
    const badge = document.createElement("span");
    badge.className = "breaking-badge";
    badge.textContent = "BREAKING";
    wrapper.append(img, badge);
    const content = document.createElement("div");
    content.className = "top-news-content";
    content.textContent = item.title;
    card.append(wrapper, content);
    card.addEventListener("click", () => {
      searchInput.value = item.title;
      setPage("search");
    });
    topNewsRow.appendChild(card);
  });
}

function setButtonGroup(group, value) {
  const buttons = group.querySelectorAll("button");
  buttons.forEach((btn) => btn.classList.toggle("active", btn.dataset.value === value));
}

function updateAnalyzerOptions() {
  analyzerFocus.innerHTML = "";
  let options = [];
  if (state.analyzerType === "newspaper") {
    options = [
      { value: "summarize", label: "Summarize Article" },
      { value: "facts", label: "Extract Key Facts" }
    ];
    analyzerLabel.textContent = "Content";
    analyzerInput.placeholder = "Paste the article...";
  }
  if (state.analyzerType === "lyrics") {
    options = [
      { value: "main", label: "Main Message" },
      { value: "insights", label: "Artist Insights" },
      { value: "creative", label: "Creative Suggestions" }
    ];
    analyzerLabel.textContent = "Lyrics";
    analyzerInput.placeholder = "Paste song lyrics here...";
  }
  if (state.analyzerType === "book") {
    options = [
      { value: "summarize", label: "Summarize Excerpt" },
      { value: "themes", label: "Identify Themes" }
    ];
    analyzerLabel.textContent = "Excerpt";
    analyzerInput.placeholder = "Paste the excerpt...";
  }
  options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.dataset.value = option.value;
    btn.textContent = option.label;
    if (index === 0) {
      btn.classList.add("active");
      state.analyzerFocus = option.value;
    }
    btn.addEventListener("click", () => {
      state.analyzerFocus = option.value;
      setButtonGroup(analyzerFocus, option.value);
    });
    analyzerFocus.appendChild(btn);
  });
}

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

async function postJson(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Request failed");
  return res.json();
}

async function handleSearch() {
  const question = searchInput.value.trim();
  if (!question) return;
  setLoading(searchBtn, searchResultCard, searchResult);
  try {
    const data = await postJson("/api/search", { question });
    showResult(searchResultCard, searchResult, data.summary || data.result || data.response || "");
  } catch (error) {
    showResult(searchResultCard, searchResult, "Unable to fetch results right now.");
  } finally {
    clearLoading(searchBtn, searchResult);
  }
}

async function handleSummarize() {
  const text = summarizeInput.value.trim();
  if (!text) return;
  setLoading(summarizeBtn, summarizeResultCard, summarizeResult);
  try {
    const data = await postJson("/api/summarize", { text, length: state.length });
    showResult(summarizeResultCard, summarizeResult, data.summary || data.result || data.response || "");
  } catch (error) {
    showResult(summarizeResultCard, summarizeResult, "Unable to summarize right now.");
  } finally {
    clearLoading(summarizeBtn, summarizeResult);
  }
}

async function handleLyrics() {
  const content = lyricsInput.value.trim();
  if (!content) return;
  setLoading(lyricsBtn, lyricsResultCard, lyricsResult);
  try {
    const data = await postJson("/api/analyze", {
      type: "lyrics",
      analysisType: state.lyricsFocus,
      content
    });
    showResult(lyricsResultCard, lyricsResult, data.analysis || data.result || data.response || "");
  } catch (error) {
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
  const colorMap = {
    noun: "#3b82f6",
    verb: "#10b981",
    adjective: "#f97316",
    adverb: "#7c3aed"
  };
  const color = colorMap[pos] || "#3b82f6";
  return `<span style="display:inline-block;padding:6px 12px;border-radius:999px;background:${color};color:#fff;font-weight:600;font-size:0.8rem;">${pos || "Definition"}</span>`;
}

async function handleDictionary() {
  const word = dictionaryInput.value.trim();
  if (!word) return;
  setLoading(dictionaryBtn, dictionaryResultCard, dictionaryResult);
  try {
    const entry = await lookupWord(word);
    const meaning = entry.meanings?.[0];
    const definition = meaning?.definitions?.[0];
    const phonetic = entry.phonetic || entry.phonetics?.[0]?.text || "";
    const synonyms = definition?.synonyms || meaning?.synonyms || [];
    dictionaryResult.innerHTML = `
      <div style="font-size:2.5rem;font-weight:800;color:#10b981;">${entry.word}</div>
      <div style="margin:6px 0;color:#64748b;font-style:italic;">🔊 ${phonetic}</div>
      ${buildPartOfSpeechBadge(meaning?.partOfSpeech)}
      <div style="margin-top:14px;font-size:1.1rem;line-height:1.8;color:#0f172a;">${definition?.definition || ""}</div>
      ${definition?.example ? `<div style="margin-top:10px;color:#64748b;font-style:italic;border-left:3px solid #10b981;padding-left:12px;">${definition.example}</div>` : ""}
      ${synonyms.length ? `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;">${synonyms.slice(0, 6).map((syn) => `<span style="background:#f1f5f9;padding:4px 10px;border-radius:999px;font-size:0.8rem;">${syn}</span>`).join("")}</div>` : ""}
    `;
    dictionaryResultCard.classList.add("show");
    dictionaryPrompt.value = `Use the word '${entry.word}' in 3 creative sentences showing different contexts and explain its nuance`;
  } catch (error) {
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
    const data = await postJson("/api/analyze", { text: prompt });
    dictionaryGemini.textContent = data.analysis || data.result || data.response || "";
    dictionaryGeminiCard.classList.add("show");
  } catch (error) {
    dictionaryGemini.textContent = "Unable to fetch response right now.";
  } finally {
    clearLoading(dictionaryAsk, dictionaryGemini);
  }
}

async function handleAnalyzer() {
  const content = analyzerInput.value.trim();
  if (!content) return;
  setLoading(analyzerBtn, analyzerResultCard, analyzerResult);
  try {
    const data = await postJson("/api/analyze", {
      type: state.analyzerType,
      analysisType: state.analyzerFocus,
      content
    });
    showResult(analyzerResultCard, analyzerResult, data.analysis || data.result || data.response || "");
  } catch (error) {
    showResult(analyzerResultCard, analyzerResult, "Unable to analyze right now.");
  } finally {
    clearLoading(analyzerBtn, analyzerResult);
  }
}

async function handleBriefing() {
  setLoading(briefingBtn, briefingResult, briefingText);
  try {
    const data = await postJson("/api/briefing", {});
    showResult(briefingResult, briefingText, data.summary || data.result || data.response || "");
  } catch (error) {
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
    list.forEach((item) => {
      const button = document.createElement("button");
      button.textContent = item;
      headlineList.appendChild(button);
    });
    showResult(briefingResult, briefingText, "Headlines loaded below.");
  } catch (error) {
    showResult(briefingResult, briefingText, "Unable to load headlines.");
  } finally {
    clearLoading(headlinesBtn, briefingText);
  }
}

function attachPictureFallback(img) {
  const name = img.dataset.picture;
  if (!name) return;
  const base = "pictures/" + encodeURIComponent(name);
  const extensions = ["jpg", "png", "jpeg", "webp"];
  let index = 0;
  const tryNext = () => {
    if (index >= extensions.length) return;
    img.src = `${base}.${extensions[index]}`;
    index += 1;
  };
  img.onerror = tryNext;
  tryNext();
}

function applyImages() {
  document.querySelectorAll("img[data-picture]").forEach(attachPictureFallback);
}

function initInfoPanels() {
  document.querySelectorAll(".info-panel").forEach((panel) => {
    const toggle = panel.querySelector(".info-toggle");
    toggle.addEventListener("click", () => panel.classList.toggle("open"));
  });
}

function initButtonGroups() {
  const lengthGroup = document.getElementById("lengthGroup");
  lengthGroup.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    state.length = button.dataset.value;
    setButtonGroup(lengthGroup, state.length);
  });

  const lyricsGroup = document.getElementById("lyricsGroup");
  lyricsGroup.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    state.lyricsFocus = button.dataset.value;
    setButtonGroup(lyricsGroup, state.lyricsFocus);
  });

  analyzerType.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    state.analyzerType = button.dataset.value;
    setButtonGroup(analyzerType, state.analyzerType);
    updateAnalyzerOptions();
  });
}

function initResultsActions() {
  document.querySelectorAll(".result-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.target;
      const target = document.getElementById(targetId);
      if (!target) return;
      if (button.dataset.action === "copy") {
        navigator.clipboard.writeText(target.textContent || "");
        const original = button.textContent;
        button.textContent = "✓ Copied!";
        setTimeout(() => { button.textContent = original; }, 2000);
      }
      if (button.dataset.action === "expand") {
        modalContent.textContent = target.textContent || "";
        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");
      }
    });
  });
}

function initSectionReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const children = entry.target.querySelectorAll(":scope > *");
          children.forEach((child, index) => {
            child.classList.add("stagger");
            child.style.transitionDelay = `${index * 0.1}s`;
          });
          entry.target.querySelectorAll(".feature-card").forEach((card, index) => {
            card.style.transitionDelay = `${index * 0.1}s`;
            card.classList.add("show");
          });
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((section, index) => {
    section.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(section);
  });
  document.querySelectorAll(".feature-card").forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
  });
}

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const progress = height > 0 ? (scrollTop / height) * 100 : 0;
  scrollProgress.style.width = `${progress}%`;
  if (scrollTop > 300) {
    backToTop.classList.add("show");
  } else {
    backToTop.classList.remove("show");
  }
}

function openTour() {
  tourOverlay.classList.add("show");
  tourOverlay.setAttribute("aria-hidden", "false");
  showTourStep(0);
}

function closeTour() {
  tourOverlay.classList.remove("show");
  tourOverlay.setAttribute("aria-hidden", "true");
  document.querySelectorAll(".tour-highlight").forEach((el) => el.classList.remove("tour-highlight"));
}

function showTourStep(index) {
  const step = tourSteps[index];
  if (!step) return;
  document.querySelectorAll(".tour-highlight").forEach((el) => el.classList.remove("tour-highlight"));
  const target = document.querySelector(step.selector);
  if (!target) return;
  target.classList.add("tour-highlight");
  const rect = target.getBoundingClientRect();
  tourTitle.textContent = step.title;
  tourText.textContent = step.text;
  const tooltipWidth = tourTooltip.offsetWidth || 240;
  const left = Math.min(rect.right + 12, window.innerWidth - tooltipWidth - 20);
  tourTooltip.style.top = `${rect.top + window.scrollY}px`;
  tourTooltip.style.left = `${Math.max(left, 20)}px`;
  tourIndex = index;
}

function initTourControls() {
  tourPrev.addEventListener("click", () => {
    if (tourIndex > 0) showTourStep(tourIndex - 1);
  });
  tourNext.addEventListener("click", () => {
    if (tourIndex < tourSteps.length - 1) showTourStep(tourIndex + 1);
  });
  tourClose.addEventListener("click", closeTour);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeTour();
  });
}

function initEvents() {
  navLinks.forEach((link) => {
    link.addEventListener("click", () => setPage(link.dataset.view));
  });
  document.querySelectorAll("[data-view]").forEach((link) => {
    link.addEventListener("click", () => {
      const view = link.dataset.view;
      if (view) setPage(view);
    });
  });
  logoButton.addEventListener("click", () => setPage("home"));

  menuBtn.addEventListener("click", () => menuDropdown.classList.toggle("show"));
  aboutCreator.addEventListener("click", () => {
    menuDropdown.classList.remove("show");
    modalContent.textContent = state.aboutText;
    modal.classList.add("show");
  });
  exampleBtn.addEventListener("click", () => {
    menuDropdown.classList.remove("show");
    searchInput.value = "What are the biggest global stories right now?";
    setPage("search");
  });
  helpBtn.addEventListener("click", openTour);

  modalClose.addEventListener("click", () => modal.classList.remove("show"));
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.classList.remove("show");
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") modal.classList.remove("show");
  });

  searchBtn.addEventListener("click", handleSearch);
  summarizeBtn.addEventListener("click", handleSummarize);
  lyricsBtn.addEventListener("click", handleLyrics);
  dictionaryBtn.addEventListener("click", handleDictionary);
  dictionaryAsk.addEventListener("click", handleDictionaryGemini);
  analyzerBtn.addEventListener("click", handleAnalyzer);
  briefingBtn.addEventListener("click", handleBriefing);
  headlinesBtn.addEventListener("click", handleHeadlines);

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", updateScrollProgress);
}

function init() {
  applyImages();
  buildHeroDots();
  startHeroRotation();
  startCarousels();
  setupTopNews();
  initInfoPanels();
  initButtonGroups();
  updateAnalyzerOptions();
  initResultsActions();
  initSectionReveal();
  initTourControls();
  initEvents();
  updateScrollProgress();
}

init();
