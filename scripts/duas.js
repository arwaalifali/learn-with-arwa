import { observeFadeInElements } from "./common.js";

const searchInput = document.getElementById("dua-search");
const searchEmpty = document.getElementById("dua-search-empty");
const duaGroups = document.querySelectorAll(".dua-group");

function filterDuas(query) {
  const normalizedQuery = query.trim().toLowerCase();
  const arabicQuery = query.trim();
  let visibleCount = 0;

  duaGroups.forEach((group) => {
    const heading = group.querySelector(".dua-group-heading")?.textContent ?? "";
    let groupVisible = 0;

    group.querySelectorAll(".dua-card").forEach((card) => {
      const arabic = card.querySelector(".dua-ar")?.textContent ?? "";
      const english = card.querySelector(".dua-en")?.textContent ?? "";
      const source = card.querySelector(".dua-source")?.textContent ?? "";

      const matches =
        !normalizedQuery ||
        heading.toLowerCase().includes(normalizedQuery) ||
        english.toLowerCase().includes(normalizedQuery) ||
        source.toLowerCase().includes(normalizedQuery) ||
        arabic.includes(arabicQuery);

      card.classList.toggle("is-hidden", !matches);
      if (matches) groupVisible += 1;
    });

    group.classList.toggle("is-hidden", normalizedQuery.length > 0 && groupVisible === 0);
    visibleCount += groupVisible;
  });

  if (searchEmpty) {
    searchEmpty.hidden = !(normalizedQuery.length > 0 && visibleCount === 0);
  }
}

if (searchInput) {
  searchInput.addEventListener("input", (event) => {
    filterDuas(event.target.value);
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      searchInput.value = "";
      filterDuas("");
      searchInput.blur();
    }
  });
}

observeFadeInElements(document.querySelector(".duas-container"));
