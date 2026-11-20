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

## The pictures

## The break tests

## Errors seen

## What was NOT walked, and why

## The gate counts

## What the walk found, and each disposition

## The reads (phase 2: Fable's blind read of the core's rights change; phase 4: the four-reader fix read)
