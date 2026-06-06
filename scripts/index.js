const TOTAL_QURAN_AYAHS = 6236;
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

const ayahArEl = document.getElementById("ayah-of-day-ar");
const ayahEnEl = document.getElementById("ayah-of-day-en");
const ayahRefEl = document.getElementById("ayah-of-day-ref");
const duaArEl = document.getElementById("dua-of-day-ar");
const duaEnEl = document.getElementById("dua-of-day-en");
const duaRefEl = document.getElementById("dua-of-day-ref");
const hadithArEl = document.getElementById("hadith-of-day-ar");
const hadithEnEl = document.getElementById("hadith-of-day-en");
const hadithSourceEl = document.getElementById("hadith-of-day-source");

const HADITHS_OF_DAY = [
  { ar: "خَيْرُكُمْ أَحْسَنُكُمْ خُلُقًا", en: "The best among you are those who have the best manners and character", source: "Sahih Bukhari" },
  { ar: "ارْحَمُوا مَنْ فِي الْأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ", en: "Show mercy to those on earth and the One in the heavens will show mercy to you", source: "Tirmidhi" },
  { ar: "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ", en: "A good word is charity", source: "Sahih Bukhari" },
  { ar: "أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ", en: "The most beloved of deeds to Allah are those done consistently even if they are small", source: "Sahih Bukhari" },
  { ar: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ صَدَقَةٌ", en: "Smiling at your brother is charity", source: "Tirmidhi" },
  { ar: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", en: "None of you truly believes until he loves for his brother what he loves for himself", source: "Sahih Bukhari" },
  { ar: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ", en: "The strong person is the one who can control himself when he is angry", source: "Sahih Bukhari" },
  { ar: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ", en: "Whoever believes in Allah and the Last Day should speak good or remain silent", source: "Sahih Bukhari" },
  { ar: "أَوَّلُ مَا يُحَاسَبُ بِهِ الْعَبْدُ الصَّلَاةُ", en: "The first matter that the slave will be brought to account for on the Day of Judgement is the prayer", source: "Tirmidhi" },
  { ar: "أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ", en: "The closest a servant is to his Lord is when he is in prostration", source: "Sahih Muslim" },
  { ar: "طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ", en: "Seeking knowledge is an obligation upon every Muslim", source: "Ibn Majah" },
  { ar: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ", en: "Whoever follows a path in pursuit of knowledge Allah will make easy for him a path to Paradise", source: "Sahih Muslim" },
  { ar: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", en: "The best of you are those who learn the Quran and teach it", source: "Sahih Bukhari" },
  { ar: "إِذَا مَاتَ الْإِنْسَانُ انْقَطَعَ عَمَلُهُ إِلَّا مِنْ ثَلَاثَةٍ", en: "When a person dies his deeds come to an end except for three: ongoing charity, knowledge that is benefited from, and a righteous child who prays for him", source: "Sahih Muslim" },
  { ar: "الْجَنَّةُ تَحْتَ أَقْدَامِ الْأُمَّهَاتِ", en: "Paradise lies at the feet of your mother", source: "Ahmad" },
  { ar: "خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ", en: "The best of you is the one who is best to his family", source: "Tirmidhi" },
  { ar: "مَا نَحَلَ وَالِدٌ وَلَدًا مِنْ نَحْلٍ أَفْضَلَ مِنْ أَدَبٍ حَسَنٍ", en: "A father gives his child nothing better than a good education", source: "Tirmidhi" },
  { ar: "مَنْ أَحَبَّ أَنْ يُبْسَطَ لَهُ فِي رِزْقِهِ فَلْيَصِلْ رَحِمَهُ", en: "Whoever wishes to have his provision expanded should maintain his family ties", source: "Sahih Bukhari" },
  { ar: "الْيَدُ الْعُلْيَا خَيْرٌ مِنَ الْيَدِ السُّفْلَى", en: "The upper hand is better than the lower hand", source: "Sahih Bukhari" },
  { ar: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ", en: "Charity does not decrease wealth", source: "Sahih Muslim" },
  { ar: "اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ", en: "Save yourself from hellfire by giving even half a date in charity", source: "Sahih Bukhari" },
  { ar: "كُلُّ مَعْرُوفٍ صَدَقَةٌ", en: "Every act of goodness is charity", source: "Sahih Muslim" },
  { ar: "السَّخِيُّ قَرِيبٌ مِنَ اللَّهِ قَرِيبٌ مِنَ الْجَنَّةِ", en: "The generous person is close to Allah close to Paradise and far from Hell", source: "Tirmidhi" },
  { ar: "عَجَبًا لِأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ", en: "How wonderful is the affair of the believer for it is all good", source: "Sahih Muslim" },
  { ar: "كُنْ فِي الدُّنْيَا كَأَنَّكَ غَرِيبٌ أَوْ عَابِرُ سَبِيلٍ", en: "Be in this world as though you were a stranger or a wayfarer", source: "Sahih Bukhari" },
  { ar: "مَنْ لَا يَشْكُرُ النَّاسَ لَا يَشْكُرُ اللَّهَ", en: "Whoever is not grateful to people is not grateful to Allah", source: "Abu Dawud" },
  { ar: "عَلَيْكُمْ بِالصِّدْقِ فَإِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ", en: "Truthfulness leads to righteousness and righteousness leads to Paradise", source: "Sahih Bukhari" },
  { ar: "آيَةُ الْمُنَافِقِ ثَلَاثٌ إِذَا حَدَّثَ كَذَبَ", en: "The signs of a hypocrite are three: when he speaks he lies when he makes a promise he breaks it and when he is entrusted he betrays", source: "Sahih Bukhari" },
  { ar: "مَنْ غَشَّنَا فَلَيْسَ مِنَّا", en: "Whoever cheats us is not one of us", source: "Sahih Muslim" },
  { ar: "مَثَلُ الَّذِي يَذْكُرُ رَبَّهُ وَالَّذِي لَا يَذْكُرُ مَثَلُ الْحَيِّ وَالْمَيِّتِ", en: "The comparison of the one who remembers Allah and the one who does not is like the living and the dead", source: "Sahih Bukhari" },
  { ar: "كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ ثَقِيلَتَانِ فِي الْمِيزَانِ", en: "Two words are light on the tongue heavy on the scales and beloved to the Most Merciful SubhanAllahi wa bihamdihi SubhanAllahil Azeem", source: "Sahih Bukhari" },
  { ar: "أَفْضَلُ الذِّكْرِ لَا إِلَهَ إِلَّا اللَّهُ", en: "The best dhikr is La ilaha illallah", source: "Tirmidhi" },
  { ar: "اقْرَءُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لِأَصْحَابِهِ", en: "Read the Quran for it will come as an intercessor for its reciters on the Day of Resurrection", source: "Sahih Muslim" },
  { ar: "مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ", en: "Whoever recites a letter from the Book of Allah he will be credited with a good deed and a good deed gets a ten-fold reward", source: "Tirmidhi" },
  { ar: "زَيِّنُوا الْقُرْآنَ بِأَصْوَاتِكُمْ", en: "Adorn the Quran with your voices", source: "Abu Dawud" },
  { ar: "يَسِّرُوا وَلَا تُعَسِّرُوا", en: "Make things easy and do not make them difficult", source: "Sahih Bukhari" },
  { ar: "صَلُّوا كَمَا رَأَيْتُمُونِي أُصَلِّي", en: "Pray as you have seen me praying", source: "Sahih Bukhari" },
  { ar: "الطُّهُورُ شَطْرُ الْإِيمَانِ", en: "Cleanliness is half of faith", source: "Sahih Muslim" },
  { ar: "إِنَّ اللَّهَ جَمِيلٌ يُحِبُّ الْجَمَالَ", en: "Allah is beautiful and loves beauty", source: "Sahih Muslim" },
  { ar: "الدُّنْيَا سِجْنُ الْمُؤْمِنِ وَجَنَّةُ الْكَافِرِ", en: "The world is a prison for the believer and a paradise for the disbeliever", source: "Sahih Muslim" },
  { ar: "لَا تُسْرِفْ فِي الْمَاءِ وَلَوْ كُنْتَ عَلَى نَهَرٍ جَارٍ", en: "Do not waste water even if you are at a flowing river", source: "Ibn Majah" },
  { ar: "أَطْعِمُوا الْجَائِعَ وَعُودُوا الْمَرِيضَ", en: "Feed the hungry visit the sick and free the captive", source: "Sahih Bukhari" },
  { ar: "أَفْضَلُ الصَّدَقَةِ أَنْ تَصَّدَّقَ وَأَنْتَ صَحِيحٌ", en: "The best of charity is that which is given when you yourself are in need", source: "Sahih Bukhari" },
  { ar: "مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً نَفَّسَ اللَّهُ عَنْهُ", en: "Whoever removes a worldly hardship from a believer Allah will remove one of the hardships of the Day of Resurrection from him", source: "Sahih Muslim" },
  { ar: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ", en: "A Muslim is the one from whose tongue and hand other Muslims are safe", source: "Sahih Bukhari" },
  { ar: "لَا تَحْقِرَنَّ مِنَ الْمَعْرُوفِ شَيْئًا", en: "Do not belittle any good deed even meeting your brother with a cheerful face", source: "Sahih Muslim" },
  { ar: "أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا", en: "The most perfect believer in faith is the one who is best in moral character", source: "Tirmidhi" },
  { ar: "لَا حَسَدَ إِلَّا فِي اثْنَتَيْنِ", en: "Envy is not permitted except in two cases a man whom Allah has given wealth and he spends it righteously and a man whom Allah has given knowledge and he acts on it and teaches it", source: "Sahih Bukhari" },
  { ar: "إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ", en: "Allah does not look at your appearance or your wealth but He looks at your hearts and your deeds", source: "Sahih Muslim" },
  { ar: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ ضَيْفَهُ", en: "Whoever believes in Allah and the Last Day let him honour his guest", source: "Sahih Bukhari" },
];

/** Day of year from local midnight (0 on 1 Jan). Updates when the calendar date changes. */
function getDayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.floor((date - start) / (24 * 60 * 60 * 1000));
}

function getAyahNumberForToday(date = new Date()) {
  const dayOfYear = getDayOfYear(date);
  return ((dayOfYear + AYAH_OF_DAY_OFFSET) % TOTAL_QURAN_AYAHS) + 1;
}

function getDuaForToday(date = new Date()) {
  const dayOfYear = getDayOfYear(date);
  return DUAS_OF_DAY[dayOfYear % DUAS_OF_DAY.length];
}

function getHadithForToday(date = new Date()) {
  const dayOfYear = getDayOfYear(date);
  return HADITHS_OF_DAY[dayOfYear % 50];
}

function renderHadithOfDay(date = new Date()) {
  if (!hadithArEl || !hadithEnEl || !hadithSourceEl) return;
  const hadith = getHadithForToday(date);
  hadithArEl.textContent = hadith.ar;
  hadithEnEl.textContent = hadith.en;
  hadithSourceEl.textContent = hadith.source;
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
    renderHadithOfDay();
    loadAyahOfDay();
    renderDuaOfDay();
    scheduleMidnightRefresh();
  }, delay);
}

function initHomeDailySections() {
  renderHadithOfDay();
  loadAyahOfDay();
  renderDuaOfDay();
  scheduleMidnightRefresh();
}

initHomeDailySections();
