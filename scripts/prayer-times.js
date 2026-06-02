import { observeFadeInElements } from "./common.js";

const PRAYERS = [
  { key: "Fajr", label: "Fajr", icon: "🌙" },
  { key: "Sunrise", label: "Sunrise", icon: "🌅" },
  { key: "Dhuhr", label: "Dhuhr", icon: "☀️" },
  { key: "Asr", label: "Asr", icon: "🌤" },
  { key: "Maghrib", label: "Maghrib", icon: "🌆" },
  { key: "Isha", label: "Isha", icon: "🌃" },
  { key: "Midnight", label: "Midnight", icon: "🌑" },
];

const statusEl = document.getElementById("prayer-times-status");
const panelEl = document.getElementById("prayer-times-panel");
const hijriEl = document.getElementById("prayer-hijri-date");
const locationEl = document.getElementById("prayer-location");
const countdownEl = document.getElementById("prayer-countdown");
const listEl = document.getElementById("prayer-times-list");
const refreshBtn = document.getElementById("prayer-refresh-location");
const clockFormat12Btn = document.getElementById("clock-format-12");
const clockFormat24Btn = document.getElementById("clock-format-24");

const STORAGE_CLOCK_FORMAT = "prayer-clock-format";

let countdownTimerId = null;
let nextPrayerInfo = null;
let currentTimings = null;
let use24Hour = false;

function todayTimestamp() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

function formatDateForHijriApi(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function cleanTime(timeStr) {
  return (timeStr || "").split(" ")[0].trim();
}

function loadClockPreference() {
  const saved = localStorage.getItem(STORAGE_CLOCK_FORMAT);
  use24Hour = saved === "24";
}

function saveClockPreference() {
  localStorage.setItem(STORAGE_CLOCK_FORMAT, use24Hour ? "24" : "12");
}

function formatDisplayTime(timeStr) {
  const cleaned = cleanTime(timeStr);
  if (!cleaned) return "—";

  const [hours, minutes] = cleaned.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return cleaned;

  if (use24Hour) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  const period = hours >= 12 ? "PM" : "AM";
  let hour12 = hours % 12;
  if (hour12 === 0) hour12 = 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

function updateClockToggleUI() {
  if (clockFormat12Btn) {
    clockFormat12Btn.classList.toggle("is-active", !use24Hour);
    clockFormat12Btn.setAttribute("aria-pressed", String(!use24Hour));
  }
  if (clockFormat24Btn) {
    clockFormat24Btn.classList.toggle("is-active", use24Hour);
    clockFormat24Btn.setAttribute("aria-pressed", String(use24Hour));
  }
}

function setClockFormat(is24) {
  if (use24Hour === is24) return;
  use24Hour = is24;
  saveClockPreference();
  updateClockToggleUI();
  if (currentTimings) renderPrayerCards(currentTimings);
}

function getPrayerDateTime(timeStr, baseDate = new Date()) {
  const [hours, minutes] = cleanTime(timeStr).split(":").map(Number);
  const dt = new Date(baseDate);
  dt.setHours(hours, minutes, 0, 0);
  return dt;
}

function findNextPrayer(timings) {
  const now = new Date();
  const base = new Date(now);

  for (const prayer of PRAYERS) {
    const raw = timings[prayer.key];
    if (!raw) continue;
    const dt = getPrayerDateTime(raw, base);
    if (dt > now) {
      return { prayer, datetime: dt };
    }
  }

  const fajrRaw = timings.Fajr;
  if (fajrRaw) {
    const tomorrow = new Date(base);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dt = getPrayerDateTime(fajrRaw, tomorrow);
    return { prayer: PRAYERS[0], datetime: dt };
  }

  return null;
}

function formatCountdown(ms) {
  if (ms <= 0) return "now";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (hours > 0) {
    parts.push(`${hours} hour${hours === 1 ? "" : "s"}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
  }
  if (hours === 0 && minutes === 0) {
    parts.push(`${seconds} second${seconds === 1 ? "" : "s"}`);
  } else if (hours === 0 && minutes > 0 && seconds > 0) {
    parts.push(`${seconds} second${seconds === 1 ? "" : "s"}`);
  }

  return parts.join(" ");
}

function setStatus(html) {
  if (!statusEl) return;
  statusEl.innerHTML = html;
  statusEl.hidden = false;
}

function showLocationDenied() {
  if (panelEl) panelEl.hidden = true;
  setStatus(`
    <p class="prayer-times-error">Location access is needed to show accurate prayer times for where you are.</p>
    <p class="muted">Please allow location permission in your browser, then tap Refresh Location.</p>
    <button type="button" id="prayer-refresh-denied" class="btn btn-primary prayer-refresh-btn">Refresh Location</button>
  `);
  document.getElementById("prayer-refresh-denied")?.addEventListener("click", requestLocationAndLoad);
}

async function fetchHijriDate(date = new Date()) {
  const response = await fetch(
    `https://api.aladhan.com/v1/gToH?date=${formatDateForHijriApi(date)}`
  );
  if (!response.ok) throw new Error("Failed to fetch Hijri date.");
  const payload = await response.json();
  const hijri = payload?.data?.hijri;
  if (!hijri) throw new Error("Incomplete Hijri data.");

  const weekday = hijri.weekday?.en || "";
  const month = hijri.month?.en || "";
  const day = hijri.day;
  const year = hijri.year;
  return `${weekday} · ${day} ${month} ${year} AH`.trim();
}

async function fetchTimings(latitude, longitude) {
  const timestamp = todayTimestamp();
  const response = await fetch(
    `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${latitude}&longitude=${longitude}&method=2`
  );
  if (!response.ok) throw new Error("Failed to fetch prayer times.");
  const payload = await response.json();
  const timings = payload?.data?.timings;
  if (!timings) throw new Error("Incomplete prayer times.");
  return timings;
}

async function fetchLocationName(latitude, longitude) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!response.ok) throw new Error("Geocode failed");
    const data = await response.json();
    const address = data.address || {};
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.county ||
      address.state;
    const country = address.country;
    if (city && country) return `${city}, ${country}`;
    if (country) return country;
    if (city) return city;
  } catch {
    /* fall through */
  }
  return `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
}

function renderPrayerCards(timings) {
  if (!listEl) return;
  const nextKey = nextPrayerInfo?.prayer?.key;

  listEl.innerHTML = PRAYERS.map((prayer) => {
    const time = formatDisplayTime(timings[prayer.key]);
    const isNext = prayer.key === nextKey;
    return `
      <li class="prayer-card fade-in-element${isNext ? " prayer-card--next" : ""}">
        ${isNext ? '<span class="prayer-card-badge">Next Prayer</span>' : ""}
        <div class="prayer-card-row">
          <span class="prayer-card-name">${prayer.icon} ${prayer.label}</span>
          <span class="prayer-card-time">${time}</span>
        </div>
      </li>
    `;
  }).join("");
}

function updateCountdown() {
  if (!countdownEl || !nextPrayerInfo) return;

  const ms = nextPrayerInfo.datetime.getTime() - Date.now();
  const label = nextPrayerInfo.prayer.label;
  const text = formatCountdown(ms);

  if (ms <= 0) {
    countdownEl.textContent = `${label} is now`;
    return;
  }

  countdownEl.textContent = `${label} in ${text}`;
}

function startCountdown() {
  if (countdownTimerId) clearInterval(countdownTimerId);
  updateCountdown();
  countdownTimerId = window.setInterval(() => {
    if (nextPrayerInfo && nextPrayerInfo.datetime.getTime() - Date.now() <= 0 && currentTimings) {
      nextPrayerInfo = findNextPrayer(currentTimings);
      renderPrayerCards(currentTimings);
      if (panelEl && !panelEl.hidden) observeFadeInElements(panelEl);
    }
    updateCountdown();
  }, 1000);
}

async function loadPrayerData(latitude, longitude) {
  setStatus('<p class="muted">Loading today&apos;s prayer times…</p>');
  if (panelEl) panelEl.hidden = true;

  const [timings, hijriLabel, locationName] = await Promise.all([
    fetchTimings(latitude, longitude),
    fetchHijriDate(new Date()),
    fetchLocationName(latitude, longitude),
  ]);

  currentTimings = timings;
  nextPrayerInfo = findNextPrayer(timings);

  if (hijriEl) hijriEl.textContent = hijriLabel;
  if (locationEl) locationEl.textContent = locationName;

  renderPrayerCards(timings);
  startCountdown();

  if (statusEl) statusEl.hidden = true;
  if (panelEl) panelEl.hidden = false;
  observeFadeInElements(panelEl);
}

function requestLocationAndLoad() {
  if (!navigator.geolocation) {
    showLocationDenied();
    setStatus(
      '<p class="prayer-times-error">Your browser does not support location services.</p>'
    );
    return;
  }

  setStatus('<p class="muted">Finding your location…</p>');

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      loadPrayerData(latitude, longitude).catch(() => {
        setStatus(
          '<p class="prayer-times-error">Unable to load prayer times. Please check your connection and try again.</p>' +
            '<button type="button" id="prayer-retry-load" class="btn btn-primary prayer-refresh-btn">Try Again</button>'
        );
        document.getElementById("prayer-retry-load")?.addEventListener("click", requestLocationAndLoad);
      });
    },
    () => {
      showLocationDenied();
    },
    { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
  );
}

if (refreshBtn) {
  refreshBtn.addEventListener("click", requestLocationAndLoad);
}

loadClockPreference();
updateClockToggleUI();

clockFormat12Btn?.addEventListener("click", () => setClockFormat(false));
clockFormat24Btn?.addEventListener("click", () => setClockFormat(true));

requestLocationAndLoad();
