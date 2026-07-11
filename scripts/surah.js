import { observeFadeInElements } from "./common.js";

const viewer = document.getElementById("surah-viewer");
let followState = null;
let followDockHandlersBound = false;
let surahViewerAyahClickBound = false;
const followPlayPauseBtn = document.getElementById("follow-btn-play-pause");
const followDockStatus = document.getElementById("follow-dock-status");
const followDockSurahEl = document.getElementById("follow-dock-surah");
const followDockAyahEl = document.getElementById("follow-dock-ayah");
const reciterSelect = document.getElementById("reciter-select");
const reciterPickerSelect = document.getElementById("reciter-picker-select");

const RECITERS = {
  husri: {
    label: "Mahmoud Al-Husri",
    fullBaseUrl: "https://server13.mp3quran.net/husr",
    ayahFolder: "Husary_128kbps",
  },
  abdulbasit: {
    label: "Abdul Basit Abdul Samad",
    fullBaseUrl: "https://server7.mp3quran.net/basit",
    ayahFolder: "AbdulSamad_64kbps_QuranExplorer.Com",
  },
  sudais: {
    label: "Sudais",
    fullBaseUrl: "https://server11.mp3quran.net/sds",
    ayahFolder: "Abdurrahmaan_As-Sudais_192kbps",
  },
  shureim: {
    label: "Shureim",
    fullBaseUrl: "https://server7.mp3quran.net/shur",
    ayahFolder: "Saood_ash-Shuraym_128kbps",
  },
  ghamdi: {
    label: "Saad Al-Ghamdi",
    fullBaseUrl: "https://server7.mp3quran.net/s_gmd",
    ayahFolder: "Ghamadi_40kbps",
  },
  shatri: {
    label: "Abu Bakr Al-Shatri",
    fullBaseUrl: "https://server11.mp3quran.net/shatri",
    ayahFolder: "Abu_Bakr_Ash-Shaatree_64kbps",
  },
  muaiqly: {
    label: "Maher Al-Muaiqly",
    fullBaseUrl: "https://server12.mp3quran.net/maher",
    ayahFolder: "Maher_AlMuaiqly_64kbps",
  },
  minshawi: {
    label: "Muhammad Al-Minshawi",
    fullBaseUrl: "https://server10.mp3quran.net/minsh",
    ayahFolder: "Minshawy_Murattal_128kbps",
  },
  afasy: {
    label: "Mishary Al-Afasy",
    fullBaseUrl: "https://server8.mp3quran.net/afs",
    ayahFolder: "Alafasy_128kbps",
  },
  hanirrifai: {
    label: "Hani Ar-Rifai",
    fullBaseUrl: "https://server8.mp3quran.net/hani",
    ayahFolder: "Hani_Rifai_64kbps",
  },
};
const DEFAULT_RECITER = "husri";
const STORAGE_SELECTED_RECITER = "selected-reciter";
const STORAGE_AUTOPLAY = "autoplay";
const STORAGE_SHOW_TRANSLATION = "show-translation";
const LAST_SURAH_ID = 114;

const BISMILLAH_HEADER_HTML = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ";

/** Decorative octagon ayah-number marker holding the verse number (fits 1-3 digits). */
function ayahNumberMarker(n) {
  const digits = String(n).length;
  const fs = digits >= 3 ? 12 : digits === 2 ? 15 : 18;
  return `<svg class="ayah-nummark" width="30" height="30" viewBox="0 0 48 48" role="img" aria-label="Ayah ${n}"><polygon points="43.4,32 32,43.4 16,43.4 4.6,32 4.6,16 16,4.6 32,4.6 43.4,16" fill="#fff" stroke="#a98b76" stroke-width="1.5"/><text x="24" y="25" text-anchor="middle" dominant-baseline="central" font-family="Lato, sans-serif" font-size="${fs}" font-weight="700" fill="#5e4632">${n}</text></svg>`;
}

/** Render the Arabic verse with its end marker glued to the last word so the
    number never wraps onto a line by itself — the last word drops down with it. */
function arabicWithMarker(ar, n) {
  const marker = ayahNumberMarker(n);
  const text = (ar || "").trimEnd();
  const lastSpace = text.lastIndexOf(" ");
  if (lastSpace === -1) {
    return `<span class="ayah-nowrap">${text}${marker}</span>`;
  }
  const head = text.slice(0, lastSpace);
  const lastWord = text.slice(lastSpace + 1);
  return `${head} <span class="ayah-nowrap">${lastWord}${marker}</span>`;
}

/** Exact Bismillah form to strip when it matches Ayah 1 text (plus Uthmani API variant via regex below). */
const BISMILLAH_AYAH_PREFIX_PLAIN = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ";

/** Map the API revelation type to a Makki/Madani label + style class. */
function revelationInfo(type) {
  if (type === "Meccan") return { label: "Makki", cls: "makki" };
  if (type === "Medinan") return { label: "Madani", cls: "madani" };
  return { label: type || "", cls: "" };
}

function surahShowsStandaloneBismillah(surahId) {
  return surahId !== 1 && surahId !== 9;
}

function surahUsesBismillahAudioIntro(surahId) {
  return surahId !== 1 && surahId !== 9;
}

function getBismillahIntroUrl(reciterKey) {
  return getAyahRecitationUrl(1, 1, reciterKey);
}

function stripLeadingBismillahFromArabic(ar) {
  let t = (ar || "").trim();
  if (!t.startsWith("بِسْمِ")) return ar;

  if (t.startsWith(BISMILLAH_AYAH_PREFIX_PLAIN)) {
    const rest = t.slice(BISMILLAH_AYAH_PREFIX_PLAIN.length).trimStart();
    if (rest.length > 0) return rest;
    return ar;
  }

  // alquran.cloud Uthmani: ٱ, ٰ on م, and shadda+fatha order on رّ may differ from plain text
  const uthmaniPrefix =
    /^بِسْمِ\s+ٱ?للّ[\u064e\u0651]+ه[\u064e\u0651]*ِ\s+ٱ?لرّ[\u064e\u0651]+حْمَ[\u0670\u0640]?نِ\s+ٱ?لرّ[\u064e\u0651]+حِيمِ\s*/u;
  if (uthmaniPrefix.test(t)) {
    const rest = t.replace(uthmaniPrefix, "").trimStart();
    if (rest.length > 0) return rest;
  }

  return ar;
}

function stripLeadingBismillahFromEnglish(en) {
  const t = (en || "").trim();
  const stripped = t
    .replace(/^In the name of (God|Allah),? the Most Gracious,? the Most Merciful\.?:?\s*/i, "")
    .replace(
      /^In the name of (God|Allah),?\s*The Most Gracious,?\s*The Dispenser of Grace\.?:?\s*/i,
      ""
    )
    .trim();
  return stripped.length > 0 ? stripped : en;
}

function applyStandaloneBismillahDisplayToAyat(surahId, ayat) {
  if (!surahShowsStandaloneBismillah(surahId) || !ayat.length) return ayat;
  const [first, ...rest] = ayat;
  return [
    {
      ...first,
      ar: stripLeadingBismillahFromArabic(first.ar),
      en: stripLeadingBismillahFromEnglish(first.en),
    },
    ...rest,
  ];
}

function clearBismillahHeaderHighlight() {
  document.querySelectorAll(".bismillah-header.is-active-bismillah").forEach((el) => {
    el.classList.remove("is-active-bismillah");
  });
}

function highlightBismillahHeader() {
  clearBismillahHeaderHighlight();
  clearFollowHighlightOnlyAyahs();
  const el = document.getElementById("bismillah-header");
  if (el) {
    el.classList.add("is-active-bismillah");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function clearFollowHighlightOnlyAyahs() {
  document.querySelectorAll(".ayah.active-ayah").forEach((el) => {
    el.classList.remove("active-ayah");
  });
}

if (!viewer) {
  throw new Error("Surah viewer element not found.");
}

function setFollowStatus(text) {
  const inlineStatus = document.getElementById("recitation-status");
  if (inlineStatus) {
    inlineStatus.textContent = text;
  }
  if (followDockStatus) {
    followDockStatus.textContent = text;
  }
}

function setDockInfoText(surahText, ayahText) {
  if (followDockSurahEl) followDockSurahEl.textContent = surahText;
  if (followDockAyahEl) followDockAyahEl.textContent = ayahText;
  const miniSurah = document.getElementById("follow-mini-surah");
  const miniAyah = document.getElementById("follow-mini-ayah");
  if (miniSurah) miniSurah.textContent = surahText;
  if (miniAyah) miniAyah.textContent = ayahText;
}

function updateFollowDockInfo() {
  if (!followState || !followState.ayat.length) {
    setDockInfoText("—", "Ayah — of —");
    return;
  }
  const surahText = followState.surahEnglishName || `Surah ${followState.surahId}`;
  const total = followState.ayat.length;
  if (followState.onBismillahIntro) {
    setDockInfoText(surahText, `Bismillah · Ayah 1 of ${total}`);
    return;
  }
  let idx = followState.currentIndex;
  if (idx >= total) idx = total - 1;
  if (idx < 0) idx = 0;
  const num = followState.ayat[idx]?.number ?? idx + 1;
  setDockInfoText(surahText, `Ayah ${num} of ${total}`);
}

const PLAY_ICON_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>`;
const PAUSE_ICON_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h3v14H7z"/><path d="M14 5h3v14h-3z"/></svg>`;

function setPlayPauseButtons(playing) {
  const html = playing ? PAUSE_ICON_SVG : PLAY_ICON_SVG;
  const label = playing ? "Pause" : "Play";
  if (followPlayPauseBtn) {
    followPlayPauseBtn.innerHTML = html;
    followPlayPauseBtn.setAttribute("aria-label", label);
  }
  const miniPlay = document.getElementById("follow-mini-play");
  if (miniPlay) {
    miniPlay.innerHTML = html;
    miniPlay.setAttribute("aria-label", label);
  }
}

function updatePlayPauseButton() {
  if (!followState) {
    setPlayPauseButtons(false);
    if (followPlayPauseBtn) followPlayPauseBtn.setAttribute("aria-label", "Play follow mode");
    return;
  }
  const playing =
    followState.isPlaying &&
    followState.currentAudio &&
    !followState.currentAudio.paused;
  setPlayPauseButtons(playing);
}

function updateFollowDockUI() {
  updateFollowDockInfo();
  updatePlayPauseButton();
}

let autoCollapseTimer = null;

function isMobileDock() {
  return window.matchMedia("(max-width: 700px)").matches;
}

function collapseDock() {
  document.querySelector(".follow-dock")?.classList.add("is-collapsed");
}

function expandDock() {
  document.querySelector(".follow-dock")?.classList.remove("is-collapsed");
  if (autoCollapseTimer) {
    clearTimeout(autoCollapseTimer);
    autoCollapseTimer = null;
  }
}

function toggleDock() {
  const dock = document.querySelector(".follow-dock");
  if (!dock) return;
  if (dock.classList.contains("is-collapsed")) {
    expandDock();
  } else {
    collapseDock();
    if (autoCollapseTimer) {
      clearTimeout(autoCollapseTimer);
      autoCollapseTimer = null;
    }
  }
}

/** After playback starts on mobile, collapse the dock to the mini-bar. */
function scheduleAutoCollapse() {
  if (autoCollapseTimer) clearTimeout(autoCollapseTimer);
  if (!isMobileDock()) return;
  autoCollapseTimer = setTimeout(() => {
    autoCollapseTimer = null;
    if (followState && followState.isPlaying) collapseDock();
  }, 3000);
}

function getSurahId() {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  if (!Number.isInteger(id) || id < 1 || id > 114) return 1;
  return id;
}

function getActiveReciterSelect() {
  return reciterSelect || reciterPickerSelect;
}

function getSelectedReciterKey() {
  const select = getActiveReciterSelect();
  if (!select) return DEFAULT_RECITER;
  const key = select.value;
  return RECITERS[key] ? key : DEFAULT_RECITER;
}

function syncCustomSelectUI(selectEl) {
  if (!selectEl) return;
  const wrapper = selectEl.closest(".custom-select");
  if (!wrapper) return;

  const trigger = wrapper.querySelector(".custom-select-trigger");
  const optionEls = wrapper.querySelectorAll(".custom-select-option");
  const selectedOption = selectEl.options[selectEl.selectedIndex];

  if (trigger) {
    trigger.textContent = selectedOption?.textContent || "";
  }

  optionEls.forEach((li) => {
    const selected = li.dataset.value === selectEl.value;
    li.classList.toggle("is-selected", selected);
    li.setAttribute("aria-selected", selected ? "true" : "false");
  });
}

function enhanceCustomSelect(selectEl) {
  if (!selectEl || selectEl.closest(".custom-select")) return;

  const wrapper = document.createElement("div");
  wrapper.className = "custom-select";
  if (selectEl.classList.contains("reciter-picker-select")) {
    wrapper.classList.add("custom-select--picker");
  }
  if (selectEl.classList.contains("follow-dock-select")) {
    wrapper.classList.add("custom-select--dock");
  }

  const parent = selectEl.parentNode;
  parent.insertBefore(wrapper, selectEl);
  wrapper.appendChild(selectEl);
  selectEl.classList.add("custom-select-native");

  const listId = `custom-select-${selectEl.id || "reciter"}`;
  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "custom-select-trigger";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", listId);

  const menu = document.createElement("ul");
  menu.className = "custom-select-menu";
  menu.id = listId;
  menu.setAttribute("role", "listbox");
  menu.hidden = true;

  const closeMenu = () => {
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    wrapper.classList.remove("is-open");
  };

  const openMenu = () => {
    document.querySelectorAll(".custom-select.is-open").forEach((openWrap) => {
      if (openWrap !== wrapper) {
        openWrap.classList.remove("is-open");
        const openMenuEl = openWrap.querySelector(".custom-select-menu");
        const openTrigger = openWrap.querySelector(".custom-select-trigger");
        if (openMenuEl) openMenuEl.hidden = true;
        if (openTrigger) openTrigger.setAttribute("aria-expanded", "false");
      }
    });
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    wrapper.classList.add("is-open");
  };

  Array.from(selectEl.options).forEach((opt) => {
    const li = document.createElement("li");
    li.className = "custom-select-option";
    li.setAttribute("role", "option");
    li.dataset.value = opt.value;
    li.textContent = opt.textContent;
    if (opt.selected) {
      li.classList.add("is-selected");
      li.setAttribute("aria-selected", "true");
    }
    li.addEventListener("click", (e) => {
      e.stopPropagation();
      selectEl.value = opt.value;
      selectEl.dispatchEvent(new Event("change", { bubbles: true }));
      closeMenu();
    });
    menu.appendChild(li);
  });

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (menu.hidden) openMenu();
    else closeMenu();
  });

  selectEl.addEventListener("change", () => syncCustomSelectUI(selectEl));

  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  wrapper.appendChild(trigger);
  wrapper.appendChild(menu);
  syncCustomSelectUI(selectEl);
}

function initReciterCustomSelects() {
  if (reciterPickerSelect) enhanceCustomSelect(reciterPickerSelect);
  if (reciterSelect) enhanceCustomSelect(reciterSelect);
}

function applyReciterSelectionToUI(reciterKey) {
  const key = RECITERS[reciterKey] ? reciterKey : DEFAULT_RECITER;
  if (reciterSelect) reciterSelect.value = key;
  if (reciterPickerSelect) reciterPickerSelect.value = key;
  syncCustomSelectUI(reciterSelect);
  syncCustomSelectUI(reciterPickerSelect);
}

function onReciterChange(event) {
  const fromSelect = event?.target?.value;
  const newReciterKey =
    fromSelect && RECITERS[fromSelect] ? fromSelect : getSelectedReciterKey();
  applyReciterSelectionToUI(newReciterKey);
  const newReciter = RECITERS[newReciterKey];
  localStorage.setItem(STORAGE_SELECTED_RECITER, newReciterKey);

  const titleEl = document.querySelector(".recitation-title");
  if (titleEl) {
    titleEl.textContent = `Quran Recitation (${newReciter.label})`;
  }

  if (followState?.fullSurahAudio) {
    const wasPlayingTop = !followState.fullSurahAudio.paused;
    followState.fullSurahAudio.src = getRecitationUrl(followState.surahId, newReciterKey);
    if (wasPlayingTop) {
      followState.fullSurahAudio.play().catch(() => {
        setFollowStatus("Changed reciter. Press play to continue.");
      });
    }
  }

  if (followState) {
    followState.reciterKey = newReciterKey;
    if (followState.isPlaying) {
      if (followState.onBismillahIntro) {
        highlightBismillahHeader();
      } else {
        const cur = followState.ayat[followState.currentIndex];
        if (cur) setFollowActiveAyah(cur.number);
      }
      playFollowCurrentAyahAudio();
    } else {
      setFollowStatus(`Reciter changed to ${newReciter.label}.`);
    }
  }
}

function bindReciterSelectHandlers() {
  if (reciterSelect) {
    reciterSelect.onchange = onReciterChange;
  }
  if (reciterPickerSelect) {
    reciterPickerSelect.onchange = onReciterChange;
  }
}

function syncReciterFromStorage() {
  const saved = localStorage.getItem(STORAGE_SELECTED_RECITER);
  const key = saved && RECITERS[saved] ? saved : DEFAULT_RECITER;
  applyReciterSelectionToUI(key);
}

function persistReciterForNextSurah(reciterKey) {
  const key = RECITERS[reciterKey] ? reciterKey : getSelectedReciterKey();
  localStorage.setItem(STORAGE_SELECTED_RECITER, key);
}

function advanceToNextSurah() {
  if (!followState) return;
  const nextId = followState.surahId + 1;
  if (nextId > LAST_SURAH_ID) return;

  if (followState.currentAudio) {
    followState.currentAudio.pause();
    followState.currentAudio = null;
  }
  followState.isPlaying = false;

  persistReciterForNextSurah(followState.reciterKey);
  localStorage.setItem(STORAGE_AUTOPLAY, "true");
  window.location.assign(`surah.html?id=${nextId}`);
}

function handleSurahFollowComplete() {
  if (!followState) return;
  if (followState.surahId >= LAST_SURAH_ID) {
    followModeFinish("You have completed the Quran");
    return;
  }
  advanceToNextSurah();
}

function startFollowModeFromBeginning() {
  if (!followState) return;
  followState.isPlaying = true;
  followState.currentIndex = 0;
  followState.bismillahIntroDone = false;
  followState.onBismillahIntro = false;
  followState.reciterKey = getSelectedReciterKey();
  followState.needsBismillahIntro = surahUsesBismillahAudioIntro(followState.surahId);
  playFollowCurrentAyahAudio();
  updateFollowDockUI();
}

function maybeAutoplayFollowMode() {
  if (localStorage.getItem(STORAGE_AUTOPLAY) !== "true") return;
  localStorage.removeItem(STORAGE_AUTOPLAY);
  startFollowModeFromBeginning();
}

function getSelectedReciter() {
  return RECITERS[getSelectedReciterKey()];
}

function getRecitationUrl(surahId, reciterKey = getSelectedReciterKey()) {
  const reciter = RECITERS[reciterKey] || RECITERS[DEFAULT_RECITER];
  return `${reciter.fullBaseUrl}/${String(surahId).padStart(3, "0")}.mp3`;
}

function getAyahRecitationUrl(surahId, ayahNumber, reciterKey = getSelectedReciterKey()) {
  const reciter = RECITERS[reciterKey] || RECITERS[DEFAULT_RECITER];
  return `https://everyayah.com/data/${reciter.ayahFolder}/${String(surahId).padStart(3, "0")}${String(ayahNumber).padStart(3, "0")}.mp3`;
}

function clearFollowHighlight() {
  clearFollowHighlightOnlyAyahs();
  clearBismillahHeaderHighlight();
}

function setFollowActiveAyah(ayahNumber) {
  clearFollowHighlight();
  const ayahEl = document.getElementById(`ayah-${ayahNumber}`);
  if (!ayahEl) return;
  ayahEl.classList.add("active-ayah");
  ayahEl.scrollIntoView({ behavior: "smooth", block: "center" });
}

function followPlayTry(audio) {
  try {
    const p = audio.play();
    if (p !== undefined) {
      p.catch((err) => {
        console.log("[Follow Mode] play() rejected:", err?.message || String(err));
      });
    }
  } catch (err) {
    console.log("[Follow Mode] play() threw:", err?.message || String(err));
  }
}

function followModeFinish(statusMessage = "Follow mode finished for this surah.") {
  if (!followState) return;
  followState.isPlaying = false;
  followState.onBismillahIntro = false;
  followState.bismillahIntroDone = false;
  if (followState.currentAudio) {
    followState.currentAudio.pause();
    followState.currentAudio = null;
  }
  followState.currentIndex = followState.ayat.length;
  setFollowStatus(statusMessage);
  updateFollowDockUI();
  clearFollowHighlight();
}

function playFollowCurrentAyahAudio() {
  if (!followState || !followState.isPlaying) return;

  if (followState.fullSurahAudio && !followState.fullSurahAudio.paused) {
    followState.fullSurahAudio.pause();
  }

  if (followState.currentAudio) {
    followState.currentAudio.pause();
    followState.currentAudio = null;
  }

  if (followState.needsBismillahIntro && !followState.bismillahIntroDone) {
    followState.onBismillahIntro = true;
    const url = getBismillahIntroUrl(followState.reciterKey);
    console.log("[Follow Mode] Bismillah intro URL:", url);

    highlightBismillahHeader();

    const audio = new Audio(url);
    audio.muted = false;
    audio.volume = 1;
    audio.playsInline = true;
    followState.currentAudio = audio;

    audio.addEventListener("ended", () => {
      if (!followState || !followState.isPlaying) return;
      if (followState.currentAudio !== audio) return;
      followState.bismillahIntroDone = true;
      followState.onBismillahIntro = false;
      const first = followState.ayat[0];
      if (first) setFollowActiveAyah(first.number);
      playFollowCurrentAyahAudio();
    });

    followPlayTry(audio);
    setFollowStatus("Playing Bismillah…");
    updateFollowDockUI();
    return;
  }

  followState.onBismillahIntro = false;

  const idx = followState.currentIndex;
  const ayah = followState.ayat[idx];
  if (!ayah) {
    if (followState.currentIndex >= followState.ayat.length && followState.ayat.length > 0) {
      handleSurahFollowComplete();
    } else {
      followModeFinish();
    }
    return;
  }

  const url = getAyahRecitationUrl(followState.surahId, ayah.number, followState.reciterKey);
  console.log("[Follow Mode] ayah URL:", url);

  setFollowActiveAyah(ayah.number);

  const audio = new Audio(url);
  audio.muted = false;
  audio.volume = 1;
  audio.playsInline = true;
  followState.currentAudio = audio;

  audio.addEventListener("ended", () => {
    if (!followState || !followState.isPlaying) return;
    if (followState.currentAudio !== audio) return;
    advanceAfterAyahEnd();
  });

  followPlayTry(audio);

  setFollowStatus(`Playing Ayah ${ayah.number} in follow mode...`);
  updateFollowDockUI();
}

function onFollowPlayPauseClick() {
  if (!followState) return;

  if (
    followState.isPlaying &&
    followState.currentAudio &&
    !followState.currentAudio.paused
  ) {
    followState.isPlaying = false;
    followState.currentAudio.pause();
    setFollowStatus("Follow mode paused.");
    expandDock();
    updateFollowDockUI();
    return;
  }

  const canResume =
    followState.currentAudio &&
    followState.currentAudio.paused &&
    !followState.currentAudio.ended &&
    followState.currentAudio.currentTime > 0;

  if (canResume) {
    followState.isPlaying = true;
    followPlayTry(followState.currentAudio);
    setFollowStatus("Follow mode playing.");
    updateFollowDockUI();
    scheduleAutoCollapse();
    return;
  }

  followState.isPlaying = true;
  followState.reciterKey = getSelectedReciterKey();
  if (followState.repeatMode === "range") {
    const fi = indexOfAyahNumber(followState.repeatFrom);
    if (fi !== -1) {
      followState.currentIndex = fi;
      followState.bismillahIntroDone = true;
      followState.onBismillahIntro = false;
    }
  } else if (followState.repeatMode === "ayah") {
    const ai = indexOfAyahNumber(followState.repeatAyah);
    if (ai !== -1) {
      followState.currentIndex = ai;
      followState.bismillahIntroDone = true;
      followState.onBismillahIntro = false;
    }
  } else if (followState.currentIndex >= followState.ayat.length) {
    followState.currentIndex = 0;
  }

  playFollowCurrentAyahAudio();
  updateFollowDockUI();
  scheduleAutoCollapse();
}

function indexOfAyahNumber(n) {
  if (!followState) return -1;
  return followState.ayat.findIndex((a) => a.number === Number(n));
}

function repeatBounds() {
  const len = followState.ayat.length;
  let firstIdx = 0;
  let lastIdx = len - 1;
  if (followState.repeatMode === "range") {
    const fi = indexOfAyahNumber(followState.repeatFrom);
    const li = indexOfAyahNumber(followState.repeatTo);
    if (fi !== -1 && li !== -1 && fi <= li) {
      firstIdx = fi;
      lastIdx = li;
    }
  }
  return { firstIdx, lastIdx };
}

/** Decide what plays after an ayah finishes, honouring the repeat mode. */
function advanceAfterAyahEnd() {
  if (followState.repeatMode === "ayah") {
    const cur = followState.ayat[followState.currentIndex];
    if (cur) setFollowActiveAyah(cur.number);
    playFollowCurrentAyahAudio();
    return;
  }

  const { firstIdx, lastIdx } = repeatBounds();
  followState.currentIndex += 1;

  if (followState.currentIndex > lastIdx) {
    if (followState.repeatMode === "surah" || followState.repeatMode === "range") {
      followState.currentIndex = firstIdx;
      const a = followState.ayat[firstIdx];
      if (a) setFollowActiveAyah(a.number);
      playFollowCurrentAyahAudio();
      return;
    }
    if (followState.currentIndex >= followState.ayat.length) {
      handleSurahFollowComplete();
      return;
    }
  }

  const nextAyah = followState.ayat[followState.currentIndex];
  setFollowActiveAyah(nextAyah.number);
  playFollowCurrentAyahAudio();
}

function effectiveFollowIndex() {
  if (!followState) return 0;
  if (followState.onBismillahIntro) return -1;
  const len = followState.ayat.length;
  if (!len) return 0;
  let idx = followState.currentIndex;
  if (idx >= len) idx = len - 1;
  if (idx < 0) idx = 0;
  return idx;
}

function clampFollowIndex(i) {
  if (!followState || !followState.ayat.length) return 0;
  const max = followState.ayat.length - 1;
  return Math.max(0, Math.min(max, i));
}

function seekFollowToIndex(newIndex) {
  if (!followState) return;
  const idx = clampFollowIndex(newIndex);
  if (followState.currentAudio) {
    followState.currentAudio.pause();
    followState.currentAudio = null;
  }
  followState.bismillahIntroDone = true;
  followState.onBismillahIntro = false;
  followState.currentIndex = idx;
  followState.isPlaying = true;
  followState.reciterKey = getSelectedReciterKey();
  const ayah = followState.ayat[idx];
  if (!ayah) return;
  playFollowCurrentAyahAudio();
  updateFollowDockUI();
}

function onFollowPrevClick() {
  if (!followState) return;
  seekFollowToIndex(effectiveFollowIndex() - 1);
}

function onFollowRewindClick() {
  if (!followState) return;
  seekFollowToIndex(effectiveFollowIndex() - 5);
}

function onFollowForwardClick() {
  if (!followState) return;
  seekFollowToIndex(effectiveFollowIndex() + 5);
}

function onFollowNextClick() {
  if (!followState) return;
  seekFollowToIndex(effectiveFollowIndex() + 1);
}

function jumpFollowToAyahNumber(ayahNumber) {
  if (!followState) return;
  const idx = followState.ayat.findIndex((a) => a.number === ayahNumber);
  if (idx < 0) return;

  if (followState.currentAudio) {
    followState.currentAudio.pause();
    followState.currentAudio = null;
  }

  followState.bismillahIntroDone = true;
  followState.onBismillahIntro = false;
  followState.currentIndex = idx;
  followState.isPlaying = true;
  followState.reciterKey = getSelectedReciterKey();

  playFollowCurrentAyahAudio();
  updateFollowDockUI();
}

function onSurahViewerAyahClick(e) {
  const article = e.target.closest(".ayah");
  if (!article || !viewer.contains(article)) return;
  const num = Number(article.dataset.ayahNumber);
  if (!Number.isInteger(num) || num < 1) return;
  jumpFollowToAyahNumber(num);
}

function renderLoading(surahId) {
  viewer.innerHTML = `
    <h2>Loading Surah ${surahId}...</h2>
    <p class="muted">Please wait while verses and recitation are loading.</p>
  `;
}

function renderError(surahId) {
  viewer.innerHTML = `
    <h2>Unable to load Surah ${surahId}</h2>
    <p class="muted">Please check your connection and try again.</p>
    <button class="ayah-play" type="button" id="retry-surah">Retry</button>
  `;

  const retryBtn = document.getElementById("retry-surah");
  if (retryBtn) {
    retryBtn.addEventListener("click", () => loadSurah());
  }
}

function renderSurah(arabicMeta, ayat) {
  const surahId = arabicMeta.number;
  const selectedReciter = getSelectedReciter();
  const recitationUrl = getRecitationUrl(surahId);
  document.title = `Learn with Arwa | ${arabicMeta.englishName}`;

  viewer.className = "surah-viewer fade-in-stagger";

  const audioOnlyPlayer = document.getElementById("audio-only-player");
  if (audioOnlyPlayer) {
    audioOnlyPlayer.innerHTML = `
      <p class="recitation-title">Quran Recitation (${selectedReciter.label})</p>
      <audio id="surah-audio" class="recitation-player" controls preload="none" src="${recitationUrl}"></audio>
      <p id="recitation-status" class="muted recitation-hint">Press play to listen to this surah recitation.</p>
    `;
  }

  viewer.innerHTML = `
    <h2 class="fade-in-element">${arabicMeta.englishName} <span class="muted">(${arabicMeta.name})</span></h2>
    <p class="muted fade-in-element">Surah ${surahId} • ${arabicMeta.numberOfAyahs} verses${
      revelationInfo(arabicMeta.revelationType).label
        ? ` <span class="surah-type-badge surah-type-badge--${revelationInfo(arabicMeta.revelationType).cls}">${revelationInfo(arabicMeta.revelationType).label}</span>`
        : ""
    }</p>
    ${
      surahShowsStandaloneBismillah(surahId)
        ? `<div class="bismillah-header" id="bismillah-header" role="presentation">
      <span class="bismillah-rule" aria-hidden="true"></span>
      <span class="bismillah-text">${BISMILLAH_HEADER_HTML}</span>
      <span class="bismillah-rule" aria-hidden="true"></span>
    </div>`
        : ""
    }
    ${ayat
      .map(
        (ayah) => `
          <article class="ayah ayah-clickable fade-in-element" id="ayah-${ayah.number}" data-ayah-number="${ayah.number}">
            <p class="ayah-ar arabic">${arabicWithMarker(ayah.ar, ayah.number)}</p>
            <p class="ayah-en">${ayahNumberMarker(ayah.number)}<span class="ayah-en-text">${ayah.en}</span></p>
          </article>
        `
      )
      .join("")}
  `;

  const audio = document.getElementById("surah-audio");
  if (audio) {
    audio.addEventListener("error", () => {
      setFollowStatus("Recitation is currently unavailable for this surah. Please try again later.");
    });
    audio.addEventListener("play", () => {
      if (followState?.isPlaying) {
        audio.pause();
        setFollowStatus("Follow mode is already playing. Pause it first to use the top recitation player.");
        return;
      }
      setFollowStatus("Recitation is now playing.");
    });
  }

  followState = {
    surahId,
    surahEnglishName: arabicMeta.englishName,
    ayat,
    currentIndex: 0,
    isPlaying: false,
    currentAudio: null,
    fullSurahAudio: audio || null,
    reciterKey: getSelectedReciterKey(),
    needsBismillahIntro: surahUsesBismillahAudioIntro(surahId),
    bismillahIntroDone: false,
    onBismillahIntro: false,
    repeatMode: "off",
    repeatAyah: ayat.length ? ayat[0].number : 1,
    repeatFrom: ayat.length ? ayat[0].number : 1,
    repeatTo: ayat.length ? ayat[ayat.length - 1].number : 1,
  };

  setFollowStatus("");
  initFollowOptionsUI();
  updateFollowDockUI();

  applyReciterSelectionToUI(getSelectedReciterKey());
  observeFadeInElements(viewer);
}

async function loadSurah() {
  const surahId = getSurahId();
  renderLoading(surahId);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    const response = await fetch(
      `https://api.alquran.cloud/v1/surah/${surahId}/editions/quran-uthmani,en.asad`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error("Failed to fetch surah.");
    }

    const payload = await response.json();
    const arabicEdition = payload?.data?.[0];
    const englishEdition = payload?.data?.[1];
    const arabicAyat = arabicEdition?.ayahs || [];
    const englishAyat = englishEdition?.ayahs || [];

    if (!arabicEdition || !arabicAyat.length || !englishAyat.length) {
      throw new Error("Incomplete surah data.");
    }

    const ayatRaw = arabicAyat.map((ayah, index) => ({
      number: ayah.numberInSurah,
      ar: ayah.text,
      en: englishAyat[index]?.text || "",
    }));

    const ayat = applyStandaloneBismillahDisplayToAyat(surahId, ayatRaw);

    renderSurah(arabicEdition, ayat);
    maybeAutoplayFollowMode();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    renderError(surahId);
  }
}

function setFollowRepeatMode(mode) {
  if (!followState) return;
  followState.repeatMode = mode;
  if (mode === "ayah") {
    const cur = followState.ayat[effectiveFollowIndex()];
    if (cur) followState.repeatAyah = cur.number;
    const ayahEl = document.getElementById("follow-ayah-num");
    if (ayahEl) ayahEl.value = String(followState.repeatAyah);
  }
  updateRepeatModeUI();
}

function updateRepeatModeUI() {
  const mode = followState ? followState.repeatMode : "off";
  document.querySelectorAll(".follow-repeat-btn").forEach((btn) => {
    const on = btn.dataset.repeat === mode;
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });
  const ayahInputs = document.getElementById("follow-ayah-inputs");
  const rangeInputs = document.getElementById("follow-range-inputs");
  if (ayahInputs) ayahInputs.hidden = mode !== "ayah";
  if (rangeInputs) rangeInputs.hidden = mode !== "range";
}

function initFollowOptionsUI() {
  if (!followState) return;
  const total = followState.ayat.length;
  const ayahEl = document.getElementById("follow-ayah-num");
  const fromEl = document.getElementById("follow-range-from");
  const toEl = document.getElementById("follow-range-to");
  if (ayahEl) {
    ayahEl.max = String(total);
    ayahEl.value = String(followState.repeatAyah);
  }
  if (fromEl) {
    fromEl.max = String(total);
    fromEl.value = String(followState.repeatFrom);
  }
  if (toEl) {
    toEl.max = String(total);
    toEl.value = String(followState.repeatTo);
  }
  updateRepeatModeUI();
}

function clampAyahNumber(value) {
  const total = followState ? followState.ayat.length : 1;
  let n = parseInt(value, 10);
  if (Number.isNaN(n)) n = 1;
  return Math.max(1, Math.min(total, n));
}

function applyTranslationVisibility(show) {
  document.body.classList.toggle("hide-translation", !show);
}

if (!followDockHandlersBound && followPlayPauseBtn) {
  followDockHandlersBound = true;
  followPlayPauseBtn.addEventListener("click", onFollowPlayPauseClick);
  document.getElementById("follow-btn-prev")?.addEventListener("click", onFollowPrevClick);
  document.getElementById("follow-btn-rewind")?.addEventListener("click", onFollowRewindClick);
  document.getElementById("follow-btn-forward")?.addEventListener("click", onFollowForwardClick);
  document.getElementById("follow-btn-next")?.addEventListener("click", onFollowNextClick);

  document.getElementById("follow-dock-handle")?.addEventListener("click", toggleDock);
  document.getElementById("follow-mini-expand")?.addEventListener("click", expandDock);
  document.getElementById("follow-mini-play")?.addEventListener("click", onFollowPlayPauseClick);

  document.querySelectorAll(".follow-repeat-btn").forEach((btn) => {
    btn.addEventListener("click", () => setFollowRepeatMode(btn.dataset.repeat));
  });

  const ayahEl = document.getElementById("follow-ayah-num");
  if (ayahEl) {
    ayahEl.addEventListener("change", () => {
      if (!followState) return;
      followState.repeatAyah = clampAyahNumber(ayahEl.value);
      ayahEl.value = String(followState.repeatAyah);
      if (followState.isPlaying && followState.repeatMode === "ayah") {
        const idx = indexOfAyahNumber(followState.repeatAyah);
        if (idx !== -1) seekFollowToIndex(idx);
      }
    });
  }

  const fromEl = document.getElementById("follow-range-from");
  const toEl = document.getElementById("follow-range-to");
  if (fromEl && toEl) {
    fromEl.addEventListener("change", () => {
      if (!followState) return;
      followState.repeatFrom = clampAyahNumber(fromEl.value);
      if (followState.repeatFrom > followState.repeatTo) {
        followState.repeatTo = followState.repeatFrom;
      }
      fromEl.value = String(followState.repeatFrom);
      toEl.value = String(followState.repeatTo);
    });
    toEl.addEventListener("change", () => {
      if (!followState) return;
      followState.repeatTo = clampAyahNumber(toEl.value);
      if (followState.repeatTo < followState.repeatFrom) {
        followState.repeatFrom = followState.repeatTo;
      }
      fromEl.value = String(followState.repeatFrom);
      toEl.value = String(followState.repeatTo);
    });
  }

  const translationCheckbox = document.getElementById("follow-translation-checkbox");
  if (translationCheckbox) {
    const saved = localStorage.getItem(STORAGE_SHOW_TRANSLATION);
    const show = saved === null ? true : saved === "true";
    translationCheckbox.checked = show;
    applyTranslationVisibility(show);
    translationCheckbox.addEventListener("change", () => {
      applyTranslationVisibility(translationCheckbox.checked);
      localStorage.setItem(
        STORAGE_SHOW_TRANSLATION,
        translationCheckbox.checked ? "true" : "false"
      );
    });
  }
}

if (!surahViewerAyahClickBound && viewer) {
  surahViewerAyahClickBound = true;
  viewer.addEventListener("click", onSurahViewerAyahClick);
}

initReciterCustomSelects();
syncReciterFromStorage();
bindReciterSelectHandlers();
loadSurah();
