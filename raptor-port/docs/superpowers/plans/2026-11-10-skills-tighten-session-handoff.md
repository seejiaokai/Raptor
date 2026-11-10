# [SKILLS-TIGHTEN] step 2 — the session-handoff skill: what would leave, what would be said shorter (10 Nov 26, chat 59)

His D1975: the skills written here and the design guide are tightened — the same rules in fewer words, none dropped —
and what no longer applies is taken out, moved whole to an archive. Step 1, the design guide, is live (pull request
750). This file is the list put to him BEFORE anything changes. Nothing in `.claude/skills/session-handoff/SKILL.md`
has been edited.

**Status:** the skill read whole by chat 59 on `main` at `b1806a3c0`; every file, heading, command and ruling it names
checked the same day (§A); the list put to him 10 Nov 26; **his answer the same day, D1978 — "As recommended": all of
§B to §F, §C's five corrections and the template's added line included; chat 59 does the rewrite.** Line numbers below
are the skill's at that commit.

**Done 10 Nov 26 by chat 59, on `claude/skills-tighten-2-9a9f74`, before the reads:** the old wording copied whole to
`raptor-port/docs/archive/session-handoff-skill-2026-11-10.md`; the skill rewritten — §B out, §C's five put right, §D
once, §E shorter. Measured: 444 lines and 29,508 bytes → 310 lines and 25,653 bytes, about 13% fewer bytes — **well
short of §G's estimate.** Why: the dated stories came to about half the size guessed, and most of what remains is
commands, quoted sentences and conditions that §F keeps word for word; nothing was cut further to reach a number
(D141). The writer's pass (§H 3) found three things to name to the readers: "`main` always does" left the merge
sentence on purpose (§C 1); the refused merge of 8 Nov 26 is now stated as a rule ("is refused"), not as the one
case; and §E's "thirteen points" were twelve — now thirteen, the one on plans and slices split in two. The brief for
the two reads: `raptor-port/docs/superpowers/briefs/2026-11-10-session-handoff-tighten-read-brief.md`.

## A. Measured, and checked

- 444 lines, 29,508 bytes — about 9,800 tokens at a third of a token to the byte (an estimate; `docsize --reads` does
  not count a skill). It is read whole at nearly every chat's end, when the chat is at its fullest.
- By part, in bytes: head 852 · Step 1 (the block, the opening line, the release) 10,448 · Step 2 (gather state) 2,412
  · Step 3 (the records kept true) 8,055 · Step 4 (the template and its 13 points) 5,267 · Rules 2,474.
- Every file it names exists (`HANDOFF-NEXT.md`, `HANDOFF-ARCHIVE.md`, `raptor-port/docs/probe-sweep.md`, the file map,
  the deploy notes and its "A worktree chat loads its settings, hooks and skills from the MAIN checkout" paragraph,
  `raptor-port/CLAUDE.md` §Coding conventions).
- The rulings it cites: D29, D59, D60, D69, D78, D138, D140, D151, D350, D870, D975, D976 are live; **D974 and D1796 are
  spent and in `DECISIONS-ARCHIVE.md`.** D975, D976, D811 and D1975 name this skill as their home, so D975 and D976
  stay cited in it.
- What names the skill from outside does so by its path or its role, never by a step number or a quoted sentence:
  `raptor-port/scripts/docsize.mjs`, `.claude/rules/doc-structure.md`, `HANDOFF.md`'s head, the overnight skill, the
  compaction hook. A rewrite breaks none of them.

## B. What no longer applies — taken out, the old wording kept whole in an archive (no rule in any of it)

The whole skill as it stands is first copied to `raptor-port/docs/archive/session-handoff-skill-2026-11-10.md`, as the
design guide's was. A move never rewords (D138).

1. **What the handoff file replaced** (lines 18–23): `session-state.md` retired, `HANDOFF-NEXT.md` a signpost — history.
   The rule stays: the one handoff is `HANDOFF.md` (D140).
2. **"Either way … SUPERSEDED 2 Sep 26"** (lines 136–143): the leftover of a two-way choice the text no longer holds.
   Its rule — the handoff is committed and pushed to the chat's branch — is stated at lines 25–28 and again at 155–157.
3. **"A docs-only handoff has NO checks"** (lines 144–153): no longer true. Since 8 Nov 26 every pull request starts
   the run (its "checks passed" job) and the documents guard runs on every one (`.claude/rules/shipping.md` §The
   checks). The rule under it — look before pushing, never push while a run is in progress (D151, D870) — stays as one
   line naming `shipping.md`, which states it whole in every chat; `HANDOFF.md`'s own head states it too.
4. **The dated stories in brackets — about 25 of them.** Each rule keeps its text; the account of the day it was learnt
   goes: the sentence "wrong by six items"; the tidy that sent three pull requests into a clash (8 Nov); six pull
   requests unmerged for days (26 Oct); the extra notes pull request (8 Nov); the "RIGHT NOW" line (3 Nov); the chat
   number already taken (8 Nov); two chats in one folder (3 and 5 Nov); the side session (2 Nov); the two wrong ranges
   (11 Aug, 23 Sep); the main checkout 208 commits behind (14 Oct); `RangeCal.tsx` unmapped; the missed leftover
   (24 Sep); the priority-list line (21 Oct); the member no longer view-only (5 Aug); the file's 3,882 → 550 → 984
   lines; the thirteen points' "M6" (29 Oct), "part 3" (7 Nov), the tripwire raise (29 Oct), six red tests (31 Oct),
   the worktree-folder pointers (7 and 9 Nov), two side chats three-quarters full (8 Nov), the refused merge (8 Nov);
   Rule 2's Undo line (5 Nov) and the times two hours out (8 Nov); Rule 7's gate list.
   **Where a story holds a condition of its rule, the condition stays in the rule** — checked sentence by sentence
   (skill note 922).
5. **His quoted words on the new-chat screen, and "this wording approved"** (lines 102–104): both are in D975's and
   D976's rows. The rule and both numbers stay.
6. **"Nate's original skill forbids git here …"** (lines 173–175): where the skill came from. "Read git" stays.
7. **The GitHub Pages sentence** (lines 180–182): switched off 23 Sep 26 — history; `shipping.md` says where the app is
   viewed.
8. **The two spent rulings' numbers:** D974 beside the `git branch -u` line (the rule stays — a branch left tracking
   `origin/main` pushes to `main`), and D1796, which sits inside one of §B 4's stories.

## C. Where the skill has fallen behind a later ruling — put right (D201; the skill's own Rule 7)

These are corrections, not cuts. Each is named apart so he can refuse any.

1. **"NEVER merged by you … ONLY on the owner's explicit 'merge live'"** (lines 136–139). Since D1407 (27 Oct 26) a
   pull request that changes only notes — which most handoffs are — goes live by itself once its run is green, the
   agent merging it; a rules-diet step waits for his word all the same (D1737). The skill would name `shipping.md`'s
   rule and both cases. Already a filed job: `[REVIEW-LAYERS]` has "the session-handoff skill's merge wording brought
   level with D1407" open since 27 Oct 26 — this closes that part of it.
2. **The template's "Gates" line** (lines 344–348) lists four checks. The run now holds more (the Tracker's, the rule
   and document checks), and since D1086 GitHub's run of the pull request is a job's full check while the PC runs only
   the tests of what changed. It would say: the state of GitHub's run on the last pushed commit, and each check run on
   his PC with the run that made it and its count — never a bare "green". Its clause on the two checks GitHub does not
   run (`npm run probes:adapted`, `npm run perf`) stays: the project guide still asks them of any work a person sees.
3. **The template has no chat number,** though D1744 has the handoff file keep the next free number and every block
   since 7 Nov 26 carries it; nor the "Rulings", "Walk" and "Reads owed" lines the always-loaded rules ask of every
   closing report (`record-decisions.md`, `bug-check.md`, D761) and every recent block carries. **This ADDS about one
   line** to the template — the one place the skill grows.
4. **`## Gate baseline` "REPLACED each time"** (lines 300–301): since D1733 the count it replaces moves whole to its
   archive file.
5. **`docs/probe-sweep.md`** (line 287) is named without `raptor-port/` — against the skill's own Rule 3.

## D. Said once — the same rule now stated two or three times

1. "An open pull request waiting for his 'merge live' is the normal end state" — three times (lines 25–28, 141–143,
   155–157).
2. The new job's opening line (fetch, check the branch is level with `origin/main`, never "git pull") — twice (lines
   79–82, 106–108); `HANDOFF.md`'s head says it too.
3. "Never append to your block — rewrite it whole; a block that accumulates becomes a changelog" — Step 1 and Rule 1,
   the same sentence.
4. "`HANDOFF.md` is a current-state document" — Step 3's section (lines 290–316) and Rule 8; its fixed shape is also
   in `HANDOFF.md`'s head and `.claude/rules/doc-structure.md`. One short statement stays, naming both.
5. "Every handoff ends with his opening line" — Step 1 and Rule 9; "a plan file is named first" — the template and
   Rule 4. Rule 9's own point (the line goes out unchanged, never a choice left inside it) stays.
6. The pointer to the deploy notes' main-checkout recipe — twice in one paragraph (lines 236–242).
7. "A rule he changed: find and fix every copy" (lines 278–281) — `record-decisions.md` states the fuller rule in
   every chat (D201). The skill keeps one line that names the three files it adds (`README.md`,
   `raptor-port/README.md`, `CLAUDE.md`).

## E. Said in fewer words — the same rules (the rewrite; each change read for meaning)

- The opening-line rules gathered into one section — today they are spread over three bullets of Step 1 and Rule 9.
  The sentence every opening line carries, and each command, stay word for word.
- Step 3's range paragraph, its main-checkout paragraph, and the "known issue resolved" bullet (seven rules in one
  paragraph) — each to a short list.
- The thirteen "what makes the block something the next chat can act on" points — each to its rule.
- Step 1's bullets on another chat's block and on the open pull requests.

## F. Left alone

- The description at the head (what makes the skill load), the four steps' order, and the template's shape but for
  §C 2 and 3.
- Every command and recipe, word for word: the switch for a chat continuing a branch, the release, the own-folder
  fallback, the archive and `gh` commands.
- Every condition (where, only, unless, except) and every live ruling's number.
- **The six open skill notes about this skill** (916, 917, 918, 920, 921, 922): each would ADD a rule. They wait for
  the next skill-notes review and are not folded in here, so the readers check one thing only — that no meaning
  changed. Note 922 is used as this job's method (§H).
- The overnight skill (step 3) and the outside skills (step 4).

## G. Estimated

From 29,508 bytes to about 17,000–19,000 — about 9,800 tokens to about 5,700–6,300, roughly a third to two-fifths
shorter. An estimate until the rewrite is measured.

## H. Method and reads

1. Copy the skill whole to the archive file (§B).
2. Rewrite it: §B out, §C put right, §D once, §E shorter.
3. Before the readers, the writer's own pass (skill note 922): for every sentence cut or reworded, list its qualifying
   words and every cross-reference into a passage that is leaving, and show each is still carried.
4. Two reads, each blind to the other, for whether any meaning changed: Astra and a fresh, blind Opus reader (D1761,
   D1738, D1770) — the brief and both reports saved under `raptor-port/docs/superpowers/briefs/`.
5. Every finding set beside the old wording and fixed; `npm run docsize`; the saving measured.
6. Live only on his "merge live" — a working guide (D1407's list excludes it). Once merged it is in force only when
   the main checkout is on `main` (the skill's own Step 3).
