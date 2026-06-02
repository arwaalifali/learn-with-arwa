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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFadeInOnScroll);
} else {
  initFadeInOnScroll();
}
