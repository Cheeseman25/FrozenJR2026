// Site-wide configuration: backend URLs, IDs, defaults and the route table.

export const CALENDAR_ID = "49b5ea63eac530c59fd5465d1fbbe1fd385a2235e24910c4a95371c07b95b5ab@group.calendar.google.com";
export const YOUTUBE_REHEARSAL_PLAYLIST_ID = "PLBDCgs4SWfnF2517NHRg4gLkayKkYssJb";
export const FROZEN_HERO_IMAGE_URL = "https://www.mtishows.com/sites/default/files/styles/hero_responsive_wide/public/show/hero/000523_hero_0.jpg?itok=9msnKhTB";
export const TTS_PLAYERS_LOGO_URL = "https://raw.githubusercontent.com/Cheeseman25/FrozenJR2026/main/music/TTS%20Players%20Logo%20Haverhill%20Bradford.png";

export const CALLBOARD_BACKEND_URL = "https://script.google.com/macros/s/AKfycbyof6K9TWBjXsSBevpx6hmk3VZ1971ob7jmng1Bo3piJiRQLujKPx7wLyyhqep8R_wn/exec";
export const DIRECT_CAST_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRruIC2zvcxRfRrtKsgZmHoVOEsiJVEsY7wqRcZzpEkXlMA6_ASTsidzCGrdkp0_7Dt5247cCYCcXSJ/pub?gid=1788082919&single=true&output=csv";
export const GOOGLE_DRIVE_MUSIC_FOLDER_URL = "https://drive.google.com/drive/folders/1WpVSq_wCG0RhjirsZFZjqOR3w50j4RPe?usp=sharing";

export const PRODUCTION_AUDIO_TRACKS = [
  {
    id: "1kq-gfuJTOWOf5eCVCbtTUst2gzODpZvp",
    title: "Let the Sun Shine On",
    filename: "Let the Sun Shine On.mp3",
    category: "Practice Tracks",
    previewUrl: "https://drive.google.com/file/d/1kq-gfuJTOWOf5eCVCbtTUst2gzODpZvp/preview",
    downloadUrl: "https://drive.google.com/uc?export=download&id=1kq-gfuJTOWOf5eCVCbtTUst2gzODpZvp"
  }
];

export const INITIAL_CALL_TYPES = [
  'Saturday Company (Full Cast)',
  'Wednesday Partial Call',
  'Parent Meeting',
  'Principals Vocal Clinic',
  'Choreography Blocking',
  'Music & Harmonies',
  'Tech / Dress Rehearsal'
];

// Route table: each key is a #hash route rendered as a tab.
export const TAB_INFO = {
  callboard: { label: 'Call Board & Schedule', icon: '📅', path: 'callboard' },
  cast: { label: 'Cast Members', icon: '🎭', path: 'cast' },
  costumes: { label: 'Costumes', icon: '👗', path: 'costumes' },
  music: { label: 'Rehearsal Tracks', icon: '🎵', path: 'music' },
  videos: { label: 'Choreography Vault', icon: '🎬', path: 'videos' },
  calendar: { label: 'Master Schedule', icon: '🗓️', path: 'calendar' }
};
