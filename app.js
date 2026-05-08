/* NEWSIFY front-end logic (vanilla JS). */
const views = {
  welcome: document.getElementById("view-welcome"),
  search: document.getElementById("view-search"),
  summarize: document.getElementById("view-summarize"),
  lyrics: document.getElementById("view-lyrics"),
  dictionary: document.getElementById("view-dictionary"),
  analyze: document.getElementById("view-analyze"),
  briefing: document.getElementById("view-briefing")
};

const navItems = document.querySelectorAll(".nav-item");
const navToggle = document.getElementById("navToggle");
const topnav = document.getElementById("topnav");
const logoHome = document.getElementById("logoHome");
const topbar = document.querySelector(".topbar");
const mainScroll = document.getElementById("mainScroll");

const menuToggle = document.getElementById("menuToggle");
const menuPanel = document.getElementById("menuPanel");
const helpBtn = document.getElementById("helpBtn");
const settingsToggle = document.getElementById("settingsToggle");
const openSettings = document.getElementById("openSettings");

const keyModal = document.getElementById("keyModal");
const keyClose = document.getElementById("keyClose");
const userGeminiKey = document.getElementById("userGeminiKey");
const saveKeys = document.getElementById("saveKeys");
const exampleBtn = document.getElementById("exampleBtn");
const serverStatus = document.getElementById("serverStatus");
const statusText = document.getElementById("statusText");

const errorBanner = document.getElementById("errorBanner");
const connectionCard = document.getElementById("connectionCard");
const loadingPulse = document.getElementById("loadingPulse");
const loader = document.getElementById("loader");

const analyzeType = document.getElementById("analyzeType");
const analyzeStyle = document.getElementById("analyzeStyle");
const lyricsStyle = document.getElementById("lyricsStyle");
const lyricsVisual = document.getElementById("lyricsVisual");
const lyricsHeroImage = document.getElementById("lyricsHeroImage");

const searchQuestion = document.getElementById("searchQuestion");
const searchBtn = document.getElementById("searchBtn");
const searchResult = document.getElementById("searchResult");
const searchMeta = document.getElementById("searchMeta");

const summaryInput = document.getElementById("summaryInput");
const summaryLength = document.getElementById("summaryLength");
const summarizeBtn = document.getElementById("summarizeBtn");
const summaryResult = document.getElementById("summaryResult");

const analyzeInput = document.getElementById("analyzeInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const analyzeResult = document.getElementById("analyzeResult");

const lyricsInput = document.getElementById("lyricsInput");
const lyricsBtn = document.getElementById("lyricsBtn");
const lyricsResult = document.getElementById("lyricsResult");

const dictionaryWord = document.getElementById("dictionaryWord");
const dictionaryBtn = document.getElementById("dictionaryBtn");
const dictionaryResult = document.getElementById("dictionaryResult");

const briefingBtn = document.getElementById("briefingBtn");
const briefingResult = document.getElementById("briefingResult");
const briefingMeta = document.getElementById("briefingMeta");
const deepDiveBtn = document.getElementById("deepDiveBtn");
const deepDiveTopic = document.getElementById("deepDiveTopic");
const headlineGrid = document.getElementById("headlineGrid");
const topHeadlinesBtn = document.getElementById("topHeadlinesBtn");
const topHeadlinesList = document.getElementById("topHeadlinesList");
const breakingTrack = document.getElementById("breakingTrack");
const breakingPrev = document.getElementById("breakingPrev");
const breakingNext = document.getElementById("breakingNext");
const breakingDots = document.getElementById("breakingDots");
const breakingTicker = document.getElementById("breakingTicker");
const briefingHomeBtn = document.getElementById("briefingHomeBtn");
const homeBriefingOutput = document.getElementById("homeBriefingOutput");
const homeBriefingMeta = document.getElementById("homeBriefingMeta");
const homeBriefingResult = document.getElementById("homeBriefingResult");

const searchCarousel = document.getElementById("searchCarousel");
const searchSlides = searchCarousel
  ? Array.from(searchCarousel.querySelectorAll(".hero-slide"))
  : [];

const tourOverlay = document.getElementById("tourOverlay");
const tourTooltip = document.getElementById("tourTooltip");
const tourTitle = document.getElementById("tourTitle");
const tourText = document.getElementById("tourText");
const tourNext = document.getElementById("tourNext");
const tourPrev = document.getElementById("tourPrev");
const tourClose = document.getElementById("tourClose");

const footerLinks = document.querySelectorAll(".footer-link");

const expandModal = document.getElementById("expandModal");
const modalClose = document.getElementById("modalClose");
const modalContent = document.getElementById("modalContent");
const modalTitle = document.getElementById("modalTitle");

const analyzeOptions = {
  newspaper: [
    { value: "summary", label: "Summarize article" },
    { value: "facts", label: "Extract key facts" }
  ],
  book: [
    { value: "summary", label: "Summarize excerpt" },
    { value: "themes", label: "Identify themes" }
  ]
};

const examplePayloads = {
  search: { question: "What is happening with AI regulation?" },
  summarize: { text: "Paste a long article here and get a clean summary." },
  lyrics: { content: "Paste lyrics here.", style: "message" },
  dictionary: { word: "serendipity" },
  analyze: { content: "Paste an article or a book excerpt here.", type: "newspaper", style: "summary" },
  briefing: { deepDive: "Global AI regulation" }
};

let currentView = "welcome";
let overrideKeys = { gemini: "" };
let cachedHeadlines = [];
let breakingIndex = 0;
let breakingTimer = null;
let searchIndex = 0;
let tourStep = 0;

const headlineImages = [
  "pictures/download.jpg",
  "pictures/download%20(1).jpg",
  "pictures/download%20(2).jpg",
  "pictures/download%20(3).jpg",
  "pictures/download%20(4).jpg"
];

const lyricsVisualMap = {
  general: "pictures/download%20(6).jpg",
  taylor: "pictures/taylor%20swift.jpg",
  weeknd: "pictures/download%20(6).jpg",
  travis: "pictures/travis%20scott.jpg",
  rihanna: "pictures/rihanna.jpg",
  "all-too-well": "pictures/all%20too%20well.jpg",
  "love-story": "pictures/love%20story.jpg",
  moth: "pictures/moth%20to%20a%20flame.jpg"
};

function showBanner(message, type = "error") {
  errorBanner.textContent = message;
  errorBanner.classList.add("show");
  errorBanner.classList.toggle("success", type === "success");
}

function clearBanner() {
  errorBanner.textContent = "";
  errorBanner.classList.remove("show", "success");
}

function showConnectionCard(show) {
  if (!connectionCard) return;
  connectionCard.classList.toggle("show", show);
}

function setServerStatus(online) {
  if (!serverStatus || !statusText) return;
  serverStatus.classList.remove("online", "offline");
  serverStatus.classList.add(online ? "online" : "offline");
  statusText.textContent = online ? "Connected" : "Node Server Offline";
}

function handleApiError(error) {
  const hint = " If limits are reached, open Settings and update your Gemini key or try again later.";
  showBanner(`${error.message}${hint}`);
  showConnectionCard(true);
  setServerStatus(false);
}

function toggleLoader(show) {
  loader.classList.toggle("show", show);
  if (loadingPulse && mainScroll) {
    mainScroll.classList.toggle("loading", show);
  }
}

function switchView(viewKey) {
  currentView = viewKey;
  Object.entries(views).forEach(([key, el]) => {
    if (el) el.classList.toggle("active", key === viewKey);
  });

  navItems.forEach(item => {
    item.classList.toggle("active", item.dataset.view === viewKey);
  });

  clearBanner();
  if (mainScroll) {
    mainScroll.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function populateAnalyzeOptions() {
  const options = analyzeOptions[analyzeType.value] || [];
  analyzeStyle.innerHTML = "";
  options.forEach(option => {
    const el = document.createElement("option");
    el.value = option.value;
    el.textContent = option.label;
    analyzeStyle.appendChild(el);
  });
}

async function safeJson(response) {
  const text = await response.text();
  if (!text) {
    throw new Error("Empty response from server. Start the local server with: node server.js");
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error("Invalid JSON response from server.");
  }
}

async function postJson(url, payload) {
  const headers = { "Content-Type": "application/json" };
  if (overrideKeys.gemini) {
    headers["x-gemini-key"] = overrideKeys.gemini;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  const data = await safeJson(response);
  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }
  setServerStatus(true);
  showConnectionCard(false);
  return data;
}

function toggleMenu(show) {
  menuPanel.classList.toggle("show", show);
}

function toggleKeyModal(show) {
  keyModal.classList.toggle("show", show);
  keyModal.setAttribute("aria-hidden", String(!show));
  if (show) {
    checkServerStatus();
  }
}

async function checkServerStatus() {
  try {
    const response = await fetch("/api/briefing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "morning", skipSummary: true })
    });
    if (response.ok) {
      setServerStatus(true);
      showConnectionCard(false);
      return;
    }
  } catch (error) {
    setServerStatus(false);
    showConnectionCard(true);
  }
}

function buildHeadlineCards(headlines) {
  if (!headlineGrid) return;
  const fallback = [
    "Global markets steady as investors await inflation data",
    "AI regulation talks accelerate across major economies",
    "Energy prices fluctuate amid supply concerns",
    "Tech leaders outline new safety standards",
    "Space agencies announce fresh lunar timelines"
  ];
  const list = (headlines && headlines.length ? headlines : fallback).slice(0, 5);
  headlineGrid.innerHTML = "";

  list.forEach((headline, index) => {
    const card = document.createElement("div");
    card.className = "headline-card";
    const image = headlineImages[index % headlineImages.length];
    card.innerHTML = `
      <img src="${image}" alt="Headline image" />
      <span>Top Story</span>
      <h3>${headline}</h3>
    `;
    card.addEventListener("click", () => {
      runSearch(headline);
    });
    headlineGrid.appendChild(card);
  });
}

function buildBreakingSlides(headlines) {
  if (!breakingTrack) return;
  breakingIndex = 0;
  const fallback = [
    "Global markets steady as investors await inflation data",
    "AI regulation talks accelerate across major economies",
    "Energy prices fluctuate amid supply concerns",
    "Tech leaders outline new safety standards",
    "Space agencies announce fresh lunar timelines"
  ];
  const list = (headlines && headlines.length ? headlines : fallback).slice(0, 5);
  breakingTrack.innerHTML = "";
  if (breakingDots) {
    breakingDots.innerHTML = "";
  }

  list.forEach((headline, index) => {
    const slide = document.createElement("div");
    slide.className = "breaking-slide";
    if (index === 0) slide.classList.add("active");
    const image = headlineImages[index % headlineImages.length];
    slide.innerHTML = `
      <img src="${image}" alt="Breaking headline" />
      <div class="breaking-overlay">
        <button type="button">${headline}</button>
      </div>
    `;
    slide.querySelector("button").addEventListener("click", () => runSearch(headline));
    breakingTrack.appendChild(slide);

    if (breakingDots) {
      const dot = document.createElement("span");
      dot.className = "slider-dot";
      if (index === 0) {
        dot.classList.add("active");
      }
      dot.addEventListener("click", () => {
        const slides = Array.from(breakingTrack.children);
        slides[breakingIndex]?.classList.remove("active");
        breakingIndex = index;
        slides[breakingIndex]?.classList.add("active");
        updateBreakingDots();
        startBreakingAuto();
      });
      breakingDots.appendChild(dot);
    }
  });
}

function buildBreakingTicker(headlines) {
  if (!breakingTicker) return;
  const fallback = [
    "Global markets steady as investors await inflation data",
    "AI regulation talks accelerate across major economies",
    "Energy prices fluctuate amid supply concerns",
    "Tech leaders outline new safety standards",
    "Space agencies announce fresh lunar timelines"
  ];
  const list = (headlines && headlines.length ? headlines : fallback).slice(0, 5);
  const items = list.map(text => `<span class="ticker-item">${text}</span>`).join("");
  breakingTicker.innerHTML = items + items;
}

function updateBreakingDots() {
  if (!breakingDots) return;
  Array.from(breakingDots.children).forEach((dot, index) => {
    dot.classList.toggle("active", index === breakingIndex);
  });
}

function rotateBreaking(next = true) {
  if (!breakingTrack) return;
  const slides = Array.from(breakingTrack.children);
  if (!slides.length) return;
  slides[breakingIndex].classList.remove("active");
  breakingIndex = next
    ? (breakingIndex + 1) % slides.length
    : (breakingIndex - 1 + slides.length) % slides.length;
  slides[breakingIndex].classList.add("active");
  updateBreakingDots();
}

function startBreakingAuto() {
  if (breakingTimer) clearInterval(breakingTimer);
  breakingTimer = setInterval(() => rotateBreaking(true), 5000);
}

function renderHeadlineList(headlines) {
  if (!topHeadlinesList) return;
  topHeadlinesList.innerHTML = "";
  if (!headlines.length) {
    topHeadlinesList.textContent = "No headlines available yet.";
    return;
  }
  headlines.slice(0, 8).forEach((headline) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = headline;
    button.addEventListener("click", () => runSearch(headline));
    topHeadlinesList.appendChild(button);
  });
}

async function loadHeadlines() {
  try {
    const data = await postJson("/api/briefing", { mode: "morning", skipSummary: true });
    cachedHeadlines = data.headlines || [];
    buildHeadlineCards(cachedHeadlines);
    buildBreakingSlides(cachedHeadlines);
    buildBreakingTicker(cachedHeadlines);
    startBreakingAuto();
  } catch (error) {
    buildHeadlineCards([]);
    buildBreakingSlides([]);
    buildBreakingTicker([]);
    startBreakingAuto();
    setServerStatus(false);
  }
}

function handleResultAction(action, targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;

  if (action === "expand") {
    modalTitle.textContent = "Expanded View";
    modalContent.textContent = target.textContent || "";
    expandModal.classList.add("show");
    expandModal.setAttribute("aria-hidden", "false");
    return;
  }

  if (action === "copy") {
    const text = target.textContent || "";
    navigator.clipboard.writeText(text).then(() => {
      showBanner("Copied! Use Ctrl+V to paste.", "success");
      setTimeout(clearBanner, 2000);
    });
    return;
  }

  if (action === "share") {
    const text = target.textContent || "";
    if (navigator.share) {
      navigator.share({ text }).catch(() => {
        navigator.clipboard.writeText(text);
        showBanner("Shared via clipboard.", "success");
        setTimeout(clearBanner, 2000);
      });
    } else {
      navigator.clipboard.writeText(text);
      showBanner("Shared via clipboard.", "success");
      setTimeout(clearBanner, 2000);
    }
  }
}

function animateResult(element) {
  if (!element) return;
  element.classList.remove("result-show");
  void element.offsetWidth;
  element.classList.add("result-show");
}

function startSearchCarousel() {
  if (!searchSlides.length) return;
  searchSlides.forEach((slide, index) => {
    slide.classList.toggle("active", index === 0);
  });
  setInterval(() => {
    searchSlides[searchIndex].classList.remove("active");
    searchIndex = (searchIndex + 1) % searchSlides.length;
    searchSlides[searchIndex].classList.add("active");
  }, 4500);
}

function updateLyricsVisual() {
  if (!lyricsHeroImage || !lyricsVisual) return;
  const key = lyricsVisual.value;
  lyricsHeroImage.src = lyricsVisualMap[key] || lyricsVisualMap.general;
}

// Navigation and menu handling.
navItems.forEach(item => {
  item.addEventListener("click", () => {
    switchView(item.dataset.view);
    topnav.classList.remove("show");
  });
});

logoHome.addEventListener("click", () => switchView("welcome"));

navToggle.addEventListener("click", () => {
  topnav.classList.toggle("show");
});

menuToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleMenu(!menuPanel.classList.contains("show"));
});

document.addEventListener("click", (event) => {
  if (!menuPanel.contains(event.target) && !menuToggle.contains(event.target)) {
    toggleMenu(false);
  }
});

menuPanel.addEventListener("click", (event) => {
  event.stopPropagation();
});

document.querySelectorAll("[data-theme]").forEach(button => {
  button.addEventListener("click", () => {
    document.body.setAttribute("data-theme", button.dataset.theme);
    toggleMenu(false);
  });
});

exampleBtn.addEventListener("click", () => {
  const payload = examplePayloads[currentView];
  if (!payload) return;

  if (currentView === "search") {
    searchQuestion.value = payload.question;
  }
  if (currentView === "summarize") {
    summaryInput.value = payload.text;
  }
  if (currentView === "lyrics") {
    lyricsInput.value = payload.content;
    lyricsStyle.value = payload.style;
  }
  if (currentView === "dictionary") {
    dictionaryWord.value = payload.word;
  }
  if (currentView === "analyze") {
    analyzeType.value = payload.type;
    populateAnalyzeOptions();
    analyzeStyle.value = payload.style;
    analyzeInput.value = payload.content;
  }
  if (currentView === "briefing") {
    deepDiveTopic.value = payload.deepDive;
  }
  toggleMenu(false);
});

if (settingsToggle) {
  settingsToggle.addEventListener("click", () => {
    toggleMenu(false);
    toggleKeyModal(true);
  });
}

if (openSettings) {
  openSettings.addEventListener("click", () => {
    toggleKeyModal(true);
  });
}

keyClose.addEventListener("click", () => toggleKeyModal(false));
keyModal.addEventListener("click", (event) => {
  if (event.target === keyModal) {
    toggleKeyModal(false);
  }
});

saveKeys.addEventListener("click", () => {
  overrideKeys = {
    gemini: userGeminiKey.value.trim()
  };
  toggleKeyModal(false);
});

modalClose.addEventListener("click", () => {
  expandModal.classList.remove("show");
  expandModal.setAttribute("aria-hidden", "true");
});

if (breakingPrev && breakingNext) {
  breakingPrev.addEventListener("click", () => rotateBreaking(false));
  breakingNext.addEventListener("click", () => rotateBreaking(true));
}

if (briefingHomeBtn) {
  briefingHomeBtn.addEventListener("click", async () => {
    switchView("welcome");
    await runBriefing(homeBriefingResult, homeBriefingMeta, homeBriefingOutput);
  });
}

if (topHeadlinesBtn) {
  topHeadlinesBtn.addEventListener("click", async () => {
    if (!cachedHeadlines.length) {
      try {
        const data = await postJson("/api/briefing", { mode: "morning", skipSummary: true });
        cachedHeadlines = data.headlines || [];
      } catch (error) {
        cachedHeadlines = [];
      }
    }
    renderHeadlineList(cachedHeadlines);
  });
}

if (helpBtn) {
  helpBtn.addEventListener("click", () => {
    startTour();
  });
}

lyricsVisual?.addEventListener("change", updateLyricsVisual);

// Feature actions.
async function runSearch(question) {
  const trimmed = question.trim();
  if (!trimmed) {
    showBanner("Please enter a question.");
    return;
  }
  searchQuestion.value = trimmed;
  switchView("search");

  toggleLoader(true);
  searchResult.textContent = "";
  searchMeta.textContent = "";

  try {
    const data = await postJson("/api/search", { question: trimmed });
    searchResult.textContent = data.summary;
    searchMeta.textContent = `Articles found and combined: ${data.articleCount} • ${data.fromDate} → ${data.toDate}`;
    animateResult(searchResult);
    clearBanner();
  } catch (error) {
    handleApiError(error);
  } finally {
    toggleLoader(false);
  }
}

searchBtn.addEventListener("click", async () => {
  await runSearch(searchQuestion.value);
});

summarizeBtn.addEventListener("click", async () => {
  const text = summaryInput.value.trim();
  if (!text) {
    showBanner("Please paste text to summarize.");
    return;
  }

  toggleLoader(true);
  summaryResult.textContent = "";

  try {
    const data = await postJson("/api/summarize", {
      text,
      length: summaryLength.value
    });
    summaryResult.textContent = data.summary;
    animateResult(summaryResult);
    clearBanner();
  } catch (error) {
    handleApiError(error);
  } finally {
    toggleLoader(false);
  }
});

dictionaryBtn.addEventListener("click", async () => {
  const word = dictionaryWord.value.trim();
  if (!word) {
    showBanner("Enter a word to define.");
    return;
  }

  toggleLoader(true);
  dictionaryResult.innerHTML = "";

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!response.ok) {
      throw new Error("No definition found.");
    }
    const data = await response.json();
    const entry = data[0] || {};
    const phonetic = entry.phonetic || (entry.phonetics && entry.phonetics[0] && entry.phonetics[0].text) || "N/A";
    const meaning = entry.meanings && entry.meanings[0];
    const definition = meaning && meaning.definitions && meaning.definitions[0];
    const partOfSpeech = meaning && meaning.partOfSpeech ? meaning.partOfSpeech : "n/a";
    const defText = definition && definition.definition ? definition.definition : "No definition found.";
    const example = definition && definition.example ? definition.example : "No example provided.";

    dictionaryResult.innerHTML = `
      <div class="dict-word">${entry.word || word}</div>
      <div class="dict-phonetic">${phonetic} • ${partOfSpeech}</div>
      <div class="dict-definition">${defText}</div>
      <div class="dict-example">${example}</div>
    `;
    animateResult(dictionaryResult);
    clearBanner();
  } catch (error) {
    showBanner(error.message);
  } finally {
    toggleLoader(false);
  }
});

analyzeBtn.addEventListener("click", async () => {
  const text = analyzeInput.value.trim();
  if (!text) {
    showBanner("Please paste content to analyze.");
    return;
  }

  toggleLoader(true);
  analyzeResult.textContent = "";

  try {
    const data = await postJson("/api/analyze", {
      content: text,
      contentType: analyzeType.value,
      analysisType: analyzeStyle.value
    });
    analyzeResult.textContent = data.result;
    animateResult(analyzeResult);
    clearBanner();
  } catch (error) {
    handleApiError(error);
  } finally {
    toggleLoader(false);
  }
});

if (lyricsBtn) {
  lyricsBtn.addEventListener("click", async () => {
    const text = lyricsInput.value.trim();
    if (!text) {
      showBanner("Please paste lyrics to analyze.");
      return;
    }

    toggleLoader(true);
    lyricsResult.textContent = "";

    try {
      const data = await postJson("/api/analyze", {
        content: text,
        contentType: "lyrics",
        analysisType: lyricsStyle.value
      });
      lyricsResult.textContent = data.result;
      animateResult(lyricsResult);
      clearBanner();
    } catch (error) {
      handleApiError(error);
    } finally {
      toggleLoader(false);
    }
  });
}

async function runBriefing(resultEl, metaEl, outputEl) {
  toggleLoader(true);
  if (resultEl) resultEl.textContent = "";
  if (metaEl) metaEl.textContent = "";

  try {
    const data = await postJson("/api/briefing", { mode: "morning" });
    if (resultEl) resultEl.textContent = data.briefing;
    if (metaEl) {
      metaEl.textContent = `Articles found and combined: ${data.articleCount} • ${data.fromDate} → ${data.toDate}`;
    }
    if (outputEl) outputEl.classList.add("show");
    if (resultEl) animateResult(resultEl);
    clearBanner();
  } catch (error) {
    handleApiError(error);
  } finally {
    toggleLoader(false);
  }
}

briefingBtn.addEventListener("click", async () => {
  await runBriefing(briefingResult, briefingMeta);
});

deepDiveBtn.addEventListener("click", async () => {
  const topic = deepDiveTopic.value.trim();
  if (!topic) {
    showBanner("Enter a topic for deep dive.");
    return;
  }

  toggleLoader(true);
  briefingResult.textContent = "";
  briefingMeta.textContent = "";

  try {
    const data = await postJson("/api/briefing", {
      mode: "deep-dive",
      deepDiveTopic: topic
    });
    briefingResult.textContent = data.briefing;
    briefingMeta.textContent = `Articles found and combined: ${data.articleCount} • ${data.fromDate} → ${data.toDate}`;
    animateResult(briefingResult);
    clearBanner();
  } catch (error) {
    handleApiError(error);
  } finally {
    toggleLoader(false);
  }
});

document.querySelectorAll(".info-btn").forEach(button => {
  button.addEventListener("click", () => {
    const parent = button.closest(".info-collapsible");
    parent.classList.toggle("open");
  });
});

document.querySelectorAll(".result-action").forEach(button => {
  button.addEventListener("click", () => {
    handleResultAction(button.dataset.action, button.dataset.target);
  });
});

document.querySelectorAll(".feature-tile").forEach(tile => {
  tile.addEventListener("click", () => {
    const target = tile.dataset.target;
    if (target) {
      switchView(target);
    }
  });
});

footerLinks.forEach(link => {
  link.addEventListener("click", () => {
    const target = link.dataset.view;
    if (target) {
      switchView(target);
    }
  });
});

if (mainScroll) {
  mainScroll.addEventListener("scroll", () => {
    if (!topbar) return;
    topbar.classList.toggle("scrolled", mainScroll.scrollTop > 10);
  });
}

const tourSteps = [
  {
    title: "Search News",
    text: "Search News — ask any question, get a full AI briefing",
    selector: ".nav-item[data-view=\"search\"]"
  },
  {
    title: "Summarize Text",
    text: "Summarize Text — paste anything, choose length, get the gist",
    selector: ".nav-item[data-view=\"summarize\"]"
  },
  {
    title: "Lyrics Analysis",
    text: "Lyrics Analysis — paste song lyrics, get message, themes, artist insights",
    selector: ".nav-item[data-view=\"lyrics\"]"
  },
  {
    title: "Dictionary",
    text: "Dictionary — instant free word definitions, no API key needed",
    selector: ".nav-item[data-view=\"dictionary\"]"
  },
  {
    title: "Content Analyzer",
    text: "Content Analyzer — newspaper, book, or article deep analysis",
    selector: ".nav-item[data-view=\"analyze\"]"
  }
];

function clearTourHighlight() {
  document.querySelectorAll(".tour-highlight").forEach(el => {
    el.classList.remove("tour-highlight");
  });
}

function startTour() {
  tourStep = 0;
  tourOverlay.classList.add("show");
  tourOverlay.setAttribute("aria-hidden", "false");
  showTourStep();
}

function showTourStep() {
  const step = tourSteps[tourStep];
  if (!step) {
    stopTour();
    return;
  }
  tourTitle.textContent = step.title;
  tourText.textContent = step.text;
  clearTourHighlight();
  const target = document.querySelector(step.selector);
  if (target) {
    target.classList.add("tour-highlight");
    positionTourTooltip(target);
  }
}

function positionTourTooltip(target) {
  if (!tourTooltip || !target) return;
  const rect = target.getBoundingClientRect();
  const tooltipRect = tourTooltip.getBoundingClientRect();
  const padding = 12;
  let top = rect.top + window.scrollY + rect.height / 2 - tooltipRect.height / 2;
  let left = rect.right + window.scrollX + padding;

  if (left + tooltipRect.width > window.innerWidth - padding) {
    left = rect.left + window.scrollX - tooltipRect.width - padding;
  }

  if (top < padding) top = padding;
  if (top + tooltipRect.height > window.innerHeight - padding) {
    top = window.innerHeight - tooltipRect.height - padding;
  }

  tourTooltip.style.top = `${top}px`;
  tourTooltip.style.left = `${left}px`;
}

function stopTour() {
  tourOverlay.classList.remove("show");
  tourOverlay.setAttribute("aria-hidden", "true");
  clearTourHighlight();
}

tourNext.addEventListener("click", () => {
  tourStep += 1;
  if (tourStep >= tourSteps.length) {
    stopTour();
    return;
  }
  showTourStep();
});

tourPrev.addEventListener("click", () => {
  tourStep = Math.max(0, tourStep - 1);
  showTourStep();
});

tourClose.addEventListener("click", () => {
  stopTour();
});

tourOverlay.addEventListener("click", (event) => {
  if (event.target === tourOverlay) {
    stopTour();
  }
});

window.addEventListener("resize", () => {
  const step = tourSteps[tourStep];
  if (!tourOverlay.classList.contains("show") || !step) return;
  const target = document.querySelector(step.selector);
  if (target) positionTourTooltip(target);
});

// Ripple effect.
document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const circle = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const rect = button.getBoundingClientRect();
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - rect.left - diameter / 2}px`;
  circle.style.top = `${event.clientY - rect.top - diameter / 2}px`;
  circle.classList.add("ripple-circle");
  const ripple = button.querySelector(".ripple-circle");
  if (ripple) ripple.remove();
  button.appendChild(circle);
});

// Init
populateAnalyzeOptions();
loadHeadlines();
startSearchCarousel();
updateLyricsVisual();
setServerStatus(false);
