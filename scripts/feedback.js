import { observeFadeInElements } from "./common.js";

const FEEDBACK_STORAGE_KEY = "learnWithArwaFeedback";

const form = document.getElementById("feedback-form");
const thankYou = document.getElementById("feedback-thank-you");
const ratingInput = document.getElementById("feedback-rating");
const recommendInput = document.getElementById("feedback-recommend");
const starButtons = document.querySelectorAll(".star-rating-star");
const toggleButtons = document.querySelectorAll(".toggle-btn");

function setStarRating(value) {
  if (!ratingInput) return;
  ratingInput.value = String(value);
  starButtons.forEach((star) => {
    const starValue = Number(star.dataset.value);
    star.classList.toggle("is-active", starValue <= value);
    star.setAttribute("aria-checked", starValue === value ? "true" : "false");
  });
}

function initStarRating() {
  starButtons.forEach((star) => {
    star.addEventListener("click", () => {
      setStarRating(Number(star.dataset.value));
      if (ratingInput) ratingInput.setCustomValidity("");
    });
  });
}

function initRecommendToggle() {
  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleButtons.forEach((item) => item.classList.remove("is-active"));
      btn.classList.add("is-active");
      if (recommendInput) recommendInput.value = btn.dataset.value;
    });
  });
}

function getStoredFeedback() {
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFeedback(entry) {
  const existing = getStoredFeedback();
  existing.push(entry);
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(existing));
}

function showThankYou() {
  if (form) form.hidden = true;
  if (thankYou) {
    thankYou.hidden = false;
    observeFadeInElements(thankYou);
  }
  renderFeedbackList();
}

function formatFeedbackDate(isoString) {
  try {
    return new Date(isoString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function createStarsElement(rating) {
  const wrap = document.createElement("div");
  wrap.className = "feedback-card-stars";
  wrap.setAttribute("aria-label", `${rating} out of 5 stars`);
  for (let i = 1; i <= 5; i += 1) {
    const star = document.createElement("span");
    star.className = "feedback-card-star";
    star.textContent = i <= rating ? "★" : "☆";
    star.setAttribute("aria-hidden", "true");
    wrap.appendChild(star);
  }
  return wrap;
}

function createFeedbackBlock(label, text, extraClass = "") {
  const block = document.createElement("div");
  block.className = `feedback-card-block${extraClass ? ` ${extraClass}` : ""}`;

  const heading = document.createElement("p");
  heading.className = "feedback-card-block-label";
  heading.textContent = label;

  const body = document.createElement("p");
  body.className = "feedback-card-block-text";
  body.textContent = text;

  block.append(heading, body);
  return block;
}

function createFeedbackCard(entry) {
  const card = document.createElement("article");
  card.className = "feedback-card fade-in-element";

  const header = document.createElement("div");
  header.className = "feedback-card-header";

  const nameEl = document.createElement("h3");
  nameEl.className = "feedback-card-name";
  nameEl.textContent = entry.name || "Anonymous";

  const meta = document.createElement("div");
  meta.className = "feedback-card-meta";

  const dateEl = document.createElement("time");
  dateEl.className = "feedback-card-date";
  dateEl.dateTime = entry.submittedAt || "";
  dateEl.textContent = formatFeedbackDate(entry.submittedAt);

  const foundEl = document.createElement("span");
  foundEl.className = "feedback-card-found";
  foundEl.textContent = entry.foundVia ? `Found via ${entry.foundVia}` : "";

  const recommendEl = document.createElement("span");
  recommendEl.className = `feedback-card-recommend feedback-card-recommend--${entry.recommend === "no" ? "no" : "yes"}`;
  recommendEl.textContent = entry.recommend === "no" ? "Would not recommend" : "Would recommend";

  meta.append(dateEl);
  if (entry.foundVia) meta.append(foundEl);
  meta.append(recommendEl);

  header.append(nameEl, createStarsElement(entry.rating || 0), meta);

  card.appendChild(header);
  card.appendChild(createFeedbackBlock("What they liked", entry.likes));
  card.appendChild(createFeedbackBlock("Suggested improvement", entry.improve, "feedback-card-block--improve"));

  if (entry.comments) {
    card.appendChild(createFeedbackBlock("Other comments", entry.comments));
  }

  return card;
}

function renderFeedbackList() {
  const listEl = document.getElementById("feedback-list");
  const emptyEl = document.getElementById("feedback-list-empty");
  if (!listEl) return;

  const entries = getStoredFeedback().slice().reverse();
  listEl.replaceChildren();

  if (emptyEl) emptyEl.hidden = entries.length > 0;

  entries.forEach((entry) => {
    listEl.appendChild(createFeedbackCard(entry));
  });

  if (entries.length > 0) {
    observeFadeInElements(listEl);
  }
}

function resetForm() {
  if (!form) return;
  form.reset();
  setStarRating(0);
  toggleButtons.forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.value === "yes");
  });
  if (recommendInput) recommendInput.value = "yes";
  if (ratingInput) ratingInput.value = "";
  starButtons.forEach((star) => {
    star.classList.remove("is-active");
    star.removeAttribute("aria-checked");
  });
}

function handleSubmit(event) {
  event.preventDefault();
  if (!form) return;

  if (!ratingInput?.value) {
    ratingInput.setCustomValidity("Please select a star rating.");
    ratingInput.reportValidity();
    return;
  }
  ratingInput.setCustomValidity("");

  const formData = new FormData(form);
  const entry = {
    id: Date.now(),
    submittedAt: new Date().toISOString(),
    name: String(formData.get("name") || "").trim(),
    foundVia: String(formData.get("foundVia") || ""),
    rating: Number(formData.get("rating")),
    likes: String(formData.get("likes") || "").trim(),
    improve: String(formData.get("improve") || "").trim(),
    recommend: String(formData.get("recommend") || "yes"),
    comments: String(formData.get("comments") || "").trim(),
  };

  saveFeedback(entry);
  resetForm();
  showThankYou();
}

function initFeedbackPage() {
  if (!form) return;
  initStarRating();
  initRecommendToggle();
  form.addEventListener("submit", handleSubmit);
  observeFadeInElements(form);
  renderFeedbackList();
}

initFeedbackPage();
