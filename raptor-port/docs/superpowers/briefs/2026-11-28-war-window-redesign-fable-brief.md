# Brief — a better design for the Leave War's day window (Fable, chat 195, 28 Nov 26)

You are a fresh, blind design helper (Fable 5.2). The owner looked at the drawing of the Leave War's day window that the
redesign proposes ("F6": one window on every tap) and asked: **"can u ask fable to see if a better design can be made for
this page"**. Your job: say whether a clearly better design exists and, if so, draw it. You did not draw the current one;
judge it cold.

## The picture he sent
`raptor-port/docs/mock/2026-11-27-war-window-states/img/s01-inputs-ll-phone.png` (and `…-desktop.png`). Saber, an admin,
taps Cutter's Wed 9 Dec on the Leave War; Cutter had filed LL (approved) on the Inputs page. Top to bottom today's
proposal: drag grip · "Cutter  Wed 9 Dec" · Auto-approve switch · ✕; "No manning row turns amber or red"; the entry line
(LL box, "Approved · Whole day", "Placed Cutter · Fri 27 Nov, 12:46", ›) with Approved · Refuse · ⇄ Move · Delete; then
the add part: Remarks box, "till 9 Dec" tick, Document; Whole day · AM · PM · Pick a range; eight leave buttons with
balances (LL 9.5 lit with the cyan ring, OL 9.5, OIL 1, CCL −1, FCL −1, PL −1, EL −1, CL −1); CSE · OD · Grant OIL · ⋯.
The other states of the same proposal: the same folder's `s00`–`s10` (pending, medical, OD, posted out, two entries,
OIL, a group leave, a member's closed day, a member's own approved leave, another man's day); today's windows `a01`–`a16`,
`m01`–`m09`; how they were made: `draw-standard.mjs` (it imports `rollcall-today.mjs` for the world and the helpers).

## Read first (whole unless a section is named)
- `raptor-port/docs/PRODUCT.md` — who uses it, where (schedulers at a desk, members on phones; his phone is an iPhone).
- `raptor-port/docs/design-practices.md` — its head, §0, §2, §3, §4, §6 and §9 (his design lessons) whole; §1/§1a/§1b if
  you change any words.
- `.claude/rules/decisions/design.md` (screen rulings) and `.claude/rules/decisions/leave-war.md` — at least "Every
  screen", "The bid windows and the day's list", "Approvals and decisions", "Balances and leave grades" and both
  "Settled" sections. Before relying on a ruling's detail, open its full row:
  `grep -h '^| D1361 |' .claude/decisions-full/*.md`.
- The direction he is weighing: `raptor-port/docs/superpowers/specs/2026-11-27-absence-clean-sheet.md` (one entry, what
  you may do follows who you are and the entry, never the page; one window every tap).
- The design skill's quality floor: `.claude/skills/impeccable/reference/critique.md` and `reference/craft-floor.md`.

## What must hold (his rulings — a design that breaks one names it, says why it is better and what it costs: D754)
- Buttons keep their size (D487); Approve and Refuse keep size, height, place and his words; the decided one solid with
  the cyan ring, the other grey (D1361, D1427, D2880, D2881 — just settled, do not reopen).
- The Raptor look and what its colours mean (D765); each leave kind keeps its colour; a working screen stays dense; no
  glow (D887); one mark, one look; never at a cost of speed on a phone.
- His card shape and lessons in §9 apply. Nothing new he will see goes in without being drawn (D1625).

## What to do
1. A short critique of the drawn window (what works, what makes it hard — hierarchy, grouping, what reads as one thing,
   what competes, what is repeated, what a member vs an admin needs), each point with the place in it.
2. Your verdict: is a clearly better design there? If not, say so plainly and stop after the critique — that is a valid
   answer.
3. If yes: **two directions at most** (a recommended one and one alternative), each drawn **on the real app** (inject into
   the served build, as `draw-standard.mjs` does — never a hand-made HTML page) for **s01 (his picture), s00 (pending)
   and s07 (group leave)**, at iPhone size (390 wide, the phone size `rollcall-today.mjs` uses) and desktop. New parts
   outlined dashed yellow only where they differ from s01 today.
   - Serve a build that already exists — the main folder's `C:/Users/User/projects/Raptor/raptor-port/dist` via
     `npx vite preview --port 4181 --host 127.0.0.1` run from that folder (check it answers first; another chat may have
     it up). Do not run `npm run build` without first running `node raptor-port/scripts/gatelock.mjs status`; if the
     lock is held, wait.
   - Script and pictures in a NEW folder: `raptor-port/docs/mock/2026-11-28-war-window-redesign/` (`draw-redesign.mjs`,
     `img/`). Change nothing under `raptor-port/src`. Do not commit or push.
   - Open each picture yourself before you report it; check no sideways scroll at 390, no console errors.
4. Any word you change or add: list old → new; a different fresh Fable reads them later (D2441).

## Report
Write the whole report to `raptor-port/docs/superpowers/briefs/2026-11-28-war-window-redesign-fable.md`: the critique,
the verdict, each direction (what changes, why it is better for Saber and for a member, rulings it keeps or changes, what
it costs to build), the picture list, words old → new. Reply with only a five-line summary and the file's path.
