# Night 3's working-guide changes — the blind read's brief (10 Nov 26, chat 53)

Sent word for word to Astra (`codex exec`, reasoning high, read-only) and to a fresh, blind Opus reader. You are one of
two readers, blind to each other: never read the other's report. READ ONLY: change no file, commit nothing. Work in the
exported copy `C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/42793572-e666-4c95-9989-7fb9b29ebe57/scratchpad/readcopy`
(the repo's rule files, rulings, backlog and the guides touched, at commit `a6909d3cc` of `claude/night3-guides`). The
whole change is `THE-CHANGE.diff` at its root (two commits on top of `b5beaea5a`).

## Background
The owner (not technical) rules on how the app and the agent work; each ruling has a full row in
`.claude/decisions-full/<area>.md` (`grep -h '^| D1743 |' .claude/decisions-full/*.md` — the shell, not a tool that hides
long lines). Archived rows are in `DECISIONS-ARCHIVE.md`. The rule files under `.claude/rules/` and the pages under
`.claude/rules/decisions/` state the rules with their rulings cited after them. A ruling is archived as SPENT only when
every "if", "until", "still" in it is done or carried by a live ruling (DECISIONS.md step 2). "Astra" is the Codex
reviewer; "Sol 6.1" another Codex model; "Fable" a Claude model.

## What changed
1. **D1743 marked SPENT and archived** (read it in `DECISIONS-ARCHIVE.md`, and D1770, D1734, D1033 in the full rows).
   D1743 was a window to Mon 9 Nov 26 19:00: his Codex allowance spent too, Sol 6.1 called wherever a second reader
   fitted. Every line citing it rewritten: `.claude/rules/bug-check.md` (Who they are now), `.claude/rules/doc-structure.md`
   (the Claudex loop), `.claude/rules/decisions/how-we-work.md` (the rules-diet readers line, the Astra line, the
   allowance line), `raptor-port/docs/guide-full.md` (NARROWED since — who is called now).
2. **The calendar's stale lines** (backlog item `[CAL-JOB-LEFT]` (1) in `OUTSTANDING.md`): `AGENTS.md`'s "D567–D585 stay
   reserved for the calendar branch" and "the calendar's work continues on `codex/inputs-sans-calendar`" removed (that
   branch is wholly in `main`, live since 9 Oct 26 as pull request 487); `raptor-port/docs/codex-guide.md`'s "the job on
   hold is the SANS availability calendar's new layout" removed; How we work's D610 line rewritten (D610 and its
   NARROWED-by-D614 mark in its full row; D614 is archived).
3. **Design lessons 49, 50, 52** in `raptor-port/docs/design-practices.md` reworded: a reader found on 25 Oct 26 that each
   claimed a little more than he said (`raptor-port/docs/handpass/parts/lw-1025/reads-1305-1355.md`, Job 2, has the fix
   it worded). His words are in each lesson's heading and in the full rows of D1309, D1313, D1322. A lesson keeps to his
   words; anything else is marked as the agent's reading (how-we-work.md, Design: "A lesson line keeps to his words").
4. **Lessons 25–30 added** to the bug-check order's list of faults he found that a walk missed
   (`raptor-port/docs/bug-check-order.md` §7.11), from a sweep of the evidence sheets up to 24 Oct 26 under D1297 (read
   its full row). The sweep's table: `raptor-port/docs/superpowers/briefs/2026-11-10-d1297-sweep-candidates.md`. The
   evidence sheets themselves are NOT in the copy; read them, if you need to, in
   `C:/Users/User/projects/Raptor-n3/raptor-port/docs/handpass/` (read only).

## The questions — answer each, with evidence
1. **Meaning (1, 2).** Does each rewritten line still say everything a live ruling requires — nothing dropped that is not
   spent, nothing added? Is D1743 truly spent (every part done or carried by D1770, D1734, D1033, or another live ruling)?
   Does any live file still state D1743's window as current, or still name the calendar as on hold or in progress?
2. **The lessons 49, 50, 52.** Does each now keep to his words, with every addition marked as the agent's reading? Does
   any reword lose something he did say?
3. **Lessons 25–30.** For each: does the sheet it cites record HIM finding the fault after a walk that should have caught
   it? Does the lesson name a KIND of gap (not one bug), and is it a kind no earlier §7.11 lesson already covers? Is any
   fact in it (a date, a number, a ruling, a file) wrong? Is its check one a later walk could actually carry out?
4. **The narrow guide-change questions (D70):** does any change contradict another guide or a live ruling, drop a
   safeguard, or add bulk that is not needed where it sits?

A claim is a finding only with a concrete failure, its cause and its exact fix (D489). Rank findings High / Medium / Low.
Report under 900 words; end with the list of findings and the exact replacement text for each.
