/* NEWSIFY front-end logic (vanilla JS). */
const views = {
  welcome: document.getElementById("view-welcome"),
  search: document.getElementById("view-search"),
  summarize: document.getElementById("view-summarize"),
  analyze: document.getElementById("view-analyze"),
  briefing: document.getElementById("view-briefing")
};

const navItems = document.querySelectorAll(".nav-item");
const pageTitle = document.getElementById("pageTitle");
const todayLabel = document.getElementById("todayLabel");
const statusPill = document.getElementById("statusPill");
const loader = document.getElementById("loader");
const toast = document.getElementById("toast");

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

const briefingBtn = document.getElementById("briefingBtn");
const briefingResult = document.getElementById("briefingResult");
const briefingMeta = document.getElementById("briefingMeta");
const deepDiveBtn = document.getElementById("deepDiveBtn");
const deepDiveTopic = document.getElementById("deepDiveTopic");

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

// Simple toast feedback for errors and confirmations.
function showToast(message, isError = false) {
  toast.textContent = message;
  toast.style.borderColor = isError ? "#ff6b6b" : "rgba(255,255,255,0.2)";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2800);
}

function setStatus(label) {
  statusPill.textContent = label;
}

function toggleLoader(show) {
  loader.classList.toggle("show", show);
  setStatus(show ? "Working" : "Idle");
}

function switchView(viewKey) {
  Object.entries(views).forEach(([key, el]) => {
    el.classList.toggle("active", key === viewKey);
  });

  navItems.forEach(item => {
    item.classList.toggle("active", item.dataset.view === viewKey);
  });

  const titleMap = {
    welcome: "Welcome to NEWSIFY",
    search: "Search News",
    summarize: "Summarize Text",
    analyze: "Analyze Content",
    briefing: "Morning Briefing"
  };

  pageTitle.textContent = titleMap[viewKey];
}

// Build analysis options based on selected content type.
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

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }
  return data;
}

navItems.forEach(item => {
  item.addEventListener("click", () => {
    switchView(item.dataset.view);
  });
});

searchBtn.addEventListener("click", async () => {
  const question = searchQuestion.value.trim();
  if (!question) {
    showToast("Please enter a question.", true);
    return;
  }

  toggleLoader(true);
  searchResult.textContent = "";
  searchMeta.textContent = "";

  try {
    const data = await postJson("/api/search", { question });
    searchResult.textContent = data.summary;
    searchMeta.textContent = `Articles: ${data.articleCount} • Date range: ${data.fromDate} → ${data.toDate}`;
  } catch (error) {
    searchResult.textContent = "";
    showToast(error.message, true);
  } finally {
    toggleLoader(false);
  }
});

summarizeBtn.addEventListener("click", async () => {
  const text = summaryInput.value.trim();
  if (!text) {
    showToast("Please paste text to summarize.", true);
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
  } catch (error) {
    showToast(error.message, true);
  } finally {
    toggleLoader(false);
  }
});

analyzeBtn.addEventListener("click", async () => {
  const text = analyzeInput.value.trim();
  if (!text) {
    showToast("Please paste content to analyze.", true);
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
  } catch (error) {
    showToast(error.message, true);
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
    briefingMeta.textContent = `Articles: ${data.articleCount} • Date range: ${data.fromDate} → ${data.toDate}`;
  } catch (error) {
    showToast(error.message, true);
  } finally {
    toggleLoader(false);
  }
});

deepDiveBtn.addEventListener("click", async () => {
  const topic = deepDiveTopic.value.trim();
  if (!topic) {
    showToast("Enter a topic for deep dive.", true);
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
    briefingMeta.textContent = `Articles: ${data.articleCount} • Date range: ${data.fromDate} → ${data.toDate}`;
  } catch (error) {
    showToast(error.message, true);
  } finally {
    toggleLoader(false);
  }
});

analyzeType.addEventListener("change", populateAnalyzeOptions);

// Initialize UI state on load.
populateAnalyzeOptions();
const today = new Date();
const formatted = today.toLocaleDateString(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric"
});

todayLabel.textContent = formatted.toUpperCase();
