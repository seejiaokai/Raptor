# Read of a working-guide change — the guide check's round 1, points a–d (chat 73, 14 Nov 26)

You are one of two blind readers (Astra, and a fresh Opus reader, each blind to the other). Read only; change nothing,
commit nothing. This is a read of documents, one round (D70, D1761): **does each change say what its note meant, does
it contradict a guide or a ruling, does it drop a safeguard, or does it add bulk?**

**Repo:** `C:\Users\User\projects\Raptor`. **Branch:** `claude/guide-check-r1-1114`. **The change:** two commits,
`855e0ed99` (points a–c) and `eff115b12` (point d). See them with `git show 855e0ed99` and `git show eff115b12` (the
later merge commit only brings `main` in — notes, not part of the change).

**What it carries out — the owner's approval, word for word in D2038's full row** (`grep -h '^| D2038 |'
.claude/decisions-full/*.md`, with the shell): *"points a–d yes — the project guide's 'all five checks after any change'
to point at the shipping rules' §The checks (D1086); its all-capital headings and 'corrected / since' wording written
plainly, no rule changed; the shipping rules' two notification bullets made one; D1972 archived on 16 Nov 26 when it
runs out."* The report the points come from: `raptor-port/docs/superpowers/briefs/2026-11-14-prompt-audit.md` (point a
= its F1, b = its hunks 1–3, c = hunk 4, d = F3).

1. **a — `raptor-port/CLAUDE.md` §Build & verify:** "All FIVE, after any change:" now points at
   `.claude/rules/shipping.md` §The checks (D1086). Does the new line keep everything the old one still required once
   D1086 is applied (the five gates are still listed below it; which run where, and when, is the shipping rule's)? Does
   anything else in the guide, `raptor-executor.md` (its line ~65 points at this section) or `guide-full.md` still say
   "all five after any change" in a way that now disagrees?
2. **b — `raptor-port/CLAUDE.md`:** eight bold headings out of all capitals (the report's six plus "A NEW Playwright
   script" and "WHAT ACTUALLY PERSISTS", which the approval's "its all-capital headings" also covers); the "is NOT a bug
   check — it needs a ROLL-CALL, a WALK" phrase; "CORRECTED 17 Sep 26: it is NOT 'absent from the next AL' …" restated as
   the current fact; "Since 30 Sep 26 a change to a WEEK, …" restated with its date after it. **No rule may change.**
   Check each sentence against the old one: is any fact lost (e.g. the funnel-bypassing write "DOES surface in the next
   AL", "worse than being absent"), any condition dropped, any emphasis removed that carried a rule? Each `· full text:
   docs/guide-full.md §…` pointer is unchanged — confirm. Several documents and code comments refer to the heading as
   "WHAT ACTUALLY PERSISTS" in capitals (`engine-rules.md`, `feature-impact.md`, `leavewar/known-gaps.md`, comments in
   `src/`): say whether that leaves a reader unable to find it (the writer's view: a reference by name still lands; the
   code comments are left alone so the change stays notes and guides only).
3. **c — `.claude/rules/shipping.md` §"Done" means LIVE:** two bullets made one. The old first bullet said: notify when
   done and when blocked waiting on his answer; one line; not for progress, not for a quick reply he is clearly
   watching, never twice. The second (D1097, which wins over the first): every stop that waits on him gets its one
   notification, whether or not he seems to be watching; an unattended run keeps its one at the end (D596). Read D1097's
   and D596's full rows. Does the merged bullet keep every live part (the tool's name, one line, plainly, never for
   progress, never twice for the same work, the unattended run's one) and drop only what D1097 overrode ("a quick reply
   he is clearly watching")? Does it still read right beside the later bullets of that section, which also speak of a
   notification (D143's "one notification, with the link", D596's unattended run)?
4. **d — D1972** ("for the week to 16 Nov 26 Fable 5.2 mainly hosts his chats") marked **SPENT 16 Nov 26** in its full
   row, moved to `DECISIONS-ARCHIVE.md` by the project's script, its line dropped from
   `.claude/rules/decisions/how-we-work.md` §Models and readers, the map in `DECISIONS.md` rewritten. The writer will
   not merge this before 16 Nov 26. Read D1972's row sentence by sentence (`DECISIONS.md` step 2: every "if", "until"
   or "still" must be carried by a live ruling, or it stays live): is anything in it still live after 16 Nov — e.g. "the
   reads do not change" — and is it carried elsewhere? Does any live file still lean on D1972?

**What is not a finding:** wording you would merely prefer; the other seven points of the report (rounds 2–3, not
approved yet); anything about data already stored (D56). A finding counts only with the exact place, what a future chat
would now do wrong because of it, and the fix.

**Report:** findings first (or "no finding"), numbered, each with severity; then one line on bulk (did the change add or
remove words beyond what the four points needed). Short.
