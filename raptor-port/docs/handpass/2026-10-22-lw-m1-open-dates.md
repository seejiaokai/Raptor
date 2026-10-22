# The Leave War overhaul's M1 — open dates — the bug check (22 Oct 26)

Branch `claude/lw-m1-open-dates`, cut from `main` c413f2541. The build plan
`../superpowers/plans/2026-10-22-leave-war-overhaul-build-plan.md` §3 batch 1 (approved, D1250). Rulings: D1177, D1176,
D1166, D1168, D1169, D1172, D1225, D1211, D418 / D333 / D352 / D827 as narrowed; the plan's fixes B2, B3, B8, A7b, B12;
D1260 (Fable reads the finished code too).

## 1. The eight questions and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money / earned leave | NO — OIL awards and credits read no stage (checked at c413: `setDayAward`, `grantTo`, `ingestDutyCredit`, `clearRaptorCell`); a closed day still takes them (walk W3) |
| 2 | The published record | NO — the war's "published" stage is a war state, not the schedule's published record; the schedule's publish path is untouched |
| 3 | Saved data | YES — `Period` loses `stage`/`bidFrom`/`bidTo`, gains `open` and `lastClosed`; the reader maps an old saved war |
| 4 | A shared drawer | YES — the grid's rows (`PersonMonth`, `cellOpenable`), the header cells (the lock) |
| 5 | A new gesture | YES — the month buttons' tap and held drag; the closed note's Delete |
| 6 | A new surface | YES — the "Open for bidding" window, the closed note |
| 7 | Roles | YES — a member's day rule moved; the commit checks it too (B8); `lw.open` replaces `lw.stage` |
| 8 | The warning list | NO — the war's clash note's words only (D827 narrowed), no rule |

**Tier: FULL.** Told to him at the start (the chat, 22 Oct 26).

## 2. The roll-call

From the independent scenario designer's 23 rows (`../superpowers/briefs/2026-10-22-lw-m1-scenarios.md` §1), one row per
place the stage or the bidding window was read. Columns: SHOWS (the new sign) · USABLE (the new gesture) · PAINTED OVER
(what shares its pixels) · Proof (A, B, C the walkers; "host" the host's own walk; "re-walk" the walkers' scripts run again on the fixed build).

| # | Place | Shows | Usable | Painted over | Proof |
|---|---|---|---|---|---|
| R1 | the chip on the strip (desktop, phone) | desktop "Open for bidding 1 Jan – 31 Mar +1"; phone "Open 15 Feb – 31 Mar" (a member's from today); "Bidding closed" | a press opens the window, for everyone; Enter on the keyboard | one line on a phone with two stretches (34 px) — the space was missing on a phone (B-F2, fixed) | A S22; B S2-chip, S22; re-walk rb `S2-00` |
| R2 | the "Open for bidding" window | months lit (open), dashed green edge (part), plain (closed); a line per stretch with its days and the calendar icon; "+ Open more dates"; the last closing with who | tap, second tap, a held drag (a phone's two rows by finger), the calendar with Open / Save / Close these days / Cancel; Tab and Space; Escape one layer at a time | unstyled at desktop widths (A-F1, fixed); under a drag-selected block's panel (H-F1, fixed) | A L1, S1, S5, S8, S14, S17, S20; B S14; host S29; re-walk ra L1, S20 |
| R3 | the green outline, one per stretch | one green outline per stretch; a member's from today | — | — | A S22; `window.test.tsx` |
| R4 | closed days dim + the lock on the date | a member's closed days dim with a small lock on the date; never the admin's | — | the admin's dim cost his tap 3× (§5) — removed before the walk | B S2; `window.test.tsx`; §5 |
| R5 | a member's tap on his own row (bid / closed note / pending note / remarks) | open day: the bid window; closed: the closed note (D1176); his pending bid on a closed day: the pending note with Delete (D1225); his approved leave: its remarks, any day | each sheet's own buttons; Undo of the Delete (B-F1, fixed) | — | B S2, S3, S4, S26; re-walk rb S3-single |
| R6 | an admin's tap (decide at any time; approved leave changeable) | the decide sheet on any day, approved leave included | Approve / Refuse / Move / Delete / Note | — | C S6; A S10 |
| R7 | "Pick a range" in the bid window | "Pick a range" skips closed days and says so — the words named the old window (B-N1, reworded) | — | — | B S4-range; `bidding.test.tsx` |
| R8 | the drag-select panel (member and admin) | a member's block on closed days offers Delete of his own pending bids only; the admin's any action | fill, decide, Delete, Move | closes when the open dates change under it; the window now drawn over it (H-F1) | B S3-drag, S4-dragfill; host S29 (desktop and phone) |
| R9 | the day's list (decide, Delete own pending, Note) | a member's lines on a closed day: Delete only; the admin: decide and Note | — | — | B S3-daylist; C S6 |
| R10 | Move (one-day chip, day's list, drag) | a member moves his own pending bid between open days; approved leave never into another period | the one-day chip, the day's list, a drag | — | B S25; A S24; C the year-end move |
| R11 | the dotted moved mark | only on approved leave moved; a pending bid's move none | — | — | A S24 |
| R12 | the Legend | the moved line always | — | — | C the Legend |
| R13 | the clash note (phone line, desktop strip) | "Change the approved leave ›" / "…but the bid is approved OL" | a tap opens the day's list | — | A S11 |
| R14 | where the page opens (boot, tab, View switch, clash tap) | the first open date from today, in the period that holds it, else today | boot, tab, View switch | — | A S10; host S9 (clock 15 Dec 26: 2026); `opendates-store.test.ts` |
| R15 | Undo / Redo of opening and closing | one step a gesture; "opening bidding 1 Apr – 30 Apr — those days are open for everyone" | top-bar Undo / Redo; the grid stays on June (D672) | the window blocks the top bar while open (A-N1, as every Leave War sheet but two) | A S13, S19; B S14-undo; C D672 |
| R16 | the store's doors (every write) | every write asks the period HOLDING the date (B3) and a member's today (D1211) | — | — | `opendates-store.test.ts` B2, B3, D1211, D1225 |
| R17 | the command gate (B8; `lw.open`) | a member's change on a closed day refused at the commit except taking his own pending bid, or its Undo | — | the Undo was refused (B-F1, fixed) | `opendates-store.test.ts` B8, B-F1 |
| R18 | the saved shape (reload; an old saved war) | stretches and the last closing survive a reload; an old saved war loads | — | — | A S1, S12; `opendates-store.test.ts` |
| R19 | creating a period ("+ New", the Holidays ask, the schedule's "create it") | "+ New" and the schedule's "Create the period" make a period with nothing open, on screen (A-F3, fixed); the Holidays ask | — | — | A S1, S37; re-walk ra S37; `oilperiod-offer.test.tsx`, `warask.test.tsx` |
| R20 | "No leave period yet" | "No leave period yet" — its words | — | — | `leavewarpage.test.tsx` (no war cannot be made from the app's controls) |
| R21 | must not change: the Inputs page on a closed day, OIL, the SANS calendar and Calendar window, the bell | unchanged: Inputs-page leave on a closed day lands approved; OIL on a closed day; the SANS month and the Calendar window; the bell silent | — | — | C S28, S31, S32, S33; host S27 |
| R22 | roles: admin, member, the admin's member view, signed in without access | admin, member, the admin's member view, signed in without access | — | — | A, B, C; B S34b; C S34a |
| R23 | the test bridge and e2e | the bridge pins a member's today (`lwSetMemberToday`); the Leave War browser tests moved | — | — | every walk; e2e 363 on his PC; GitHub's run |

## 3. The door check

Every action the open dates allow, and its control: open a month (its month button) · close a month (the same, again) ·
open several months (a held drag across them) · close several (a drag starting on an open month) · exact days of a
stretch (its calendar icon, or a tap on its line) · open new exact days ("+ Open more dates") · read what is open
(the chip — everyone) · read the last closing (the chip with nothing open → the window's last line) · a member deletes
his own pending bid on a closed day (the pending note's Delete; the day's list's Delete; a drag-select's Delete) ·
a member reaches the Inputs page from a closed day (the closed note's "Open the Inputs page") · Undo / Redo of each
(the top bar).

## 4. Sizing the walk (§7.0, D607)

1. **Type of change:** A (the day rule inside one shared body, `dayWritable`), B (two new windows), C (the month tap and
   held drag), D (the outline and the dim drawn by the grid), G (saved data, Undo, reload), H (who may write which day).
2. **What only a walk can find here:** the chip and the window at a phone's and a desktop's width (the strip must stay
   one line on a phone — D678); the held drag across a phone's two rows of months by a finger (hold against scroll —
   S21, S14); the outline and the dim and lock painted on the real grid (one box per stretch, a member's from today);
   every tap on a member's own row landing on the right sheet (closed note, pending note, remarks); the clash note's
   words; the landing after a reload; the Undo bubble's words; the window above the grid on both sizes.
3. **What the ledger says:** the last FULL Leave War-sized walks — 19 Oct 26, four Sonnet walkers on one frozen build,
   12 faults; 19 Oct 26 (standby flies), three walkers in parallel (436k / 352k / 499k tokens), 4 faults in the change.
4. **The walk chosen:** three Sonnet 5.5 walkers in parallel on ONE frozen build (`dist-m1w`, `.claude/launch.json`
   "lwm1-walk-a/b/c" — ports 4252–4254), each in its own browser context, from the scenario designer's S1–S38 —
   W1 the admin at 1440 by mouse (the window and every month gesture, the calendar, Undo / Redo / reload, the outline and
   the dim, deciding on a period nobody opened, the clash note, the landing); W2 a member at 390 by finger, the clock
   pinned to 15 Feb 26 (the closed note, the pending note's Delete, before today, a drag-select fill that skips, remarks
   at any time, the chip from today) and the admin at 390 (the month drag on two rows, hold against scroll); W3 the
   seams and what must not change (Inputs-page leave on a closed day, OIL on a closed day, the SANS calendar and the
   Calendar window before and after, the bell silent, an old saved war loaded in a browser, a range across the year end).
   The host opens the pictures behind every FAIL and every saved-data or role PASS, reproduces every finding, and runs
   the speed after-measure himself (`scripts/handpass/lw-m1-perf.mjs`, the same 4× CPU, 5 runs).
5. **After the walk:** the ledger row — `docs/walk-ledger.md`, 22 Oct 26, M1.

## 5. The speed (performance.md §E — before and after)

Before (main c413f2541, built bundle on 4251, CPU 4×, 5 runs, tap 2026-02-10):

| Size · who | open (median) | nodes in the grid | tap → bid window (median) |
|---|---|---|---|
| desktop · admin | 1508 ms | 20187 | 438 ms |
| desktop · member | 1256 ms | 19593 | 788 ms |
| phone · admin | 1266 ms | 8441 | 550 ms |
| phone · member | 1129 ms | 8208 | 678 ms |

After — measured PAIRED with `main` the same hour (the machine was busier than at the first measure, so both columns are
read together), 5 runs each, a member's today pinned through the bridge so the same tap opens the same bid window:

| Size · who | open: main → M1 | nodes: main → M1 | tap: main → M1 |
|---|---|---|---|
| desktop · admin | 1398 → 1911 ms (runs 1361–1930 vs 1355–2228 — the same spread) | 18292 → 18292 | 827 → 823 ms |
| desktop · member | 1232 → 1224 ms | 17760 → 17760 | 1432 → 1373 ms |
| phone · admin | 1193 → 1201 ms | 8441 → 8441 | 765 → 760 ms |
| phone · member | 1324 → 1313 ms | 8208 → 8208 | 935 → 971 ms |

**A fault this measure found, fixed before the walk:** the first build of M1 dimmed the closed days for the admin too (the
builder's reading of D1177); his tap measured 774 → 2338 ms on a desktop and 769 → 1058 ms on a phone — thousands of
cells drawn at half strength. The admin's dim went (as before M1: the open dates do not bind him, and the outline shows
what is open); the table above is the build without it. Members' dim is as it always was. No node is added to any day
cell (the lock is a pseudo-element on the date heading).

## 6. Orders walked

Three Sonnet 5.5 walkers on one frozen build (`dist-m1w` from 66f75a2b7): A the admin at 1440 by mouse (S1, S5, S8, S10–S20,
S22–S24, S36–S37 and the window's look L1); B the phone at 390 by finger, member then admin (S2–S4, S7, S14, S21, S22,
S25, S26, S29, S30, S34b, S35); C the seams at 1440 and 390 (S6, S28, S31–S34a, the year-end move, the Legend, D672).
Then, on the fixed build (70ec49a2f + the fixes of §14), **the re-walk**: A's and B's scripts run again whole (pictures in
`ra/` and `rb/`), and the host's own walk (`scripts/handpass/lw-m1-walk-h.mjs`, pictures in `h/`) — S29 at both
sizes, S9 across the year end (clock 15 Dec 26), S27 a member's own OIL award on a closed day.

## 7. Cases carried by a test

B2, B3, D1211, D1225, B8 and B-F1 (`opendates-store.test.ts`); an old saved war's five shapes and a stored one through a
reload (the same file, test 6 — the walk loaded them through the bridge, S12); one gesture one Undo (B12); the landing;
the window's gestures, the calendar, Escape and focus (`window.test.tsx`); the closed and pending notes
(`closednote.test.tsx`); S36 (no route on screen); "No leave period yet" (`leavewarpage.test.tsx`); the schedule's
create landing on the new period (`oilperiod-offer.test.tsx`); the year-end move (`scenarios-corners.test.ts`).

## 8. Pictures

`docs/img/handpass/2026-10-22-lw-m1-open-dates/` — a/ 57, b/ 51, c/ 98 (the walk); ra/ 63, rb/ 52, h/ 11 (after the fixes).
The host opened every picture behind a FAIL and the saved-data and role PASSes named in §14, and after the fixes: the
window at 1440 (`ra/01`), the window drawn over the selection panel (`h/S29-02`), the phone chip (`rb/S2-00`).

## 9. Break tests

Each fix of §14 was proved by its test going red with the fix taken out, then green with it: A-F2 (Escape and focus),
B-F1 (the member's Undo), A-F3 (the new period on screen), H-F1 (the window over the panel), H-F2 (the month list first).
The scenario designer's 13 cuts (its §3) and five for the walk's fixes — 23 cuts in all, run by a helper in its own
checkout on 543ed46bc, one test file at a time, each source put back: **19 red, 4 gaps.** The gaps, each now a test: 5b
(`deletableIn` — a dragged block of his pending bids on closed days keeps its Delete; a refused one not counted), 5d (his
pending half beside Inputs-page leave on a closed day: Delete takes the bid, the leave stays), 7 (a drag in the window is
ONE Undo step — proved red with the drag cut month by month), 17b (what a restore on a closed day may and may not bring;
its "approved" record is a state a war record cannot hold today — approved leave is an input — so the check now names the
two undecided states rather than "not refused", and nothing reachable changed). Its note A (the "before today" render
test never moved his today) is a real before-today test now. Every fix after the reads was red without it, green with it.

## 10. Errors seen

None in the browser console or page errors, in any walk or re-walk.

## 11. Not walked, and why

S29's member half (a member's bid window open while the admin closes the day — two live sessions); S36 (no route on
screen — carried by a test); S10 (c, d) (carried by `opendates-store.test.ts`'s landing tests).

## 12. Gate counts

Leave War unit tests 3035 / 3035 (his PC, 22 Oct 26, after the fixes); the Leave War browser tests 363 on his PC before the
walk; GitHub's full run of the pull request green on d2ff349a4 — the run on the fixes: (to fill). After the reads' fixes:
Leave War unit tests 3053 / 3053; the shared tests they touch (permissions, Undo words, the schedule's button) 153 / 153.

## 13. The reads (fresh Opus; Fable — D1260)

Two readers, blind to each other, after the walk, given the evidence sheet (brief
`../superpowers/briefs/2026-10-22-lw-m1-read-brief.md`): a fresh Opus 5.5 (about 423k tokens) and Fable 5.1 (about 370k).
**Both found, each alone, the same two faults** — and proved each in a throwaway test:
- **R-H1 (high) — fixed:** a member's half day filed on the Inputs page (leave, or a timed medical) over his own whole-day
  pending bid, on a day closed for him or before his today, was refused whole — the clash rule cuts the bid to its free
  half inside his command, and the commit's open-day check read the cut as a change (D1166, D1211 broken). The cut now
  passes as a take (`state/perms.ts narrowed`); four tests (open, closed, past; a medical; the permission itself).
- **R-M1 (medium) — fixed:** after a drag across the window's months, the next single tap did nothing (the drag's click
  lands on the strip, or a finger sends none, so the "swallow the drag's click" flag stayed up). A new press, a click on the
  strip or a key clears it (`ui/OpenDatesSheet.tsx`); two tests, red without it.
Opus alone: **M2 — fixed:** a member's war-approved HALF day on an open day hid its free half (his tap opened remarks;
`main` opened the bid window) — the free-half rule now covers it (`ui/Matrix.tsx`; `remarks.test.tsx` changed to say
so). **L6 — fixed:** the admin's tap on one approved leave opens the decide window, which had no way to its remarks — it
carries the day's list's Note now (`ui/BidPicker.tsx`, `ui/Matrix.tsx`; `deciding.test.tsx`) — a new control, in his look.
**L5 — fixed:** with two leaves clashing, "approved" could name the wrong one — the pair's order is fixed
(`sync.ts clashPairOrder`). **L7 — fixed:** this sheet's roll-call had been written onto its first line (the host's
script) — moved back into §2.
Both: **closed note's Delete as one step — fixed** (`ClosedNoteSheet.tsx`, one command; a test with two halves and one
Undo); **the skip words untrue for some readers — fixed:** a member's fill "closed for bidding, before today, or already
holding leave or a medical", an admin's "already holding leave or a medical", a delete "already decided, or filed on the
Inputs page" (`BidPicker.tsx skipWhy`, pinned); **one span naming days that stayed open — fixed:** the Undo words name the
runs ("closing bidding 1 Jan – 31 Jan and 1 Mar – 31 Mar") and the last closing records the latest run that closed
(`engine/opendates.ts closedRuns`, `undo/describe.ts`); **the store file's line endings** — put back as `main` has them
(the diff 10,000 lines → 387); **stage words** — the one on screen ("…an approved leave on a published war needs the war
reopened") reworded, the stale comments brought up to date.
**Filed, not fixed:** [LW-REDO-ONTO-CLOSED] — a member's Redo may put his bid back on a day closed since (both readers;
not reachable in one browser today; his question, with a recommendation); [LW-M1-READ-LEFTOVERS] — a member's shared
input over another man's pending bid (older), the replace note raised before the check, the stale "today" at midnight,
a vague Move refusal.
**Judged, no change:** the chip's "+1" (the drawing of record); "Bidding is closed" on an open day before his today (D1176's
words, true for him); the clash sentence "…but the bid is approved OL" (the drawing of record, r7-19).

**The re-walk of the reads' fixes** (the host, `scripts/handpass/lw-m1-walk-h2.mjs` on the build of bcf79e040; pictures
`h/R1-…` to `h/R5-…`): the first tap after a month drag acts — desktop by mouse, phone by a held finger (PASS ×2); a
member's approved MORNING on an open day opens the bid window on the free afternoon, and on the day closed, its remarks
(PASS ×2); the admin's decide window carries Note, which opens the remarks (PASS); the member's Inputs-page morning of OL
over his own whole-day pending LL on 20 Feb, February closed — "This replaces your LL bid on 20 Feb (morning) on the
Leave War · Input added", one OL row saved, the war's 20 Feb "<OL +1" (the afternoon bid kept) — PASS by the picture
(`h/R4-03`; the script's own check looked for "LL" in the cell's text, where the kept half sits behind "+1"); the range
fill 27 Mar – 2 Apr: "5 days written. 2 skipped: closed for bidding, before today, or already holding leave or a medical."
(PASS); the Undo after closing FEB reads "Undo — closing bidding 1 Feb – 28 Feb" (RECORD). No console or page errors.

**His look's pictures** (`scripts/handpass/lw-m1-look.mjs`, `look/` — each place cut to itself at twice the pixels) found two
faults of the look, both in buttons M1 added, both fixed and re-pictured: **K-F1** the closed note's "Open the Inputs page"
was a bare chip — the browser's grey with a white edge, unlike every button beside it; **K-F2** the admin's new Note had
the same, and its first fix took the class `note` — the sheets' line of small text — and stretched across the row. Both
now wear Move's quiet grey (`.dchip.plain`, `bidpicker.css`). Seen in `look/05` and `look/08`.

**Walk:** docs/handpass/2026-10-22-lw-m1-open-dates.md · 342 pictures · 23 surfaces (the roll-call) · 3 walkers + 2 re-walks
+ 2 host walks, desktop 1440 / 768 and phone 390 · MISSING: 13 fixed (A-F1, A-F2, A-F3, B-F1, B-F2, H-F1, H-F2, K-F1, K-F2, and the
reads' R-H1, R-M1, M2, L6), 4 words / looks fixed (B-N1, L2, L3, L5), 2 filed ([LW-REDO-ONTO-CLOSED], his question;
[LW-M1-READ-LEFTOVERS]), 1 judged (the dashed part-month edge)

## 14. Findings and dispositions (filled as they come)

**Walker B (phone 390, touch; member Ranger, then the admin) — returned 22 Oct 26** (its script
`scripts/handpass/lw-m1-walk-b.mjs` + `-lib.mjs`, 51 pictures in `docs/img/handpass/2026-10-22-lw-m1-open-dates/b/`; no console
or page errors). PASS: S2 (the closed note's words — a curly ’ in "management’s", the app's own apostrophe), S2c, S3's
day's list / drag-select / half day, S4 (a–d), S7, S14 phone (MAY → SEP across the two rows: one stretch MAY–SEP; one
Undo), S21, S22 phone (two stretches: one line, 34 px), S25 (a–d), S26 member and admin, S34 (b). RECORD: S35 (another
man's row opens nothing), S30 (the panel is replaced by the tapped cell's window, so a stale Approve is not reachable
that way), S29 (partial — a FEB tap in the window with the drag-select panel up did not close FEB, and LL in the panel
then wrote nothing: TO REPRODUCE by the host). Not walked: S9, S27 (out of context).
- **B-F1 — FAIL, fixed:** a member deleted his own pending bid on a day since closed; his Undo was refused ("That couldn’t
  be completed just now.") — the commit's open-day check (B8) refused the restore. Fix: `state/perms.ts` lets a restore
  that only adds back his own pending bids through (the same check read the other way). **Owed: a regression test** (a
  member's `clearRecordById` on a closed day, then his Undo restores the bid) and a re-walk of S3's Undo step.
- **B-F2 — cosmetic, fixed:** on a phone the chip read "Open15 Feb" — a typed space dropped by the flex chip; drawn as a
  margin now (`chrome.css`). Re-walk: one picture of the phone chip.
- **B-N1 (words, recorded):** a range or drag-select fill's skip note still says "locked, owned by Raptor, or outside the
  window / your time in the squadron" — it never says "closed". Older words; the host to judge whether M1 should name
  the closed days (likely yes, small).

**Walker A (desktop admin, 1440 by mouse) — returned 22 Oct 26** (`scripts/handpass/lw-m1-walk-a.mjs`, 57 pictures in
`…/a/`; no console or page errors). PASS: S1, S5, S8, S13 (each gesture one Undo, the bubble's words, the grid stays on
June), S14, S17, S22 desktop. RECORD: S10 (a, b, c'), S11 (a duty clash: "Weekend/PH work earns *HO, but the day holds
approved OL. Change the approved leave ›", a tap opens the day's list with Back to bid · Refuse · Move · Delete · Note;
the scenario's input-clash recipe made no clash), S12 (all five old shapes load through the bridge; a stored old row
through a reload is carried by `opendates-store.test.ts` test 6), S15, S16, S18, S23, S24 (an approved leave's move wears
the mark, a pending bid's none). Not walked: S36 (no route — carried by a test), S10 (c, d).
- **A-F1 — FAIL, fixed:** at desktop widths the "Open for bidding" window and the closed note were UNSTYLED (raw grey
  buttons; open / part / closed months alike; "31 Mar90 days") — their rules had been appended INSIDE the stylesheet's
  phone-only block (`bidpicker.css`, the last block, `@media (max-width: 430px)`). Fixed: the phone block closed before
  them; the built CSS checked (the rules now outside every media query). **Owed: re-walk the window at 1440 and 768.**
- **A-F2 — FAIL, to fix:** Escape with the exact-days calendar open closes the calendar AND the window together; and after
  Escape or ✕ focus lands on the page body, not back on the chip (the design guide §3: Escape closes what opened last;
  the keyboard returns to the button that opened it).
- **A-F3 — FAIL, to check against main first:** the schedule's "Create the 2028 period" makes the period and brings the
  Leave War to the front — on the OLD period (the toast says "Open its dates for bidding here"); it should land on the new
  one. Likely older than M1 (`ui/interactions.ts`, `sync.ts createOilPeriodFor`): compare on `main` (4251), then fix
  (select the new period) or file.
- **A-N1 (RECORD):** the window is modal, so the top bar's Undo cannot be pressed while it is open (S19) — as every Leave
  War sheet but two ([LW-WINDOWS-NONBLOCKING]); after closing it, Undo and reopening show the new picture.

**Walker C (the seams and what must not change, desktop 1440 and phone 390) — returned 22 Oct 26: 48 PASS, 10 RECORD,
0 FAIL** (`scripts/handpass/lw-m1-walk-c.mjs`, 98 pictures in `…/c/`; no console or page errors). PASS at both sizes: S6
(the admin's tap on approved leave opens the decide sheet, open or closed day; the day's list adds Note), S28 (a member's
Inputs-page leave on closed days lands approved, the war follows its edit and delete; his tap opens its remarks), S31
(the bell and the changes window say nothing of opening, closing, Undo or Redo), S32 (the SANS month and the Calendar
window identical before, with APR open, and after), S33 (OIL awards on a closed day from +OIL and the tracker; Delete
names the award), the Legend, D672 (Undo / Redo of opening APR leave the grid on June). RECORD: S33 the award's sheet;
S34a (signed in without access sees only "Request access"; a viewer-less war through the bridge opens nothing); the
year-end move (no control lands a record in another period — the grid ends at 31 Dec and the View switch ends a move;
carried by `scenarios-corners.test.ts`); "Pick a range" cannot cross 31 Dec. The phone chip's missing gap it saw is B-F2
(fixed).

**The fixes after the walk (22 Oct 26, evening), each red without it and green with it:**
- **A-F2 — fixed:** Escape with the exact-days calendar open now puts the calendar away and leaves the window; the window
  hands the keyboard back to the chip that opened it (`ui/OpenDatesSheet.tsx`, `ui/Chrome.tsx`; `window.test.tsx`).
- **A-F3 — fixed** (older than M1 — on `main` the schedule's button never selected the new period either; M1's note
  "Open its dates for bidding here" made it wrong): the Leave War now shows the period just made, as its own "+ New" does
  (owner, 2 Sep 26) — `sync.ts showPeriodOf`, `ui/interactions.ts`; `oilperiod-offer.test.tsx`. Re-walk: ra S37 PASS.
- **B-F1 — the owed regression test written** (`opendates-store.test.ts` "B-F1"): his bid, the day closed, his Delete,
  his Undo puts it back, Redo takes it again. Re-walk: rb S3-single PASS.
- **B-N1 — reworded:** the fill's skip note named the old window; now "… skipped: closed for bidding, before today, or
  already taken." (a fill) and "… closed for bidding, before today, decided, or filed on the Inputs page." (a delete)
  (`ui/BidPicker.tsx`, `ui/SelectSheet.tsx`; `bidding.test.tsx`). New words: to be read cold by the code readers.
- **H-F1 — FAIL found by the host's walk, fixed (S29):** with a drag-selected block's panel up, the "Open for bidding"
  window opened UNDER the panel, unseen (both at the sheets' layer, the panel drawn later) — the chip seemed to do
  nothing, and a press meant for a month went to the panel. That is what walker B's partial S29 saw on the phone (FEB
  "did not close"). A blocking window is now raised over a non-blocking panel, as it already was over the scheduler's
  floating windows (`ui/Sheet.tsx`; `window.test.tsx`). Re-walk: host S29 — desktop: MAY closes, the stale panel goes;
  phone: FEB closes on one finger tap, the panel goes.
- **H-F2 — FAIL found by the re-walk (ra S20), fixed:** the A-F2 fix took Escape before the calendar's own month-and-year
  list could, so the first Escape closed the whole calendar (D1012: the list first). The window's listener now lets the
  open list take it (`ui/OpenDatesSheet.tsx`; `window.test.tsx`). Re-walk: ra S20 PASS.
- **Judged, no change:** ra L1's one FAIL line — a month open in part wears a DASHED green edge where the scenario wrote
  "dotted". No ruling sets it; the app's dotted edge already means "moved" (D1175's family), so the dashed one stays.
  ra S19's FAIL line is A-N1 (the window blocks the top bar while open, as every Leave War sheet but two —
  [LW-WINDOWS-NONBLOCKING]).
- **The re-walk, whole:** ra — 8 PASS, 8 RECORD, the two judged lines above, S20 then PASS; rb — 28 PASS, 6 RECORD, 0 FAIL;
  host — S9 PASS, S27 PASS, S29 PASS (phone) and RECORD (desktop, as the scenario asks). No console or page errors.

## 15. D1263 — a member's Undo or Redo onto a day closed since ([LW-REDO-ONTO-CLOSED], built 22 Oct 26)

**What changed.** His ruling (D1263, "no"): a member's Undo or Redo never puts his bid back on a Leave War day closed for him
since, but for his Undo of a step he made on the day while it was already closed. The commit's open-day check (§13, B8) had
let through any restore that only added back his pending bids. Now the undo timeline keeps, on each member step as it is
recorded, the war records it changed on a day already closed for him, and vouches for a restore onto a closed day only for
his UNDO of such a step, image for image; the check asks only that (`undo/timeline.ts verifiedWarRestore`, the
`closedAtStep` hook; `state/perms.ts lwClosedKeys`). Read as the same kind of step (the agent's reading, D1166): his
Inputs-page half day that cut his bid on the closed day still undoes. A refused one says "Bidding is closed on that day, so
your bid can’t go back on it." (it said "That couldn’t be completed just now").

**Tier.** FULL by question 7 (who may do something), riding M1's own FULL check: the permission tests (`perms.test.ts`,
`perms-scan.test.ts`) green with §11's LeaveBid row rewritten; the walk; one fresh blind Opus read, then a narrow read of
its fix. Sized SMALL for the walk (walk-ledger row, 22 Oct 26): one permission rule and the timeline behind it, no new
screen. **Not reachable through the admin's window in one browser** — his closing sits above the member's step on the one
timeline — so the walk closes the day for the member by his clock (a day before today is closed for him, D1211: the same
rule), every bid, Delete, Undo and Redo a real tap on the phone at 390.

**Tests, red first** (`leavewar/opendates-store.test.ts`, the D1263 block): Redo after the day closes; Redo after an
open-day Undo; Undo of an open-day delete — all three failed before the change; the exception by the clock and the
Inputs-page half day's Undo pass before and after. The break tests' 17b pin rewritten as D1263 narrows it (a command
that only calls itself a restore puts nothing back). Leave War unit 3060 / 3060; the shared undo, permission and store
tests 309 / 309; `npm run build` clean.

**The walk** (`scripts/handpass/lw-d1263-walk.mjs`, pictures `d1263/`, the re-walk `d1263-r/`): W1 a Redo after the day
passed — refused, 20 Feb empty, the bubble says why (PASS); W2 the Undo of an open-day delete after it passed — refused
(PASS); W3 the exception by the clock — Delete from the closed note, Undo puts LL back, Redo takes it (PASS); W4 the
exception with the admin closing MAR in the window (PASS — its first run used the memory-only sign-in and lost the bid at
the admin's sign-in: the script's, fixed); W5 (after the read) a refused Undo then two more presses — the button passes
over the blocked steps and takes his 20 Feb bid (PASS). No console or page errors.

**The read** (fresh Opus, blind, the code commit and D1263): no path puts a bid back on a day closed since (Redo, an
open-day step's Undo, a folded projection, steps recorded before the hooks, an admin in the member view, a mixed step, a
colon in a war id, a command calling itself a restore); the exception holds single, for two halves, for a two-day block and
for the Inputs-page cut. **F1 (medium) — fixed:** a refused Undo or Redo jammed the button for the session — every press
picked the same step, so everything older was out of reach; now the step is blocked as every never-passing step is
(`refusedFor` → `sayBlocked`), and an older step sharing its record is passed over too (`undoConflictOf`). Tests red
first ("a refused Undo is passed over", "a refused Redo is passed over too"); re-walked (W5). **F2 (low) — fixed:** the B-F1
test header still stated the old rule.

**The narrow read of that fix** (fresh Opus, the fix commit and F1 only — order §5 "a fix is new code"): the Undo half right
and complete; **R1 (medium) — fixed:** a Redo could still jam one step later, behind a blocked older undone step sharing its
record ("redo that first" for a step no press can take) — `redoConflictOf` given the same guard as `undoConflictOf`, a
one-line guard (no further read, §5); test red first ("a Redo behind a blocked step on the same day is passed over");
re-walked (W6: three Redo presses — refused, passed over, "Redid: Ranger’s bid"; pictures `d1263-r2/`, W1–W6 all PASS).
**Caveat, filed:** [LW-UNDO-BLOCK-REOPEN] — a block outlives an admin reopening the day from another device; not reachable
in one browser; with the database step. Its judgement that the older-step guard changes behaviour for other sticky blocks
only from a jam to a pass-over (never from "could succeed") is recorded here. Gates after R1: Leave War unit 3061 / 3061;
the shared undo, permission, undo-wiring and store tests 360 / 360; `npm run build` clean.

**Walk:** this section · 27 pictures (`d1263/`, `d1263-r/`, `d1263-r2/`) · 1 surface (the Leave War grid's Undo and Redo, the
member's) · the host alone, phone 390 by finger · MISSING: 2 fixed (the refusal's words; F1 / R1 the jam), 1 comment fixed
(F2), 1 filed ([LW-UNDO-BLOCK-REOPEN])

## 16. His look at the preview on his iPhone (22–23 Oct 26) — what he found, and what was done

| He saw | What it was | Done |
|---|---|---|
| A member's closed days showed no lock (nothing open) | as built: the dim and lock show only while some dates are open for him — the look page's caption had left that out | ruled as is, **D1267** |
| The Settings window let a finger scroll the page behind | older than M1: the war's windows relied on `overscroll-behavior`, which an iPhone ignores where a list fits or is at its end (**D686**) | `Sheet.tsx` takes the app's guard (`ui/floatwin.ts holdPageScroll`) on its panel; the background still scrolls the grid (his 28 Aug 26 ruling). Test red first (`sheet-holdscroll.test.tsx`); not reproducible in the build PC's browser — his phone is the check |
| Fast scrolling between months showed the stripes, "loads slowly" | measured paired with main (`lw-m1-scroll-perf.mjs`): no month draws slower; the page lands on today, and a swipe back from late October met months never drawn | `colwindow.ts rollingTarget` draws the cut-off runway behind: striped 1004 ms → 0 (performance.md §E). Test red first |
| "Open for bidding" grew upward, so its month buttons moved | M1's window, docked at the foot | **D1264**: a full page from the top on a phone (`Sheet` `page`, `.bidsheet.fullpage`); walked: the buttons' top 55 in six states. Lesson 40 |
| Opened Mar–May as admin; the member saw it closed | as built (D1211: a member never bids before today, 23 Oct); but the admin had no warning | **D1265 / D1268**: past months locked and not pressable, a past stretch reads "past", the admin's chip counts from today; drawn first (`lw-d1265-mock.mjs`), walked (`lw-d1268-walk.mjs`) |
| The landing box stayed on 22 Oct after midnight | the page opened before midnight; a member's dim and outline stay a day behind too ([LW-M1-READ-LEFTOVERS] item 3) | **D1266**: `ui/dayclock.ts` + `store.ts dayTurned`. Tests (`dayclock.test.ts`, 5) |

Gates: Leave War unit 3077 / 3077 (window tests 32 / 32 after the tap's clip); build clean; GitHub's run on the pushed head — see the handoff.
