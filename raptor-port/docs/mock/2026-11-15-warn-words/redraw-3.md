# Redraw 3 (after redraw 2) — picture E: the short NAMES of the checks, today and proposed

The app keeps a short name for each kind of warning (the engine's `WCODE` table, `raptor-port/src/engine/validate.ts`
line 25). It shows where warnings are counted by kind — Insights' list of warnings by type
(`src/ui/insights-html.ts`), the view-only schedule's warning list (`src/ui/html.ts` near line 2606, "<severity> ·
<name>"), and on the Logic page if it prints them (`src/ui/logic-html.ts` — look).

Make ONE pair, phone (402 WebKit @3x), in the same folder, cropped to the list:
- `e-names-today-phone.png` — REAL: the place where the most of these names show at once (Insights' warnings by type
  on the seeded week is the likely one; Monday's week has clashes, briefs, long days, crew rest). Sign in as the admin.
- `e-names-proposed-phone.png` — DRAWN on that same real list: change only the name text of the rows whose name is in
  the table below; counts, order and everything else untouched.

| Today's name | Proposed name |
|---|---|
| Conflict — two events at once | Clash |
| Personal input clash | Clash with a request |
| No time for the flight brief | Misses flight brief |
| No time for the flight debrief | Misses flight debrief |
| No time for the sim brief | Misses sim brief |
| No time for the sim debrief | Misses sim debrief |
| Tight turning — crew rest | Tight crew rest |
| Long work day | Long day |
| No break day — too many days in a row | Days in a row |
| Qualification — illegal seat | Wrong seat |
| Illegal aircrew combination | Crew not authorised |
| Crew combination — CO approval required | CO approval needed |
| OCU without IP | OCU with no IP |
| IRT without an IR examiner | IRT with no IR examiner |
| On shift — also down for a ground event | Overlaps standby |
| In-time window cut — busy between report and shift start | Busy before a standby shift |

Names not in the table stay as they are. Add both pictures to `manifest.json` (family "E — the checks' short names",
rows = the names shown, in order). Hand back: where the names show in the app (each place, in the app's own words),
which place the picture is of, and the names that appear in it.
