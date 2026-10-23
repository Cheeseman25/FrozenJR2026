# FrozenJR2026 — Project Primer

> Read this first at the start of any session on this project. It is the working context for Claude.
> Last updated: 2026-10-21. Shared engine (`src/`) + show settings (`show/show.config.js`) with a build step. Recent work: call form start/end pickers, calendar sync (call board → show calendar), and the attach-or-create prompt for calls with no matching calendar event. Status and where each piece lives: see **Calendar sync** below.
> The engine also lives in the template repo `Cheeseman25/ShowPortalTemplate`; future shows are created from it. Engine fixes go there too.

## What this is

A single-page **production portal and call board** for TTS Players' (Haverhill / Bradford, MA) production of *Disney's Frozen JR.* Families, cast and crew use it to see rehearsal calls, cast assignments, rehearsal music and the season calendar. Directors/crew log in with a PIN to post and archive rehearsal calls.

- **Live site:** https://cheeseman25.github.io/FrozenJR2026/ (GitHub Pages, `main` branch, repo root)
- **Repo:** `git@github.com:Cheeseman25/FrozenJR2026.git` (remote is SSH; branch `main`)
- **Local path:** `~/Development/FrozenJR2026`
- **History:** ~63 commits, nearly all "Update index.html" made through the GitHub web editor. Originally vibe-coded with Gemini.

## Architecture at a glance

```
Browser (GitHub Pages: built dist/ — index.html + assets/app-<hash>.js + assets/styles-<hash>.css)
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

**Build:** source lives in `src/`. `npm run build` (scripts/build.mjs) bundles the JSX with esbuild into one minified `assets/app-<hash>.js`, compiles Tailwind v3 + `src/styles.css` into `assets/styles-<hash>.css`, and writes `dist/index.html`. React 18 / ReactDOM still load as global UMD scripts from unpkg; canvas-confetti, Google Translate, GA4 and Google Fonts load from CDNs. No Babel and no Tailwind CDN in the browser.

**Deploy:** `.github/workflows/deploy.yml` builds on every push; pushes to `main` deploy `dist/` to GitHub Pages. Requires repo Settings → Pages → Source = "GitHub Actions". Other branches only build (a CI check).

## Files

| File | Purpose |
|---|---|
| `show/show.config.js` | **All Frozen-specific settings**: names/text, artwork/logo, Google IDs, analytics, languages, call types, cast column keywords (summer/snow, winter/ice), pages, snow background, theme colors (cyan/sky), `storagePrefix: "frozen"` (keeps existing visitors' cached data keys). |
| `src/index.html` | HTML shell; the build fills `{{pageTitle}}`, `{{icon}}`, languages and `<!--ANALYTICS-->` from the show settings, plus `<!--STYLES-->`, `<!--APP-->`. |
| `src/main.jsx` | Entry: mounts `<ProductionApp />`. |
| `src/App.jsx` | Root component: all state, data loading (fetch from Apps Script / CSV), handlers, memos. Builds a `ctx` object passed to every section. |
| `src/config.js` | Engine view of the settings (`SHOW` + named constants), page registry (`ALL_TABS` → `TAB_INFO` filtered by the show's `tabs`), `DEFAULT_TAB`, `storageKey()`. |
| `src/effects/snow.js` | Snow background (selected by `background: "snow"`). |
| `src/lib/*.js(x)` | Helpers: `analytics` (gtag events), `dates` (call board date parsing), `music` (natural sort), `celebration` (fanfare + confetti), `links` (auto-link URLs), `cast` (`processCastRows`). |
| `src/components/` | `Header`, `NavBar` (breadcrumb + tabs), `Footer`, `CallCard` (`renderCallCard(reh, isArchived, ctx)`). |
| `src/tabs/` | One file per route: `CallBoardTab`, `CastTab`, `CostumesTab`, `MusicTab`, `VideosTab`, `CalendarTab`. Each renders only when its tab is active. |
| `src/modals/` | `CalendarEventModal`, `CelebrationModal`, `LoginModal`, `EditCallModal` (call form), `CalendarChoiceModal` (attach-or-create prompt after a save). |
| `src/components/PickerInput.jsx` | Date/time input with a light drawn icon (the browser's dark icon is hidden in `styles.css`). Clicking the icon opens the native picker. |
| `src/lib/callTimes.js` | Time helpers for the call form: `to24`, `fromTimeInput`, `splitLegacyTime`, `timeRangeLabel`. |
| `src/styles.css` | Custom CSS (glass cards, background canvas, scrollbars, Google Translate banner hiding; colors via `theme()`), then the Tailwind directives. Tailwind must stay after the custom CSS so utilities override custom classes. |
| `tailwind.config.js` | Maps `primary` / `accent` / `page` colors from the show theme. Themed elements use `primary-*` / `accent-*` classes. |
| `scripts/build.mjs` | Build script (`--cdn-css` = preview build without the Tailwind CLI). |
| `package.json` | Dev dependencies: esbuild, tailwindcss@3. |
| `.github/workflows/deploy.yml` | Build + deploy to Pages. |
| `index.html` (root) | **Old single-file version**, kept as a fallback until the Actions deploy is confirmed; delete after switch-over. |
| `apps-script/Code.gs` | Plain-text copy of the Apps Script backend, **VERSION 4** (header comment says so). **Git-ignored** because it contains the admin PIN. Reference copy only; the live script is edited and deployed at script.google.com. Keep this file in sync whenever the backend changes. |
| `apps-script/calendarSync.gs` | **Calendar sync module, VERSION 4**, git-ignored along with the rest of `apps-script/`. Its source is committed on the `calendar-sync` branch at `staging/calendar-sync/calendarSync.gs` (not on `main`). |
| `AppScript for Frozen.txt` | Original RTF copy from TextEdit. Superseded by `apps-script/Code.gs`; git-ignored; safe to delete. |
| `.gitignore` | Keeps `apps-script/` and the RTF copy out of the public repo. |
| `README.md` | Just the title. |
| `music/TTS Players Logo Haverhill Bradford.png` | Footer logo, served via raw.githubusercontent.com. |
| `music/Rehearsal Tracks/` | One sample mp3 + placeholder readme. Real tracks live in Google Drive. |
| `primer.md` | This file. |

## Key settings (`show/show.config.js`)

| Setting | What it is |
|---|---|
| `backendUrl` | Apps Script web app `/exec` URL. Changes only if a *new deployment* is created (a new version of the same deployment keeps the URL). |
| `castCsvUrl` | Published CSV of the cast tab (fallback). |
| `calendarId` | Public Google Calendar for the season (also hardcoded in Frozen's Apps Script `CONFIG.CALENDAR_ID`). Calendar sync writes call details into its events. |
| `musicFolderUrl` | Drive music folder (same ID as Apps Script `MUSIC_ROOT_FOLDER_ID`). |
| `youtubePlaylistId` | YouTube playlist embedded in the music tab. |
| `videosPlaylistId` | YouTube playlist for the Choreography Vault. `""` shows "coming soon". |
| `youtubeApiKey` | YouTube Data API v3 key, restricted to `cheeseman25.github.io`. Lets the Vault list playlist entries automatically. `""` falls back to the plain playlist embed. |
| `artworkUrl` | MTI hero artwork (hotlinked from mtishows.com). |
| `company.logoUrl` | Footer logo (raw GitHub URL to `music/` in this repo). |
| `fallbackTracks` | Single-track fallback if Drive sync fails. |
| `callTypes` | Default rehearsal call types for the admin dropdown. |
| `analyticsId` | GA4 `G-1D8TXY3JM5`. |

Frozen's Apps Script still has its IDs and PIN in code (local `apps-script/Code.gs`, git-ignored). The template's script reads them from Script Properties instead; switching Frozen to it is optional.

## Routing

Hash-based routing on a single page. `TAB_INFO` is the route table; `getInitialTab()` reads `location.hash` on load, `navigateToTab()` sets it, and a `hashchange` listener keeps state in sync with back/forward. Unknown hashes fall back to `callboard`. Every navigation fires a GA4 `page_view`.

| Route | Label | Content |
|---|---|---|
| `#callboard` (default) | 📅 Call Board & Schedule | Rehearsal call notices from the Sheet |
| `#cast` | 🎭 Cast Members | Mystery reveal cast cards |
| `#costumes` | 👗 Costumes | **Placeholder** ("coming soon"), confirmed empty, no content yet |
| `#music` | 🎵 Rehearsal Tracks | Drive audio player + YouTube playlist sub-view |
| `#videos` | 🎬 Choreography Vault | Thumbnail picker over the choreography YouTube playlist (see section below) |
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
- **Call sync:** the call board's date, start and end time, location and called characters are written into the matching event on the show calendar (see **Calendar sync**).
- Collapsible **Archived Rehearsal Notices** vault.
- **Admin only:** + New Call, ✏️ Edit, 📦 Archive / 🔄 Restore. Edit modal has title, date (date picker), call type (list or custom), **Start and End time pickers** (5-minute steps; both required; end must be after start), location, performer picker (search, + Full Company, + Principals, + All Ensemble, Clear), focus scenes, notes, archived checkbox. Saves optimistically to local state, then POSTs to backend.
- **After save:** if no calendar event on that date matches the call's time, a prompt lists that date's events and offers **Attach to: <event>** or **Create new invite <start>–<end>**, or **Decide later**. Choice goes to the backend (`calendarAttach` / `calendarCreate`).

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

### Choreography Vault (`#videos`)

- Lists the choreography playlist (`videosPlaylistId`) through the YouTube Data API (`playlistItems.list`) when the tab opens. New entries added in YouTube appear on the next visit, with no code change.
- Renders a thumbnail grid. The selected video plays in a youtube-nocookie embed. The first entry plays by default.
- Pages through up to 500 entries (10 pages x 50). Skips hidden or removed entries and any ID that fails the 11-character check.
- Falls back to the plain playlist embed when `youtubeApiKey` is blank or the API call fails. Shows "coming soon" when `videosPlaylistId` is blank.
- Calls the API only while the tab is open, which keeps quota use low.

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
| `save` | `{pin, item}` | Upsert row in Rehearsals by ID (new ID = `reh-<ms>`). Returns `{status, id, sync}`; `sync.unmatched` lists active calls with no matching event and `sync.events` lists that date's events, for the prompt |
| `archive` / `delete` | `{pin, id}` | Sets IsArchived TRUE (column found by header name) — never deletes rows; re-syncs the call's date |
| `unarchive` | `{pin, id}` | Sets IsArchived FALSE; re-syncs |
| `calendarAttach` | `{pin, id, eventId}` | Attaches the call to an existing event on its date (sections rebuilt for that event). Event time is not changed |
| `calendarCreate` | `{pin, id}` | Creates a new calendar event for the call's time, with the call's details |

Rehearsals sheet columns: `ID, Title, Date, StartTime, EndTime, Location, Type, CalledRoles, FocusScenes, Notes, IsArchived` (**v3+**: `Time` was split into `StartTime` and `EndTime`; values like `5:30 PM`). Lists are stored comma-separated; called performers stored as `"Name (Role)"`. Saves write these columns by position; the archive column is found by its header name. Adding or reordering columns needs a matching backend change.

`getRehearsals` also returns `startTime` and `endTime` alongside the combined `time` text.

**Deploying backend changes:** edit in the Apps Script editor → Deploy → Manage deployments → edit the existing deployment → New version. That keeps the same `/exec` URL. Creating a *new* deployment changes the URL and requires updating `CALLBOARD_BACKEND_URL`.

## Known issues, risks and gotchas

- **Admin PIN is in the Apps Script.** `DEFAULT_ADMIN_PIN` is hardcoded. The repo is public, so the local copy (`apps-script/`) is git-ignored. Never commit it or paste the PIN into tracked files.
- Auth is a shared PIN, stored in `sessionStorage` and sent with every write. Fine for a call board; not real security.
- Admin edits update `localStorage` before the backend confirms; a failed save shows an alert but local view may diverge until refresh.
- Each visitor's `localStorage` caches data; stale-data bugs may be cache, not backend.
- Hero image is hotlinked from mtishows.com and could break if MTI changes the URL.
- `getMusic` only reads one level of subfolders.
- Calendar window is fixed at −14 / +240 days in the backend.
- **Calendar sync rules (v4).** Each date's active calls are matched to that date's events by time overlap. Matched events get a description rebuilt from all overlapping active calls, one labeled section per call. The description starts with the marker line `[Call board: updates automatically]`. Hand edits to a description that starts with that marker are overwritten on the next sync; events without the marker are never edited by the sync. Event times and titles are never changed by the sync. Events are never created by a save; a save only offers the prompt. A time the sync can't read is logged and skipped, never guessed (the old 9:00 AM default caused wrong events once).
- Calendar connector (in Claude) is **read-only** on the show calendar and only one Google account can be connected at a time, so edits to that calendar go through Apps Script running as the show account.
- Subscribed ICS feeds refresh slowly (hours); the in-app Master Schedule reads the calendar directly.
- The page contains real student names (cast); keep that data in the Sheet, not hardcoded in the repo.

## Keep the engine in sync (Frozen ⇄ template)

Engine changes are made in BOTH repos in the same session, as separate commits:
`Cheeseman25/FrozenJR2026` (the running show, where changes are tested with real data)
and `Cheeseman25/ShowPortalTemplate` (the starting point for future shows).

- **Copy** (engine, identical in both): `src/`, `scripts/`, `tailwind.config.js`, `package.json` devDependencies, `.github/workflows/`.
- **Never copy** (per show): `show/show.config.js`, `public/`, `music/`, `primer.md`, `README.md`.
- **New setting:** add it to the engine with a safe default for blank values, then add it to the template's blank `show/show.config.js` (commented) as well as Frozen's.
- **Backend:** the template's `apps-script/Code.gs` is the generic version (settings in Script Properties). Port backend logic changes to it; Frozen's own script is local only (git-ignored, contains its PIN).
- After copying, `diff -r` the engine paths between the two repos; the only expected difference is none.
- A settings-only change (new call type, colors, text) stays in the one show.

## Calendar sync (status and where things live)

- **Live now (main):** call form start/end pickers and light picker icons; the attach-or-create prompt in the app (`CalendarChoiceModal`, `callTimes.js`, `PickerInput.jsx`).
- **Frozen backend:** `apps-script/Code.gs` VERSION 4 and `apps-script/calendarSync.gs` VERSION 4 on the Mac (git-ignored, contain the PIN in Code.gs). The sync module's committed source is on branch `calendar-sync` at `staging/calendar-sync/calendarSync.gs`.
- **Template:** `ShowPortalTemplate` `main` has the same engine and the generic backend (`apps-script/Code.gs` and `calendarSync.gs`, VERSION 4). Its calendar ID is read from Script Properties (`getSetting("CALENDAR_ID")`), where Frozen uses `CONFIG.CALENDAR_ID`.
- **Testing:** the sync results and any prompt show in the Apps Script execution log. Confirm against the calendar after each save.
- **Known test leftovers:** an active "Test Call" on Oct 26 2026 in the Frozen sheet. Archive any test calls after testing.

## Workflow notes for Claude

- **Cloud sessions (phone or web):** GitHub is the source of truth. Clone or attach `Cheeseman25/FrozenJR2026` and read this file first. The device shell (`~/Development/...`) exists only when a session is linked to the Mac; without it, the Mac copies of `apps-script/` are unreachable and the user has to paste backend changes into Apps Script themselves.
- Git on the Mac cannot reach GitHub from the device shell (SSH and HTTPS are blocked). The user runs `git pull` / `git fetch` in Terminal. The stop-hook warning "branch has unpushed commits and no remote branch" comes from the Mac repo, which doesn't have the cloud-only branch yet. Check `git ls-remote` before pushing again.
- Branch flow used so far: change on a branch off `main`, confirm with the user, fast-forward `main`, push. Template changes follow as separate engine and backend commits.

- Work in a cloud clone of the GitHub repo, or in `~/Development/FrozenJR2026` through the device shell when linked. Frozen-only changes go in `show/show.config.js`; engine changes in `src/` (and in ShowPortalTemplate too). Never edit `dist/` (generated, git-ignored).
- Adding a new piece of state or handler a section needs: declare it in `App.jsx`, add it to the `ctx` object, destructure it in the section. A missing name fails silently as `undefined`, so check with a type-check or the comparison harness.
- The Mac's device shell has no network (no npm). The cloud workspace can't reach npm either but has esbuild preinstalled at /opt/npm-tools: build previews with `node scripts/build.mjs --cdn-css` after symlinking `node_modules/esbuild` and `node_modules/@esbuild` to it. Full builds (with the Tailwind CLI) run in GitHub Actions.
- Regression check used for the restructure: render old and new builds in headless Chromium (Playwright at /opt/npm-tools, browsers at /opt/pw-browsers) with mocked backend data, click through every tab/modal, and diff the DOM.
- Git needs **deletion permission** on the folder (lock files). Request it once before the first commit.
- Commit with clear messages (not "Update index.html"). Pushing over SSH from Claude's shell may be blocked; if so, the user pushes or the remote is switched to HTTPS.
- Pushing to `main` deploys to GitHub Pages within ~1 minute. Verify at the live URL in the browser pane after pushing.
- Backend changes: edit `apps-script/Code.gs` and `apps-script/calendarSync.gs`, then the user pastes them into the Apps Script editor (script.google.com) and redeploys as a new version of the existing deployment. Direct deploy via Google's `clasp` CLI is possible but not set up yet.
