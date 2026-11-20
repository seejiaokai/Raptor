# Evidence sheet — batch 1's multi-squadron reshape (chat 127, from 21 Nov 26)

The build of `docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md` by its §10 phases, his D2244 (Opus builds;
Fable reads the core's rights change blind before any helper builds on it; Sonnet walks; the four-reader fix read at
the end, D2236). Branch `claude/multi-sqn-b1-107`, pull request 806 (draft — not merged before a fix read comes back
clear). Pictures: `docs/img/handpass/2026-11-21-msq-reshape/`.

## The eight answers and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money (OIL, who counts as present) | YES — the war's roster by date (A1), OIL eligibility across a move (`oilOpenOn`), A4's holidays per squadron |
| 2 | The published record | YES — the sign-off boxes (C5), `snap.ros` frozen by the day (C4) |
| 3 | Saved data | YES — rights read by date, the planning record routed to another squadron's store, the foreign posting pass |
| 4 | A shared drawer | YES — the roster readers behind every crew list and palette |
| 5 | A new gesture or mode | YES — the midnight band and its "Close" (drawn, approved D2243 Q7) |
| 6 | A new surface | NO — no new screen; the band sits on an existing window |
| 7 | Roles | YES — Pieces B and C, PA1–PA3, R1, R7 |
| 8 | The warning list | NO — no warning's words or rule reading changes; the refusals are doors' words, not warnings |

**Tier: FULL.**

## The roll-call (one row per surface the reshape touches — §13; filled during the walk)

| Surface | SHOW | USABLE | PAINTED there | Proved by |
|---|---|---|---|---|
| Inputs — list, filter, deleted and archived groups (C1, C2, C11) | | | | |
| Inputs calendar — notes, day titles, their edits and Undo (A-ii) | | | | |
| Input window — people picker and Save across a move (C6, Q8's words) | | | | |
| Edit Schedule — day panel, crew palette, free all day, ALL AVAIL crowd (C4) | | | | |
| Edit Schedule — sign-off boxes (C5; R8 his answer) | | | | |
| Publish and sign — the frozen roster (C4) | | | | |
| Quals (A-ii setting) | | | | |
| Medical counts | | | | |
| SANS calendar and day | | | | |
| OIL answer list (A4, PB3–PB5, R3, R4) | | | | |
| Leave War — rows across a move (A1, drawn), a day now another squadron's (A7) | | | | |
| Leave War — posting pass, held note (A5, A6, PB1, PB2) | | | | |
| Tracker — people, rebind at midnight (A2) | | | | |
| Admin → Users — Suspend, Demote, Archive, Delete of a last admin (B3, Piece C; R12 his answer) | | | | |
| Admin → Users — re-link, Restore, Delete and their Undo (Piece B, guardrails 1 and 2) | | | | |
| Admin → Users — "+ New squadron" (B6, R5) — no screen yet | | | | |
| The bell — posting lines to a squadron's admins (adminsOf) | | | | |
| The top bar's Undo / Redo — steps across the midnight swap (A-v) | | | | |
| The midnight band on a Leave War window and a Tracker pop-up (A-iv, drawn D2243 Q7) | | | | |
| Waiting screen — no guest view (B2, D2239) | | | | |

## The five sizing lines (§7.0)

(written at the sizing step, before any walker starts)

## The rulings that apply, swept against the running build

## The orders walked

## The cases carried by a test

(each fault's proof copied red first — §9.1 of the plan; the host reruns both runs)

| Fault | Test file | Red on | Green on |
|---|---|---|---|
| C9 (the guards' counter dropped a template's `${…}` code) | `engine/roster-readers.test.ts`, `engine/inputsfor-readers.test.ts` (their C9 cases) | the old counter (chat 127, before `b526f2f45`) | `b526f2f45` |
| B4 (an own page read and wrote the members' switch of the signed-in man's home, not the page's) | `state/memberfile-own-unit.test.ts` (copied word for word from the repro brief, only the harness changed) | `518b675a3` | `3208bfe7e` |
| A5 step 7 — another squadron's posting through the second store; the bell lines' audience | `state/posting-pass-every-squadron-gate.test.ts` (12; 8 red, 4 refusals already refused) | `0f9d98ef7` | `7ada453ba` |
| B1's gate line — a delete takes its man off another squadron's planning notes, and only that | `state/delete-strips-other-calendar-gate.test.ts` (9; the 4 allowed cases red, the 5 refusals green on both) | `7ada453ba` | `81092264c` |
| A7's gate half — a war's change to a man's day not its squadron's only removes (D2243) | `state/war-day-not-its-squadron-gate.test.ts` (6; both refusal cases red, the allowed green on both) | `81092264c` | `f12c09d56` |
| Piece B: R2, R3 (its two reads name the move day, §4.4), R4 (a–d), R5, K1 — copied whole from the repro brief | `state/reshape-r2-move-back`, `-r3-undo-move`, `-r4-no-old-right`, `-r5-first-admin-moving`, `-k1-place-day` `.test.ts` (15; 10 red, 5 controls green on both) | `9288f0593` (core files before Piece B) | the night's Piece B commit |
| Piece B: PA1 (a–e), PA2 (a, b), PA3 (a) — the Plan audit; R1 (O1 a, b) — the blind read | `state/reshape-plan-audit.test.ts`, `state/reshape-plan-audit-read.test.ts` (13; 10 red, 3 controls/guard green on both; O2 and O4 left for P3 and phase 3) | `9288f0593` | the night's Piece B commit |
| Piece B's tables — the reading rule, the one check for homes and places, guardrail 2's leave-out, R7, moves-tomorrow | `state/piece-b-tables.test.ts` (21) | new behaviour — not fault proofs | `6a3ca222d` |
| Piece C: B3 (the door judged today, the gate every date — a correct refusal reached the screen as "That did not save"), B6 (a squadron made, or left, with no admin) — copied whole from the repro brief | `state/reshape-b3-lock-door-vs-gate.test.ts`, `state/reshape-b6-squadron-without-admin.test.ts` (7; 5 red, 2 green on both — the Archive control, and Hunter taking his own Plan away, refused by PA1 already) | `6a3ca222d` (core files before Piece C) | `be0dc7e13` |
| Piece C's lock table (§5.4 — dates × admins at home × a Plan-only squadron × a master at home only × an archived admin × the first admin moving in × a new squadron's first admin moving away later × a Plan sign-in that is a member there × a squadron removed whole × the whole app) and every door in the one words table (D2184 Q10, D2217 Q15, D2246), the gate past the door for a right and a squadron, the Undo and Redo of "+ New squadron" | `state/lastadmin.test.ts` (22), `state/reshape-piece-c-doors.test.ts` (20) | new behaviour — not fault proofs | `be0dc7e13` |

## The pictures

## The break tests

## Errors seen

- **The source scan left red by Piece B, found by Piece C's wide run (21 Nov 26):** `state/perms-scan.test.ts` (D200 (3) —
  authority decided in one place) failed on three account-role reads Piece B put outside the allowed files
  (`notices.ts adminThen`, `units.ts addUnit` and `setGrant`) and Piece C's own in `lastadmin.ts`. Not a behaviour fault —
  each read an account record's role, which is data — but the guard is what keeps a second gate from growing: all four
  now read `units-model.ts isAdminRole`. Piece B's own runs had covered only the multi-squadron and gate files; from
  Piece C on, a core commit runs the whole unit suite (15,308 passed, 1 failed — F11-4, owed and fail-closed).

## What was NOT walked, and why

## The gate counts

## What the walk found, and each disposition

## The reads (phase 2: Fable's blind read of the core's rights change; phase 4: the four-reader fix read)

### Phase 2 — Fable's blind read of the core's rights change (his D2244), 21 Nov 26

On an exported copy of `6c0908481` (the code, no records), brief and report word for word in
`docs/superpowers/briefs/2026-11-21-msq-reshape-fable-read-brief.md` and `…-fable-read-report.md`. Four findings, each
reproduced red in this checkout before it counted (10 red, 3 controls green), each fixed as Fable specified and green
after; the whole unit suite run after the fixes. No right found holding where it should not.

| # | Finding | Severity | Fix | Proof (red on `6c0908481`, green after) |
|---|---|---|---|---|
| 1 | The first admin's move into his new squadron could never be taken back or undone — the lock read his date as home-only | HIGH | `lastadmin.ts`: a home admin of that date who still counts there by his own Plan after the step keeps the squadron | `state/fable-first-admin-takeback.test.ts` |
| 2 | Making a squadron's only Plan admin a master admin: the door let through what the gate refused ("That did not save") | MED | `accounts.ts setMaster` asks the lock at the door | `state/fable-master-mark-lock.test.ts` |
| 3 | Six squadron doors (move, take in, View given or taken, a place moved, "+ New squadron" by a non-master) showed the gate's raw reason | MED | `units.ts said()`: a refusal raised inside a command keeps its words, everything else the generic words (as `saidOf`) | `state/fable-unit-doors-raw-reason.test.ts` (6) |
| 4 | A move's Undo after its day began jammed his whole Undo list ("just now" on every press) | MED | `undo/timeline.ts refusedFor`: "changed for a day already begun" is blocked for good, in today's words | `state/fable-move-undo-after-midnight.test.ts` |

Fable's "one thing for the owner" (not a fault — the plan's §5.3 reading): once a squadron has an admin at home, a Plan
holder no longer counts for it — put to him (the block's questions).
