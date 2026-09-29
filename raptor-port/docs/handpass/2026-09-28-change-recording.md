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

Also fixed in the table above by the walk: the top bar's pair is icon-only between 821 and 1499px wide, and the Sync pill
is its dot alone on a page carrying the pair (the first gate run found the bar two lines tall at 1366 / 1440 on six pages).

## 4. The walk of the build (Phase C) and the re-walk of Phase A — 29 Sep 26

On the production bundle (`npm run build`, served on 4173), the live app (`origin/main` d3650865, served on 4192 from a
separate checkout) beside it as the height baseline. Every script ASSERTS the right behaviour; re-running it is the re-walk.

| Walk | Sizes | Checks | Result | Pictures |
|---|---|---|---|---|
| `cr-c-bars` — the pair on every page, admin and member; the board's bar; the ⋯ menu; each bar no taller than the live app's | 1440×900, 1366×768, 390×844, 844×390 | 53 · 53 · 78 · 53 | all PASS | `c/<size>/` 17 · 17 · 20 · 17 |
| `cr-c-barheights` — the bar's height on 9 pages, build against live | 1920, 1600, 1536, 1500, 1440, 1366, 1280, 844×390, 390×844 | 81 | no page taller anywhere (Edit Schedule at 1440: 104 → 58, one line) | — |
| `cr-c-steps` C1–C11 — the new behaviours | desktop, phone | 29 · 29 | all PASS | `a2-rewalk/<w>/c-steps-*` 15 each |
| Phase A re-walk, walker A1 (land, nav, oil, pub, s13, struct, survey) | desktop, phone | 96 · 94 | all PASS | `a1-rewalk/` 79 · 77 |
| Phase A re-walk, walker A2 (clash, inputs, lw, roles, sessions, survey) | desktop, phone | 88 · 88 | all PASS | `a2-rewalk/` 83 · 83 |

**What the walk found, and each disposition:**

| # | Found | Disposition |
|---|---|---|
| W1 | The pair made the top bar two lines at 1366 and 1440 on Inputs, Quals, Logic, Leave War, Tracker and Admin (57 → 103px); the Leave War grid moved 46px down (three drag tests red). The first `cr-c-bars` passed it — it compared against Edit Schedule's bar, which is two lines anyway | FIXED — icon-only pair + Sync dot at 821–1499px (`topbar-css.test.ts`); `cr-c-bars` now compares every page against the live app's bar, and walks 1366×768 |
| W2 | The Changes clock's gold number did not move until a page change | FIXED — the bar re-draws on the count (the changeswin e2e) |
| W3 | A leave undone on the Leave War jumped to Inputs (step4-leavewar e2e) | FIXED red-first — an absence input stays on the war (`undo-wire.test.ts`) |
| W4 | A leave filed late on a published Sunday, undone on Edit Schedule, jumped to Inputs — the day whose "1 pending" it cleared went out of sight (A1 S16.4) | FIXED red-first — an input on a day of the loaded week keeps you on Edit Schedule (the plan's §11.6 "unless a week context is present"); an input on another week still opens Inputs |
| W5 | A1 S13.6 / S13.8 asserted the Phase A walker's hoped-for words ("tap Unpublish first") | NOT A DEFECT — the plan's §13 A1-F1 decided "A later change touches the same thing and can't be undone" here (the publish holding it is dead: undoing it would bring the deleted man's signature back; after an Unpublish, Undo takes the Unpublish). Script re-pointed at the decided behaviour; PASS |
| W6 | A2 H-today asserted the four ⚙ / stage Undo / Redo history lines Phase A found | NOT A DEFECT — that was A2-F5; the fix writes none. Script re-pointed; PASS |
| W7 | C3 typed into a box reading "1h" (no change possible); C11 on a phone tapped the day's status badge, whose sheet then blocked the Undo | SCRIPT faults — C3 picks a number box, C11 taps the day's change count; both PASS |

**Not walked, and why:** two people at once (unit only — one browser has one signed-in person); the standalone Tracker's
own header pair (unit, `trackerHosted`); a reload between an act and its Undo on every door (walked on the schedule and
the war in Phase A S24; the undo list itself is cleared at sign-out by design, D148).

## 5. The break tests — each red on the code before its fix, green after

| Surface / rule | Test |
|---|---|
| Seen marks and a waiting person's request are never a step (B1) | `undo/timeline-cr.test.ts` B1 |
| Adding / archiving / restoring / deleting a person, a posting — not undone here, the button says why (D350, B3) | `timeline-cr.test.ts` B3 |
| Another person's change, the posting pass — a barrier that names who (D148, §11.1, B6) | `timeline-cr.test.ts` §11.1, B6 |
| A dead newer step reads "can't be undone", never "undo that first" (A1-F1) | `timeline-cr.test.ts` A1-F1 |
| A restore re-checked inside the write (§11.3) | `timeline-cr.test.ts` §11.3 |
| Quals, accounts, templates, rules, the look-ahead — a step each; a wave-template save ONE step (B2) | `state/undo-wire.test.ts` B2 |
| A callsign taken since, an archived man's sign-in, a deleted man — a roster / settings restore refused whole (B5, D286, D322) | `state/roster-restore.test.ts`, `person-delete.test.ts` B4 |
| The page an undo lands on; the board kept open across weeks; an absence stays on the war; an input on the loaded week stays on Edit Schedule (B7, W3, W4) | `undo-wire.test.ts` B7 |
| The words (B8) | `undo-wire.test.ts` B8, `undo/describe` via B8 |
| The Leave War stage, its own words (D352) | `leavewar/stage-undo.test.ts` |
| No undo line where the change wrote none (A2-F5) | `state/changelines.test.ts` A2-F5 |
| The LoX columns read live on Quals (S19) | `ui/quals.test.tsx` S19 |
| The pair on every page, the Tracker's own, the board's bar, the laptop-width rule (D347–D349, W1) | `ui/topbar-pair.test.tsx`, `ui/topbar-css.test.ts`, e2e `geometry.spec.ts` |
