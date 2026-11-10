# The fresh Opus reader's report — the session-handoff skill's tightening (10 Nov 26, chat 59)

Read-only, by a fresh Opus helper on the brief `2026-11-10-session-handoff-tighten-read-brief.md`, at commit
`9c9dadb5e`, blind to Astra's read. **Count: 1 change of meaning · 1 of lost detail · 1 other** — all three in the
corrected parts (the plan's §C), none in the shortened text.

The host (chat 59) set each finding beside the old wording and the rulings named:

- **The template's "Next chat number: <n+1>"** — holds (both readers). D1744 has the handoff file keep the next FREE
  number, and with chats side by side that is often not this chat's number plus one. Fixed: the line now reads "the
  next free number, checked against `main`'s `HANDOFF.md` and every open block when this block is written".
- **The merge sentence read as "green, so merge"** — holds (the Opus reader). `shipping.md` also has the agent check
  the file list, run `npm run rulecheck` and the unit tests that read documents first, merge under the merge lock and
  say so in its report. Fixed: the sentence names those steps.
- **No place for that merge in the closing order** — holds (the Opus reader; its "other"). The release was "the very
  last command" once the commit was pushed, written when the agent never merged. Fixed: a line under the release says
  a notes-only pull request this chat merges by itself is merged first, the release after it. This orders steps the
  correction implies; it is the agent's reading, not old text put back.

The fixes were read by nobody but their writer.

Its report, as returned:

---
**1 change of meaning · 1 lost detail · 1 other**

**What I compared:** I read the old skill (`origin/main`, 444 lines) and the new one (310 lines) whole, side by side, passage by passage: the head, all of Step 1 (block bullets, opening line, release), Steps 2 and 3, the template, the 13 "act on" points and Rules 1–9. I checked character by character every command and every quoted sentence an opening line must carry: the continue-branch switch and its refusal fallback, the "Every opening line says" worktree sentence, the new-job line, the release recipe, the side-session keep-branch recipe, `gh run list …`, `gh pr list …`, `gh pr view …`, `backlog-archive.mjs` (both forms), and the range `git diff` and `git log` commands. All are word for word. Apart from §C 2 and 3, the template is unchanged: the Branch, Opening line, Pick up here and other lines are identical. I set the new text against the plan's §B–F and the full rows of D1975, D1978, D1407, D1737, D1086, D1744, D1733, D761, D975, D976, D151 and D870. I also checked it against `shipping.md`, `record-decisions.md`, `bug-check.md` and `HANDOFF.md`'s head and §Gate baseline.

Everything else held:
- **§B:** each story left with no condition lost. The 8 Nov clash kept "a clashing pull request runs no checks", and the range paragraph kept both empty-range cases, now worded in the present tense, which is correct.
- **§D:** each stated-once rule is whole where it sits. "Never append, rewrite whole" is in Step 1's "Only your own block". "A plan file first" is the template's Pick up here line. "HANDOFF.md current-state", with "merged blocks come OUT", is in Step 3. "Every handoff ends with the opening line" heads the new section, and Rule 9's "goes out UNCHANGED, no `<a / b>` slot" is whole there.
- **§C 1, 2, 4 and 5:** each says what its ruling says. The exceptions are the findings below.

---

**1. Change of meaning: the template's "Next chat number: <n+1>" (§C 3) says less than D1744 and the skill's own chat-number rule.**
- **Old words:** there was no template line. The skill's rule was: "A chat number in it is a hint: 'the next free number in `main`'s `HANDOFF.md` when you start (was N at <time>)', checked there before use." It carried the story "8 Nov 26: a number given was already taken".
- **New words:** "`**Next chat number:** <n+1> (D1744)`".
- **Concrete failure:** D1744 says "the handoff file keeps the next free number", and a chat that starts another gives it "the next free number from the handoff file". With chats running side by side, the free number is often not this chat's n+1. Chat 55's block says 56 while chats 56–59 have since been taken. A chat filling the template by rote writes n+1 when a parallel chat already holds it. That is the exact slip of 8 Nov 26, now written into the template.
- **Fix:** replace `<n+1>` with `<the next free number — the highest chat number in `main`'s `HANDOFF.md` and every open block, plus one, read when this block is written>`.

**2. Lost detail: the merge correction (§C 1) drops two conditions that D1407 and `shipping.md` attach to the agent merging a notes-only pull request.**
- **Old words:** "NEVER merged by you." This was stale since D1407, so the correction itself is right.
- **New words:** "…or, where the whole pull request changes only notes (that file's 'only notes' list), by itself once its run is green, the agent merging it (D1407; a rules-diet step waits for his word all the same, D1737)."
- **Concrete failure:** D1407, and `shipping.md` in its words, also has the agent:
  - check the file list itself before merging;
  - run `npm run rulecheck` and the unit tests that read documents on his PC first, because the gates skip a notes-only pull request;
  - merge under the merge lock's four steps;
  - say in its report that it merged.

  The new sentence, read on its own, reads as "green → merge". A chat working from the skill at the end of a full chat could merge a handoff pull request that touched a permissions-table or behaviour-register document without the document checks. `shipping.md` is always loaded, so the risk is lowered, not removed. The sentence's "by `.claude/rules/shipping.md`'s rule" is the only pointer.
- **Fix:** after "the agent merging it", insert: "— after checking the file list and running `npm run rulecheck` and the unit tests that read documents, under the merge lock's four steps, and saying so in its report".

**3. Other: the new merge case has no place in the order of the closing steps.**
- **Old:** the agent never merged, so push → `git switch --detach` as "the very last command" was the whole ending.
- **New:** the agent now merges a notes-only handoff pull request once its run is green. But "Release the branch as your LAST step" still says detach "once that commit is pushed … nothing is edited or committed after it". `shipping.md`'s step 2 may need `main` brought in, which is a commit on the branch.
- **Concrete failure:** a chat either detaches straight after the push and leaves its notes-only pull request unmerged, or merges after detaching and then has to commit on a branch it has released.
- **Fix:** add to the release section: "A pull request that merges by itself (notes only) is merged first, by `shipping.md`'s four steps, once its run is green; the `git switch --detach` comes after that merge, and if `main` had to be brought in, after that push."
- I mark this "other" because it orders steps the correction implies rather than restoring old text. It is the writer's call.

---

**Noted, not findings (no concrete failure):**
- **"is refused" is now worded as a rule.** The 8 Nov merge refusal is stated as a general rule ("is refused, even where his standing word covers that chat"). The writer flagged this. It only makes the chat more careful, and the action it calls for is the same.
- **The template's Rulings line** is shorter than `record-decisions.md`'s report line: it gives no area files. It matches what recent blocks carry.
- **D350 and D59 left with their stories**, under §B 4 and §B 7. §F's "every live ruling's number" sits uneasily with that, but neither ruling names the skill as its home.
- **Rule 8's "a handoff that grows `HANDOFF.md` has redone the thing the cuts undid"** left. The current-state rule, "every line costs every chat", and the size-ceiling tripwire still carry it.
