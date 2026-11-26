# Brief — fold rounds 5 and 6 (D2638–D2655) into Build 1's plan, and split it into four sections (D2656, D2657)

**Who:** a fresh Fable (high), who has read no earlier report of this plan's readers. **For:** chat 191, the coordinator
of the multi-squadron build. **Date:** 26 Nov 26.

## Where

- The folder: `C:/Users/User/projects/Raptor-msq`, branch `claude/msq-b1-screens-135` (use `git -C` it; do not switch
  branch; do not commit or push — the host does).
- The plan: `raptor-port/docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md` (368 KB — read by section:
  `grep -n '^## \|^### '` first; §8, §10, §17, §18, §19, §20 are the ones this fold touches most).
- His rulings, full rows: `grep -h '^| D2638 |' .claude/decisions-full/*.md` (the shell; the Grep tool hides long rows).
  Read in full **D2638–D2657**, and every ruling one of them narrows (named in each row: D2624, D2625, D2628, D2629,
  D2631, D2632, D2270, D1462 at least).
- The pages he answered: round 6's source `raptor-port/scripts/handpass/n188/page/` (`body-n2.html` and the rest) and the
  built page `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q3/page-r6.html`; round 5's
  `…/q3/page.html`. Each item's recommendation there is what he took ("as recommended").
- The design reports behind the new items: `raptor-port/docs/superpowers/briefs/2026-11-26-msq-r6-*-report.md`
  (posting sheet, users-nav, users-draw, misc-draw, both Fable word reviews), `2026-11-26-msq-users-design-brief.md`
  and `…/q3/users-design.html`.
- The rulings pages that govern: `.claude/rules/decisions/people-accounts.md`, `leave-war.md`, `design.md`,
  `how-we-work.md`.

## The job

1. **Fold every ruling D2638–D2655** into the plan, the way §17 folded round 4: each answer built where it belongs
   (its part, its step, its tests, its "waits on" cell, its size), each default it replaces struck through or rewritten,
   §8's tables brought up to date (what is answered, what is still open — group B stays unanswered and unbuilt, D2636),
   the head-of-§8 pointer replaced. Where a ruling narrows an older one, say so at the place, both numbers. A
   "reading" (the agent's, not his) stays marked "(reading)"; never promote a reading to his rule (lesson 32,
   [READINGS-LAPSE-FIX]). D2644–D2646 are design lessons about drawings, not app behaviour — note them only where a
   drawing step is described. D2646 keeps the browser's own list for the sign-off boxes and "+ Input"'s Person list.
2. **Add a new section, "§21. The four section chats (D2656, D2657)"**, which the coordinator and each section chat
   will read as their brief's spine:
   - **Core — the guard rail:** Build 1 steps 0–9 (parts A, B, F, G), the latest Fable, high; first, as a chain.
   - **Admin → Users across squadrons:** Build 1V §19.1–19.4 with D2652's layout, folds and jumps, D2655's short rows,
     D2654's retired tick, Plan given only by the squadron's own admins (D2626); the latest Fable, high, with the
     security reader (D1411); starts once the core's step 1b has landed.
   - **The bell, its colours and the Display page:** §19.5–19.8 with D2638–D2640, D2649, D2652's N1–N2; bug reports
     (D2623) kept here; Opus, high; starts once the core's step 5 (the bell door) is settled.
   - **The posting sheet on the Leave War:** D2648, D2653 (way C), the Leave War side only — the Admin → Users side
     rides the Transfer step (D2634, batch 4); Opus, high; independent, may start at once and ship on its own.
   For each section: its steps in order (renumbered within the section, with the old step numbers beside them), **the
   files it changes**, the files it must not touch, **every file it shares with another section and who goes first on
   it**, what it waits on (another section's step, a drawing he must see, a question still open), its tests, its size
   (estimate), its readers (D2440, D1770, D790), and its share of the FULL check's roll-call (§10's list split by
   section). Also say what **one FULL check at the end** covers for the lot (D490) and which section's risk sizes it.
   If you find a file two sections both change with no clean "who goes first", say so plainly as a finding for the host
   — do not hide it with a guess.
3. **The sizes** (§13) and the risks (§11) updated for what the fold adds; any new risk named.
4. **Words:** any new on-screen words the fold needs are drafted and marked "words owed a fresh Fable review (D2441)" —
   never written as final.

## Rules

- Change nothing in `raptor-port/src`. Edit only the plan file; write your report to
  `raptor-port/docs/superpowers/briefs/2026-11-26-msq-r6-plan-fold-report.md` (create it; the transcript may be lost —
  the file is the report).
- The report: what you folded where (one line a ruling, with the plan's section), every place the plan and a ruling
  disagreed and how you settled it, the §21 section split in short, the overlaps, the open questions left (each its own
  line, with what it holds back), and anything you judged a reading rather than his rule.
- Keep the plan's own style: plain statements, rulings cited after them, no transcript. Do not shorten any existing
  rule to make room.
- A problem that lives only in data already stored is not a finding (D56).
