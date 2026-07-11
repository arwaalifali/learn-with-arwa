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

function initCommon() {
  initFadeInOnScroll();
  initBurgerMenu();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCommon);
} else {
  initCommon();
}
