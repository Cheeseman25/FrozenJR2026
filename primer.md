# FrozenJR2026 — Project Primer

> Read this first at the start of any session on this project. It is the working context for Claude.
> Last updated: 2026-11-05 (added the **Show Casts** page `#shows`, AWS site only for now; see its feature section). Earlier: 2026-10-24 added **Planned work**: email allow-list access with admin panel, then detailed logging. Shared engine (`src/`) + show settings (`show/show.config.js`) with a build step. Recent work: Choreography Vault thumbnail picker that lists the YouTube playlist automatically (2026-10-22); call form start/end pickers, calendar sync (call board → show calendar), and the attach-or-create prompt for calls with no matching calendar event. Status and where each piece lives: see **Calendar sync** below.
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

**Deploy:** `.github/workflows/deploy.yml` builds on every push; pushes to `main` deploy `dist/` to GitHub Pages only while the repo variable `PAGES_DEPLOY` is `true` (otherwise the deploy job is skipped). Requires repo Settings → Pages → Source = "GitHub Actions". Other branches only build (a CI check).

## Files

| File | Purpose |
|---|---|
| `show/show.config.js` | **All Frozen-specific settings**: names/text, artwork/logo, Google IDs, analytics, languages, call types, cast column keywords (summer/snow, winter/ice), pages, snow background, theme colors (cyan/sky), `storagePrefix: "frozen"` (keeps existing visitors' cached data keys). |
| `src/index.html` | HTML shell; the build fills `{{pageTitle}}`, `{{icon}}`, languages and `<!--ANALYTICS-->` from the show settings, plus `<!--STYLES-->`, `<!--APP-->`. |
| `src/main.jsx` | Entry: mounts `<ProductionApp />`. |
| `src/App.jsx` | Root component: all state, data loading (fetch from Apps Script / CSV), handlers, memos. Builds a `ctx` object passed to every section. |
| `src/config.js` | Engine view of the settings (`SHOW` + named constants), page registry (`ALL_TABS` → `TAB_INFO` filtered by the show's `tabs`), `DEFAULT_TAB`, `storageKey()`. |
| `src/effects/snow.js` | Snow background (selected by `background: "snow"`). |
| `src/lib/*.js(x)` | Helpers: `analytics` (gtag events), `dates` (call board date parsing), `music` (natural sort), `celebration` (fanfare + confetti), `links` (auto-link URLs), `shows` (Shows sheet parsing and the grid/lookup helpers), `cast` (`processCastRows`). |
| `src/components/` | `Header`, `NavBar` (breadcrumb + tabs), `Footer`, `CallCard` (`renderCallCard(reh, isArchived, ctx)`). |
| `src/tabs/` | One file per route: `CallBoardTab`, `CastTab`, `ShowsTab`, `CostumesTab`, `MusicTab`, `VideosTab`, `CalendarTab`. Each renders only when its tab is active. |
| `src/modals/` | `CalendarEventModal`, `CelebrationModal`, `LoginModal`, `EditCallModal` (call form), `CalendarChoiceModal` (attach-or-create prompt after a save). |
| `src/components/PickerInput.jsx` | Date/time input with a light drawn icon (the browser's dark icon is hidden in `styles.css`). Clicking the icon opens the native picker. |
| `src/lib/callTimes.js` | Time helpers for the call form: `to24`, `fromTimeInput`, `splitLegacyTime`, `timeRangeLabel`. |
| `src/styles.css` | Custom CSS (glass cards, background canvas, scrollbars, Google Translate banner hiding; colors via `theme()`), then the Tailwind directives. Tailwind must stay after the custom CSS so utilities override custom classes. |
| `tailwind.config.js` | Maps `primary` / `accent` / `page` colors from the show theme. Themed elements use `primary-*` / `accent-*` classes. |
| `scripts/build.mjs` | Build script (`--cdn-css` = preview build without the Tailwind CLI). |
| `package.json` | Dev dependencies: esbuild, tailwindcss@3. |
| `.github/workflows/deploy.yml` | Build + deploy to Pages. |
| `index.html` (root) | **Old single-file version**, kept as a fallback until the Actions deploy is confirmed; delete after switch-over. |
| `apps-script/Code.gs` | Plain-text copy of the Apps Script backend, **VERSION 5** (header comment says so; adds the AWS bridge). **Git-ignored** because it contains the admin PIN. Reference copy only; the live script is edited and deployed at script.google.com. Keep this file in sync whenever the backend changes. |
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
| `castCsvUrl` | Published CSV of the cast tab (fallback). The GitHub Pages site reads it directly, so the link is readable in this public repo and in that site's code; the AWS build blanks it and uses `castApiUrl`. |
| `castApiUrl` / `showsApiUrl` | Same-site routes (`/api/cast`, `/api/shows`) that return the published cast / per-show cast CSV. The Lambda holds the Google links, so the links are not in the page code. Set in `show/show.aws.config.js`. Blank = use the direct link below. |
| `showsCsvUrl` | Direct published CSV link for the per-show tab, for a site with no API. Not set for Frozen (it would put the link in this public repo). |
| `showSchedule` | Date and time of each show for the Show Casts page, matched by order to the sheet's show blocks: `[{ label, week, date, time }]`. Frozen uses 12-hour times ("6:30 PM"). Missing entries fall back to the sheet's own header text. |
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
| `#shows` | 🎟️ Show Casts | Who is in which of the six shows (grid, by show, by performer, together). **Enabled on the AWS site only** via `tabs` in `show/show.aws.config.js`; hidden on GitHub Pages |
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

### Show Casts (`#shows`)
Built 2026-11-05 on the AWS site first. Four views over one table (character, show, actor), chosen by buttons at the top:
- **Grid:** characters down the left in sheet order (that order is the billing order), the six shows across with Week 1 / Week 2 labels. Each column header is a block with the date and the time (12-hour). Cells hold the actor's name; tapping a name opens By Performer, tapping a header opens By Show. The filter box matches characters and performers (matching names turn amber). No show-count column on purpose: the director does not want children comparing how many shows they have.
- **By Show:** pick one of six show buttons for the full cast, one entry per person with their role(s) joined by " · ".
- **By Performer:** search a name, see their roles in each of the six shows (3 + 3), with a "Who am I on stage with?" shortcut. No total count, for the same reason as the grid.
- **Together:** pick one or more performers; "All together" shows the shows that contain every chosen performer, "Any of them" shows shows with at least one. Each show lists who is in it and their roles.
- **Data:** the sheet tab `Sheet5` in the show's spreadsheet "Frozen Jr. (Fall 2026)", web-published as CSV. The publish link is NOT kept in this repo (the public primer must not carry the tab ID or the link). On the AWS site the page asks `GET /api/shows` (`showsApiUrl`); the Lambda reads the link from its `SHOWS_CSV_URL` setting. Layout: row 1 show labels, row 2 headings, then one `Character` + `Actor` column pair per show side by side with a blank spacer column. Rows are matched by position, so a repeated role (Chorus, Oaken Family, Castle Staff, Featured Townspeople) stays as separate rows. A person with two roles in one show appears once per show in the person-based views. Names are matched case-insensitively with spaces collapsed, so use the same full name everywhere. Parsed data is cached in `localStorage` key `<prefix>_shows_data_v2`.
- Code: `src/tabs/ShowsTab.jsx`, `src/lib/shows.js` (`parseCsv`, `parseShowRows`, `buildCharacterRows`, `indexAssignments`, `togetherByShow`). Settings `showsCsvUrl`, `showSchedule`; page key `shows` in `ALL_TABS` (`src/config.js`).
- Privacy: the published CSV is public like the cast list and shows real children's names and show assignments. The planned sign-in (see Planned work) should cover it; until then, publish only tabs that hold no contact details.

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

- **The cast publish link is public in git history.** `castCsvUrl` has been in `show/show.config.js` on public `main`, and a 2026-11-05 primer commit (`546b8cd`) also named the Sheet5 tab ID. Anyone who joins the publish ID and tab ID can read the published tabs. Removing the text does not remove history. Real fix: in Google, stop publishing and publish again (new link), then update the two Lambda settings; the GitHub Pages site's cast fallback breaks until it is retired because it must hold the link in the repo.
- **GitHub Pages cannot hide the link.** It is a static site with no server, so `castCsvUrl` stays in its code. Only the AWS site uses the server routes.
- **Unused Apps Script action `getShows`** (deployed as Apps Script version 30 on 2026-11-05) reads a tab named `Sheet5` in the script's own spreadsheet, which has no such tab, so it returns `[]`. The Show Casts page does not use it (it reads the published CSV). Remove it in the next script deploy; it is also in local `apps-script/Code.gs` (`CONFIG.SHOWS_SHEET_NAME`, `getShowCasts`).
- **Admin PIN is in the Apps Script.** `DEFAULT_ADMIN_PIN` is hardcoded. The repo is public, so the local copy (`apps-script/`) is git-ignored. Never commit it or paste the PIN into tracked files.
- **YouTube API key is in `show/show.config.js`** (`youtubeApiKey`). The repo is public, so anyone can read it. It is safe only because Google Cloud restricts it to HTTP referrer `https://cheeseman25.github.io/*` and to the YouTube Data API v3. If the key leaks or the restrictions change, rotate it in Google Cloud and update the setting.
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
- Backend changes: edit `apps-script/Code.gs` and `apps-script/calendarSync.gs`, then the user pastes them into the Apps Script editor (script.google.com) and redeploys as a new version of the existing deployment. `clasp` is installed on the Mac and signed in as the TTS Players Google account, so Claude can push and redeploy directly when asked (script ID `1JpqHQY24utiOUN8tQaQ0lwRKgM6c-Ur3YZI2wE_Zjns-fGqn2b7t8zLu`; keep the same web-app deployment so the `/exec` URL does not change).

## AWS hosting (second site, running side by side)

The same engine can be served from AWS on its own domain with its own call board API, while the GitHub Pages build keeps using Google.

- `npm run build` is unchanged: `show/show.config.js`, Apps Script for everything, deployed to GitHub Pages from `main`.
- `npm run build:aws` merges `show/show.aws.config.js` over the settings. The overrides are `callBoardUrl` (call board on `/api/calls`), `videosApiUrl` (playlist on `/api/videos`, so the YouTube key stays on the server), a blank `youtubeApiKey` and a logo hosted with the site. Only the merged result is bundled, so a blanked value is truly absent from the AWS build.
- The call board API is `aws/callboard-api/` (Lambda + DynamoDB; see its README). Cast, the calendar and the music folder still come from Apps Script and the Sheet, which the production team edits. Calendar updates for AWS-stored calls go through three bridge actions in the Apps Script (`awsSync`, `awsAttach`, `awsCreate`), protected by a shared secret kept in Parameter Store.
- Settings: `callBoardUrl` and `videosApiUrl` are optional. Blank means the old behaviour (`backendUrl`, and the browser-side `youtubeApiKey`).
- The two sites keep separate call lists (Sheet vs DynamoDB). Use one for real changes until the cutover.

### AWS clone: where things are (account 106490371111, Region us-east-2)
- Site `https://frozen2026.ttsplayershaverhillbradford.com` (Cloudflare DNS-only CNAME to CloudFront `E2CE6WJEO4KPN4`). Private S3 site bucket `frozen2026-ttsplayers-site-106490371111`, deploy bucket `frozen2026-ttsplayers-private-106490371111`.
- API: Lambda `frozen2026-callboard` (function URL with IAM auth, reached only through CloudFront OAC), DynamoDB `frozen2026-calls` (point-in-time recovery on), same-origin paths `/api/calls` and `/api/videos`.
- Secrets in SSM SecureStrings `/tts/frozen2026/{admin-pin,sync-secret,youtube-key}`. The YouTube key has no website restriction and is limited to YouTube Data API v3. The old key in this repo's history is burned; delete it in Google Cloud once the Pages site is retired.
- POSTs through CloudFront must send `x-amz-content-sha256`; `src/lib/callApi.js` does it for relative URLs.
- Deploy: `npm run build:aws`, upload `dist/` to the site bucket, invalidate CloudFront.
- **Sheet links stay server-side (2026-11-05).** Lambda `frozen2026-callboard` also serves `GET /api/cast` and `GET /api/shows`: it fetches the published CSV links from its settings `CAST_CSV_URL` and `SHOWS_CSV_URL` (never in git), caches 60 s, serves the last good copy if Google fails, and refuses non-CSV replies. CloudFront has matching behaviors (copied from `/api/videos`). The AWS bundle contains no `docs.google.com/spreadsheets` text. Updating a link = `UpdateFunctionConfiguration` on those two variables (merge with the existing ones); no site upload needed.
- The Show Casts tab (`shows`) is listed in `tabs` in `show/show.aws.config.js`, so only this site shows it. Deploy as usual; the CSS file hash changes when new classes are used, so upload every changed file in `dist/assets/` plus `index.html`.
- New shows: use the template repo's `aws/README.md` and CloudFormation stack (this clone was built by hand).
- Status: side by side, no cutover yet. Planned cutover: rename this repo to a private name and publish a tiny public repo named `FrozenJR2026` containing only a redirect (making this repo private unpublishes its Pages site on a free plan).

## Planned work (not built yet)

Build in this order (step 3 is best built together with step 1). All three are engine features: make them in both repos (see CLAUDE.md), with show-specific values in `show/show.config.js`. They apply to the AWS site only (`npm run build:aws`); the GitHub Pages build is unchanged and keeps the PIN until it is retired.

**Decided (2026-10-24):** Cognito holds logins; the Sheet is only the allow list; invite model (approved Sheet row creates the Cognito user and emails an invite); unknown emails notify the admins with Approve / Deny links; admin panel on the page for use from a phone; detailed logging follows.

**Before starting:** follow CLAUDE.md (fetch, check the Mac copy). Ask the user the open choices at the end of step 1, and load the AWS skills first (`aws-auth`, `aws-serverless`, `aws-iam`, `aws-messaging-and-streaming` for SES). Stay in the project Region (us-east-2); no Lambda@Edge, no cross-Region resources. Ask about the SES sandbox, since new projects start with sending limited to verified addresses.

### 1. Per-user access: Cognito logins, with the Sheet as the registration allow list, plus a phone-friendly admin panel

Goal: visitors have a real login and only listed people can register. The shared staff PIN stays until this ships; it is not real security.

- **Logins and passwords live in Cognito, not the Sheet.** Reuse the pattern already built for ryanjclarke.com `/italy2026` (Lambda `italy2026-auth`: Cognito code + PKCE login, HttpOnly cookie, function URL behind CloudFront OAC; see the `ryanjclarke-site-aws` memory). Copy that pattern into a new user pool for the show (new path, pool, app client, callback URL); don't modify `/italy2026`. The Sheet never holds passwords, hashes or tokens.
- **The Sheet is only the allow list:** a tab (for example `Access`) with `Email, Name, Role (viewer/crew/admin), Status (approved/denied/pending), AddedBy, AddedOn`. The production crew already edit this Sheet. Emails are compared lowercase and trimmed. It answers one question: "may this email register?"
- **How the allow list gates registration (decided 2026-10-24: invite model):** the pool stays closed, so nobody can self-register. The Sheet and the admin notification flow control who gets an account:
  - An email set to `approved` in the Sheet (added by hand, or from the admin panel) gets a Cognito user through `AdminCreateUser`, which emails the invite and temporary password. The server also picks up Sheet edits made by hand (a periodic check or an "Apply changes" button in the panel), so crew can add someone in the Sheet and the invite still goes out.
  - An email not in the Sheet can ask for access on the login page. That creates a `pending` row and starts the admin notify flow below. Approving it turns the row to `approved` and sends the invite.
  - Removing a row or setting it to `denied` disables the Cognito user and signs them out.
- **Reading and writing the Sheet from AWS:** through the existing Apps Script bridge pattern (shared secret kept in Parameter Store, as with `awsSync`), so the Lambda needs no Google credentials. Cache allow-list reads briefly; don't hit the Sheet on every request.
- **Roles:** the Sheet `Role` column is the source of truth. When a person is approved or their role changes, set the matching Cognito group (`viewer`, `crew`, `admin`) so the Lambda can check the signed token without calling the Sheet.
- **Where the check runs:** on the server (the AWS Lambda), on every API call, not just in the page. Hiding tabs in the browser is not access control. Cast names are real students, so the cast data endpoint must be protected too. This applies to the AWS site only; the GitHub Pages site has no Cognito and keeps the PIN until it is retired.
- **Sessions:** use short logins (12 hour cookie and token) like the Italy default.
- **Unknown email flow:** someone requests access with an email not on the list. The server adds a `pending` row and emails the production crew address(es) (a setting, for example `accessNotifyEmails`). The email shows the person's email and name and has two links, **Approve** and **Deny**. Tapping a link must work from a phone with no login to code or AWS.
  - Links carry a signed, expiring, single-use token (HMAC with a secret in Parameter Store), bound to the one email and one action.
  - Mail scanners and link previews fetch links automatically. A GET link must open a small confirmation page with one button that POSTs the decision. Do not change state on GET.
  - Approve sets the Sheet row to `approved`, creates the Cognito user and sends the invite. Deny sets `denied` and tells the person. Repeat requests from a pending email must not email the crew again.
  - Sending: SES from the AWS site (needs a verified sender and out of sandbox).
- **Admin panel on the page:** a staff-only tab (for example `#access`) for `admin` role users, built mobile first. It lists pending requests with Approve / Deny, lists approved people with remove and role change, and has an "Add email" box. Every change goes through the server, updates the Sheet (and Cognito), and records who made it. Removing someone also disables their Cognito user and signs them out (`AdminUserGlobalSignOut`).
- **Safeguards:** at least one admin email in settings so nobody can lock everyone out; confirm before an admin removes their own admin role; rate-limit access requests so the crew inbox can't be flooded.
- **Open choices to settle with the user before coding:** crew notification addresses, who counts as admin, whether the whole site or only some tabs are gated, and whether the PIN is retired or kept as a fallback.

**Build plan for step 1 (suggested slices, each testable on its own):**
1. Cognito user pool and app client for the show (sign-up disabled, 12 hour tokens, groups `viewer` / `crew` / `admin`), plus the login Lambda copied from the Italy pattern. Gate the whole AWS site behind it, with the first admin created by hand.
2. Apps Script bridge actions to read and update the `Access` tab, protected by the shared secret in Parameter Store. Port them to the template's generic `Code.gs`.
3. Invite sync: approved row creates the Cognito user and group; denied or removed row disables the user and signs them out.
4. Request-access form on the login page, `pending` row, admin notification email through SES, and the signed Approve / Deny confirm pages.
5. Admin panel tab (`#access`), mobile first, checked on a phone-sized screen.
6. Move the call board write actions from the PIN to the signed-in `crew` / `admin` role. Retire or keep the PIN per the user's choice.
7. Update the template repo's `aws/README.md` and CloudFormation stack so new shows get the auth setup, and update this primer (Files, Settings, API sections).

New settings to add with safe blank defaults in the engine: `accessNotifyEmails`, `adminEmails`, `accessSheetTab`, and the Cognito pool, client and domain IDs. New secrets (link-signing key, bridge secret) go in Parameter Store under `/tts/<show>/`, never in the repo.

### 2. Detailed activity logging

Goal: know who used the site and what they did. Google Analytics (GA4, `G-1D8TXY3JM5`) stays for traffic trends, but it is anonymous, sampled and blockable, so it can't answer "who".

- **Build on step 1:** once visitors sign in, every event can carry the verified email. Build this after step 1.
- **What to record:** sign-in, denied or pending attempts, tab views, call saves / edits / archives (with before and after values), access approvals and denials (who decided), music plays and downloads, calendar and Meet link clicks, cast reveals, errors. Each record: time, email, role, action, target, device / browser summary.
- **Where:** a DynamoDB table on the AWS site written by the Lambda (server-side events cannot be skipped by the browser). The Pages site has no sign-in, so it gets no per-person log. Browser events (tab views, plays) go to a small `/api/log` endpoint that checks the sign-in token. Keep writes cheap (batch, fire and forget, never block the page).
- **Viewing it:** a staff-only "Activity" view in the admin panel with filters by person, action and date, plus a CSV download.
- **Privacy:** the cast are minors. Log the minimum (email, action, time); don't store IP addresses or free-text content unless needed. Set a retention period (for example delete after 12 months, using DynamoDB TTL) and say so in the footer or privacy note.

### 3. Private Google Sheets access: a service account instead of web-published links
Goal: the production team keeps editing the Sheet as a group, but the data is not published to the web. Only the owner, the team members the owner shares with, Claude (through the owner's Google connection) and the Lambda can read it. Decided as a direction on 2026-11-05; not built.

- **Why:** a web-published tab is readable by anyone who has the link, and the Frozen publish link is already in public git history (see Known issues). The `/api/cast` and `/api/shows` routes hide the link from the page, but the data itself is still published. A private sheet has no link to leak and nothing to rotate.
- **How:** create a Google Cloud project (free), switch on the Sheets API, create a **service account** (a robot Google login with its own email), and share the spreadsheet with that email as **Viewer**. The Lambda signs in as the robot and reads tabs with `spreadsheets.values.get`; the page keeps calling `/api/cast` and `/api/shows`, so the front end does not change. Unpublish the tabs afterwards.
- **Credential:** start with the robot's JSON key in SSM Parameter Store as a SecureString (same pattern as the PIN and YouTube key). A keyless option exists (workload identity federation, where the Lambda's AWS role is trusted by Google); more setup, so only if the key becomes a concern.
- **Code:** replace the "fetch the published CSV link" step in `readSheet()` (`aws/callboard-api/index.mjs`) with a Sheets API call. Sign the Google token request with Node's built-in `crypto` (RS256) to avoid a large library. Keep the 60 second cache, the last-good-copy fallback and the tests; add tests for token failure and an unshared sheet. New settings: spreadsheet ID and tab names per route (not secret). The `CAST_CSV_URL` / `SHOWS_CSV_URL` variables and the `CastCsvUrl` / `ShowsCsvUrl` stack parameters are then retired.
- **Combine with step 1:** with Cognito in front, the routes also check who is asking, so the cast list needs both a login and the private sheet.
- **Later, same pattern:** the Calendar and the music folder (now read through Apps Script) can move to the Calendar and Drive APIs with the same robot.
- **Cost:** none at this scale (Sheets API read quota is far above the use here). Updates appear in about a minute instead of the several-minute lag of a published copy. Setup is about 20 minutes of clicking in Google Cloud plus the code change.
