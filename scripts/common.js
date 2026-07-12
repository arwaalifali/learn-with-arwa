const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

let fadeInObserver = null;

function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  const viewHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < viewHeight * 0.92 && rect.bottom > 0;
}

function revealFadeInElement(el) {
  if (el.classList.contains("is-visible")) return;
  requestAnimationFrame(() => {
    el.classList.add("is-visible");
  });
}

function observeFadeInElement(el) {
  if (el.dataset.fadeObserved === "true") return;
  el.dataset.fadeObserved = "true";

  if (isElementInViewport(el)) {
    revealFadeInElement(el);
    return;
  }

  if (!fadeInObserver) return;
  fadeInObserver.observe(el);
}

/**
 * Observe fade-in elements within root (document or a subtree).
 * Call after dynamically adding .fade-in-element nodes.
 */
export function observeFadeInElements(root = document) {
  if (!fadeInObserver) {
    fadeInObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          revealFadeInElement(entry.target);
          fadeInObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      }
    );
  }

  root.querySelectorAll(".fade-in-element").forEach(observeFadeInElement);
}

function initFadeInOnScroll() {
  observeFadeInElements();
}

/** Inject a burger toggle into the header so the nav collapses on mobile. */
function initBurgerMenu() {
  const header = document.querySelector(".site-header");
  const navWrap = header?.querySelector(".nav-wrap");
  const navLinks = navWrap?.querySelector(".nav-links");
  if (!header || !navWrap || !navLinks) return;
  if (navWrap.querySelector(".nav-toggle")) return;

  if (!navLinks.id) navLinks.id = "primary-nav";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "nav-toggle";
  btn.setAttribute("aria-label", "Menu");
  btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-controls", navLinks.id);
  btn.innerHTML = "<span></span><span></span><span></span>";
  navWrap.appendChild(btn);

  const close = () => {
    header.classList.remove("nav-open");
    btn.setAttribute("aria-expanded", "false");
  };

  btn.addEventListener("click", () => {
    const open = header.classList.toggle("nav-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  navLinks.addEventListener("click", (event) => {
    if (event.target.closest("a")) close();
  });
  document.addEventListener("click", (event) => {
    if (!header.classList.contains("nav-open")) return;
    if (!navWrap.contains(event.target)) close();
  });
}

const FEEDBACK_POPUP_SEEN_KEY = "feedbackPopupSeen";
const FEEDBACK_POPUP_DELAY_MS = 300000;

function markFeedbackPopupSeen() {
  localStorage.setItem(FEEDBACK_POPUP_SEEN_KEY, "true");
}

function hasSeenFeedbackPopup() {
  return localStorage.getItem(FEEDBACK_POPUP_SEEN_KEY) === "true";
}

function isFeedbackPage() {
  return window.location.pathname.endsWith("feedback.html");
}

function createFeedbackPopup() {
  if (document.getElementById("feedback-popup")) return;

  const popup = document.createElement("div");
  popup.id = "feedback-popup";
  popup.className = "feedback-popup";
  popup.hidden = true;
  popup.innerHTML = `
    <div class="feedback-popup-overlay" data-feedback-close></div>
    <div class="feedback-popup-box" role="dialog" aria-modal="true" aria-labelledby="feedback-popup-title">
      <button type="button" class="feedback-popup-close" aria-label="Close feedback popup" data-feedback-close>&times;</button>
      <h2 id="feedback-popup-title" class="feedback-popup-title">We would love your feedback! 🌙</h2>
      <p class="feedback-popup-subtitle">
        You have been using Learn with Arwa for a few minutes. Would you like to share your thoughts?
      </p>
      <div class="feedback-popup-actions">
        <a href="feedback.html" class="btn btn-primary feedback-popup-give">Give Feedback</a>
        <button type="button" class="btn btn-outline feedback-popup-later" data-feedback-close>Maybe Later</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  popup.querySelectorAll("[data-feedback-close]").forEach((el) => {
    el.addEventListener("click", () => {
      closeFeedbackPopup();
      markFeedbackPopupSeen();
    });
  });

  popup.querySelector(".feedback-popup-give")?.addEventListener("click", () => {
    markFeedbackPopupSeen();
  });
}

function openFeedbackPopup() {
  const popup = document.getElementById("feedback-popup");
  if (!popup) return;
  popup.hidden = false;
  document.body.classList.add("feedback-popup-open");
}

function closeFeedbackPopup() {
  const popup = document.getElementById("feedback-popup");
  if (!popup) return;
  popup.hidden = true;
  document.body.classList.remove("feedback-popup-open");
}

function initFeedbackPopup() {
  if (isFeedbackPage() || hasSeenFeedbackPopup()) return;

  createFeedbackPopup();

  window.setTimeout(() => {
    if (hasSeenFeedbackPopup()) return;
    openFeedbackPopup();
  }, FEEDBACK_POPUP_DELAY_MS);
}

function initCommon() {
  initFadeInOnScroll();
  initBurgerMenu();
  initFeedbackPopup();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCommon);
} else {
  initCommon();
}
