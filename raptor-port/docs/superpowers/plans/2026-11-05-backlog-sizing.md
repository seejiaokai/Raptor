# The backlog sized — what the agent can finish alone, in overnight jobs (5 Nov 26)

His question (5 Nov 26): how long to fix everything in `OUTSTANDING.md` and React Doctor's findings; then "yeah size it".
Sized from main's backlog read item by item (each candidate's full entry, not its one-line summary) and a fresh React Doctor
run on `main` at `ba7ca0be8` (0.9.18, `npm run lint`, 208 s). A plan, not a ruling: the jobs start on his word (an
`/overnight` night, or a day chat). Each job keeps the usual rules — red-first tests, its bug-check tier, its walk, one fresh
Opus read where the tier asks, and nothing live without his "merge live".

## 1. React Doctor today (5 Nov 26)

**584 findings in the whole project, 1 error** (it was 675 on 3 Nov 26 and 952 on 31 Oct 26). The 31 errors in old walk
scripts (D1572) are gone; the one error left is in `reference/` (the original app, read-only — never edited).

| Where | Findings | What happens to them |
|---|---|---|
| The app's own screens and state (`src/`, outside the engine and tests) | **183**, in 64 files | the jobs below (D1534, D490 — each with its area's batch) |
| The rules engine (`src/engine/`) | 51 | kept: the engine stays word for word, checked by the original's 728 tests (D1537) |
| Tests (unit and browser) | 133 | not the app — his call (§4, question 1) |
| Mock-up pages (`docs/mock/`, `docs/img/`) | 119 | not the app — his call (§4, question 1) |
| Walk and tool scripts (`scripts/`) | 32 | not the app — his call (§4, question 1) |
| The original app (`reference/`) | 66 (1 error) | never: read-only by rule |
| The Leave War, the Tracker | **0** | done (31 Oct, 3 Nov 26) |

The app's 183, by kind: 36 look-ups in a list where a Set would do, 18 + 7 + 7 + 12 + 5 a click or a role on something that is
not a button (screen-reader and keyboard), 14 + 1 state worked out in an effect, 14 + 4 very large parts, 13 files that import
each other in a ring, 13 files that mix a screen part with other exports, 12 deep copies by JSON, the rest one to three each.
The heaviest files: `HolidaysPanel.tsx` 13, `Shell.tsx` 13, `Modals.tsx` 11, `PeoplePick.tsx` 10, `accounts.ts` 8, `InputsCal.tsx`
8, `QualsPage.tsx` 7. Past jobs fixed about 6 in 10 and kept the rest with a written reason on the line (3 Nov 26: 41 fixed, 26
kept), so expect about 110 fixed and 70 kept.

## 2. The jobs the agent can do alone — nine, about three nights

Times are the agent's working time per job, including its check; a night of about 8 hours fits three (D1443).

| # | Job | Items | Check | Time |
|---|---|---|---|---|
| **Night 1** | | | | |
| 1 | **Leave War faults** | [LW-NIGHT1025-OLDER] (a) words typed for a new afternoon bid land on the morning bid — a real fault, first; (c) a posted-out man's gone days take a drag's bids, an OD over them skips with no note; (d) a double tap falls through to the grid; (f) a refused war change puts back the role and viewer; (g) the bubble's foot note under the day panel. [CSS-WRAPPER-GUARD] (the rule worked out, then the check) | FULL (bids are saved data) | 3½ h |
| 2 | **The board and windows by the keys** | [BOARD-KEYS-LEFT] (1)–(5) — the board's menus reached by the keys, Tab kept in the board, the crew-day picker, the day and week chips, Escape on Sort all; [WINDOWS-KEEP-KEYS]' three leftovers; [WEEK-GLIDE-TWO-PAGES] | WALK | 2½ h |
| 3 | **React Doctor — the shell, the state, the windows** | about 90 of the 183: `Shell.tsx`, `Modals.tsx`, `src/state/`, `src/storage/`, `src/command/`, the board's files; with [DOC-POINTERS-CODE] and [ONE-RULE-LEFTOVERS] (3) (comments that name removed code) | WALK (nothing a person sees; every screen pictured before and after, as 31 Oct 26) | 2½ h |
| **Night 2** | | | | |
| 4 | **People, accounts and Quals** | [QUALS-HEAD-FINGER-CAPTURE] (a heading dragged by a finger), [QUALS-PINCH-NOSDA-HEAD], [QUALS-ZOOM-EDGE-SLIVER] (the cause found first; may need his iPhone); React Doctor's ~55 there (`HolidaysPanel.tsx`, `PeoplePick.tsx`, `QualsPage.tsx`, `Login.tsx`, `accounts.ts`, Admin) | WALK; a security read if a change touches sign-in (D1411) | 3 h |
| 5 | **Inputs** | [INP-CARD-COLUMNS] (his pick A, D1310 — the cards' three columns), [BATCH-14OCT-LEFTOVERS]' small faults (a)–(f); React Doctor's ~35 there (`InputsCal.tsx`, `DateBox.tsx`, `InputsPage.tsx`, `InputCard.tsx`) | WALK | 3 h |
| 6 | **Insights and the last small ones** | [STACK-LEFTOVERS] (1) Insights' two untried edges, (2) one shared wording helper; React Doctor's 3 in Insights and Logic; [OIL-NOTIFY-SEEN] and [LW-M1-READ-LEFTOVERS] archived (live) | LOOK | 1½ h |
| **Night 3** — no app change | | | | |
| 7 | **The checks themselves** | a time limit on the Tracker's smoke test on GitHub (it hung 16 min on 5 Nov 26 and would have waited 6 h); [SHELL-SCRIPT-GUARD] (his go, D811 — the escape trap met three times on 5 Nov 26 alone); [MERGE-ONCE-RECORDS] (record files that merge without clashing) | a fresh reader for the guard; his "merge live" (hooks and workflows) | 3 h |
| 8 | **Documents** | [RULINGS-SPENT-PASS] (spent and restated rulings archived, a fresh reader), [CAL-JOB-LEFT] (stale lines in `AGENTS.md` — a guide change, his approval), [LW-READS-OWED-1024], [WORD-LIST] checked | a fresh reader; notes merge by themselves (D1407), guides on his word | 3 h |
| 9 | **The folder** | [REPO-TIDY] (1) — the 47 old worktrees, each checked for unpushed work first; [MAIN-CHECKOUT-STALE] (2) — the guide line (his approval) | — | 1 h |

**Already in other chats' hands** (each needs only his look and "merge live"): pull requests 636 (the keyboard batch), 637 (the
Tracker's standalone tidy — [TRK-STANDALONE-LEFTOVERS]), 639 (the "not saved" messages' look), 641 (the posting-out bell line).

## 3. What needs him first — one pictures round

These are small to build but each shows something new or changes how a screen looks, so each goes to him as a picture
first (D1625, D853). One page, about 12 questions, about 2–3 hours to prepare; his answers then build in about one night.

[BOARD-SIDEWAYS-KEYS] (the board's top on a phone on its side with the keys up) · [BOARD-NARROW-DESKTOP-REMARKS] (the board
821–1000 wide) · [LW-TWO-BOX-LETTERS] (two boxes on one day clip "FO*") · [SCHED-UNAV-PENDING-MARK] (no "waiting" mark on an
Unavailable row) · [READONLY-WEEK-WORDS] (new words) · [TRK-ROUND-SEEN] (2), (3) (the Tracker's pop-up and Find covering its tabs
on a phone) · [LOGIC-WORDS-WORKHOURS] · [OIL-EARN-DAY-SWITCH-WORDS] · [OIL-INERT-TAP-SILENT] · [INP-ADD-RIGHT] · [LW-MORE-BELOW-CUE] ·
[LW-FROZEN-BAR-GAP] · round 5 of [UI-CONSISTENCY-LOOK] (the typed marks the round-4 read saw).

## 4. His questions in this plan

1. **React Doctor outside the app** (tests 133, mock-up pages 119, scripts 32): leave them (recommended — none is shipped or
   seen, and the app's own count is what the M365 scan will judge), or one more night to clean the tests and scripts too, and
   the mock-up pages left out of the doctor's reach.
2. **The order:** nights 1–3 as above (recommended — the one real fault first), or the pictures round first.

## 5. Not sized here — each its own plan, on his word

The big features (the Leave War's M5, caps and ops limits, End-of-Day, the Tracker's progress graph, the wish list — roughly
1–2 weeks each), the database step and the M365 move (about 30 items, waiting on the IT side and his test account — D1682), and
the questions the backlog keeps for him until he says (D994).

## 6. The cost

Today's weekly allowance: 44% used, resetting Mon 9 Nov 26 19:00. A night of three jobs with their checks and reads is
estimated (not measured) at 10–15% of a week; nights 1–3 and the pictures round together about 40–55% — nights 1 and 2 fit
before the reset.
