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
    ayahFolder: "Minshawi_16kbps",
  },
  afasy: {
    label: "Mishary Al-Afasy",
    fullBaseUrl: "https://server8.mp3quran.net/afs",
    ayahFolder: "Mishary_Rashid_Alafasy_128kbps",
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
const LAST_SURAH_ID = 114;

const BISMILLAH_HEADER_HTML = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ";

/** Exact Bismillah form to strip when it matches Ayah 1 text (plus Uthmani API variant via regex below). */
const BISMILLAH_AYAH_PREFIX_PLAIN = "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ";

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

function updateFollowDockInfo() {
  if (!followDockSurahEl || !followDockAyahEl) return;
  if (!followState || !followState.ayat.length) {
    followDockSurahEl.textContent = "—";
    followDockAyahEl.textContent = "Ayah — of —";
    return;
  }
  followDockSurahEl.textContent = followState.surahEnglishName || `Surah ${followState.surahId}`;
  const total = followState.ayat.length;
  if (followState.onBismillahIntro) {
    followDockAyahEl.textContent = `Bismillah · Ayah 1 of ${total}`;
    return;
  }
  let idx = followState.currentIndex;
  if (idx >= total) idx = total - 1;
  if (idx < 0) idx = 0;
  const num = followState.ayat[idx]?.number ?? idx + 1;
  followDockAyahEl.textContent = `Ayah ${num} of ${total}`;
}

function updatePlayPauseButton() {
  if (!followPlayPauseBtn) return;
  if (!followState) {
    followPlayPauseBtn.textContent = "⏯";
    followPlayPauseBtn.setAttribute("aria-label", "Play follow mode");
    return;
  }
  const playing =
    followState.isPlaying &&
    followState.currentAudio &&
    !followState.currentAudio.paused;
  followPlayPauseBtn.textContent = playing ? "⏸" : "⏯";
  followPlayPauseBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
}

function updateFollowDockUI() {
  updateFollowDockInfo();
  updatePlayPauseButton();
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

  const titleEl = viewer.querySelector(".recitation-title");
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
    followState.currentIndex += 1;
    if (followState.currentIndex >= followState.ayat.length) {
      handleSurahFollowComplete();
      return;
    }
    const nextAyah = followState.ayat[followState.currentIndex];
    setFollowActiveAyah(nextAyah.number);
    playFollowCurrentAyahAudio();
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
    return;
  }

  followState.isPlaying = true;
  followState.reciterKey = getSelectedReciterKey();
  if (followState.currentIndex >= followState.ayat.length) {
    followState.currentIndex = 0;
  }

  playFollowCurrentAyahAudio();
  updateFollowDockUI();
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

function onStopFollowClick() {
  if (!followState) return;
  followState.isPlaying = false;
  followState.bismillahIntroDone = false;
  followState.onBismillahIntro = false;
  if (followState.currentAudio) {
    followState.currentAudio.pause();
    followState.currentAudio = null;
  }
  followState.currentIndex = 0;
  clearFollowHighlight();
  setFollowStatus("Follow mode stopped.");
  updateFollowDockUI();
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

  viewer.innerHTML = `
    <h2 class="fade-in-element">${arabicMeta.englishName} <span class="muted">(${arabicMeta.name})</span></h2>
    <p class="muted fade-in-element">Surah ${surahId} • ${arabicMeta.numberOfAyahs} verses</p>
    <div class="recitation-box fade-in-element">
      <p class="recitation-title">Quran Recitation (${selectedReciter.label})</p>
      <audio id="surah-audio" class="recitation-player" controls preload="none" src="${recitationUrl}"></audio>
      <p id="recitation-status" class="muted recitation-hint">Press play to listen to this surah recitation.</p>
    </div>
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
            <p class="ayah-ar arabic">${ayah.ar}</p>
            <p>${ayah.en}</p>
            <p class="muted">Ayah ${ayah.number}</p>
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
  };

  setFollowStatus("Follow mode is ready.");
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

if (!followDockHandlersBound && followPlayPauseBtn) {
  followDockHandlersBound = true;
  followPlayPauseBtn.addEventListener("click", onFollowPlayPauseClick);
  document.getElementById("follow-btn-prev")?.addEventListener("click", onFollowPrevClick);
  document.getElementById("follow-btn-rewind")?.addEventListener("click", onFollowRewindClick);
  document.getElementById("follow-btn-forward")?.addEventListener("click", onFollowForwardClick);
  document.getElementById("follow-btn-next")?.addEventListener("click", onFollowNextClick);
  document.getElementById("follow-btn-stop")?.addEventListener("click", onStopFollowClick);
}

if (!surahViewerAyahClickBound && viewer) {
  surahViewerAyahClickBound = true;
  viewer.addEventListener("click", onSurahViewerAyahClick);
}

initReciterCustomSelects();
syncReciterFromStorage();
bindReciterSelectHandlers();
loadSurah();
