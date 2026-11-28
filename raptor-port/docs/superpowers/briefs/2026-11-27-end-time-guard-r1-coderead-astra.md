**No qualifying defects found in `change.diff`.** I found no concrete failure introduced or worsened by this commit that meets the requested finding standard.

I traced the end-only rule through outlines, counts, sign-off, Publish day, Publish AL, and the time refusal before the OIL question. The existing exclusions remain intact. The legend addition is confined to Edit Schedule.

Read-only, in-memory probes against the actual calculation and painter passed for:

- Newly emptied boxes and new rows becoming red; filling every gap resetting the day.
- Reordering, deleted-row names retained for Undo, and restoration.
- Plan separation and carrying red when the working copy becomes Plan A.
- Repeated painting of board/week copies.
- End-only cases across all six row categories, plus the relevant exclusions.

These were isolated code probes, not browser interaction tests. I did not run the full suite or verify the legend’s rendered appearance. No files were changed.

**Tidiness, filed here only:** the newly added flying-line test at [timegaps.test.ts:179](/C:/rt/r1-cr/build/raptor-port/src/engine/timegaps.test.ts:179) belongs in the flying-line group, rather than the Common Programme group. Not fixed.