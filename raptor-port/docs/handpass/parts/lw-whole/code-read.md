# [LW-WHOLE-LEAVE-WINDOW] — the blind code read (D790), 28 Oct 26

A fresh, blind Opus reader, given the spec, the scenario report, the evidence sheet and the diff `603feaa93..1e9afdc75`.
Condensed by the host; each finding's failure, cause and fix kept.

**Findings: 1 HIGH · 0 MEDIUM · 1 LOW.**

**F1 (HIGH) — a one-day window could delete, re-type or decide days it never showed.** A four-day pending LL 9–12 Feb
with the words "Wedding", and a separate LL on Fri 13: a tap on the 13th opens the one-day window (no chips). Typing
"Wedding" and pressing Delete without leaving the box took all five days in one command; OL re-typed five; Approve
approved five — and the same with no typing if another tab joined the 13th under the open window. *Cause:* `pick` starts
"all" in every window, and the press's re-read (`wholeNow`, the scenario designer's G4) asked only `pick === 'all'`: the
words saved by `flushWords` joined the 13th to the run, and every press took the whole-leave path; it also beat a range
picked with "Pick a range". *Fix:* re-read only on a window that drew a leave of several days, no range picked — `run &&
!span && pick === 'all'`. **Done, red first** (`wholeleave.test.tsx` — three F1 cases, red before the fix); **its twin
closed too**: a range picked wins over a leave joined under the window, the title and mark never turning to the leave
while the buttons act on the range (`whole` and the chips also ask `!span`; one more case, red before).

**F2 (LOW) — the browser test could no longer fail on what it said it checked:** "one line" was compared with a width
worked out from the same buttons, and the height check sat behind `if (all.fits)`. *Fix:* pin Arial-width letters on every
machine (Arial here, Liberation Sans — its metric twin — on GitHub's), at his iPhone's 402, and assert one line and the
single day's row height outright; keep the Verdana block as the wrap test. **Done.**

**Checked and found sound:** `clearRecords` against `clearRecordById` / `clearCells` (the same gates; filtered before the
command; one `lw.edit`, one Undo, a bell line); Approve / Refuse on "All" through `decideRequests` (checked whole before
anything is written; a morning run beside an afternoon bid decides only the run — better than `setBidStates`, which
decided both); the lit button's send-back on a war-approved leave; Move's `only`; `leaveRunAt` against Approvals' lines; a
member's controls; the cyan watcher (no loop, no leak, the class never React's — its cost one page lookup per marked day
per batch of grid changes, small; a lookup inside the man's row would be cheaper — noted, not a finding); the day line;
the two older tests rebuilt on separate entries, nothing weakened.
