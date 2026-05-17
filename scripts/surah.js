const viewer = document.getElementById("surah-viewer");
let followState = null;
const toggleFollowBtn = document.getElementById("toggle-follow-recitation");
const stopFollowBtn = document.getElementById("stop-follow-recitation");
const followDockStatus = document.getElementById("follow-dock-status");
const reciterSelect = document.getElementById("reciter-select");

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
  omarhisham: {
    label: "Omar Hisham Al-Arabi",
    fullBaseUrl: "https://server8.mp3quran.net/omar_hisham",
    ayahFolder: "Omar_Hisham_Al-Arabi_128kbps",
  },
};
const DEFAULT_RECITER = "husri";

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

function setToggleButtonLabel(text) {
  if (toggleFollowBtn) {
    toggleFollowBtn.textContent = text;
  }
}

function getSurahId() {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  if (!Number.isInteger(id) || id < 1 || id > 114) return 1;
  return id;
}

function getSelectedReciterKey() {
  if (!reciterSelect) return DEFAULT_RECITER;
  const key = reciterSelect.value;
  return RECITERS[key] ? key : DEFAULT_RECITER;
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

  viewer.innerHTML = `
    <h2>${arabicMeta.englishName} <span class="muted">(${arabicMeta.name})</span></h2>
    <p class="muted">Surah ${surahId} • ${arabicMeta.numberOfAyahs} verses</p>
    <div class="recitation-box">
      <p class="recitation-title">Quran Recitation (${selectedReciter.label})</p>
      <audio id="surah-audio" class="recitation-player" controls preload="none" src="${recitationUrl}"></audio>
      <p id="recitation-status" class="muted recitation-hint">Press play to listen to this surah recitation.</p>
      <audio id="ayah-follow-audio" preload="none"></audio>
    </div>
    ${ayat
      .map(
        (ayah) => `
          <article class="ayah" id="ayah-${ayah.number}" data-ayah-number="${ayah.number}">
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

  const followAudio = document.getElementById("ayah-follow-audio");
  if (!followAudio || !toggleFollowBtn || !stopFollowBtn) {
    return;
  }

  followState = {
    surahId,
    ayat,
    currentIndex: 0,
    isPlaying: false,
    followAudio,
    fullSurahAudio: audio || null,
    reciterKey: getSelectedReciterKey(),
  };

  const clearHighlight = () => {
    document.querySelectorAll(".ayah.active-ayah").forEach((el) => {
      el.classList.remove("active-ayah");
    });
  };

  const highlightAyah = (ayahNumber) => {
    clearHighlight();
    const ayahEl = document.getElementById(`ayah-${ayahNumber}`);
    if (!ayahEl) return;
    ayahEl.classList.add("active-ayah");
    ayahEl.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const playCurrentAyah = () => {
    if (!followState) return;
    const currentAyah = followState.ayat[followState.currentIndex];
    if (!currentAyah) {
      followState.isPlaying = false;
      setFollowStatus("Follow mode finished for this surah.");
      setToggleButtonLabel("Replay Follow Mode");
      return;
    }

    highlightAyah(currentAyah.number);
    if (followState.fullSurahAudio && !followState.fullSurahAudio.paused) {
      followState.fullSurahAudio.pause();
    }
    const src = getAyahRecitationUrl(followState.surahId, currentAyah.number, followState.reciterKey);
    followState.followAudio.src = src;
    setFollowStatus(`Playing Ayah ${currentAyah.number} in follow mode...`);
    setToggleButtonLabel("Pause Follow Mode");
    followState.followAudio.play().catch(() => {
      setFollowStatus("Could not play recitation right now. Please press the button again.");
      followState.isPlaying = false;
      setToggleButtonLabel("Play Follow Mode");
    });
  };

  toggleFollowBtn.addEventListener("click", () => {
    if (!followState) return;

    // If currently playing, this acts as Pause.
    if (followState.isPlaying) {
      followState.isPlaying = false;
      followState.followAudio.pause();
      setFollowStatus("Follow mode paused. Press the same button to continue.");
      setToggleButtonLabel("Resume Follow Mode");
      return;
    }

    // Resume from current position if paused.
    if (followState.followAudio.src && followState.followAudio.currentTime > 0) {
      followState.isPlaying = true;
      followState.followAudio.play().catch(() => {
        setFollowStatus("Could not resume recitation. Please press the button again.");
        followState.isPlaying = false;
        setToggleButtonLabel("Resume Follow Mode");
      });
      setToggleButtonLabel("Pause Follow Mode");
      return;
    }

    // Otherwise start playing from current ayah index.
    followState.isPlaying = true;
    followState.reciterKey = getSelectedReciterKey();
    if (followState.currentIndex >= followState.ayat.length) {
      followState.currentIndex = 0;
    }
    playCurrentAyah();
  });

  stopFollowBtn.addEventListener("click", () => {
    if (!followState) return;
    followState.isPlaying = false;
    followState.followAudio.pause();
    followState.followAudio.currentTime = 0;
    followState.currentIndex = 0;
    setFollowStatus("Follow mode stopped.");
    setToggleButtonLabel("Play Follow Mode");
    clearHighlight();
  });

  followAudio.addEventListener("ended", () => {
    if (!followState || !followState.isPlaying) return;
    followState.currentIndex += 1;
    playCurrentAyah();
  });

  followAudio.addEventListener("error", () => {
    if (!followState || !followState.isPlaying) return;
    // Skip problematic ayah audio and continue.
    followState.currentIndex += 1;
    playCurrentAyah();
  });

  setFollowStatus("Follow mode is ready.");
  setToggleButtonLabel("Play Follow Mode");

  if (reciterSelect) {
    reciterSelect.value = getSelectedReciterKey();
    reciterSelect.onchange = () => {
      const newReciterKey = getSelectedReciterKey();
      const newReciter = RECITERS[newReciterKey];
      localStorage.setItem("selected-reciter", newReciterKey);

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
          playCurrentAyah();
        } else {
          setFollowStatus(`Reciter changed to ${newReciter.label}.`);
        }
      }
    };
  }
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

    const ayat = arabicAyat.map((ayah, index) => ({
      number: ayah.numberInSurah,
      ar: ayah.text,
      en: englishAyat[index]?.text || "",
    }));

    renderSurah(arabicEdition, ayat);
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    renderError(surahId);
  }
}

loadSurah();

if (reciterSelect) {
  const savedReciter = localStorage.getItem("selected-reciter");
  if (savedReciter && RECITERS[savedReciter]) {
    reciterSelect.value = savedReciter;
  } else {
    reciterSelect.value = DEFAULT_RECITER;
  }
}
