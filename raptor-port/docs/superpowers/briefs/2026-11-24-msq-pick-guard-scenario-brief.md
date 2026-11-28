# Scenario design: the guard rail at a squadron pick, a change of view and sign-out (RAPTOR), 24 Nov 26

**The first line, before anything else:** you are one of two designers, each blind to the other. Do not open any other
scenario list or any reader's report for this job, and none under `raptor-port/docs/handpass/` or
`raptor-port/docs/superpowers/briefs/` dated 24 Nov 26 other than the files this brief names. A handoff block pasted
into your context after a compaction of your own is not read; name it in your report if it happens.

You design the scenarios a later walk of the RUNNING app will press. **Nothing of this job is built yet** — the build
follows your list. You do not judge code: you work from what was promised, and say what a person could do that the
builder may not think of, and what the screen must show after each step. Read-only: change no file, build nothing,
commit nothing.

## The finder's wording (the bug-check order §4 — taken as it stands)

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item,
> state where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
> NEW data, report it: that is a real finding and this exclusion does not touch it.

Also not raised (his D785): a scheduler who is not an admin. A member, a guest and a person with no sign-in stay in
scope.

## The promise — the owner's rulings, each quoted from its full row

Open each full row before you rely on it (the shell; the row is one long line):
`grep -h '^| D2403 |' .claude/decisions-full/*.md .claude/rules/decisions/*.md` — and the same for D2405, D2590, D2591,
D2592, D2593, D2594, D2595, D2318, D2323, D2389, D2395, D2637, D2381, D148, D1622, D1667, D1668. The area's page:
`.claude/rules/decisions/people-accounts.md` §Many squadrons (its last lines).

- **D2403** — "A pick of another squadron, and the switch to or from the member view, is refused while an Input, Leave
  War or other window is open, a note saying to close it first; unsaved Tracker chart edits are asked about at both, as a
  pick asks today; nothing is left held behind a switch he made himself." Its row also says: a bell line that would
  take him to another squadron follows the same rule; the OIL list counts as a window.
- **D2405** — "Where the squadron in view or his rights change without his press — his own move landing at midnight, a
  right taken away, the Tracker failing part-way through a switch — the app stops under one note asking him to refresh,
  its own Refresh button reloading the app; unsaved work is lost and the note says so." Its row also says: with D2403
  refusing a switch he makes himself, no case is left for the greyed windows or their bands, which the build removes;
  the Tracker's hold at his own move goes the same way; things he does on purpose never ask for a refresh.
- **D2590** — "The guard rail's refusal is the app's grey "Blocked:" note: on a desktop just under the control pressed
  (the squadron picker, the role badge, the bell list), on a phone at the screen's foot; its words "Blocked: close the
  open window, then pick 149." / "…then switch to the member view." (back: "…then switch back to the admin view.") /
  "…then press this line again."" Its row also says: nothing else changes — the window stays live with his typing, the
  squadron as it was; it passes in a few seconds, covering what lies under it meanwhile, never the window's ✕.
- **D2591** — "The refresh note of D2405 is drawn as a shade over the whole app and one card in the middle in the look of
  the app's own question card, one button, Refresh; its words: "You are 149's from today" / "Your move to 149 took
  effect at midnight. Refresh and sign in again to carry on. Anything you hadn't saved is lost."; "Your access has
  changed" / "An admin changed what you can do here. …"; "The switch to 149 didn't finish" / "The Tracker stopped
  part-way. Refresh and sign in again. …"."
- **D2592** — "Logout with a window open is not refused: it asks the open window's own question first ("Close it and
  lose them?", D1622), then the Tracker's unsaved-edits question, one at a time and never one over the other; on a phone
  Logout can be reached with a window open."
- **D2593** — "Undo and Redo reach only the squadron in view: a step made on another squadron waits, and is there again
  when that squadron is picked; with none in view the greyed Undo says why ("Your 142 changes are on 142's Undo.", a
  draft); a change of someone's access belongs to the squadron it was made on." Its row also says: the Tracker's own
  Undo after a pick is not yet pressed; it is in the build's walk.
- **D2594** — "While a change is not saved (the "Not saved" band with Retry), a pick, the switch to or from the member
  view and a bell line to another squadron are refused, the grey note asking for Retry first and never using the band's
  words "Not saved"; Logout asks "This change isn't saved. Log out and lose it?" (a draft); the "Not kept" band never
  blocks anything."
- **D2595** — "An opened row on Admin → Users with typing in it counts as an open window for the guard rail: a pick, or
  the switch to or from the member view, is refused with the grey note, its words a draft ("Blocked: close the open
  row, then pick 149.")."

**His words on the scope (24 Nov 26):** the note shown when the guard refuses, and why it is refused, is to be worked
on; *"also still think of any potential bugs that may still happen when switch roles/sqns"*. So the list covers every
switch of squadron or view, not only the cases the guard refuses.

**The host's readings — NOT rulings; treat each as a question to test, and say where you would read it otherwise:**
- What counts as "a window": anything with its own title or ✕ that stays until closed, and the OIL list — refused. A
  drop-down menu and the bell's list (each closes by a press elsewhere) are not windows: they close as today. Where a
  window's own shade already covers the picker, the badge and the bell, nothing can be pressed and the guard is never
  met; the walk confirms each.
- A text box that is not a window and holds typing (a day's note on Edit Schedule, the Logic search, the Quals filter)
  is not refused: its words stay where they were typed, as today.
- Logout with an opened Admin → Users row holding typing, or with a change not saved: asked, never refused (D2592,
  D2594).
- With a change not saved AND a window open, the refusal names the window first.
- Redo follows Undo in D2593, its greyed reason included.

## What today's app does — pressed, not built from

- The press report: `raptor-port/docs/superpowers/briefs/2026-11-24-msq-pick-guard-press-report.md` (every case at
  1536 × 864 and 402 × 874; its scripts `raptor-port/scripts/handpass/n166/`, its pictures
  `raptor-port/docs/mock/2026-11-24-msq-pick-guard/today/`).
- The drawings he approved: `raptor-port/docs/mock/2026-11-24-msq-pick-guard/drawn/` (p1b, p2b, p4b, p3-p the refusal
  note; p6, p7, p8 the refresh card), the page `…/page.html`.
- Today's doors, in the code as it stands (it will change): `raptor-port/src/state/pick.ts` (the pick),
  `state/store.ts` `enterSquadron`, `switchRoleView` and the bands, `state/belltap.ts` `enterForLine`,
  `state/typing-hold.ts`, `ui/heldro.ts`, `tracker/role.js`, `tracker/TrackerPage.tsx`, `ui/Shell.tsx`,
  `ui/Drawer.tsx`, `ui/SquadronMenu.tsx`, `ui/topstate.ts`, `ui/InputWindow.tsx`, `leavewar/ui/Sheet.tsx`.

## Also in this batch — one walk covers both (his D485)

`OUTSTANDING.md` `[MSQ-NIGHT-153-OPEN]`: (1) a Plan holder of 149 with 149 picked opens a 142 input live from 142's OIL
list or the bell's OIL line, so Save, Delete and the OIL answer change 142's record under a bar saying 149 — to be fixed
at its root (the Input window records the input's own squadron); (2) three fixes already built and not yet walked: a
bell line re-checked after the Tracker's question when the right ended while it was up; Escape with the squadron list
open over an Input window; the Tracker's question taking the keys. **Not in this build:** the Tracker's drag and press
handling (its own job) — do not design scenarios for a ball dragged on the chart beyond "a drag in progress at a switch".

## The ten seeds (chat 162's; each is to be covered or shown not to apply)

1. A page with unsaved typing that is not a window — an opened row on Admin → Users, a text box on Edit Schedule, Logic,
   Quals.
2. A drag in progress.
3. A save still going, or failed ("Not saved" with Retry).
4. A second switch pressed during the first.
5. A window that opens after the guard has looked (a bell tap under a question).
6. Undo and Redo of one squadron's steps pressed on another.
7. The bell's lines of the other squadron.
8. A change he did not make, with a window open.
9. Sign-out and the next person.
10. The phone, where a window covers the control.

## The demo world

Saber (`ad` / `a`) a master admin, home 142; Hunter (`hunter`) 142's admin; Ranger (`us` / `us`) a 142 member; Kestrel
149's admin; Osprey a 149 member. Saber gives View or Plan of 149 on a person's opened row in Admin → Users. The press
scripts' set-up (`n166/lib.mjs`) shows how each state was reached.

## Give back

1. **A table of doors × states.** Doors: every control that changes the squadron in view, the view (admin / member), or
   who is signed in — the top bar's picker, the ☰ menu's, the role badge, the ☰ role line, a bell line, the bell's
   access alert, a link or Undo landing that brings another squadron in, Logout (bar and ☰), sign-in on a shared
   computer, midnight, a right taken away, a reload. States: every kind of window and overlay the app has (find them in
   the code; the press report's table A is a start, not the list), unsaved Tracker chart edits, an opened Admin → Users
   row with typing, a change not saved, a save still going, a drag in progress, a question card already up, two of
   these at once. Each cell: REFUSED (which note, where drawn) / ASKED (which question) / GOES THROUGH / CANNOT BE
   REACHED (why) / THE RULINGS DO NOT SAY.
2. **40–60 scenarios, ranked, most likely to find a fault first.** Each: a name; who; the device (desktop 1536 × 864;
   phone 402 × 874; a phone on its side and a tablet 768 × 1024 where the press report found they differ); the steps
   pressed in the app; EXPECTED after each deciding step, **with its source** — a ruling's number, "as today (the press
   report, case …)", or "RECORD exactly what it says" where no ruling settles it; and the one observation that would
   disprove it. Include what must be left exactly as it is today.
3. **For each lesson in `raptor-port/docs/bug-check-checklist.md` §The lessons of §7.11:** the scenario that covers it,
   or why it cannot apply (a few words each).
4. **Questions** — every case where the rulings do not say what should happen, as a question with the choice you would
   recommend; never as a scenario with an invented EXPECTED.
5. **Explicit negatives** — what you looked for and found already covered.

Write each scenario into your output as you settle it, not all at the end, so a stopped run keeps what it found.
