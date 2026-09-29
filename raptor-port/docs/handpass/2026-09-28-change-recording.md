# Evidence sheet — the change-recording re-test, with `[UNDO-ROSTER-SETTINGS]`, D148 and `[UNDO-TOPBAR]` (28–29 Sep 26)

Branch `claude/change-recording-retest`. Planned (Opus 5.5) → scenarios (Fable, Astra) → the "which changes get Undo" review
(both) → the plan's red team (Fable + Astra, one round, every finding accepted — plan §11) → Phase A walked (two walkers:
A1 178 / 12, A2 158 / 8 — plan §12–§13) → built red-first (B1–B11, in the amended order) → gates → Phase C walked →
the two code reads → fixes → re-walk → his look. The plan of record:
`docs/superpowers/plans/2026-09-28-change-recording-plan.md` (its §11–§13 win over §3–§6).
Pictures: `docs/img/handpass/2026-09-28-change-recording/` — `a1/`, `a2/` (Phase A, the defects' evidence), `c/` (the bars),
`a1-rewalk/`, `a2-rewalk/` (Phase A re-run on the build), `a2-rewalk/<width>/c-steps-*` (the new behaviours).

## 1. The eight questions (bug-check order §5) and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money — earned leave | **YES** — Undo takes back OIL decisions, OIL awards and publishes (which credit OIL); walked in Phase A (A1 S11, S12, Astra 17) |
| 2 | The published record | **YES** — undo of a publish is an Unpublish (AM39c); a Quals CAT or a rule change undone moves a published day's pending |
| 3 | Saved data | **YES** — a roster / settings restore writes the stored roster, accounts and rules |
| 4 | A shared drawer | **YES** — the top bar and the board's bar are drawn on every page |
| 5 | A new gesture or mode | **YES** — the pair on six more pages; the board's ⋯ menu |
| 6 | A new surface | **YES** — the ⋯ menu |
| 7 | Roles | **YES** — D148 (whose steps), the accounts' guards on a restore, the admin's member view |
| 8 | The warning list | **YES** — an undone rule or Quals change re-derives every warning |

**Tier: FULL.**

## 2. The rulings it builds and must not break (the rules sweep — plan §1)

**Builds:** D148 (only your own; refuses and says who), D347 (every pair in the top bar), D348 (the phone's order), D349
(the mock-up: the Tracker's pair too; the board's Sync + bell + ✓ Done only; ⋯ on a phone), D350 (adding / archiving /
restoring / deleting a person and postings stay out — and say so), D352 (the stage kept, with its own words), the
16 Sep 26 "roster and settings edits ARE undoable" (AM39d), AM39b (takes you to where the change was; says what it did),
`[AMEND-SMALL-SEEN]` item 2 (a take-off time). **Must not break:** D166 (5), D170, D171 (2), D227, D263, D286, D287,
D290, D292, D295, D305, D310, D322, D338 (7), (9), D351, AM32–AM39c, the 4 Sep 26 "a click-open popup closes on a click
outside", the 2 Sep 26 "a control tapped repeatedly must not move under the finger", "UI copy reads production". No
clash found between them (plan §1).

## 3. The roll-call

### 3a. The pair — every place the app draws Undo / Redo

| Surface | Admin | Member | Admin in the member view | Walked |
|---|---|---|---|---|
| Top bar — Edit Schedule (+ the changes clock) | YES — the one undo | — no page | — the page leaves (D292) | `cr-c-bars` all three sizes |
| Top bar — Leave War | YES | YES | YES | same; its Period row: NO — must not (the pair left it) |
| Top bar — Inputs, Quals | YES | YES | YES | same |
| Top bar — Admin | YES | — no page | — | same |
| Top bar — Logic | YES | NO — must not: read-only for him (§11.6) | NO — must not | same |
| Top bar — Tracker | YES — the TRACKER'S OWN history (`#trUndoBtn`) | YES (own) | YES (own) | same; its own header: NO — must not inside Raptor |
| Top bar — View-only Sched, Help | NO — must not: nothing changes there | NO | NO | same |
| The board's bar | YES — Undo · Redo · History · Sync · the bell · ✓ Done (no ✕) | — | — | `cr-c-bars` board section |
| The standalone Tracker's header | YES (its own) — nothing hosts it there | — | — | unit (`trackerHosted`), not walked |
| Guest / waiting screen | NO — must not (no Shell) | — | — | unit (App mounts no Shell) |

### 3b. The kinds of change — a step, never a step, or not undone here

| Change | What the build does | Proved by |
|---|---|---|
| The schedule, publish / Unpublish, sign-offs, Discard, a warning mute, OIL Earn, inputs, the planning calendar | a step (unchanged) | Phase A (A1, A2) |
| The Leave War: bids, decisions, moves, awards, balances, OIL policy, bid window, war create / rename, ⚙ settings | a step, now with its own words | Phase A (A2) + `stage-undo.test.ts` |
| The Leave War stage (D352) | a step, `lw.stage`, its own words and what the war is now | `stage-undo.test.ts`, C8 |
| Quals: a tick, CAT, initials, flight, remarks, a callsign; the LoX columns | a step (new) | `undo-wire.test.ts` B2, C1, C2, C6 |
| Accounts: give access to an existing person, refuse, give a sign-in, suspend / enable, role, puck, sign-in name, the guest switch | a step (new), the accounts' guards re-checked | `roster-restore.test.ts`, C4, C7 |
| Templates, the default arrangement, wave show / hide, the look-ahead, the rules, the stores, the cancel reasons | a step (new); a wave-template save ONE step | `undo-wire.test.ts` B2, C3 |
| Adding a person (alone / with sign-in / a request as new), Archive, Restore / Restore as, Delete, a posting | NOT undone here (D350) — the greyed button says why; an older step taken past one says it stays | `timeline-cr.test.ts` B3, C5 |
| Seen marks (changes, the bell, welcome back, "OK, seen"), a waiting person's own request | NEVER a step | `timeline-cr.test.ts` B1, `scenarios-corners.test.ts`, C11 |
| The posting pass, another person's change | never his step; a barrier that names who | `timeline-cr.test.ts` §11.1, B6 |

### 3c. The door check — the control for every action

Undo / Redo on every page above; the board's ⋯ → Sort all, Phone / Desktop layout; the ⋯ closes on a tap outside, on
Escape and after a choice; ✓ Done is the board's one exit (Escape and the scrim still close it). A phone has no door to
"Discard marks" — filed, `[PHONE-DISCARD-MARKS]` (walker A1 O4), not this build.
