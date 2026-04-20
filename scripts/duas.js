const duaContent = [
  {
    title: "Morning Duas",
    items: [
      {
        ar: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
        translit:
          "Allahumma bika asbahna wa bika amsayna wa bika nahya wa bika namutu wa ilaykan-nushur.",
        en: "O Allah, by You we enter the morning and by You we enter the evening. By You we live and by You we die, and to You is the resurrection.",
      },
      {
        ar: "رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ ﷺ نَبِيًّا",
        translit:
          "Raditu billahi Rabban wa bil-Islami dinan wa bi Muhammadin ﷺ nabiyya.",
        en: "I am pleased with Allah as my Lord, Islam as my religion, and Muhammad ﷺ as my Prophet.",
      },
    ],
  },
  {
    title: "Evening Duas",
    items: [
      {
        ar: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ",
        translit: "Amsayna wa amsal-mulku lillah, wal-hamdu lillah.",
        en: "We have reached the evening and all dominion belongs to Allah, and all praise is for Allah.",
      },
      {
        ar: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ",
        translit: "Allahumma inni as'alukal-'afwa wal-'afiyah.",
        en: "O Allah, I ask You for forgiveness and well-being.",
      },
    ],
  },
  {
    title: "Daily Supplications",
    items: [
      {
        ar: "رَبِّ زِدْنِي عِلْمًا",
        translit: "Rabbi zidni 'ilma.",
        en: "My Lord, increase me in knowledge.",
      },
      {
        ar: "اللَّهُمَّ اغْفِرْ لِي وَلِوَالِدَيَّ",
        translit: "Allahummaghfir li wa liwalidayya.",
        en: "O Allah, forgive me and my parents.",
      },
    ],
  },
];

const duaSections = document.getElementById("dua-sections");

duaContent.forEach((group) => {
  const wrapper = document.createElement("section");
  wrapper.className = "dua-group";
  wrapper.innerHTML = `<h2>${group.title}</h2>`;

  group.items.forEach((dua) => {
    const card = document.createElement("article");
    card.className = "entry-card";
    card.innerHTML = `
      <p class="arabic">${dua.ar}</p>
      <p><strong>Transliteration:</strong> ${dua.translit}</p>
      <p>${dua.en}</p>
    `;
    wrapper.appendChild(card);
  });

  duaSections.appendChild(wrapper);
});
