# Evidence sheet — [LW-WHOLE-LEAVE-WINDOW] (28 Oct 26)

**The change:** a tap on any day of a leave of several days opens the bid window on the whole leave — the title its dates,
"All <n> days" (picked to start with) or the day tapped at the Duration row's right end, Approve / Refuse / Move / Delete
acting on what is picked; D1289's cyan mark built with it (his D1448, D1461, D1289). Branch `claude/lw-whole-leave-window`,
pull request 582. Spec `docs/superpowers/plans/2026-10-28-lw-whole-leave-build-spec.md`; scenario design
`docs/superpowers/briefs/2026-10-28-lw-whole-leave-scenarios.md`.

**Tier: FULL** — §5's questions: 1 money/OIL no (no OIL figure changes; a delete of a leave moves the balance as any delete
does); 2 published record no; **3 saved data YES** (decides and deletes leave, one command each); 4 shared drawer yes (the
grid's cells wear the mark); 5 new control YES; 6 new surface no (a row of the existing window); 7 roles — no new rule (the
store's gates, unchanged); 8 warnings no.

## 1. The rules sweep

D1448, D1461 (the design) · D1462, D1463 (built in M4 — the title's brightness, "Auto-approve") · D1289 (the mark — built
here), D1290 (the phone keeps the tapped day above the window — built in M3) · D1330, D1361 (the lit Approve / Refuse, a
second tap back to pending) · D260 (a block's Delete names awards — the day's Delete keeps it; "All" takes no award) ·
D262, D265, D266 (Move picks up into the grid's move mode; a record by its id) · D333, D1225 (a member's own bid: Move while
open, Delete on a day since closed) · D335 ("Pick a range" widens the window — kept for days that are not one leave) ·
D1339, D1346 (one entry, one remark; next-door bids with one remark act as one) · D1359 (the joined bar) · D1421 (Approvals'
lines) · D1436 (a day from his posting-out refused). No ruling found that the change contradicts; D335 is narrowed only in
the sense D1461 itself gives (the choice stands where "Pick a range" stood).

## 2. The roll-call — the THING is "a leave of several days", and "the days a bid window acts on"

| Place the app opens or draws it | Has it / must not, because… / MISSING |
|---|---|
| The bid window on a day of the leave | HAS IT — the chips, the title, the four actions on the leave (wholeleave.test.tsx) |
| The day's list (a day of the leave holding a second entry — an award, the other half's bid) | MUST NOT as built: it lists each entry with its own actions (D266); D1448's "any day" → reading R6, put to him with a picture |
| The free half's window (a day whose other half was filed on the Inputs page) | MUST NOT as built: the window is the free half's (`onlyPortion`) → R6 |
| The drag window | MUST NOT: a drag is a block of days and takes everything on them (D260) |
| A member's approved-leave window (D1354) | MUST NOT: it carries only the leave's remarks, which are already the whole leave's (one Input) |
| A member's closed-day window (D1225) | MUST NOT: its Delete takes his pending bid on that day; the whole leave's Delete is in the bid window on an open day — the difference stated (S14) |
| Leave filed on the Inputs page (its read-only window) | MUST NOT: changed on the Inputs page (`leaveRunAt` returns nothing for it — tested) |
| The Approvals list's line | HAS IT — the same leave (`reqRunKey`) and the same writer (`decideRequests`) |
| The grid's joined bar | HAS IT — the same entry key; a picked day shows its own box under the cyan (`td:not(.selcell)`) |
| The member's bell (a decision or a delete by an admin) | HAS IT — through the same commands (`lw.decide`, `lw.edit`) — walked (S1) |
| Undo / Redo (the top bar) | HAS IT — one command a press — tested; walked (S9, S12) |
| The phone's scroll keeping the tapped day above the window (D1290) | HAS IT — the tapped day, as built — walked |
| **Painted on the same pixels as the cyan:** the Approvals ring (`lw-ring`), today's ring, a pending bid's dashed box, the open-bidding outline, the "+n" / "!" corner tiles | each checked in the walk's pictures (S16) |

**The door check (a new control):** both chips are buttons in the window's tab order, named in full for a screen reader
("All 4 days, 9 to 12 Feb", "Only Tue 10 Feb"); Escape closes the window as before (S20).

## 3. Sizing the walk (D607, `docs/walk-ledger.md`)

1. **Type:** C (a new control — the choice) leading; D (the cyan mark on the grid's cells); G (decides and deletes saved
   leave, Undo).
2. **What only a walk can find here:** the chips' fit in Safari's engine with an iPhone's wider letters; the cyan over the
   joined bar and the other marks on the same cell; the move mode started from "All" and landed; Undo and Redo from the top
   bar after each press; the member's bell after an admin's press; Approvals' "Back" after deciding in the window; the phone
   keeping the leave in view. Already carried by tests: what each press writes and its one Undo, the re-read after the words
   are saved (G4), the lit button with Auto-approve off (G6), the mark kept through a rebuilt class (G2), the refusal's words.
3. **The ledger:** walks of window controls (M3, M4 — types B, C, D, G, H) found faults every time (M4's re-walk 5 FAIL of
   28 steps), most of them order-of-action and layout faults the tests had not met.
4. **The walk chosen:** one Sonnet walker (D588), one assertion script, 14 scenarios from the designer's S1–S20 (S1, S3, S4,
   S8, S9, S10, S11, S12, S14, S15, S16, S17, S18, S20) at the phone (WebKit, 402 × 874, iPhone) and the desktop (Chromium,
   1536 × 864 at 1.25 — his PC); carried by tests, not walked: S2 (`wholeleave.test.tsx` G4), S13 (the re-read at every
   press — the same code path as S2), S19 (the run key — `leaveRunAt` tests); S5, S6, S7 pictured for his readings only.
5. **After the walk:** its row in the ledger — §6 below.

## 4. Gates

Unit: `wholeleave.test.tsx` 28/28; the whole Leave War project 3674 passed, 4 failed → the four were range cases built on
one leave (now opened whole), given separate entries (`movestandard`, `litdecide` — 29/29). Browser:
`e2e/wholeleave-leavewar.spec.ts` 4/4 (phone, desktop). Build: green. GitHub's run on pull request 582: in progress.

## 5. The walk

One Sonnet walker, one assertion script (`scripts/handpass/lw-whole-walk.mjs`), the served build `index-BrWj2PVq.js`
(port 4183, built under the lock); phone WebKit 402 × 874 (and 360 × 780 for W13), desktop Chromium 1536 × 864 at 1.25. 30
runs: **26 PASS, 4 FAIL → three findings**; no page or console error. Report `docs/handpass/parts/lw-whole/walk.md`, raw
`walk-results.json`, pictures `docs/img/handpass/2026-10-28-lw-whole-leave/walk/` (100).

| Finding | The host's reading (pictures opened: W1 phone all / day, W13 360) | Disposition |
|---|---|---|
| W6 — the refusal's note amber, the brief said red | Every refusal note in this window is the amber `note warn` (a kept-pending note, a skipped day): the brief's word was wrong, the words right — "Nothing was decided. He posts out on 11 Feb: refuse or delete it." | Not a fault |
| W9 — Undo with the window open: the desktop's window covers the top bar; on a phone the Undo tap only closes the window (a tap outside closes it — the popup rule) | Older than this change ([LW-WINDOWS-NONBLOCKING], [TRAFFIC-WIN-COVERS-UNDO]'s family); a store change under an open window (W9b) and Undo after ✕ both follow live — PASS | Not this change's; noted under [LW-WINDOWS-NONBLOCKING] |
| W13 at 360 × 780 — the Duration row wraps, the chips under AM · PM; no word clipped | His iPhone is 402 wide, where the row is one line (D1461's reading: "drawn at 402 in WebKit on one line"); at 360 the row wraps whole, never breaking a chip — the design guide's wrap. "Grant OIL" reading "Grant …" at 360 is the leave rows' own, untouched here | Said to him (R9); no change |
| **Found by the host in W1's pictures, not flagged:** on "All" the manning line read "Mon 9 Feb" over "No manning row is amber or red" — a date naming no hurt, a line of height, and his drawing (v2) shows the calm line alone | A departure from the approved drawing (D1424) | **Fixed red first** (`DayLine.tsx` — the day named only where a row is; `bidwindow-dayline.test.tsx`); the drag window's calm line loses the same empty date |

Recorded words: W3 the member's bell, ONE line — "Your leave · Mon 9 – Thu 12 Feb · LL approved · Saber · now"; W8 after
Back, Approvals' line greyed "Already approved by Saber" (as built for any decision made on the grid — said to him); a cyan
cell carrying Approvals' ring occurred (W8-desk-ringed-cyan). Observations, none a fault of this change: the desktop window
can cover the leave's last days (it floats, D641); the 30–31 Dec window's "till 2 Jan 27" (the bid's words run across the
year's end, the store's run — as before); Escape leaves focus on the page (as every war window does — older).

## 6. The ledger's row

Added to `docs/walk-ledger.md` (28 Oct 26).
