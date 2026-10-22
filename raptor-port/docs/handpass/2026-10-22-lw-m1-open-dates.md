| the bridge pins a member's today (`lwSetMemberToday`); the Leave War browser tests moved | — | — | every walk; e2e 363 on his PC; GitHub's run || admin, member, the admin's member view, signed in without access | — | — | A, B, C; B S34b; C S34a || unchanged: Inputs-page leave on a closed day lands approved; OIL on a closed day; the SANS month and the Calendar window; the bell silent | — | — | C S28, S31, S32, S33; host S27 || "No leave period yet" — its words | — | — | `leavewarpage.test.tsx` (no war cannot be made from the app's controls) || "+ New" and the schedule's "Create the period" make a period with nothing open, on screen (A-F3, fixed); the Holidays ask | — | — | A S1, S37; re-walk ra S37; `oilperiod-offer.test.tsx`, `warask.test.tsx` || stretches and the last closing survive a reload; an old saved war loads | — | — | A S1, S12; `opendates-store.test.ts` || a member's change on a closed day refused at the commit except taking his own pending bid, or its Undo | — | the Undo was refused (B-F1, fixed) | `opendates-store.test.ts` B8, B-F1 || every write asks the period HOLDING the date (B3) and a member's today (D1211) | — | — | `opendates-store.test.ts` B2, B3, D1211, D1225 || one step a gesture; "opening bidding 1 Apr – 30 Apr — those days are open for everyone" | top-bar Undo / Redo; the grid stays on June (D672) | the window blocks the top bar while open (A-N1, as every Leave War sheet but two) | A S13, S19; B S14-undo; C D672 || the first open date from today, in the period that holds it, else today | boot, tab, View switch | — | A S10; host S9 (clock 15 Dec 26: 2026); `opendates-store.test.ts` || "Change the approved leave ›" / "…but the bid is approved OL" | a tap opens the day's list | — | A S11 || the moved line always | — | — | C the Legend || only on approved leave moved; a pending bid's move none | — | — | A S24 || a member moves his own pending bid between open days; approved leave never into another period | the one-day chip, the day's list, a drag | — | B S25; A S24; C the year-end move || a member's lines on a closed day: Delete only; the admin: decide and Note | — | — | B S3-daylist; C S6 || a member's block on closed days offers Delete of his own pending bids only; the admin's any action | fill, decide, Delete, Move | closes when the open dates change under it; the window now drawn over it (H-F1) | B S3-drag, S4-dragfill; host S29 (desktop and phone) || "Pick a range" skips closed days and says so — the words named the old window (B-N1, reworded) | — | — | B S4-range; `bidding.test.tsx` || the decide sheet on any day, approved leave included | Approve / Refuse / Move / Delete / Note | — | C S6; A S10 || open day: the bid window; closed: the closed note (D1176); his pending bid on a closed day: the pending note with Delete (D1225); his approved leave: its remarks, any day | each sheet's own buttons; Undo of the Delete (B-F1, fixed) | — | B S2, S3, S4, S26; re-walk rb S3-single || a member's closed days dim with a small lock on the date; never the admin's | — | the admin's dim cost his tap 3× (§5) — removed before the walk | B S2; `window.test.tsx`; §5 || one green outline per stretch; a member's from today | — | — | A S22; `window.test.tsx` || months lit (open), dashed green edge (part), plain (closed); a line per stretch with its days and the calendar icon; "+ Open more dates"; the last closing with who | tap, second tap, a held drag (a phone's two rows by finger), the calendar with Open / Save / Close these days / Cancel; Tab and Space; Escape one layer at a time | unstyled at desktop widths (A-F1, fixed); under a drag-selected block's panel (H-F1, fixed) | A L1, S1, S5, S8, S14, S17, S20; B S14; host S29; re-walk ra L1, S20 || desktop "Open for bidding 1 Jan – 31 Mar +1"; phone "Open 15 Feb – 31 Mar" (a member's from today); "Bidding closed" | a press opens the window, for everyone; Enter on the keyboard | one line on a phone with two stretches (34 px) — the space was missing on a phone (B-F2, fixed) | A S22; B S2-chip, S22; re-walk rb `S2-00` |# The Leave War overhaul's M1 — open dates — the bug check (22 Oct 26)

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
The scenario designer's 13 cuts (its §3): (to fill — run in a separate checkout).

## 10. Errors seen

None in the browser console or page errors, in any walk or re-walk.

## 11. Not walked, and why

S29's member half (a member's bid window open while the admin closes the day — two live sessions); S36 (no route on
screen — carried by a test); S10 (c, d) (carried by `opendates-store.test.ts`'s landing tests).

## 12. Gate counts

Leave War unit tests 3035 / 3035 (his PC, 22 Oct 26, after the fixes); the Leave War browser tests 363 on his PC before the
walk; GitHub's full run of the pull request green on d2ff349a4 — the run on the fixes: (to fill).

## 13. The reads (fresh Opus; Fable — D1260)

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
