const TOTAL_QURAN_AYAHS = 6236;
/** Offset so Ayah of the Day never matches Verse of the Day (half the mushaf). */
const AYAH_OF_DAY_OFFSET = 3118;
const DUAS_OF_DAY = [
  {
    ar: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً",
    en: "Our Lord give us good in this world and good in the hereafter",
    ref: "Quran 2:201",
  },
  {
    ar: "رَبِّ زِدْنِي عِلْمًا",
    en: "My Lord increase me in knowledge",
    ref: "Quran 20:114",
  },
  {
    ar: "رَبَّنَا تَقَبَّلْ مِنَّا",
    en: "Our Lord accept from us",
    ref: "Quran 2:127",
  },
  {
    ar: "رَبِّ اشْرَحْ لِي صَدْرِي",
    en: "My Lord expand my chest for me",
    ref: "Quran 20:25",
  },
  {
    ar: "رَبَّنَا اغْفِرْ لَنَا",
    en: "Our Lord forgive us",
    ref: "Quran 3:193",
  },
  {
    ar: "رَبِّ إِنِّي ظَلَمْتُ نَفْسِي",
    en: "My Lord I have wronged myself",
    ref: "Quran 28:16",
  },
  {
    ar: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا",
    en: "Our Lord do not let our hearts deviate",
    ref: "Quran 3:8",
  },
  {
    ar: "رَبِّ أَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ",
    en: "My Lord I seek refuge in You from the whispers of devils",
    ref: "Quran 23:97",
  },
  {
    ar: "رَبَّنَا آمَنَّا فَاغْفِرْ لَنَا",
    en: "Our Lord we have believed so forgive us",
    ref: "Quran 3:16",
  },
  {
    ar: "رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ",
    en: "My Lord I am in need of whatever good You send me",
    ref: "Quran 28:24",
  },
  {
    ar: "رَبَّنَا اصْرِفْ عَنَّا عَذَابَ جَهَنَّمَ",
    en: "Our Lord avert from us the punishment of Hell",
    ref: "Quran 25:65",
  },
  {
    ar: "رَبِّ هَبْ لِي حُكْمًا",
    en: "My Lord grant me wisdom",
    ref: "Quran 26:83",
  },
  {
    ar: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا",
    en: "Our Lord grant us from our spouses and offspring comfort",
    ref: "Quran 25:74",
  },
  {
    ar: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ",
    en: "My Lord inspire me to be grateful for Your blessing",
    ref: "Quran 27:19",
  },
  {
    ar: "رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ",
    en: "Our Lord forgive me and my parents",
    ref: "Quran 14:41",
  },
  {
    ar: "رَبِّ لَا تَذَرْنِي فَرْدًا",
    en: "My Lord do not leave me alone",
    ref: "Quran 21:89",
  },
  {
    ar: "رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً",
    en: "Our Lord grant us mercy from Yourself",
    ref: "Quran 18:10",
  },
  {
    ar: "رَبِّ إِنِّي مَسَّنِيَ الضُّرُّ",
    en: "My Lord adversity has touched me",
    ref: "Quran 21:83",
  },
  {
    ar: "رَبَّنَا اكْشِفْ عَنَّا الْعَذَابَ",
    en: "Our Lord remove the punishment from us",
    ref: "Quran 44:12",
  },
  {
    ar: "رَبِّ نَجِّنِي مِنَ الْقَوْمِ الظَّالِمِينَ",
    en: "My Lord save me from the wrongdoing people",
    ref: "Quran 28:21",
  },
  {
    ar: "رَبَّنَا لَا تَجْعَلْنَا فِتْنَةً لِّلْقَوْمِ الظَّالِمِينَ",
    en: "Our Lord do not make us a trial for the wrongdoing people",
    ref: "Quran 10:85",
  },
  {
    ar: "رَبِّ أَدْخِلْنِي مُدْخَلَ صِدْقٍ",
    en: "My Lord cause me to enter a truthful entrance",
    ref: "Quran 17:80",
  },
  {
    ar: "رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا",
    en: "Our Lord forgive us and our brothers",
    ref: "Quran 59:10",
  },
  {
    ar: "رَبِّ انصُرْنِي عَلَى الْقَوْمِ الْمُفْسِدِينَ",
    en: "My Lord help me against the corrupting people",
    ref: "Quran 29:30",
  },
  {
    ar: "رَبَّنَا أَتْمِمْ لَنَا نُورَنَا",
    en: "Our Lord perfect our light for us",
    ref: "Quran 66:8",
  },
  {
    ar: "رَبِّ إِنِّي وَهَنَ الْعَظْمُ مِنِّي",
    en: "My Lord my bones have weakened",
    ref: "Quran 19:4",
  },
  {
    ar: "رَبَّنَا وَسِعْتَ كُلَّ شَيْءٍ رَّحْمَةً وَعِلْمًا",
    en: "Our Lord You encompass all things in mercy and knowledge",
    ref: "Quran 40:7",
  },
  {
    ar: "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ",
    en: "My Lord make me an establisher of prayer",
    ref: "Quran 14:40",
  },
  {
    ar: "رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا",
    en: "Our Lord forgive us our sins",
    ref: "Quran 3:147",
  },
  {
    ar: "رَبِّ هَبْ لِي مِنَ الصَّالِحِينَ",
    en: "My Lord grant me a child from the righteous",
    ref: "Quran 37:100",
  },
];

const verseArEl = document.getElementById("verse-of-day-ar");
const verseEnEl = document.getElementById("verse-of-day-en");
const verseRefEl = document.getElementById("verse-of-day-ref");
const ayahArEl = document.getElementById("ayah-of-day-ar");
const ayahEnEl = document.getElementById("ayah-of-day-en");
const ayahRefEl = document.getElementById("ayah-of-day-ref");
const duaArEl = document.getElementById("dua-of-day-ar");
const duaEnEl = document.getElementById("dua-of-day-en");
const duaRefEl = document.getElementById("dua-of-day-ref");

/** Day of year from local midnight (0 on 1 Jan). Updates when the calendar date changes. */
function getDayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.floor((date - start) / (24 * 60 * 60 * 1000));
}

function getVerseNumberForToday(date = new Date()) {
  const dayOfYear = getDayOfYear(date);
  return (dayOfYear % TOTAL_QURAN_AYAHS) + 1;
}

function getAyahNumberForToday(date = new Date()) {
  const dayOfYear = getDayOfYear(date);
  return ((dayOfYear + AYAH_OF_DAY_OFFSET) % TOTAL_QURAN_AYAHS) + 1;
}

function getDuaForToday(date = new Date()) {
  const dayOfYear = getDayOfYear(date);
  return DUAS_OF_DAY[dayOfYear % DUAS_OF_DAY.length];
}

function renderDuaOfDay(date = new Date()) {
  if (!duaArEl || !duaEnEl || !duaRefEl) return;
  const dua = getDuaForToday(date);
  duaArEl.textContent = dua.ar;
  duaEnEl.textContent = dua.en;
  duaRefEl.textContent = dua.ref;
}

function formatAyahReference(arabicEdition) {
  const surah = arabicEdition.surah;
  return `Surah ${surah.englishName} ${surah.number}:${arabicEdition.numberInSurah}`;
}

async function fetchAyahFromApi(ayahNumber) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);
  const response = await fetch(
    `https://api.alquran.cloud/v1/ayah/${ayahNumber}/editions/quran-uthmani,en.asad`,
    { signal: controller.signal }
  );
  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error("Failed to fetch ayah.");
  }

  const payload = await response.json();
  const arabicEdition = payload?.data?.[0];
  const englishEdition = payload?.data?.[1];

  if (!arabicEdition?.text || !englishEdition?.text || !arabicEdition?.surah) {
    throw new Error("Incomplete ayah data.");
  }

  return { arabicEdition, englishEdition };
}

function setQuranDayBlockLoading(arEl, enEl, refEl) {
  if (arEl) arEl.textContent = "Loading…";
  if (enEl) enEl.textContent = "";
  if (refEl) refEl.textContent = "";
}

function setQuranDayBlockError(arEl, enEl, refEl, label) {
  if (arEl) arEl.textContent = `Unable to load today’s ${label}.`;
  if (enEl) {
    enEl.textContent = "Please check your connection and refresh the page.";
  }
  if (refEl) refEl.textContent = "";
}

async function loadQuranDayBlock(arEl, enEl, refEl, ayahNumber, errorLabel) {
  if (!arEl || !enEl || !refEl) return;

  setQuranDayBlockLoading(arEl, enEl, refEl);

  try {
    const { arabicEdition, englishEdition } = await fetchAyahFromApi(ayahNumber);
    arEl.textContent = arabicEdition.text.replace(/^\uFEFF/, "");
    enEl.textContent = englishEdition.text;
    refEl.textContent = formatAyahReference(arabicEdition);
  } catch {
    setQuranDayBlockError(arEl, enEl, refEl, errorLabel);
  }
}

function loadVerseOfDay(date = new Date()) {
  return loadQuranDayBlock(
    verseArEl,
    verseEnEl,
    verseRefEl,
    getVerseNumberForToday(date),
    "verse"
  );
}

function loadAyahOfDay(date = new Date()) {
  return loadQuranDayBlock(
    ayahArEl,
    ayahEnEl,
    ayahRefEl,
    getAyahNumberForToday(date),
    "ayah"
  );
}

function msUntilNextLocalMidnight() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next - now;
}

function scheduleMidnightRefresh() {
  const delay = msUntilNextLocalMidnight();
  window.setTimeout(() => {
    renderDuaOfDay();
    loadVerseOfDay();
    loadAyahOfDay();
    scheduleMidnightRefresh();
  }, delay);
}

function initHomeDailySections() {
  if (!verseArEl && !ayahArEl && !duaArEl) return;
  renderDuaOfDay();
  loadVerseOfDay();
  loadAyahOfDay();
  scheduleMidnightRefresh();
}

initHomeDailySections();
