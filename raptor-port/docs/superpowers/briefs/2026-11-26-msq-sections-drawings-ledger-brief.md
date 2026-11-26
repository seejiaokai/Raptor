# Brief — the drawings ledger for the four section mock-up pages (D2656, D2657)

**Who:** a fresh Opus helper (high). **For:** chat 191, the coordinator. **Date:** 26 Nov 26. Read-only except your one
report file.

## Where

- Folder `C:/Users/User/projects/Raptor-msq`, branch `claude/msq-b1-screens-135` (`git -C`; no switch, no commit).
- Drawings: `raptor-port/docs/mock/2026-11-2*-msq-*/` — mainly `2026-11-25-msq-pick-guard-q3/drawn/` (468 files),
  `…-q2/`, `2026-11-24-msq-pick-guard/`, `2026-11-24-msq-new-words/`, `2026-11-22-msq-b1-screens/`. The pages that showed
  them to him: `…-q3/page.html` (round 5), `…-q3/page-r6.html` (round 6), and the earlier rounds' `page*.html` in those
  folders. Round 6's page sources: `raptor-port/scripts/handpass/n188/page/`.
- The design reports: `raptor-port/docs/superpowers/briefs/2026-11-2[4-6]-msq-*-report.md`.
- His rulings: full rows by `grep -h '^| D2638 |' .claude/decisions-full/*.md`; read D2596–D2657 at least.
- Build 1's plan `raptor-port/docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md` — §10 (each step's "waits on"
  names drawings he must see, D1625), §18, §19, §20. Read by section (`grep -n '^## \|^### '`).
- `HANDOFF.md`, the `claude/msq-b1-screens-135` block (lines ~23–60): CHAT 190 and 188 list drawings not yet made.

## The four sections

1. **Core — the guard rail:** Build 1 parts A, B, F, G (§3–§5, §18): the refusal note at each door, Add a person at
   the top with its Cancel (§18.3), the squadron number's two fades (§18.4, D2642's phone fade after the menu), the
   "Welcome back" card, "+ Input" / "+ Commitment" on another squadron's pages, the Tracker's question at the view switch,
   the windows that close by themselves.
2. **Admin → Users across squadrons:** §19.1–19.4 — short rows (D2625, D2655 D5), the role in words (D2652), "From
   other squadrons", Incoming / Outgoing (D2643, D2650), folds, the top search (D2647), the jumps (D2651, D2652 way A),
   E8's tick retired with "Edit on 142 →" (D2654), D8 "Someone new" / "It's him" (D2655), the callsign note (D2632/3),
   Plan given only by the squadron's own admins (D2626).
3. **The bell, colours and Display:** §19.5–19.8 — the bell's number in its squadron colour (D2638), Admin → Display
   (D2639, D2640, D2649), bug reports (D2623), the name badge where he only views (D2655 D10), the sign-off boxes' number.
4. **The posting sheet on the Leave War:** D2648, D2653 way C — and the pieces round 6 named as not drawn: the posting's
   Delete card, the last-admin line, the "Undo post out" sheet, a drag posting, ground crew's three chips.

## The job

For each section, a table of every screen state the section will change or add, one row each:
`state | the approved drawing (path, the round it was shown, the ruling that approved it) | or OWED (why: never drawn /
drawn before a later ruling changed it / drawn only on desktop or only on phone) | new to the app? (yes/no) | desktop /
phone`. "Approved" means he answered it ("as recommended" counts; check the ruling). A drawing made before a later
ruling changed that look is OWED a redraw — say which ruling. Each state needs a desktop and a phone picture unless a
ruling or the screen says only one applies (say why). Name the best existing file to start a redraw from, and the
drawing script that made it (`raptor-port/scripts/handpass/n17*/`, `n18*/`, `draw-*.mjs`).

Also list, per section, any on-screen words not yet reviewed by a fresh Fable (D2441).

Write the report to `raptor-port/docs/superpowers/briefs/2026-11-26-msq-sections-drawings-ledger.md`. Open the
pictures you rely on (cropped is fine); do not judge a picture by its file name alone. Be exact: a wrong "approved"
means he sees a build he never saw drawn.
