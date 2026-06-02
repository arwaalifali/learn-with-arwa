import { observeFadeInElements } from "./common.js";

const ISLAMIC_EVENTS = [
  {
    id: "new-year",
    name: "Islamic New Year",
    hijriLabel: "1st Muharram",
    description:
      "The beginning of the new Islamic Hijri year. A time for reflection and renewal of faith.",
    schedule: {
      2025: { month: 5, day: 27, label: "27 June 2025" },
      2026: { month: 5, day: 16, label: "16 June 2026" },
    },
  },
  {
    id: "ashura",
    name: "Day of Ashura",
    hijriLabel: "10th Muharram",
    description:
      "A blessed day of fasting commemorating the day Allah saved Prophet Musa and his people.",
    schedule: {
      2025: { month: 6, day: 6, label: "6 July 2025" },
      2026: { month: 5, day: 25, label: "25 June 2026" },
    },
  },
  {
    id: "mawlid",
    name: "Mawlid an-Nabi",
    hijriLabel: "12th Rabi al-Awwal",
    description:
      "The birthday of our beloved Prophet Muhammad peace be upon him. A day of joy and sending salawat upon the Prophet.",
    schedule: {
      2025: { month: 8, day: 4, label: "4 September 2025" },
      2026: { month: 7, day: 24, label: "24 August 2026" },
    },
  },
  {
    id: "isra-miraj",
    name: "Isra and Mi'raj",
    hijriLabel: "27th Rajab",
    description:
      "The miraculous night journey of Prophet Muhammad peace be upon him from Makkah to Jerusalem and up through the heavens.",
    schedule: {
      2025: { month: 0, day: 28, label: "28 January 2025" },
      2026: { month: 0, day: 17, label: "17 January 2026" },
    },
  },
  {
    id: "baraah",
    name: "Laylatul Baraah",
    hijriLabel: "15th Shaban",
    description:
      "The Night of Forgiveness. It is recommended to spend this night in worship and seeking forgiveness from Allah.",
    schedule: {
      2025: { month: 1, day: 13, label: "13 February 2025" },
      2026: { month: 1, day: 2, label: "2 February 2026" },
    },
  },
  {
    id: "ramadan-start",
    name: "First day of Ramadan",
    hijriLabel: "1st Ramadan",
    description:
      "The blessed month of fasting begins. Muslims fast from dawn to sunset and increase in worship and recitation of the Quran.",
    schedule: {
      2025: { month: 2, day: 1, label: "1 March 2025" },
      2026: { month: 1, day: 18, label: "18 February 2026" },
    },
  },
  {
    id: "laylatul-qadr",
    name: "Laylatul Qadr",
    hijriLabel: "27th Ramadan",
    description:
      "The Night of Power. Better than a thousand months. Seek it in the last ten nights of Ramadan.",
    schedule: {
      2025: { month: 2, day: 27, label: "27 March 2025" },
      2026: { month: 2, day: 16, label: "16 March 2026" },
    },
  },
  {
    id: "eid-fitr",
    name: "Eid al-Fitr",
    hijriLabel: "1st Shawwal",
    description:
      "The festival of breaking the fast. Celebrated after the blessed month of Ramadan with prayer, family and gratitude to Allah.",
    schedule: {
      2025: { month: 2, day: 30, label: "30 March 2025" },
      2026: { month: 2, day: 19, label: "19 March 2026" },
    },
  },
  {
    id: "dhul-hijjah-ten",
    name: "First 10 days of Dhul Hijjah",
    hijriLabel: "1st–9th Dhul Hijjah",
    description:
      "The most blessed days of the entire year. The Prophet said no days are greater for good deeds than these ten days.",
    schedule: {
      2025: { month: 4, day: 28, label: "28 May 2025" },
      2026: { month: 4, day: 17, label: "17 May 2026" },
    },
  },
  {
    id: "arafah",
    name: "Day of Arafah",
    hijriLabel: "9th Dhul Hijjah",
    description:
      "The most important day of Hajj and one of the greatest days of the year. Fasting on this day expiates sins of two years.",
    schedule: {
      2025: { month: 5, day: 5, label: "5 June 2025" },
      2026: { month: 4, day: 25, label: "25 May 2026" },
    },
  },
  {
    id: "eid-adha",
    name: "Eid al-Adha",
    hijriLabel: "10th Dhul Hijjah",
    description:
      "The festival of sacrifice commemorating the willingness of Prophet Ibrahim to sacrifice his son in obedience to Allah.",
    schedule: {
      2025: { month: 5, day: 6, label: "6 June 2025" },
      2026: { month: 4, day: 26, label: "26 May 2026" },
    },
  },
  {
    id: "tashreeq",
    name: "Days of Tashreeq",
    hijriLabel: "11th–13th Dhul Hijjah",
    description:
      "The days of eating, drinking and remembering Allah. Pilgrims complete their Hajj rituals during these blessed days.",
    schedule: {
      2025: { month: 5, day: 7, label: "7 June to 9 June 2025" },
      2026: { month: 4, day: 27, label: "27 May to 29 May 2026" },
    },
  },
];

const statusEl = document.getElementById("islamic-calendar-status");
const panelEl = document.getElementById("islamic-calendar-panel");
const hijriDateEl = document.getElementById("islamic-calendar-hijri");
const gregorianDateEl = document.getElementById("islamic-calendar-gregorian");
const eventsEl = document.getElementById("islamic-calendar-events");

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatGregorianDate(date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getScheduleYear(calendarYear) {
  if (calendarYear <= 2025) return 2025;
  if (calendarYear >= 2026) return 2026;
  return calendarYear;
}

function gregorianDateFromSchedule(year, entry) {
  return startOfDay(new Date(year, entry.month, entry.day));
}

function formatCountdown(daysUntil) {
  if (daysUntil === 0) return "Today!";
  if (daysUntil < 0) {
    const daysAgo = Math.abs(daysUntil);
    return `${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`;
  }

  if (daysUntil < 30) {
    return `In ${daysUntil} day${daysUntil === 1 ? "" : "s"}`;
  }

  const months = Math.floor(daysUntil / 30);
  const remainder = daysUntil % 30;

  if (remainder === 0) {
    return `In ${months} month${months === 1 ? "" : "s"}`;
  }

  return `In ${months} month${months === 1 ? "" : "s"} ${remainder} day${remainder === 1 ? "" : "s"}`;
}

function parseGregorianFromApi(gregorian) {
  const month = gregorian.month?.number ?? gregorian.month;
  return startOfDay(
    new Date(Number(gregorian.year), Number(month) - 1, Number(gregorian.day))
  );
}

function buildEventsForDisplay() {
  const today = startOfDay(new Date());
  const calendarYear = today.getFullYear();
  const scheduleYear = getScheduleYear(calendarYear);

  return ISLAMIC_EVENTS.map((event) => {
    const entry = event.schedule[scheduleYear];
    const gregorianDate = gregorianDateFromSchedule(scheduleYear, entry);
    const daysUntil = Math.round((gregorianDate - today) / 86400000);

    return {
      event,
      gregorianDate,
      daysUntil,
      hijriLabel: event.hijriLabel,
      gregorianLabel: entry.label,
      scheduleYear,
    };
  });
}

function sortEvents(events) {
  return [...events].sort((a, b) => {
    const aPast = a.daysUntil < 0;
    const bPast = b.daysUntil < 0;
    if (aPast !== bPast) return aPast ? 1 : -1;
    if (!aPast) return a.daysUntil - b.daysUntil;
    return b.daysUntil - a.daysUntil;
  });
}

function renderHeader(hijri, gregorian) {
  const weekday = hijri.weekday?.en || "";
  const month = hijri.month?.en || "";
  const hijriText = `${weekday} · ${hijri.day} ${month} ${hijri.year} AH`.trim();

  if (hijriDateEl) {
    hijriDateEl.hidden = false;
    hijriDateEl.textContent = hijriText;
  }
  if (gregorianDateEl) {
    gregorianDateEl.textContent = formatGregorianDate(parseGregorianFromApi(gregorian));
  }
}

function renderHeaderGregorianOnly() {
  if (hijriDateEl) {
    hijriDateEl.hidden = true;
    hijriDateEl.textContent = "";
  }
  if (gregorianDateEl) {
    gregorianDateEl.textContent = formatGregorianDate(new Date());
  }
}

async function tryRenderHijriHeader() {
  try {
    const response = await fetch("https://api.aladhan.com/v1/gToH");
    if (!response.ok) {
      renderHeaderGregorianOnly();
      return;
    }
    const payload = await response.json();
    const hijri = payload?.data?.hijri;
    const gregorian = payload?.data?.gregorian;
    if (!hijri || !gregorian) {
      renderHeaderGregorianOnly();
      return;
    }
    renderHeader(hijri, gregorian);
  } catch {
    renderHeaderGregorianOnly();
  }
}

function renderEvents(events) {
  if (!eventsEl) return;

  let comingSoonAssigned = false;

  eventsEl.innerHTML = events
    .map((item) => {
      let cardClass = "islamic-event-card fade-in-element islamic-event-card--future";
      let badge = "";

      if (item.daysUntil < 0) {
        cardClass = "islamic-event-card islamic-event-card--past";
      } else if (item.daysUntil === 0) {
        cardClass = "islamic-event-card islamic-event-card--today";
      } else if (!comingSoonAssigned) {
        cardClass = "islamic-event-card islamic-event-card--soon";
        badge = '<span class="islamic-event-badge">Coming Soon</span>';
        comingSoonAssigned = true;
      }

      const countdownClass =
        item.daysUntil === 0
          ? "islamic-event-countdown islamic-event-countdown--today"
          : "islamic-event-countdown";

      return `
        <li class="${cardClass}">
          ${badge}
          <div class="islamic-event-head">
            <h2 class="islamic-event-name">${item.event.name}</h2>
            <p class="${countdownClass}">${formatCountdown(item.daysUntil)}</p>
          </div>
          <p class="islamic-event-hijri-date">${item.hijriLabel}</p>
          <p class="islamic-event-gregorian-date">${item.gregorianLabel}</p>
          <p class="islamic-event-description">${item.event.description}</p>
        </li>
      `;
    })
    .join("");
}

async function initIslamicCalendar() {
  if (statusEl) statusEl.hidden = true;
  if (panelEl) panelEl.hidden = false;

  const events = sortEvents(buildEventsForDisplay());
  renderEvents(events);

  await tryRenderHijriHeader();
  observeFadeInElements(panelEl);
}

initIslamicCalendar();
