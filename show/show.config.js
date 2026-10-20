/**
 * SHOW SETTINGS: everything specific to this production lives in this file.
 * The rest of the site (src/) is the shared engine and shouldn't need edits for a new show.
 *
 * Used by: the app (src/), the build (scripts/build.mjs) and Tailwind (tailwind.config.js).
 */
module.exports = {
  // Short, unique, lowercase. Prefixes the data this site saves in visitors' browsers.
  // Every site on <you>.github.io shares browser storage, so each show needs its own.
  // (Frozen keeps "frozen" so returning visitors' cached data and logins carry over.)
  storagePrefix: "frozen",

  // ---------------------------------------------------------------- names & text
  title: "Disney's Frozen JR.",          // full show name (artwork alt text, footer)
  shortTitle: "Frozen JR",               // breadcrumb label
  pageTitle: "Frozen JR. Production Portal & Call Board", // browser tab title
  playlistTitle: "Frozen JR. Rehearsal Music Playlist",   // YouTube embed title
  icon: "❄️",                           // favicon, loading spinner and card icons
  breadcrumbIcon: "❄",

  company: {
    name: "TTS Players",
    location: "Haverhill / Bradford, MA",
    logoUrl: "https://raw.githubusercontent.com/Cheeseman25/FrozenJR2026/main/music/TTS%20Players%20Logo%20Haverhill%20Bradford.png",
    logoAlt: "TTS Players Haverhill Bradford",
  },
  licenseLine: "Authorized Performance Materials Supplied by Music Theatre International (MTI)",
  artworkUrl: "https://www.mtishows.com/sites/default/files/styles/hero_responsive_wide/public/show/hero/000523_hero_0.jpg?itok=9msnKhTB",

  castNotice:
    "There will be two full casts of Frozen Jr. Which cast each actor will belong to will depend on availability. Featured ensemble roles have lines. Which featured ensemble member each actor will play will be assigned in rehearsals.",

  // Song titles used as examples on the Choreography page and in the call form.
  exampleNumbers: ["Fixer Upper", "Hygge", "In Summer"],
  focusScenesPlaceholder: 'e.g., Scene 4: "In Summer", Act 1 Harmonies',

  // ---------------------------------------------------------------- Google services
  backendUrl: "https://script.google.com/macros/s/AKfycbyof6K9TWBjXsSBevpx6hmk3VZ1971ob7jmng1Bo3piJiRQLujKPx7wLyyhqep8R_wn/exec",
  castCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRruIC2zvcxRfRrtKsgZmHoVOEsiJVEsY7wqRcZzpEkXlMA6_ASTsidzCGrdkp0_7Dt5247cCYCcXSJ/pub?gid=1788082919&single=true&output=csv",
  calendarId: "49b5ea63eac530c59fd5465d1fbbe1fd385a2235e24910c4a95371c07b95b5ab@group.calendar.google.com",
  musicFolderUrl: "https://drive.google.com/drive/folders/1WpVSq_wCG0RhjirsZFZjqOR3w50j4RPe?usp=sharing",
  youtubePlaylistId: "PLBDCgs4SWfnF2517NHRg4gLkayKkYssJb",
  analyticsId: "G-1D8TXY3JM5",          // Google Analytics 4; "" to turn off

  // Shown on the music page if the Drive folder can't be loaded. Can be [].
  fallbackTracks: [
    {
      id: "1kq-gfuJTOWOf5eCVCbtTUst2gzODpZvp",
      title: "Let the Sun Shine On",
      filename: "Let the Sun Shine On.mp3",
      category: "Practice Tracks",
      previewUrl: "https://drive.google.com/file/d/1kq-gfuJTOWOf5eCVCbtTUst2gzODpZvp/preview",
      downloadUrl: "https://drive.google.com/uc?export=download&id=1kq-gfuJTOWOf5eCVCbtTUst2gzODpZvp",
    },
  ],

  // ---------------------------------------------------------------- features
  // Pages shown in the menu, in order. Available: callboard, cast, costumes, music, videos, calendar.
  tabs: ["callboard", "cast", "costumes", "music", "videos", "calendar"],

  // Choices in the staff "New Rehearsal Call" form (staff can also type a custom one).
  callTypes: [
    "Saturday Company (Full Cast)",
    "Wednesday Partial Call",
    "Parent Meeting",
    "Principals Vocal Clinic",
    "Choreography Blocking",
    "Music & Harmonies",
    "Tech / Dress Rehearsal",
  ],

  // How the cast sheet's two cast columns are recognised (header text, lowercase).
  // "cast a" / "actor" / "name" and "cast b" always work; add your own cast names here.
  castColumnKeywords: { first: ["summer", "snow"], second: ["winter", "ice"] },

  // Language buttons (Google Translate). First entry is the site's own language.
  languages: [
    { code: "en", label: "EN" },
    { code: "es", label: "ES" },
    { code: "pt", label: "PT" },
    { code: "ar", label: "العربية" },
  ],

  // ---------------------------------------------------------------- look
  background: "snow",                    // "snow" or "none"
  theme: {
    // primary: buttons, borders, highlights. accent: secondary gradients.
    // Any Tailwind-style 50–950 scale works (hex). These are Tailwind's cyan and sky.
    primary: { 50: "#ecfeff", 100: "#cffafe", 200: "#a5f3fc", 300: "#67e8f9", 400: "#22d3ee", 500: "#06b6d4", 600: "#0891b2", 700: "#0e7490", 800: "#155e75", 900: "#164e63", 950: "#083344" },
    accent:  { 50: "#f0f9ff", 100: "#e0f2fe", 200: "#bae6fd", 300: "#7dd3fc", 400: "#38bdf8", 500: "#0ea5e9", 600: "#0284c7", 700: "#0369a1", 800: "#075985", 900: "#0c4a6e", 950: "#082f49" },
    pageGradient: { top: "#0c4a6e", bottom: "#031828" }, // page background
    confetti: ["#38bdf8", "#7dd3fc", "#bae6fd", "#f472b6", "#fbbf24", "#ffffff"],
  },
};
