# Calendar sync: staged, not deployed

Status: drafted from the template backend's structure. Frozen's Code.gs is on the Mac
(git-ignored), so the exact hook lines must be checked against it first.

## Steps when the Mac is back
1. Read Frozen's apps-script/Code.gs. Confirm: CONFIG.CALENDAR_ID exists, the functions
   saveRehearsalCall / setRehearsalArchivedStatus / getRehearsalCalls match, and the time
   format stored in the Rehearsals sheet (the parser handles "6:30 PM", "18:30", "6 PM").
2. Paste calendarSync.gs into the Apps Script project (new file, same project).
3. In saveRehearsalCall, after the sheet write and before `return`, add:
       syncRehearsalToCalendar(item);
   (`item` has id, title, date, time, location, calledRoles, focusScenes, notes, isArchived.)
   Use the saved row values if `item.calledRoles` may be a string rather than an array; the
   parser accepts both.
4. In setRehearsalArchivedStatus, inside the `if (found)` block, add:
       syncRehearsalById(id);
5. Run syncAllRehearsalsToCalendar() once from the editor to backfill existing calls.
   Authorize the calendar permission when prompted.
6. Deploy as a NEW VERSION of the existing deployment (same /exec URL).

## Test checklist (use a throwaway test call first)
- Create a call: one event appears on the calendar at the right date/time with location.
- Edit its time and title: the same event moves; no duplicate.
- Add called performers: description shows character names only, no performer names.
- Archive it: event title becomes "CANCELLED: ...".
- Restore it: title returns to normal and the details refresh.
- Confirm the public calendar still lists the event as expected.
- Allow the ICS subscription time to refresh before judging the feed (can take hours).
- Delete the test event from the calendar afterward.

## Open items
- Time zone: the script uses the Apps Script project's time zone. Confirm it's Eastern.
- Duration: defaults to 60 minutes. Tell me if calls need different lengths.
- Notes: left off the calendar (SYNC_INCLUDE_NOTES = false). Say if you want them included.
