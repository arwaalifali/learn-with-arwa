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
}

initFeedbackPage();
