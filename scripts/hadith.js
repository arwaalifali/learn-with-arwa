import { observeFadeInElements } from "./common.js";

const hadiths = [
  {
    ar: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",
    en: "Actions are judged by intentions.",
    source: "Sahih Bukhari & Sahih Muslim",
  },
  {
    ar: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    en: "The best among you are those who learn the Quran and teach it.",
    source: "Sahih Bukhari",
  },
  {
    ar: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    en: "None of you truly believes until he loves for his brother what he loves for himself.",
    source: "Sahih Bukhari & Sahih Muslim",
  },
  {
    ar: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    en: "Whoever believes in Allah and the Last Day should speak good or remain silent.",
    source: "Sahih Bukhari & Sahih Muslim",
  },
  {
    ar: "أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
    en: "The most beloved deeds to Allah are those done regularly, even if they are small.",
    source: "Sahih Bukhari",
  },
  {
    ar: "الدُّعَاءُ هُوَ الْعِبَادَةُ",
    en: "Supplication is worship.",
    source: "Jami` at-Tirmidhi",
  },
];

const hadithGrid = document.getElementById("hadith-grid");

hadiths.forEach((hadith) => {
  const card = document.createElement("article");
  card.className = "entry-card fade-in-element";
  card.innerHTML = `
    <p class="arabic">${hadith.ar}</p>
    <p>${hadith.en}</p>
    <p class="entry-source">${hadith.source}</p>
  `;
  hadithGrid.appendChild(card);
});

observeFadeInElements(hadithGrid);
