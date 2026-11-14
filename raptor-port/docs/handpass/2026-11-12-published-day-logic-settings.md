# A published day keeps its Logic settings — the bug check (12 Nov 26, the night's job 4)

D2005 — a published day is checked by all the Logic settings it was published under; a changed setting reaches it from
its next amendment and every unpublished day at once; it neither starts nor clears a flag there. Branch
`claude/published-day-logic-settings` (no pull request — the night's brief forbids opening one). Built in `30b99f027`;
walked on its frozen build by two Sonnet walkers; read blind by Astra and a fresh Opus reader beside the walk; the reads'
and the walk's findings fixed red-first in the fix commit and re-walked on its frozen build. Reports, whole:
`docs/superpowers/briefs/2026-11-12-published-day-logic-settings-scenarios.md` (Astra's scenarios), `…-read-brief.md`
(the one brief both readers got), `…-read-astra.md`, `…-read-opus.md`. Pictures:
`docs/img/handpass/2026-11-12-published-day-logic-settings/` (`w1/`, `w2/`, `rewalk/`). Walk scripts:
`scripts/handpass/pdl/`.

## 1. The eight answers and the tier

| # | Question | Answer, and why |
|---|---|---|
| 1 | Money | YES — OIL (earned leave, time off banked, never pay — D25): its code was touched (`oil.ts` reads today's settings under the overlay; the validator's OIL block runs under today's) though what a man earns must not change |
| 2 | The published record | YES — what a published day's face flags, and whether it reads pending, is the change |
| 3 | Saved data | YES — each new version keeps every Logic setting its checks read (`rv`'s new shape, `schema.ts`) |
| 4 | A shared drawer | YES — the one warning bundle feeds every ring, count, list, ⓘ, the ALL AVAIL window and Insights |
| 5 | A new gesture or mode | NO — no control added |
| 6 | A new surface | NO — nothing new on screen |
| 7 | Roles | NO — who may do or see anything is unchanged |
| 8 | The warning list | YES — which settings a published day's warnings are judged by |

**Tier: FULL.** Rulings swept: D2005, D1991, D186, D184, D179, D183, D185, D188, D482, D592, D48, D2002, D56, D785.

## 2. The roll-call

| Change | Surface | Mark | Seen in |
|---|---|---|---|
| A published day judged by its kept settings | View-only Sched's published face (warnings, rings, chips) | has it | W1 S1.3, S1.5, S2.5, S4.4; W2 T1.1, T2.1, T6 |
| | Edit Schedule's week, a published day nothing waits on | has it | W1 S1.5, S2.5; W2 T1.1, T2.1 |
| | the Scheduler Board, the same day | has it | W1 S1.5, S2.5 (phone); W2 T1.1, T2.1 |
| | an unpublished day takes the change at once | has it | W1 S1.6, S2.6, S4.5; W2 T1.2, T2.2 |
| | the next amendment takes today's | has it | W1 S1.7, S1.8, S4.6–S4.7; W2 T6.1, T7.4 |
| | a member's View-only Sched | has it | W1 S3 |
| | a look at a published version (👁) | has it | W2 T6.2–T6.5, T6.8 |
| | the warning list's heading ("Crew rest (<12h)") | has it — MISSING at the walk (today's limit), fixed | re-walk |
| | a puck chip's hover title, the R box's timing title | MISSING — today's settings; a known limit, to file (no ring or flag, a title only) | — |
| | the ALL AVAIL window's reasons | has it — MISSING at the walk ("land + 3h" on the published day), fixed | re-walk |
| | the crew list's cross-day lines (days in a row, crew rest) | has it — MISSING by both reads, fixed | carried by test (`published-day-logic-picker.test.ts`) |
| | the dotted run mark's words | has it — MISSING by the Opus read, fixed | carried by test |
| | the dotted crew-rest mark across the week's edge | has it — MISSING by the Opus read, fixed | carried by test (`state/published-day-logic-neighbour.test.ts`) |
| | the day before's assumed ends (sim, open row) | has it — MISSING by both reads, fixed | carried by test (`published-day-logic-reads.test.ts`) |
| | a hide waiting previews today's settings | has it — MISSING by both reads, fixed | re-walk; carried by test |
| | pending and the four sign-offs | must not, because D2005 and D186: only the printed brief reads pending | W1 S1.5 ("11 changes" unchanged), W2 T3.2 (the brief); F4 test |
| | print and export | has it — they draw the published face | carried by test (the face's one bundle) |
| | the next-week preview | has it — View-only the published value, Edit Schedule the working copy (D1010) | W2 T5 |
| Insights' work hours | Insights | must not, because D482 keeps them on today's | W2 T2.5–T2.7 |
| OIL | OIL Earn, the Leave War credit | must not, because OIL keeps its own rule (D48, D592) | the mechanism carried by test (`published-day-logic-reads.test.ts`, `withLiveRules`) and the whole OIL suite unchanged and green; no end-to-end test of a published earning day across a Logic change — the harness has no dated week for one (tried, set aside); not walked |
| The Logic page | its settings and banner | has it — unchanged; the banner's words are now incomplete, a question for him | W1 S1.4, S5; W2 T8 |

## 3. The five sizing lines

- **Type of change:** A (the rules engine), G (published record), D (warnings and marks).
- **Size:** FULL — two Sonnet 5.5 walkers side by side on the frozen build of `30b99f027`, then one Sonnet re-walk of
  the fixes on the fix commit's frozen build.
- **Widths:** his PC's 1536 × 864 and his iPhone's 402 × 874 by touch (W1 S2, W2 T3 phone, T8).
- **Scenarios:** Astra's (`…-scenarios.md`), ranked; the walkers took his Ranger case (W1, with Vandal, since Ranger is
  not free Monday to Thursday in the demo) and the other settings (W2); the rest carried by tests or set aside below.
- **Plain-user round:** W1 S5 (Logic ✎ Edit, Reset to standard, the board open and ✓ Done, the changes window, Undo,
  Redo, View-only's arrows and week chips); W2 T8 on the phone by touch (Logic, Reset, Done, the board, the changes
  window, the ALL AVAIL window).

**Deviation from the order, named:** the two blind code reads ran beside the walk, not after it, for time; both readers
saw neither the walk nor each other. No pull request was opened (the night's brief forbids it), so GitHub's run did
not happen: every gate ran on his PC through the checks lock.

## 4. The orders walked

On the frozen build of `30b99f027` (port 4291), signed in as `ad` (admin) and, for S3, `us` (Ranger, a member). Every
fixture built through the controls; no planted data.

- **W1 — the Ranger case** (Vandal stood in: the demo flies Ranger on Monday and Thursday). Monday's VL lands 19:00,
  Tuesday's VL 12:00 with B blank (prints 09:40) — 12h40 rest; Wednesday and Thursday the same. S1 desktop: Tuesday
  published at crew rest 12h, crew rest raised to 13h — Tuesday clean on View-only, Edit Schedule and the board, its
  "11 changes" count and signatures unchanged; Thursday red at once; an edit to Tuesday shows the breach as "new once
  signed"; Publish AL1 puts it on the face; a reload keeps all of it. S2 the same on the phone by touch. S3 a member's
  View-only. S4 the lowered case: Monday lands 20:00 (11h40 rest), Tuesday published red at 12h, crew rest lowered to
  11h — the breach stays on the published day, Thursday clears at once, the next AL clears Tuesday. S5 the plain-user
  round on a desktop.
- **W2 — the other settings.** T1 long work day 12h → 10h; T2 flight debrief 2h → 3h with Insights' hours; T3 the
  printed brief 2h20 → 3h (desktop and phone); T4 the ALL AVAIL window across a debrief change; T5 the next-week
  preview; T6 a look at each published version (👁 and View-only's picker); T7 a hide only, then AL1; T8 the plain-user
  round on the phone by touch.
- **The re-walk** of the fixes, on the frozen build of the fix commit (port 4292): R1 the ALL AVAIL window's reason
  (desktop and phone), R2 a hide only, R3 the warning list's heading, R4 the plain-user round (desktop and phone).

## 5. Cases carried by a test

| Case | Test | What it proves |
|---|---|---|
| The ruling's cases: his crew-rest case, an unpublished day, the next AL, a version from before the build, every setting, days in a row, D482's hours | `src/engine/published-day-logic.test.ts` | the face neither starts nor clears a flag, nothing reads pending, the four stand; an AL takes today's; Insights' hours move at once |
| D1991's printed brief | `src/engine/rulesfirst-7-published-day.test.ts` | crew rest measured to the B the day printed |
| The day before's assumed ends (Astra 1, Opus F1) | `src/published-day-logic-reads.test.ts` (F1 ×3) | a sim with no end, an open row and a flight's debrief measured by the judged day's settings |
| A change waiting previews today's (Astra 7, Opus F2) | `published-day-logic-reads.test.ts` (F2) | a hide only switches the working copy to today's settings |
| The advisory's words never make the day pending (Opus F4) | `published-day-logic-reads.test.ts` (F4) | "same take-off and landing" judged by the day's values |
| OIL's block runs under today's (Astra 3) | `published-day-logic-reads.test.ts` (withLiveRules) | the overlay lifted inside (Logic settings and the SC clash table), the kept values back after |
| A hide today's settings would clear never flips the day (narrow read 1) | `published-day-logic-reads.test.ts` (five passes) | the same answer five validations running |
| The warning list's heading, the issued face included (Opus F6, narrow read 2) | `published-day-logic-reads.test.ts` (headings) | the kept limit named on the working copy and inside the issued face alike |
| The crew picker and the dotted run mark (Astra 4, 5, Opus F3) | `published-day-logic-reads.test.ts` (F3), `src/published-day-logic-picker.test.ts` (F3 a–c) | days in a row and crew rest forward asked of each day by its own settings |
| Next week's published Monday (Astra 6, Opus F5) | `src/state/published-day-logic-neighbour.test.ts` | the people and the printed brief decide the neighbour too |
| The kept rules across the week's edge | `src/state/kept-rules-neighbour.test.ts` | unchanged |
| The original's 728 | `reference/tfin.js` | 728 / 0 |

## 6. Break tests

Every fix was written red first: each test above that pins a finding failed on the code before its fix (the failing
runs kept in the chat's scratch; F3c's premise needed a second crewman in the late formation before it could fail for
the right reason).

## 7. Errors seen

No console errors, page errors or 4xx responses in any final run of the walk or the re-walk.

## 8. What was not walked, and why

- The Ranger case with Ranger himself: the demo flies him on Monday and Thursday; Vandal, free those days, stood in.
- View-only's version picker for the Original (W2 T6.6): it offers AL1 and the working draft only — the 👁 look from
  Edit Schedule and the board walked the Original instead (T6.2, T6.8).
- The EOD version: nothing publishes one yet (filed in the backlog), so there is no path to walk.
- Print, export and the CSV: they draw the published face's one bundle, carried by the tests; not walked.
- A guest's view: the same View-only face a member sees (S3 walked a member).

## 9. Gate counts

On `7ef60c894` (the fixes), on his PC, 12 Nov 26, each through the checks lock where it builds; no pull request, so no
GitHub run:

| Check | Result |
|---|---|
| Whole unit suite (through the lock) | 830 files, 14,272 passed, 20 skipped, 0 failed |
| The original's assertions (`reference/tfin.js`) | 728 passed, 0 failed |
| The build (through the lock: the frozen build, and again inside the browser run) | passes |
| The scheduler's browser groups (through the lock, port 4293): `geometry`, `board-layout`, `boardside`, `logicedit`, `availwin`, `warnhide`, `changeswin`, `restblank`, `sched-phone`, `rallybox`, `schedule-tab` | 331 passed, 3 skipped, 0 failed |
| `npm run rulecheck` | OK (878 test files, 278 rulings; 31 named by nothing, all in the baseline) |
| `npm run lint:changed` | no new finding |
| `npm run docsize` | below |

## 10. What the walk and the reads found, and each disposition

**The walk (two Sonnet walkers):**
- W1 S4.4 / pointer 1 — a published day's warning heading took today's setting: "Crew rest (<11h)" beside "only 11h40
  rest" → fixed (`wlbl(s, di)` through `withShownRules`), re-walked R3.
- W2 T4.3 — the ALL AVAIL window's reason on the published Tuesday read "(land + 3h)" after the debrief change, on
  View-only's "who was free when this day was issued" too → fixed (`AvailWindow.tsx`), re-walked R1.
- W2 T4.2 — the board's list of who is free looked different before and after: a capture fault (the first capture
  lacked the whole window); the counts and the men matched → not a finding; R1 re-reads it.
- W2 T2.4 — Ranger's hours did not move: his ground row ends his day either way; Piston and Cobra moved 6h → 7h (D482)
  → not a finding.
- W1 pointer 3 — the Logic page's banner names only "its printed B and its OIL" → a question for him (words).
- W1 S5.D — Escape does not close the changes window (✕ does) → older, not this job's; to file.
- W2 T6.6 — View-only's picker has no "Original" entry once a day has an AL → older, not this job's; to file.
- W2 T5 — Edit Schedule's next-week preview shows the working copy's B (09:00) while View-only keeps 09:40 → as ruled
  (D1010).
- W2 T7.3 — a hidden warning still lists on View-only until the next AL → as ruled (D471).

**Astra's code read (codex, on `30b99f027` against `30370bd29`) — eight findings:**
1. The day before's assumed end re-measured by today's settings → fixed.
2. The ALL AVAIL window by today's settings → fixed.
3. OIL inheriting the kept settings through availability → fixed (`withLiveRules`).
4. Next week's hidden run warning could regain its dotted mark → the trace's words and limit now the breaking day's,
   fixed; the neighbour week's hides deciding whether its day keeps its values → a known limit, to file.
5. The crew picker forecasting by other settings than the validator → fixed.
6. Switching weeks changed whether a pending day used today's → fixed (`weekctx.ts`).
7. A hide only, or an OIL entry only, did not switch the working copy → fixed.
8. Headings and titles quoting today's → headings fixed; a puck chip's title and the R box's timing title stay on
   today's → known limits, to file.

**The fresh blind Opus read (on the same diff, the same brief):**
- F1 assumed lengths (the same as Astra 1) → fixed. F2 a change waiting the check missed (Astra 7) → fixed. F3 the
  picker and the dotted run mark's words (Astra 4, 5) → fixed. F4 the "same take-off and landing" advisory's words made
  a published day pending after a Logic change → fixed. F5 next week's Monday (Astra 6) → fixed. F6 headings and chip
  titles (Astra 8) → headings fixed, chip titles a known limit. F7 the neighbour days' window sized by today's
  days-in-a-row limit → a known limit, not proven, to file.

**The narrow re-read of the fixes (a fresh Opus reader):**
1. A hide today's settings would clear flipped the day between passes → fixed (`untouchedKept` reads the hides and the
   last official pass straight; `HOOKS.hideNow`).
2. The issued face's headings still read today's → fixed (`withShownRules` reads the face's own values).
3. On an earning day whose "same take-off and landing" line measured OIL when it went out, a Logic change that leaves it
   measuring nothing shows the kept words beside the live "no usable times" line → kept as built; a question for him
   (by D592 it should read pending there — not checked).
4. Box titles → a known limit, as 8 above.

Both reads agreed that only the printed brief may make a published day pending (D186), that the overlay restores
itself on every path, and that D592's OIL axis can still make a published earning day pending — an older exception,
kept, since OIL is not this job's.

**The re-walk of the fixes (one Sonnet walker, frozen build of `7ef60c894`):** R1 the ALL AVAIL window — the published
Tuesday keeps "… BRIEFING sits inside 13:00–15:00 (land + 2h)" after the debrief went to 3h on View-only, Edit
Schedule and the board, and on the phone by tap; the unpublished Thursday reads "(land + 3h)" at once; the count 46 and
the men the same (W2 T4.2 settled). R2 a hide only — before it no crew-rest line anywhere; after it "1 pending", and
Edit Schedule and the board preview "Crew rest (<13h) Ranger … only 12h40 rest." tagged "new once signed" while
View-only keeps the issued face; after AL1 View-only shows it. R3 the heading — the published Tuesday keeps its breach
under "Crew rest (<12h)" beside "only 11h40 rest" after crew rest went to 11h; Thursday clears at once. R4 the
plain-user round — the changes window from "1 pending" and from the clock, Undo and Redo, the board and ✓ Done, the
Logic page's ✎ Edit, a change, Reset to standard, Done; the phone by tap: all as expected. No new finding.

## Pictures for him

| Picture | Caption |
|---|---|
| `w1/s1/s1-05-tue-view-after-13h-man.png` | His case: Tuesday published at crew rest 12h, then raised to 13h — the published day stays clean (Vandal, 12h40 rest) |
| `w1/s1/s1-06-thu-board-after-13h.png` | The same pair on an unpublished Thursday turns red at once: "only 12h40 rest" |
| `w1/s1/s1-08-tue-view-AL1-man.png` | The 13h reaches Tuesday with its next amendment: after AL1 the breach and the red ring show |
| `rewalk/r3/s4-04-tue-view-after-11h.png` | Lowered the other way: a published breach stays, under "Crew rest (<12h)" — it neither starts nor clears a flag |
| `rewalk/r2/t7-5-tue-after-hide-edit.png` | Once anything waits on the published day (here a hidden warning), Edit Schedule previews the next amendment: "new once signed" |
| `rewalk/r1/r1-tue-pub-after-view.png` | The ALL AVAIL window on the published day keeps its reason "(land + 2h)" after the debrief went to 3h |
| `rewalk/r1-phone/r1p-04-settled.png` | The same on his phone |
| `w2/t1-run1/t1-3-tue-published-after-change-view.png` | Long work day lowered to 10h: the published Tuesday shows no new long-day note |
| `w2/t3-run2/t3-3-after-change-view.png` | The printed brief stays 09:40 on View-only after the brief time was raised (D186) |

All under `docs/img/handpass/2026-11-12-published-day-logic-settings/`.

## The closing lines

`Walk: docs/handpass/2026-11-12-published-day-logic-settings.md · 409 pictures · 10 surfaces · 17 orders · MISSING: 2 fixed (the warning list's heading on a published day, the ALL AVAIL window's reason), 0 ruled, 2 filed (Escape on the changes window, View-only's "Original" entry — older, to file)`

`docsize: OK`

The 10 surfaces walked: View-only Sched, Edit Schedule's week, the Scheduler Board, the day's warning list, the ALL AVAIL
window, the changes window, a look at a published version, the next-week preview, the Logic page and Insights.
