# The fresh, blind Opus read — [RALLY-PER-FORMATION] with [EDIT-BUTTON-AFTER-CHANGE] (19 Oct 26)

Saved as it arrived. Brief: `raptor-port/docs/superpowers/briefs/2026-10-19-rally-box-read.md`. Range `c4cad58e1..231108bce`;
read-only. It read the full rows (D1026–D1032, D1034, D505, D506, D503, D507, D509, D510, D591, D592, D45, D554, D1011), the
sheet (§3, §5, §8), the scenario list, both walkers' reports, the whole diff over src, e2e and rulecheck, and the code around it
(reporting.ts whole; textedit.ts from routeFocusOut; slots.ts; restore.ts and canonical; validate.ts; events.ts; boardChange;
describe / changesmodel / histbubble; the document click handlers; rowdrag).

## Findings

**F1 — medium — a timing-order fault caused by an R box is explained under the wrong control or nowhere, and a click on its
warning lights nothing.** Files: `src/engine/reporting.ts:147-159` (reportingIssuesForWave), `src/engine/validate.ts:697-698`,
`src/ui/html.ts:1286`. What a scheduler sees (walker A 4a/4b): R 10:00, take-off 12:00, B blank (suggested 09:40) → the list says
"VL: rally 10:00 is later than suggested brief 09:40"; with no typed in-time line nothing in the wave explains it and a click
rings nothing; with any in-time line, the red sentence sits under that line and a click rings the in-time block, not the R box —
the scheduler is pointed at the line not at fault. New with this build: before the box every in-time or rally came from a typed
line, so a REPORT_ORDER fault always had lines to be explained under (D509: "explained while editing"). Cause: a box rally has no
source line (`p:null`), so `sourceLines` holds only the in-time's lines; validate keys the warning to `it:di.gi` when any line is
involved, else to the first FCP seat, which with `who=[]` lights nothing; the typed-lines feedback prints all the wave's issues.
Fix: (1) `pick()` also returns `box: own!=null && time===instant(own)`; `resolveReporting` returns `rallyBox`. (2) `ReportingIssue`
gains `box?`; when the out-of-order pair includes 'rally' and `r.rallyBox`, push with `lines: []`, `box: true`. (3) validate keys
it `ff:di.gi.li.rl` when `issue.box`. (4) `data-warnkey="${fp}.rl"` on the R box (week and board) when not previewing — the FLT_NO_LEN
`${fp}.ld` precedent. (5) A `title` on the R box carrying the message, as `badAtt` does; filter `box` issues out of the
typed-lines feedback (html.ts:1286, routeReportingInput, routeFocusOut's two writes, refreshWaveReports). (6) Tests: engine
(box-only → `box:true`, the `ff:…rl` key; with an in-time line the line is not blamed), markup (the warnkey), e2e (a click rings the R box).

No other finding. B-F1, B-F3 fixed (verified in code); B-F2, A-FAIL (A), A-FAIL (B) older and filed.

## Checked and fine (its words, shortened to the points)
- The reader: the box is one more formation-specific rally — drops whole-wave typed RALLY lines incl. a whole-wave "RALLY AFTER IN
  TIME" (D505), beside a targeted rally the earlier counts (D506); never an in-time (D1034); the evening-before rule (D503); a
  standby wave carries none; a whole-wave "rally after in-time" is no longer reported unresolved once a box replaces it, a
  targeted one still is; with no take-off the box keeps its own clock.
- Every consumer reads the box through the one reader (crew rest, OIL on the published version's own formations, long day and
  work hours, `waveInTime` → "(prev day)", the week header note, the bands); "+ In-time" strips `rl` (D1031).
- Saving and amending: `TIME_TXT` has `rl`; `dayKeys` carries it; an issued copy without `rl` compares as empty (no phantom
  change); the log, changes window, pending list and Undo name it; export and PDF print the typed R only.
- The suggestion: editable surfaces only; View-only prints the brief suggestion, leaves R blank; Escape empties before the blur
  (no save, no Undo step); Enter saves (B-F3), a second save is a refused no-op; Tab clears the press note.
- The press-to-focus placement (B-F1): waits for its own address; dropped by another press, any key, 1.5 s; lands after the
  arrival's refresh, guarded by `activeElement===el`; a click landing first places it and the waiting placement finds it filled.
- The button-press hold: replays only when the pressed button is detached, no click reached it or an identical copy, and the
  button under the lift has the same markup; pointercancel drops it; a quick second press cancels it; no capture listener can
  make it miss "done" or fire twice; grips are not buttons; nothing sorts by itself after a time changes.
- The layouts and the Tab order (CS, MSN, R, B, TO, LD) as ruled; the tests match.
- Older, filed or ruled: a take-off moved before a typed R reads as the evening before (D503; worth a line on his look card);
  [LOGIC-WORDS-WORKHOURS]; [LOGIC-DONE-FIRST-PRESS]; [BOARD-NARROW-DESKTOP-REMARKS]; two tabs (the whole-week save).
- Saved data: the seed carries no `rl`; D56 has nothing to apply to.

## Round 2 — a fresh Opus, the fix commits 231108bce and e540ac14c only
**N1 (medium):** an in-time typed later than the box's rally ("10:30 IN TIME", R 10:00) — the typed lines went silent and the box
alone was blamed, though the in-time is always a typed line (D1034) and often the culprit. Fix: the in-time to rally pair keeps the
in-time's lines and `box:true`; the five typed-lines writers hide only a box fault that names no lines; a test. **N2 (low):** the R box's
words named only the first of its faults (in-time > rally > brief gives two). Fix: all joined. Checked and fine: the press-to-place
fix (waits for the arrival's refresh, focus re-checked, Tab / keys clear the note, 1.5 s expiry, member and view-only place
nothing); the box fault's key, frozen paper (no address), the read-only board, the peek, two formations on a wave. Both FIXED
(2352cf3df).

## Round 3 — a fresh Opus, the N1 / N2 fix only
**No findings.** The in-time list can never be empty when that pair fires; all five writers share one filter (no sixth); a box to
brief fault stays off the typed lines; no message twice. Observations, no failure: in the in-time to rally case a tap lights the R
box, not the line (one address a warning); a typed rally tying the box on a rally to brief fault stays silent (harmless, the tie).
