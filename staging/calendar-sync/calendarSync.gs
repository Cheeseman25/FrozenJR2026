/**
 * calendarSync.gs  (STAGED DRAFT, not yet deployed or tested)
 *
 * Mirrors each rehearsal call on the Rehearsals sheet into a single event
 * on the public show calendar. Matched by an event tag holding the
 * rehearsal ID, so title/time edits don't create duplicates.
 *
 * Privacy: only CHARACTER names go into the event description.
 * Called performers are stored as "Name (Character)"; only the character
 * part is copied. Notes are NOT posted unless SYNC_INCLUDE_NOTES is true.
 *
 * Hook points (see README.md in this folder):
 *   - saveRehearsalCall(item)          -> call syncRehearsalToCalendar(rowObject)
 *   - setRehearsalArchivedStatus(...)  -> call syncRehearsalById(id)
 */

var SYNC_TAG_KEY = "rehearsalId";
var SYNC_INCLUDE_NOTES = false;      // keep false: calendar is public
var SYNC_DEFAULT_DURATION_MIN = 60;  // used when the call has no end time

/**
 * Entry point used by the save path. Wrapped so a calendar problem never
 * fails the save itself; errors are logged for the Apps Script execution log.
 */
function syncRehearsalToCalendar(reh) {
  try {
    var cal = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
    if (!cal) throw new Error("Calendar not found: " + CONFIG.CALENDAR_ID);

    var event = findSyncedEvent_(cal, reh.id, reh.date);

    if (reh.isArchived) {
      if (event) markCancelled_(event);
      return { status: "success", action: event ? "cancelled" : "none" };
    }

    var start = buildStart_(reh.date, reh.time);
    if (!start) {
      Logger.log("calendarSync: could not parse date/time for " + reh.id + " (" + reh.date + " " + reh.time + ")");
      return { status: "skipped", reason: "unparseable date/time" };
    }
    var end = new Date(start.getTime() + SYNC_DEFAULT_DURATION_MIN * 60000);
    var title = reh.title || "Rehearsal Call";
    var opts = { location: reh.location || "", description: buildDescription_(reh) };

    if (event) {
      event.setTitle(title);
      event.setTime(start, end);
      event.setLocation(opts.location);
      event.setDescription(opts.description);
      return { status: "success", action: "updated" };
    }

    var created = cal.createEvent(title, start, end, opts);
    created.setTag(SYNC_TAG_KEY, String(reh.id));
    return { status: "success", action: "created" };
  } catch (err) {
    Logger.log("calendarSync error for " + (reh && reh.id) + ": " + err);
    return { status: "error", message: String(err) };
  }
}

/** Re-sync one call by ID by reading its row from the sheet. */
function syncRehearsalById(id) {
  var rows = getRehearsalCalls().filter(function(r) { return String(r.id) === String(id); });
  if (rows.length === 0) return { status: "error", message: "not found" };
  return syncRehearsalToCalendar(rows[0]);
}

/** Manual backfill: run once from the Apps Script editor after deploying. */
function syncAllRehearsalsToCalendar() {
  var results = getRehearsalCalls().map(function(r) {
    return r.id + ": " + JSON.stringify(syncRehearsalToCalendar(r));
  });
  Logger.log(results.join("\n"));
  return results;
}

// ---------- helpers ----------

function findSyncedEvent_(cal, id, dateStr) {
  // Search a window around the call date (tags can't be queried directly).
  var d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) d = new Date();
  var from = new Date(d.getTime() - 2 * 86400000);
  var to = new Date(d.getTime() + 3 * 86400000);
  var events = cal.getEvents(from, to);
  for (var i = 0; i < events.length; i++) {
    if (events[i].getTag(SYNC_TAG_KEY) === String(id)) return events[i];
  }
  return null;
}

function markCancelled_(event) {
  var t = event.getTitle();
  if (t.indexOf("CANCELLED: ") !== 0) event.setTitle("CANCELLED: " + t);
}

/** Character names only, e.g. "Elsa, Anna, Olaf". Parses "Name (Character)". */
function buildDescription_(reh) {
  var lines = [];
  var roles = parseCommaList(reh.calledRoles).map(function(entry) {
    var m = String(entry).match(/\(([^)]+)\)\s*$/);
    return m ? m[1].trim() : null;   // no "(Character)" -> skip, never post the performer name
  }).filter(Boolean);
  // de-duplicate, keep order
  roles = roles.filter(function(v, i, a) { return a.indexOf(v) === i; });
  if (roles.length) lines.push("Characters called: " + roles.join(", "));
  if (reh.focusScenes && String(reh.focusScenes).trim()) lines.push("Focus: " + parseCommaList(reh.focusScenes).join(", "));
  if (SYNC_INCLUDE_NOTES && reh.notes) lines.push(String(reh.notes));
  return lines.join("\n");
}

/** Parses "2026-11-03" + "6:30 PM" (or "18:30") into a Date in the script's timezone. */
function buildStart_(dateStr, timeStr) {
  var m = String(dateStr || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  var t = String(timeStr || "").trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  var hh = 9, mm = 0;   // default 9:00 if no time given
  if (t) {
    hh = parseInt(t[1], 10);
    mm = t[2] ? parseInt(t[2], 10) : 0;
    if (t[3]) {
      var ap = t[3].toLowerCase();
      if (ap === "pm" && hh < 12) hh += 12;
      if (ap === "am" && hh === 12) hh = 0;
    }
  }
  return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10), hh, mm, 0);
}
