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
(what shares its pixels). Filled during the walk.

| # | Place | Shows | Usable | Painted over | Proof |
|---|---|---|---|---|---|
| R1 | the chip on the strip (desktop, phone) | | | | |
| R2 | the "Open for bidding" window | | | | |
| R3 | the green outline, one per stretch | | | | |
| R4 | closed days dim + the lock on the date | | | | |
| R5 | a member's tap on his own row (bid / closed note / pending note / remarks) | | | | |
| R6 | an admin's tap (decide at any time; approved leave changeable) | | | | |
| R7 | "Pick a range" in the bid window | | | | |
| R8 | the drag-select panel (member and admin) | | | | |
| R9 | the day's list (decide, Delete own pending, Note) | | | | |
| R10 | Move (one-day chip, day's list, drag) | | | | |
| R11 | the dotted moved mark | | | | |
| R12 | the Legend | | | | |
| R13 | the clash note (phone line, desktop strip) | | | | |
| R14 | where the page opens (boot, tab, View switch, clash tap) | | | | |
| R15 | Undo / Redo of opening and closing | | | | |
| R16 | the store's doors (every write) | | | | |
| R17 | the command gate (B8; `lw.open`) | | | | |
| R18 | the saved shape (reload; an old saved war) | | | | |
| R19 | creating a period ("+ New", the Holidays ask, the schedule's "create it") | | | | |
| R20 | "No leave period yet" | | | | |
| R21 | must not change: the Inputs page on a closed day, OIL, the SANS calendar and Calendar window, the bell | | | | |
| R22 | roles: admin, member, the admin's member view, signed in without access | | | | |
| R23 | the test bridge and e2e | | | | |

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
5. **After the walk:** the ledger row — (to fill).

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

## 6. Orders walked · 7. Cases carried by a test · 8. Pictures · 9. Break tests · 10. Errors seen · 11. Not walked, and why · 12. Gate counts · 13. The reads (fresh Opus; Fable — D1260)

(to fill)

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
