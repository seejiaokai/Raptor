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

## 6. Orders walked · 7. Cases carried by a test · 8. Pictures · 9. Break tests · 10. Errors seen · 11. Not walked, and why · 12. Gate counts · 13. The reads (fresh Opus; Fable — D1260) · 14. Findings and dispositions

(to fill)
