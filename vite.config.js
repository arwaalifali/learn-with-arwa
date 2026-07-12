import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: "index.html",
        about: "about.html",
        quran: "quran.html",
        surah: "surah.html",
        hadith: "hadith.html",
        duas: "duas.html",
        prayerTimes: "prayer-times.html",
        islamicCalendar: "islamic-calendar.html",
        feedback: "feedback.html",
      },
    },
  },
});
