# The Tracker's down days from the Inputs — the code survey before the build (the night of 18 Oct 26; a read-only helper, condensed, saved as returned)

For D1002, D1003, D1005, D1018 (the design note `docs/superpowers/specs/2026-10-18-trk-down-days.md`).

1. **The two boxes:** `tracker/components/SidePanel.jsx` — `#downDays` (a number box → `core.setDownDays`) and `#upchit`
   (a `DateBox` → `core.setUpchit`) in the "Currency & flex" card. Setters in `tracker/app/core.js` (`setDownDays` with
   undo key `'downDays'`; `setUpchit`), writing `dates[s]`, then `stamp()`, `saveDates(s)`, `renderSide()`. **`downDays`
   is display only** — nothing else reads it (and since D1004 the currency bar does not).
2. **Where a course start belongs:** NOT `dates` (one record per student PER CHART, `v3:<course>:<sylId>:d:<s>`) but
   `pace` (`v3:<course>:pace:<s>`, per course and student whatever the chart, like the lulls) — `savePace`, `paceOf`,
   `setEpw` / `setTarget` the pattern to copy. `app/rows.js` leaves dates and pace as their own records. Export / import
   copies `dates` and `pace` whole (`fileFormat.js` checks each is a plain object), so a field inside `pace` travels with
   no format change.
3. **"+ Add":** `#addStu` → `core.addStudent` (a roster pick adds at once — `uiPick`); the new entry made inside its gesture
   (`marks[r.id] = {}`, `dates[r.id] = {lastSyll:null,lastCurr:null}`); a reused student's `kPace` read first. Default the
   course start to today there, only when no pace record exists.
4. **The Failures window to clone:** `FailLog()` in `SidePanel.jsx` — `.lullback` backdrop, `.lullcal.on.faillog#failLog`,
   `.lullhd` header (title, `.failtot` count, ✕), `.frow` rows, a `.mini` footer; opened by `#failTitle` (role button,
   Enter / Space); its state `failLog` / `openFailLog` / `closeFailLog` in core.js, listed in `windowUp()`, Escape handled
   with the other windows; CSS `.faillog .frow`, `.lullback`, `.lullcal` in `tracker.css`.
5. **The people bridge:** `tracker/people.js` imports nothing (a test fails if it does, or if `app/` or `components/` import
   `peoplewire`, `/engine/` or `/state/`); `setPeople` with a signature guard, and a second channel built the same way
   (`setGonePeople` / `getGonePeople` / `onGonePeople`). `tracker/peoplewire.ts` projects Raptor's PEOPLE on every notify.
   **The rider:** a third channel (`setMedInputs` / `getMedInputs` / `onMedInputs`, its own signature); peoplewire projects
   each man's downchits (`isDownchit`, `holds` / `leadOf`) as `{iid, type, startIso, endIso, half, allday}`, the dates
   resolved on Raptor's side (`medStartOrd` / `medEndOrd`), so core.js never sees `yr`.
6. **Counting:** downchits HL, OML, ATT C, ATT B (all allow a half day, `half: 'am' | 'pm'`); nothing counts down days
   today (the Leave War charges leave by halves, `leavewar/engine/dayview.ts`). **"Today" differs:** the Tracker's
   `isoToday()` is the real date; the main app's is a fixed demo date (`ui/weeknav.ts` TODAY 13 Jul 2026) — a running
   input counts to the Tracker's today.
7. **Tests touching the boxes:** `tracker.test.tsx` (the down-days undo step; the stamps), `trk-batch-ui.test.tsx` (D1004),
   `leftovers.test.tsx` (the Upchit box — several F/K tests drive `#upchit`), `e2e/datecal.spec.ts` (the Tracker's
   `#upchit`); the smoke suite checks neither box (its Failures window checks and `#addStu` uses are elsewhere).
