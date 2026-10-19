# FrozenJR2026 — Project Primer

> Read this first at the start of any session on this project. It is the working context for Claude.
> Last updated: 2026-10-19 (initial handoff from Gemini-built code to Claude).

## What this is

A single-page **production portal and call board** for TTS Players' (Haverhill / Bradford, MA) production of *Disney's Frozen JR.* Families, cast and crew use it to see rehearsal calls, cast assignments, rehearsal music and the season calendar. Directors/crew log in with a PIN to post and archive rehearsal calls.

- **Live site:** https://cheeseman25.github.io/FrozenJR2026/ (GitHub Pages, `main` branch, repo root)
- **Repo:** `git@github.com:Cheeseman25/FrozenJR2026.git` (remote is SSH; branch `main`)
- **Local path:** `~/Development/FrozenJR2026`
- **History:** ~63 commits, nearly all "Update index.html" made through the GitHub web editor. Originally vibe-coded with Gemini.

## Architecture at a glance

```
Browser (GitHub Pages: index.html, React via in-browser Babel)
   │  GET  ?action=…            POST {action, pin, …}  (Content-Type: text/plain to avoid CORS preflight)
   ▼
Google Apps Script Web App  (CALLBOARD_BACKEND_URL …/macros/s/AKfycby…/exec)
   │  bound to a Google Sheet (uses SpreadsheetApp.getActiveSpreadsheet())
   ├── Sheet tab "Rehearsals"  → rehearsal call notices (read/write)
   ├── Sheet tab "Cast" (or any tab with "cast"/"character" in the name) → cast roster (read)
   ├── Google Calendar (CALENDAR_ID) → season schedule (read)
   └── Google Drive folder (MUSIC_ROOT_FOLDER_ID) + subfolders → audio tracks (read)

Fallback: cast also loads from a published-to-web CSV of the sheet (DIRECT_CAST_CSV_URL) if the backend fails.
```

There is **no build step**. `index.html` loads React 18 UMD, ReactDOM, Babel Standalone, Tailwind (CDN), canvas-confetti, Google Translate and GA4 from CDNs, and the whole app is one `<script type="text/babel">` block. Editing `index.html` and pushing to `main` is the deploy.

## Files

| File | Purpose |
|---|---|
| `index.html` | Entire frontend (~2,640 lines). Config constants at the top of the Babel script (~line 147), helpers, then one big `ProductionApp` component. |
| `apps-script/Code.gs` | Plain-text copy of the Apps Script backend (converted 2026-10-19 from the original TextEdit RTF). **Git-ignored** because it contains the admin PIN. Reference copy only; the live script is edited and deployed at script.google.com. Keep this file in sync whenever the backend changes. |
| `AppScript for Frozen.txt` | Original RTF copy from TextEdit. Superseded by `apps-script/Code.gs`; git-ignored; safe to delete. |
| `.gitignore` | Keeps `apps-script/` and the RTF copy out of the public repo. |
| `README.md` | Just the title. |
| `music/TTS Players Logo Haverhill Bradford.png` | Footer logo, served via raw.githubusercontent.com. |
| `music/Rehearsal Tracks/` | One sample mp3 + placeholder readme. Real tracks live in Google Drive. |
| `primer.md` | This file. |

## Key config (index.html, top of Babel script)

| Constant | What it is |
|---|---|
| `CALLBOARD_BACKEND_URL` | Apps Script web app `/exec` URL. Changes only if a *new deployment* is created (redeploying a new version of the same deployment keeps the URL). |
| `DIRECT_CAST_CSV_URL` | Published CSV of the cast sheet tab (fallback). |
| `CALENDAR_ID` | Public Google Calendar for the season (also duplicated in Apps Script `CONFIG`). |
| `GOOGLE_DRIVE_MUSIC_FOLDER_URL` | Drive music folder (same ID as Apps Script `MUSIC_ROOT_FOLDER_ID`). |
| `YOUTUBE_REHEARSAL_PLAYLIST_ID` | YouTube playlist embedded in the music tab. |
| `FROZEN_HERO_IMAGE_URL` | MTI hero artwork (hotlinked from mtishows.com). |
| `TTS_PLAYERS_LOGO_URL` | Footer logo (raw GitHub URL). |
| `PRODUCTION_AUDIO_TRACKS` | Hardcoded single-track fallback if Drive sync fails. |
| `INITIAL_CALL_TYPES` | Default rehearsal call types for the admin dropdown. |
| `TAB_INFO` | Defines the pages/routes (see below). |

GA4 measurement ID `G-1D8TXY3JM5` is in the `<head>`.

## Routing

Hash-based routing on a single page. `TAB_INFO` is the route table; `getInitialTab()` reads `location.hash` on load, `navigateToTab()` sets it, and a `hashchange` listener keeps state in sync with back/forward. Unknown hashes fall back to `callboard`. Every navigation fires a GA4 `page_view`.

| Route | Label | Content |
|---|---|---|
| `#callboard` (default) | 📅 Call Board & Schedule | Rehearsal call notices from the Sheet |
| `#cast` | 🎭 Cast Members | Mystery reveal cast cards |
| `#costumes` | 👗 Costumes | **Placeholder** ("coming soon"), confirmed empty, no content yet |
| `#music` | 🎵 Rehearsal Tracks | Drive audio player + YouTube playlist sub-view |
| `#videos` | 🎬 Choreography Vault | **Placeholder** ("coming soon"), confirmed empty, no content yet |
| `#calendar` | 🗓️ Master Schedule | Live Google Calendar feed |

Sub-views and overlays (not routed, component state only):
- Music tab sub-view: one button per Drive folder category (currently *Practice Tracks*, *Training Tracks*, *Performance Tracks*) plus `youtube`.
- Calendar view mode: `next8` (default) or `full`.
- Modals: Staff Login, Add/Edit Rehearsal Call, Calendar Event Details, Cast Celebration (role reveal).

A breadcrumb bar shows the current route and has a **Copy Direct Link** button that copies `…/FrozenJR2026/#<tab>`.

## Feature list

### Global
- Frozen-themed dark UI (Tailwind, Cinzel headings), animated canvas **snowfall** background.
- **Language switcher**: EN / ES / PT / العربية via hidden Google Translate widget (sets `googtrans` cookie; Arabic switches page to RTL).
- **Staff Login** (PIN) → "Director / Crew Admin" badge with Lock (logout). Session persists in `sessionStorage` for the tab.
- Header with MTI artwork; footer with TTS Players logo and MTI licensing line.
- **Cache-first loading**: cast, rehearsals, calendar and music are read from `localStorage` instantly, then refreshed from the backend on load.
- GA4 analytics events: `page_view`, `change_site_language`, `admin_login_success` / `admin_login_failed`, `select_rehearsal_track`, `calendar_view_mode_change`, `join_google_meet_click`, `open_google_calendar_click`, and others via `trackAnalyticsEvent()`.

### Call Board (`#callboard`)
- Active rehearsal notices, newest first; each card shows title, type badge, date/time, location, called performers, focus scenes/music, notes (URLs auto-linked).
- Full-cast calls are visually distinguished.
- Filter by actor or character name (full-cast/company calls always match).
- Backend status indicator ("Connected to Google Sheet Backend").
- Collapsible **Archived Rehearsal Notices** vault.
- **Admin only:** + New Call, ✏️ Edit, 📦 Archive / 🔄 Restore. Edit modal has title, date, call type (list or custom), time, location, performer picker (search, + Full Company, + Principals, + All Ensemble, Clear), focus scenes, notes, archived checkbox. Saves optimistically to local state, then POSTs to backend.

### Cast (`#cast`)
- Casting notice (two full casts; assignment depends on availability).
- **Mystery reveal cards**: each performer's role is hidden until tapped; tapping opens a celebration modal with confetti and a synthesized fanfare (Web Audio). Reveal All / Re-hide All.
- Search by performer or character; category filter chips (All Cast A–Z, Principal, Featured Ensemble, Ensemble).
- Refresh Cast button. Cast parsed by `processCastRows()`: finds columns by header keywords (category/type/group/tier; role/character/part; Cast A = summer/snow/cast a/actor/name; Cast B = winter/ice/cast b), drops "TBD", merges an actor's multiple roles into one card.
- Currently ~69 performers across Principal, Featured Ensemble, Ensemble.

### Costumes (`#costumes`) — placeholder only.

### Rehearsal Tracks (`#music`)
- Folder switcher built dynamically from Drive subfolders (track counts shown). Currently ~76 tracks.
- Embedded Drive audio preview player for the selected track, plus Download link.
- Track list per folder, natural-sorted by filename; Load Track / download per row.
- Open Drive Folder link, Sync Folder (clears cache and refetches).
- YouTube Stream sub-view embedding the rehearsal playlist (youtube-nocookie).

### Choreography Vault (`#videos`) — placeholder only.

### Master Schedule (`#calendar`)
- Events from Google Calendar (2 weeks back to ~8 months ahead), grouped by month. Currently ~26 events (Oct 2026 – Jan 2027).
- Next 8 Events vs Full Season Run toggle; search across title, location, description.
- Google Meet links auto-detected and badged; event details modal with Join Meet button.
- + Add to Google Calendar and Subscribe on iPhone/Mac (webcal ICS) links; Sync button.

## Backend API (Apps Script)

`CONFIG` in the script: `REHEARSALS_SHEET_NAME="Rehearsals"`, `CAST_SHEET_NAME="Cast"`, `CALENDAR_ID`, `MUSIC_ROOT_FOLDER_ID`, `DEFAULT_ADMIN_PIN` (overridable by Script Property `ADMIN_PIN`).

**GET** `CALLBOARD_BACKEND_URL?action=…` (frontend adds `&t=<timestamp>` cache-buster)
| action | Returns |
|---|---|
| *(none)* / `getRehearsals` | `[{id,title,date(YYYY-MM-DD),time,location,type,calledRoles[],focusScenes[],notes,isArchived}]` |
| `getCalendarEvents` | `[{id,title,startTime,endTime(ISO),isAllDay,location,description,meetLink}]` sorted by start |
| `getMusic` | `{status:"success", tracks:[{id,title,filename,category,previewUrl,downloadUrl}]}` — root folder files = "Practice Tracks", each direct subfolder = its own category (not recursive below one level) |
| `getCast` | Raw 2D array of the cast sheet (`getValues()`), parsed client-side |

**POST** body is JSON sent as `text/plain`:
| action | Body | Effect |
|---|---|---|
| `verifyPin` | `{pin}` | success/error |
| `save` | `{pin, item}` | Upsert row in Rehearsals by ID (new ID = `reh-<ms>`) |
| `archive` / `delete` | `{pin, id}` | Sets IsArchived (col 10) TRUE — never deletes rows |
| `unarchive` | `{pin, id}` | Sets IsArchived FALSE |

Rehearsals sheet columns: `ID, Title, Date, Time, Location, Type, CalledRoles, FocusScenes, Notes, IsArchived` (lists stored comma-separated; called performers stored as `"Name (Role)"`).

**Deploying backend changes:** edit in the Apps Script editor → Deploy → Manage deployments → edit the existing deployment → New version. That keeps the same `/exec` URL. Creating a *new* deployment changes the URL and requires updating `CALLBOARD_BACKEND_URL`.

## Known issues, risks and gotchas

- **Admin PIN is in the Apps Script.** `DEFAULT_ADMIN_PIN` is hardcoded. The repo is public, so the local copy (`apps-script/`) is git-ignored. Never commit it or paste the PIN into tracked files.
- Auth is a shared PIN, stored in `sessionStorage` and sent with every write. Fine for a call board; not real security.
- Admin edits update `localStorage` before the backend confirms; a failed save shows an alert but local view may diverge until refresh.
- Each visitor's `localStorage` caches data; stale-data bugs may be cache, not backend.
- In-browser Babel compiles ~2,600 lines on every page load (slower first paint on phones). A build step or precompiled JS would fix it if ever needed.
- Hero image is hotlinked from mtishows.com and could break if MTI changes the URL.
- `getMusic` only reads one level of subfolders.
- Calendar window is fixed at −14 / +240 days in the backend.
- The page contains real student names (cast); keep that data in the Sheet, not hardcoded in the repo.

## Workflow notes for Claude

- Work in `~/Development/FrozenJR2026` through the device shell. Edit `index.html` in place (sed/python), never by retyping it.
- Git needs **deletion permission** on the folder (lock files). Request it once before the first commit.
- Commit with clear messages (not "Update index.html"). Pushing over SSH from Claude's shell may be blocked; if so, the user pushes or the remote is switched to HTTPS.
- Pushing to `main` deploys to GitHub Pages within ~1 minute. Verify at the live URL in the browser pane after pushing.
- Backend changes: edit `apps-script/Code.gs`, then the user pastes it into the Apps Script editor (script.google.com) and redeploys as a new version of the existing deployment. Direct deploy via Google's `clasp` CLI is possible but not set up yet.
