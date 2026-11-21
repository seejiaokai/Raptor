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
| **Phase 3 (chats 130–131, 21 Nov 26)** — the rows below; the red and green of each are its builder's and the host's runs as their commits record them, and the twelve test files named were run again together on `b2e09dc1a`'s code by the documents step: 56 passed, 1 expected fail (A2's Tracker case, below) | | | |
| The contract — the "whose is he on a day" readers (`homeOn`, `homeUnitOf`, `onRosterOf`, `rosterOf`, `unitPeople`, `myUnit`, `levelIn`, `levelOfAccount`) took today by default, and `inputsFor` had a no-day form | no proof file of its own: the whole unit suite, where a missing or malformed day now throws (`engine/roster.ts needDay`) — 26 app callers and 125 test calls given their day; the guard `engine/inputsfor-readers.test.ts` (its allowance for `engine/inputs.ts` raised by one, `inputsOnFirstDay`) | new contract — not a fault proof; that guard red until its allowance | `ea7fa94cf` (the whole unit suite through the lock: 951 of 952 files, the one red that guard, then green) |
| R6 of the 35 — a member's own command could remove who refused his bid and when, where both stamps went together | `state/reshape-r6-refusal-stamps.test.ts` — "R6 — a member's own command never removes who refused his bid and when" (proof r-r6 copied whole; 5 cases, "both stamps removed, still refused: refused by the gate" the red one) | `ea7fa94cf` | `c0a856d83` |
| The late mark — an input's late mark was judged by the loaded squadron's cut-off, not its own squadron's (owed by phase 2's "own pages") | `engine/late-own-cutoff.test.ts` — "an input's late mark reads its own squadron's cut-off": "a 149 man's input, 142 loaded: 149 cuts off on the Monday, 142 a week before — on time by 149's", with its control | the code before `7b5a53fea` | `7b5a53fea` |
| A4 — one squadron's public holiday reached another at the same place: its days, its OIL question, its bell | `leavewar/msq-holidays-own-sqn.test.tsx` — "A4 (bell) — 142’s holiday tells only 142’s schedulers" (2, the second "(A4, the call site easy to miss) 142’s holiday asks no OIL question of a 149 man’s input on that day"); `leavewar/holidays-by-place.test.ts` — its first two cases and its R32 words rewritten to D2195 and D2207: "a public holiday is its own squadron's, as an Off day is (D2195)", "A4 — a holiday 142 adds stays 142’s (D2195)", "R32 (D2184, D2207): a new public holiday names, before it is saved, its own squadron's published days it puts out of date" | `c0a856d83` (the proofs' own commit `b02185f1b`) | `40321d9ab` |
| PB3 — a holiday's OIL question never reached an admin holding Plan of that squadron | `leavewar/msq-holidays-own-sqn.test.tsx` — "PB3 — a holiday’s OIL question reaches that squadron’s admins, a plain admin holding Plan of it among them (D2202)" | `c0a856d83` | `b6e60c91c` |
| PB4 with R3 — once told, the line counted and opened the reader's home squadron, and the list saved only the reader's home squadron's answers | the same file — "PB4 + R3 + R4 — the line carries its squadron: its count, its span, the list it opens and the list’s save are 149’s" (its count and list cases); "O4 — the one OIL list saves the answers of the squadron it LISTS (PB4 must reach ui/oilday.ts saveOilDay)" (the blind read's O4 word for word, and "(R3, its door) a 142 admin with no right in 149 is refused the 149 list’s save") | `c0a856d83` | `7ea050e19` |
| R4 with PB5 — a holiday line's dates, name, newer-line check and the list's foot read the loaded war, or any squadron's line | the same file — in "PB4 + R3 + R4 …": its dates-and-name case, "(R4) a 142 holiday on the same day does not take the place of Hunter’s 149 line: one line each squadron" and "the list the bell’s tap opens (its dates only — ui/topstate.ts openNotice) finds the line’s squadron: 149’s input" (added with the fix; red with that lookup switched off); "PB5 — the list’s foot asks only lines of the list’s own squadron" | `c0a856d83` | `d5c86a299` |
| The flying plan read the loaded Leave War's holidays for another squadron's page (found with A4) | the same file — "the flying plan’s facts are the page’s squadron’s holidays, never the loaded war’s" | `c0a856d83` | `09602d118`; the helper merged `6adfca111`, its 12 proofs re-run by the host red on the code before the merge and green after; the follow-ups (the bell's tap, the record's field, the put-back's list) `cc77b061f` |
| B2 — the guest switch worked for 142 only; closed by removing the guest view (D2239) | `ui/reshape-b2-no-guest-switch.test.tsx` — "B2 — no squadron's guest switch exists (D2239)" (3: Kestrel's and Hunter's cases red, the control green on both); `state/reshape-b2b-no-guest-switch-shared-store.test.ts` — "B2 (shared store, first squadron 149) — no guest switch exists (D2239)" (1, red) — both proofs rewritten to "no squadron's switch exists" (`a1ce90674`) | `c0a856d83` | `f031c157f`; merged `218184770`; the store's label `0ea1b4342`, where the host re-ran them: 3 red and the control green with the merge's source files put back, 4 green after |
| A2's proof — signed in across his own move, the page stayed in his old squadron | `state/reshape-a02-midnight.test.ts` — "A2 — the war follows his squadron at midnight of his move" (proof `a-a02-signed-in-across-move` word for word, the clock moved by the app's own wake: "Ranger signed in on 15 Jul, moved to 149 from 16 Jul; at 00:05 on 16 Jul his war is 149’s and holds his row", with its control; its Tracker case kept word for word as an expected fail — OPEN, the plan §14 item 3: a loaded Tracker moves at the next sign-in); `state/midnight-swap-undo.test.ts` — "enterSquadron at his own midnight — fired by the clock alone", "A-v across the midnight swap — his Undo after the clock moved him" (6) | `c0a856d83`, where the trigger was off (the proofs' own commit `d02951d7f`) | `548f7426a` |
| The hold and the band (D2243 Q7) — an open Leave War window at midnight of his move | `state/typing-hold.test.tsx` — "a Leave War window open at midnight of his move" (6, the band's approved words, the refused save, Close and Escape among them) and "the Tracker at midnight of his move (the plan §14 item 3 — it cannot be re-read in place once loaded)" (1) | `548f7426a` (the tests' own commit `d09893e27`) | `52159d559` |
| R6 of the blind read — a pick with no right behind it, or a war or Tracker not the page's own squadron's, left the page where it was (dormant until a screen gives or takes a right) | `state/reshape-r6-reenter.test.tsx` — "the pick half: a squadron picked with no readable right behind it", "the war half: a Leave War loaded that is not the page’s own squadron", "the Tracker half: a Tracker bound to a squadron that is not the page’s own" (6; 3 red, 3 already green with the swap and the hold); `state/pick-stands.test.ts` — "pickStandsOn" (4, new behaviour) | `46a97946f` | `61d2926f5`; the helper merged `9dbdfe9f3` |
| The midnight words fault — at midnight of his move the grid swapped his open bid window for the closed note, so his typed words were gone under the band (found by the drawing check, D1494) | `state/typing-hold-grid.test.tsx` — "Ranger's bid window open at midnight of his move": "stays the bid window, his words in it, under the band", with its control | the code before `0a98f2ae1` | `0a98f2ae1` (the 88 files that render the grid, 1,505 tests, green through the lock) |

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
