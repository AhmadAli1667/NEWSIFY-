/* NEWSIFY front-end logic (vanilla JS). */
const views = {
  welcome: document.getElementById("view-welcome"),
  search: document.getElementById("view-search"),
  summarize: document.getElementById("view-summarize"),
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

const tourOverlay = document.getElementById("tourOverlay");
const tourTitle = document.getElementById("tourTitle");
const tourText = document.getElementById("tourText");
const tourNext = document.getElementById("tourNext");
const tourSkip = document.getElementById("tourSkip");

const footerLinks = document.querySelectorAll(".footer-link");

const feedbackForm = document.getElementById("feedbackForm");
const feedbackName = document.getElementById("feedbackName");
const feedbackEmail = document.getElementById("feedbackEmail");
const feedbackMessage = document.getElementById("feedbackMessage");

const expandModal = document.getElementById("expandModal");
const modalClose = document.getElementById("modalClose");
const modalContent = document.getElementById("modalContent");
const modalTitle = document.getElementById("modalTitle");

const analyzeOptions = {
  newspaper: [
    { value: "summary", label: "Summarize article" },
    { value: "facts", label: "Extract key facts" }
  ],
  lyrics: [
    { value: "message", label: "Analyze main message" },
    { value: "insights", label: "Artist insights" },
    { value: "creative", label: "Suggest creative uses" }
  ],
  book: [
    { value: "summary", label: "Summarize excerpt" },
    { value: "themes", label: "Identify themes" }
  ]
};

const examplePayloads = {
  search: { question: "What is happening with AI regulation?" },
  summarize: { text: "Paste a long article here and get a clean summary." },
  dictionary: { word: "serendipity" },
  analyze: { content: "Paste lyrics or a book excerpt here.", type: "lyrics", style: "message" },
  briefing: { deepDive: "Global AI regulation" }
};

let currentView = "welcome";
let overrideKeys = { gemini: "" };
let cachedHeadlines = [];
let breakingIndex = 0;
let breakingTimer = null;
let tourStep = 0;

const headlineImages = [
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80"
];

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
    el.classList.toggle("active", key === viewKey);
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
  const list = (headlines && headlines.length ? headlines : fallback).slice(0, 6);
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
    startBreakingAuto();
  } catch (error) {
    buildHeadlineCards([]);
    buildBreakingSlides([]);
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

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    expandModal.classList.remove("show");
    keyModal.classList.remove("show");
    tourOverlay.classList.remove("show");
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

if (helpBtn) {
  helpBtn.addEventListener("click", () => {
    startTour();
  });
}

if (breakingPrev && breakingNext) {
  breakingPrev.addEventListener("click", () => rotateBreaking(false));
  breakingNext.addEventListener("click", () => rotateBreaking(true));
}

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
  dictionaryResult.textContent = "";

  try {
    const data = await postJson("/api/dictionary", { word });
    const lines = (data.definitions || []).map((item, index) => {
      const example = item.example ? `Example: ${item.example}` : "Example: N/A";
      return `${index + 1}. (${item.partOfSpeech || "n/a"}) ${item.definition}\n${example}`;
    });
    const phonetic = data.phonetic ? `Phonetic: ${data.phonetic}` : "Phonetic: N/A";
    dictionaryResult.textContent = `${data.word}\n${phonetic}\n\n${lines.join("\n\n")}`;
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
    clearBanner();
  } catch (error) {
    handleApiError(error);
  } finally {
    toggleLoader(false);
  }
});

briefingBtn.addEventListener("click", async () => {
  toggleLoader(true);
  briefingResult.textContent = "";
  briefingMeta.textContent = "";

  try {
    const data = await postJson("/api/briefing", { mode: "morning" });
    briefingResult.textContent = data.briefing;
    briefingMeta.textContent = `Articles found and combined: ${data.articleCount} • ${data.fromDate} → ${data.toDate}`;
    clearBanner();
  } catch (error) {
    handleApiError(error);
  } finally {
    toggleLoader(false);
  }
});

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
    clearBanner();
  } catch (error) {
    handleApiError(error);
  } finally {
    toggleLoader(false);
  }
});

feedbackForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = feedbackMessage.value.trim();
  if (!message) {
    showBanner("Please write a feedback message.");
    return;
  }

  toggleLoader(true);
  try {
    await postJson("/api/feedback", {
      name: feedbackName.value.trim(),
      email: feedbackEmail.value.trim(),
      message
    });
    feedbackMessage.value = "";
    showBanner("Feedback saved.", "success");
    setTimeout(clearBanner, 2000);
  } catch (error) {
    showBanner(error.message);
  } finally {
    toggleLoader(false);
  }
});

analyzeType.addEventListener("change", populateAnalyzeOptions);

if (mainScroll) {
  mainScroll.addEventListener("scroll", () => {
    if (!topbar) return;
    topbar.classList.toggle("scrolled", mainScroll.scrollTop > 10);
  });
}

const tourSteps = [
  {
    title: "Top Navigation",
    text: "Use these tabs to switch features instantly.",
    selector: ".topnav"
  },
  {
    title: "Breaking News",
    text: "Click any breaking headline to auto-run a news briefing.",
    selector: ".breaking-slider"
  },
  {
    title: "Input Theater",
    text: "Drop your question or text here, then hit Generate.",
    selector: ".input-theater"
  },
  {
    title: "Reading Pane",
    text: "Results appear here with Copy and Share actions.",
    selector: ".reading-pane"
  },
  {
    title: "Settings",
    text: "Manage your Gemini key and check server status.",
    selector: "#settingsToggle"
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
    tourOverlay.classList.remove("show");
    tourOverlay.setAttribute("aria-hidden", "true");
    clearTourHighlight();
    return;
  }
  tourTitle.textContent = step.title;
  tourText.textContent = step.text;
  clearTourHighlight();
  const target = document.querySelector(step.selector);
  if (target) {
    target.classList.add("tour-highlight");
    target.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

tourNext.addEventListener("click", () => {
  tourStep += 1;
  showTourStep();
});

tourSkip.addEventListener("click", () => {
  tourOverlay.classList.remove("show");
  tourOverlay.setAttribute("aria-hidden", "true");
  clearTourHighlight();
});

tourOverlay.addEventListener("click", (event) => {
  if (event.target === tourOverlay) {
    tourOverlay.classList.remove("show");
    tourOverlay.setAttribute("aria-hidden", "true");
    clearTourHighlight();
  }
});

// Init
populateAnalyzeOptions();
loadHeadlines();
setServerStatus(false);
