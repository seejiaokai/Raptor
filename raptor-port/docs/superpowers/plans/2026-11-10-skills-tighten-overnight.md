# [SKILLS-TIGHTEN] step 3 — the overnight skill: what would leave, what would be said shorter (10 Nov 26, chat 60)

His D1975: the skills written here and the design guide are tightened — the same rules in fewer words, none dropped —
and what no longer applies is taken out, moved whole to an archive. Steps 1 and 2 (the design guide, the
session-handoff skill) are live. This file is the list put to him BEFORE anything changes. Nothing in
`.claude/skills/overnight/SKILL.md` has been edited.

**Status:** the skill read whole by chat 60 on `main` at `1db898d45`; every file, heading, command and ruling it names
checked the same day (§A); the saving MEASURED by a script that sums the listed passages (§G, skill note 924), not
guessed; the list put to him 10 Nov 26; **his answer the same day, D1979 — "As recommended": §B, §C and §D, §E left
alone; chat 60 does the change. His answer to §C's question, D1980 — as recommended: on an unattended run nothing
merges by itself, notes included, unless he gave "auto merge live"; the night's notes are merged in the morning.**
Line numbers below are the skill's at that commit.

**Done 10 Nov 26 by chat 60, on `claude/skills-tighten-3`:** the old wording copied whole to
`raptor-port/docs/archive/overnight-skill-2026-11-10.md`; §B out, §C put right, §D once — 21,958 → 21,167 bytes
before the reads, less than §G's 1,141 because D1980's sentence went in and "never only the newest row" was kept.
**Both reads in and fixed:** the fresh Opus reader five findings, Astra one (the Opus reader's third) — reports
`raptor-port/docs/superpowers/briefs/2026-11-10-overnight-tighten-read-opus.md` and `…-read-astra.md`. The fixes put
§D 4's rule back whole in the skill (a pointer to a line the night rewrites was not enough), brought the opening
checklist level with §C 3, set "push to `main`" outside the "auto merge live" exception, and added the step §C 2
needed to be possible — each job's helper stops once the job is built so its pull request can open. **Final measure:
227 lines, 21,725 bytes — about 1% fewer bytes than the 21,958 it started at.** Merged on his advance "merge live"
(D1981).

## A. Measured, and checked

- 225 lines, 21,958 bytes — about 7,300 tokens at a third of a token to the byte (an estimate). It is read only on a
  night he runs `/overnight`, and again after each compaction that night.
- It was gone over the same day: the skill-notes review of 10 Nov 26 added nine notes' lessons to it (732, 738, 754,
  762, 847, 853, 857, 907 and 915's refused write). It is current, and already dense.
- Every file, heading and command it names exists: the walk ledger, the bug-check order's §4, §5 and §7.0, the design
  guide's §1b, the deploy notes' "A worktree chat loads its settings, hooks and skills from the MAIN checkout", the
  compaction switch's `--away` and `--back`, the lock's `status`, the commit `81b65274b`, `[NO-ASTRA-LIST]`.
- The rulings it cites are live, but for six: **D856, D857, D858, D859 and D864 are spent, and D1103 is replaced by
  D1416 — all in `DECISIONS-ARCHIVE.md`.**
- What names the skill from outside does so by its name or its role, never by a step number or a quoted sentence: the
  compaction hooks (`--away` "an /overnight run"), `.claude/rules/doc-structure.md` ("the overnight guide carries the
  same rulings"), the general rulings page. A rewrite breaks none of them.

## B. What no longer applies — taken out, the old wording kept whole in an archive (no rule in any of it)

The whole skill as it stands is first copied to `raptor-port/docs/archive/overnight-skill-2026-11-10.md`. A move never
rewords (D138).

1. **What the guide replaced, and its worked example** (lines 10–12): "the questions he used to ask by hand each
   night", and the night of 14 Oct 26 as the example — a night from before helpers, Low or Medium and the chat-fullness
   rules, so it no longer shows how a night runs. The four live rulings' numbers stay (D596, D667, D766, D869).
2. **The dated stories and bare dates in brackets — thirteen.** Each rule keeps its text; the account of the night it
   was learnt goes: the night begun on the older guide (28 Oct); two looks ready ten minutes before he slept (25 Oct);
   the parked question with no case (13 Oct); the block pushed seconds after the pull request opened (17 Oct); and the
   bare dates beside the timer, the block on a branch, the refused write, the readers ticked, the stopped helper, the
   push alone in its command, D1415 and the list checked against a picture. **Where a story holds its rule's reason or
   condition, that stays** — "a refused push stops a compound command's earlier steps too" stays; the pointer to the
   deploy notes stays (skill note 922).
3. **The history of how helpers replaced a session per job** (lines 123–125): "His D1103 asked for…, on 21 Oct 26 the
   app started none…, this line is his approval of that change". D1103 is replaced; the rule — a helper per job, a
   session per job only when he types the night's message in the desktop app — stays, with D1416.
4. **The spent rulings' numbers:** D856–D859 (inside 1), D857 beside the chat-fullness line, D864 beside the one pull
   request for related work (D822 stays), D1103 (inside 3).

## C. Where the skill has fallen behind a later ruling — put right (D201). These ADD words.

Corrections, not cuts; each named apart so he can refuse any.

1. **"The full checks, up to about twenty" minutes** (line 30): GitHub's run is about 6 minutes since D1089. Goes with
   §D 1, which names `shipping.md` instead of repeating the figure.
2. **Where the checks run** (lines 110 and 169): the skill has every job run its "gates under the lock" on his PC and
   open its pull request "when its check closes". Since D1086 (20 Oct 26), while the repo is public, GitHub's run of
   the pull request is a job's full check: the pull request opens as soon as the job is built, so that run goes while
   the app is walked, and his PC runs only the tests of what changed and the build the walk drives. The skill would
   name `shipping.md` §The checks and say the same. The order "block first, then the pull request, then no push until
   its run has finished" stays.
3. **"Merge" is forbidden flatly** (lines 15–16, 179, 225, and the sentence sent to him at line 78). Since D1093
   (20 Oct 26) his "auto merge live", given for a night, covers everything that night produces. The skill would say:
   nothing merges — unless he gave "auto merge live" for the night, then by `shipping.md`'s four steps; and the Part 1
   message would say which of the two tonight is.

**One question for him, which the rulings do not settle (D90):** the notes of a night — its handoff block, its backlog
lines, its evidence sheets. D596 (5 Oct): on an unattended run nothing merges. D1407 (27 Oct, later): a pull request
that changes only notes goes live by itself once green. Which holds at night? **Recommended: at night nothing merges
by itself, notes included, unless he said "auto merge live"** — the morning chat merges the notes after his look, as
now; it costs him nothing and keeps "nothing merges while you sleep" true as he was told it.

## D. Said once — the same rule now stated two or three times

1. **A push starts two runs; read them all** (lines 29–31): `shipping.md` states it in every chat. The command stays
   word for word; its explanation becomes a pointer.
2. **What a night may never do** — the head's "is NOT permission" paragraph (lines 14–17) and Part 2's "Never" bullet
   (lines 179–181) are the same list. The head keeps it; Part 2 keeps what is its own: a job step 4 holds that his
   reply did not settle, the one notification, and "if truly blocked". The checklist's tick stays.
3. **The first compaction note and its figures** — three times in one bullet (lines 144–148 and 154). Once.
4. **After a compaction: re-read the block, the guide and the files in hand** — the sentence the block opens with
   (step 8, kept word for word, since it is what survives a compaction) and again as Part 2's rule (lines 158–160),
   which would point to it and keep its own half: never carry on from the summary's memory.

## E. Said in fewer words — NOT recommended for this skill

The four densest paragraphs could be broken into short lists and trimmed: each job's helper (lines 112–127), a
helper's report (128–137), a roadblock (161–168), his reply (83–92). **A guess, not measured: 500 to 1,000 bytes
more.** Nearly every clause in them is a condition learnt on a real night, most added in the last three weeks; skill
note 922 is that shortening drops exactly those first. Recommended: leave these as they are.

## F. Left alone

- The description at the head (what makes the skill load), the three parts and the nine steps' order.
- Every command, word for word; every sentence the skill has the agent say to him or write into the block.
- Every condition (where, only, unless, except) and every live ruling's number.
- The three closing checklists (1,380 bytes): they restate the steps on purpose — a check that cannot be skipped.
- **Open skill note 915** (a helper's brief must say to return its report as text): it would ADD a rule; it waits for
  the next skill-notes review.
- **`[OVERNIGHT-RETRY-TRIAL]`** (D885 — the next night tries the keep-retrying setting): open in the backlog, not in
  the skill; step 2's read of the backlog is what finds it. Not folded in here.
- The outside skills (step 4 — the question put to him last).

## G. Measured — by `measure-overnight.mjs`, each passage of §B, §C and §D found exactly once and its bytes summed

| Part | Bytes out | Bytes back | Net |
|---|---|---|---|
| §B — what no longer applies (16 passages) | 1,260 | 354 | −906 |
| §C — the corrections (3; C1 is counted in §D 1) | 173 | 347 | +174 |
| §D — said once (5 passages) | 1,501 | 1,092 | −409 |
| **All** | **2,934** | **1,793** | **−1,141** |

**About 5%** of the skill (1,141 of 21,515 bytes with its line wraps flattened; 21,958 as stored) — about 380 tokens,
on a night he runs it. With §E, a guess of 7 to 10%. The script and its passage list are saved beside this file as
`2026-11-10-skills-tighten-overnight-measure.mjs`.

**What this means:** the skill has little left to take out. The gain of this step is §C — the skill made right where
two rulings overtook it — more than its size.

## H. Method and reads (if he says go)

1. Copy the skill whole to the archive file (§B).
2. Make the listed changes only: §B out, §C put right, §D once. No other sentence is touched.
3. The writer's own pass (skill note 922): for every sentence cut or reworded, its qualifying words and every
   cross-reference into a passage that is leaving, each shown still carried.
4. Two reads, each blind to the other, for whether any meaning changed: Astra and a fresh, blind Opus reader (D1761,
   D1738, D1770) — the brief and both reports under `raptor-port/docs/superpowers/briefs/`.
5. Every finding set beside the old wording and fixed; `npm run docsize`; the saving measured again.
6. Live only on his "merge live" — a working guide (D1407's list excludes it). In force in new chats only once the
   main checkout is level with `main` ([MAIN-CHECKOUT-STALE]).
