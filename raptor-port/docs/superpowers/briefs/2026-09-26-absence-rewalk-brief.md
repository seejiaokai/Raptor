# The absence-record re-test — the RE-WALK of the fixes (26 Sep 26)

For the re-walkers (Opus 5.5 helpers), one per walker. The first walk (W1–W5) found defects on the OLD build; each was
fixed with a test that failed first. The app is now REBUILT with every fix and served at http://localhost:4175 (the
bundle `index-KbvILaPW.js` — if the page loads a different `index-*.js`, stop and say so: someone rebuilt under you).
Bug-check order §5, "The re-walk": re-run the scripts that showed each finding, into a SEPARATE output folder, and read
every result against the NEW flow.

## Read first
1. `raptor-port/docs/superpowers/briefs/2026-09-26-absence-walker-brief.md` — the drivers, the fresh world, the traps
   that cost an hour (read "The traps" in full). It still holds, except where this brief overrides it.
2. Your walker's own sheet: `raptor-port/docs/handpass/parts/2026-09-26-absence-wN.md` — how each finding was set up.
3. `raptor-port/docs/superpowers/specs/2026-09-20-one-absence-behaviour-register.md` §12 — how each fixed thing must now
   behave, in the app's words. That is your "expected".
4. `raptor-port/docs/handpass/2026-09-26-absence.md` §3 — every finding and what was done about it.

## How
- Run from `raptor-port/scripts/handpass/ab/` with `AB_WHO=rewalk/wN` set (pictures then land in
  `raptor-port/docs/img/handpass/2026-09-26-absence/rewalk/wN/` — NEVER in the first walk's folder, whose pictures are
  the defects' evidence). Send each script's printed output to
  `raptor-port/docs/handpass/parts/2026-09-26-absence-rewalk-wN-<script>.txt`.
- A step whose premise the fix itself consumed (it waited for the old wrong screen) is walked again with the right
  premise: copy the script to `rw-wN-<name>.mjs` beside it and change the copy only. Never edit the first walk's
  scripts.
- LOOK at every picture of every finding you re-walk. A PASS is what you SAW on screen matching the register §12 line,
  not a script's exit code.
- While you walk, keep an eye out: anything else on those screens that looks wrong is reported too (it is new
  evidence), with its picture.
- Never rebuild the app, never run `npm run build`, the full unit suite or the browser-test suite, never start or stop
  a server (the host holds the PC's check lock for this walk). Never change a file under `raptor-port/src`.

## What each of you re-walks
- **W1** (the Inputs calendar): W1-F1 (a phone swipe pages the month), W1-F2 (a finger's tap on a chip opens its edit
  once), W1-F3 (a member's calendar: another man's chip does not lift; his input opens READ ONLY — no Delete / Save,
  "Only … or an admin can change this."), W1-F4 (a noon leave prints 12:00 in the war's tap list), and FR3 from the final code reads (a leave or a medical
  DRAGGED on the calendar rewrites its remark's "till <date>" / "on <date>" to the new dates and keeps the other
  words — the Inputs page's Remarks column and the week's Unavailable row). Scripts:
  `w1-05-phone-finger.mjs`, `w1-06-probe-swipe-tap.mjs`, `w1-07-probe-ghostclick.mjs`, `w1-08-member.mjs`,
  `w1-09-probe-member-cal.mjs`, `w1-03-desk-cal-doors.mjs`, `w1-10-desk-topbar-undo.mjs`.
- **W2** (medical): AB4 at all four doors (a medical / upchit dragged on the calendar or reassigned on the schedule now
  asks who holds the shared days / the upchit's leftovers before anything is written — both answers of each question),
  AB3 (every piece of a cut leave says its own last day), and the published-day behaviour unchanged. Scripts:
  `w2-01-ab4.mjs`, `w2-02-cascade.mjs`, `w2-03-hours.mjs`, `w2-05-published.mjs`.
- **W3** (the war's gestures): AB7 (bulk Approve over an already-approved leave says "… already approved", counts only
  what changed), W3-F3 (bulk Delete takes the bid beneath filed leave; the filed leave stays; Move is filed separately —
  record what it does, not a finding), W3-F4 (every posting door that closes before it opens is refused AND said), W3-F5
  (the Post out sheet stays while its date moves past the tapped day), W3-F6 (an award's code follows its days on the
  OIL tracker and the tap list), W3-F7 (a keyboard cannot leave an open sheet; a war switch closes the open cell — try
  every road to a switch you can find), W3-F8 (Redo / Undo refuse to put a bid back over a medical filed since, naming
  it; undoing a filing that replaced a bid still gives the bid back), W3-F9 (the war's cuts: each piece says its own
  "till"). From the final code reads: FR1 (Refuse a bid, Ack it, Undo, file a medical on its day on the Inputs page,
  Redo — refused by name, the bid stays refused), FR5 (a dragged block's Delete over a morning the WAR approved plus an
  afternoon bid takes both). AB2 is unchanged on purpose (a question for the owner) — confirm it only. Scripts: `w3-01-bulk.mjs`,
  `w3-03-postings.mjs`, `w3-03b-po-archive.mjs`, `w3-04d-code-follows-days.mjs`, `w3-05-switch.mjs`,
  `w3-05b-stale-sheet.mjs`, `w3-05c-tab-reach.mjs`, `w3-06-till.mjs`.
- **W4** (phone and money): AB6 (an overnight leave's tail is named in the tap list of the day it ambers — admin and
  member, both widths), W4-1 (a finger held on one day and lifted keeps the selection sheet; a plain tap still opens the
  one-cell sheet; a drag-select still works), and the money on the eight-record day unchanged. Scripts:
  `w4-06-saturday.mjs`, `w4-07-hold-probe.mjs`, `w4-08-hold-why.mjs`, `w4-03-touch.mjs`, `w4-04-eight.mjs`.
- **W5** (orders and lifecycle): W5-F1 / F2 ("Undo post out" brings the man's row, bids and leave back; a later Post out
  does not make it vanish), W5-F3 (Tab stays in the open sheet; a war switch closes it), W5-F4 / F5 (beside a 09:00–14:00
  ATT C no afternoon is offered; a refusal names a timed medical's hours; the heading reads "now <LL"). From the final code reads: FR2 (a Post out that has archived him — a past date, the
  switch on — moved to a date still to come, or with "Archive on PO date" turned off: he is back on the Quals roster at
  once), FR4 (a man archived BY HAND on Quals who has a future Post out: the posting sheet's Undo clears the date and
  he STAYS archived). Scripts:
  `w5-05-postout-file.mjs`, `w5-05b-postout-row-probe.mjs`, `w5-05d-vanish-trigger-probe.mjs`,
  `w5-06b-stale-sheet-probe.mjs`, `w5-02b-medical-hours-control.mjs`.

- **W6** (NEW — the roll-call rows nobody walked; found when the roll-call was consolidated, 26 Sep 26): not a re-walk
  but a first walk, on the rebuilt app, at BOTH widths, admin and member, of the places an absence shows that no walker
  and no host log reached. Plan §4 and §9 say what each must show. Set the absences up through the app's own controls
  (a leave, a half-day leave, a medical, a course, a war-approved leave; one of them filed LATE on a published day, H1's
  recipe in `ab-h1-published-doors.mjs`), then for EACH row: does it show the absence, can the person act on it there,
  is anything painted over it. **R12** the manning sheet and the under-manned list (tap a manning row's name — a man
  with a leave and a medical on one day counted away ONCE; an award counts nobody). **R17** the scheduler board's
  Unavailable and Personal Inputs panels (desktop and phone; the fold; + Add). **R18** View-only Sched's
  working-draft view ("Working draft — not issued") on a published day carrying a late input: the face as issued, the
  draft showing the input. **R19** the crew picker and the ALL AVAIL count / window: a man on leave or medical is not
  offered as free and is not counted available. **R22** the schedule's export (the Unavailable on a published day, as
  issued). **R27** the Leave War's clash strip (admin only). **R30** the pending list (tap "N pending" on a published
  day carrying a late input: it names the input and jumps to it). **R32** the OIL question sheet (a leave filed on a
  weekend day a man is on a named duty). **R36** print (the printed schedule of a published day carrying a late input —
  as issued). Row R23 (Week Insights) is NOT walked: its question is the owner's (`OUTSTANDING.md`
  `[INSIGHTS-WORKING-COPY]`). Write your scripts as `w6-*.mjs` beside the others (`AB_WHO=rewalk/w6`); the drivers and
  the e2e tests (`raptor-port/e2e/`) and the older walk scripts (`scripts/handpass/am/`) carry the selectors.

## What you hand back
Write `raptor-port/docs/handpass/parts/2026-09-26-absence-rewalk-wN.md`: a table — finding · what must happen now
(register §12) · what you saw · PASS / FAIL · the pictures — at BOTH widths where the first walk had both. Then
anything new you saw, each with steps and a picture. Then reply with a short summary: PASS / FAIL counts and every FAIL
in one line each.
