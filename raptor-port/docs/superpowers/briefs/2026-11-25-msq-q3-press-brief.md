# [MSQ-PICK-GUARD] the third round — pressing what is still his question (chat 176, 25 Nov 26)

You are a fresh Opus helper pressing TODAY's app — finding out what it does now and picturing it — for questions the
owner (not technical; he reads on an iPhone) has still to answer about the squadron guard rail. You build nothing and
decide nothing. Change no file under `raptor-port/src` or `raptor-port/tracker`; commit nothing; push nothing; do not
start, stop or rebuild the app — it is served at `http://localhost:4700/` (this branch's build). Work in
`C:\Users\User\projects\Raptor-msq` (branch `claude/msq-b1-screens-135`) by full path — your shell may start in another
folder, which you must not write to. A drawing helper works at the same time (`raptor-port/scripts/handpass/n176/draw-*.mjs`,
`…/q3/drawn/`) — leave its files alone.

## Read first
- The full rows (the shell: `grep -h '^| D2597 |' .claude/decisions-full/*.md`) of D2403, D2596, D2597, D2625, D2627,
  D2630; the build plan `raptor-port/docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md` §8.3 (rows N6, N7, N9,
  N10, N12 — the cases, what was found, what is recommended).
- The last pressers' brief and scripts — `…/briefs/2026-11-25-msq-pick-guard-q2-press-brief.md` (its method is yours),
  `raptor-port/scripts/handpass/n175/lib.mjs`, `p1-lib.mjs`, `p5-setup.mjs`, `p6-lib.mjs` (sign-in, set-up presses,
  `give`, the readers of storage, the bell, open windows) — reuse them by import; new scripts go in
  `raptor-port/scripts/handpass/n176/k<n>-<what>.mjs`, each re-runnable by itself from the repo root and printing
  `FACT` lines of what the screen says and what storage changed.

## Method
Each case is pressed by the app's own controls, as a person would, at a desktop (`d`, 1536×864) and — where named — a
phone (`p`, 402×874 touch, WebKit), deviceScaleFactor 1 (pictures only you and the host look at; the host may ask for 2
where one goes to him). A picture right before the deciding press and one after; on a phone one right after the tap as
well as the settled one (D1281). Pictures `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/today/k<n>-<size>-<step>.png`
plus a `-crop` cut to what decides it. **Open every picture that decides a fact before you report it.** "From the code"
is never a finding here: if a case cannot be raised by pressing, say so and why.

**Three squadrons (his D2630).** In one set-up script, by the app's own controls: Saber (master admin) adds squadron 150
("+ New squadron") and adds two people whose home is 150; Hunter (142's admin) holds Plan of 149 and View of 150 (check
what `p5-setup` already gives). Where a case picks a squadron, pick 150 as well as 149 where it could differ, and say so.

## The cases
- **k1 — the Calendar window (Inputs settings → Calendar), D2597's open question.** Does every press in it save at once,
  with nothing to type? Press each kind of control it has (a day, a holiday added — is there a box to type a name? —
  removed, anything else); after each, read storage: saved or not. Then, with it open and nothing pending, pick 149: what
  happens today (closes? stays? greyed?). `d` and `p`.
- **k2 — the Tracker's marking window, D2597's open question (N7).** Saber on 142's Tracker presses a ball — the marking
  window opens. Does each press in it save at once (read the Tracker's saved data after each)? Anything to type? Then
  press Schedules → 149 with it open: today it closes at the press outside (P1) — confirm, picture. `d` and `p`.
- **k3 — the six that now close by themselves (D2596, D2597),** each as today, 150 picked with it open: ALL AVAIL;
  Changes (opened out; on a phone folded too); Insights; a day opened on the SANS calendar; the Leave War's day panel; a
  Tracker event's details (the ⓘ bubble). Before and after each, `d` (and `p` for Changes folded). Say for each: closes,
  stays, or comes back later.
- **k4 — N9: an Input window that would open already greyed.** Hunter, with Plan of 149, files an input for two 149
  men; Kestrel (149's admin) or Saber then ends his Plan of 149 — by the app's controls, as D2626 now allows; a bell line
  about that input is in Hunter's bell (raise one: a change to that input by Kestrel, a sign-off, whatever reaches his
  bell — say which). On 142 he presses it: what opens, where, greyed or live, with what words; can he save; which
  record would a save write. `d`.
- **k5 — N10: a clean chart editor at the view switch.** Hunter, 149 picked, on 149's Tracker opens Edit chart layout,
  moves nothing, presses his badge (to the member view): what shows; is the editor still open; which squadron's Tracker.
  Then the same on 150 (View only — can he open the editor at all?). `d`.
- **k6 — N12: a Tracker window hidden behind the Flow chart tab.** Saber on 142's Tracker at a desktop's width opens
  Down days in the Info panel; the browser narrowed to 1000 wide (or a tablet 768×1024 upright) so the Tracker shows one
  half, the Flow chart showing; is anything on screen saying a window is open? Pick 149: what happens to the window
  (closed? kept and shown again on 142?). Picture each step.
- **k7 — D2625: Kestrel's view of another squadron's man.** Kestrel (149's own admin) on 149's Admin → Users finds a 142
  man by the search: what of the row is shown, and which of Save, Suspend, Archive, Delete, Role, the sign-in mail are
  live (press each to the point before it would change anything; Cancel). Then the same for a 150 man. `d`.
- **k8 — N6, pictures only.** The held window case was pressed by P5 (`…/q2/today/p5-n6-*`). Open those pictures and say
  which pair shows it best for him; re-run `n175/p5-n6.mjs` only if the pictures do not show the held window's words.

## Your hand-back
Write it to `C:\Users\User\AppData\Local\Temp\claude\37df10f156419f1e\6f8c588f-5c4c-4428-8bce-0293bb12cfb9\scratchpad\n176\presser.md`
AND give the same text as your final message. Under 900 words: the world (short); per case, what today does in one or
two plain sentences, the deciding FACT lines, the picture pair to show him, and anything that surprised you (a fault
against a ruling — name the ruling — a control out of reach, a save that went to the wrong squadron). Nothing
recommended — the host does that.
