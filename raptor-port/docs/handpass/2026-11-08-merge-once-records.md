# [MERGE-ONCE-RECORDS] — the settle step's replay on real merges (8 Nov 26, chat 33)

**What this is.** The evidence for part 2 of the plan (`raptor-port/docs/superpowers/plans/2026-11-08-merge-once-records-plan.md`
§After the red team): the settle step, `raptor-port/scripts/records-merge.mjs`, run on every clashing merge of 8 Nov 26 exactly as a
chat would have run it, and each file it settled compared with the file the chat committed. No screen changes, so there is no walk
(the plan's §Cost); the reads are Astra's and a fresh, blind Opus reader's.

**How.** The list — each merge and its two parents — is committed as data, `raptor-port/scripts/records-merge-replay.json`: every
two-parent merge on any branch whose committer date falls between 8 Nov 26 00:00 and the moment the list was cut (Singapore time,
+08:00), kept when its two parents clash again under `git merge-tree`. The held-out merges are the clashing ones committed after the
cut. Each runs in one throwaway clone (its remote branches removed, so a renumber sees only the two sides): the first parent checked
out, `git merge --no-commit --no-ff` of the second, the step with `--no-checks`, then each settled file compared byte for byte with
the committed merge, and the count of each identity (handoff block markers, skill-note numbers, ledger rows, `[ID]` headings,
D-numbers). Re-run: `node raptor-port/scripts/records-merge-replay.mjs --out raptor-port/docs/handpass/2026-11-08-merge-once-records.md`.

**Nothing below is judged fine by the builder.** Every difference is listed for the host and the readers; the marks on each line say
only where the line came from.

## What the builder saw in it — a sort, not a verdict (for the host and the readers to check)

- **Merges.** Of the list's 76 clashing merges the step settled everything in **52**, part in **19** (left: the rulings files,
  which go to `backlog-archive.mjs --rulings --merge`, app code, a working guide, or a record both sides changed), nothing in **5**.
  It stopped with an error on none. The held-out set is small: **2** clashing merges were committed after the list was cut (19:26)
  and before the replay ran; the step settled everything in 1 and part in the other.
- **Files.** It settled 114 files whole: **53** byte for byte the chat's, **61** different. The first run gave 39 the same: two notes
  added after a last note with no blank line ran together; fixed red first (the test "notes both sides added after a last note…"),
  and the replay run again — the figures here are the second run's.
- **The 61 differences, sorted by shape** (each is listed in full below):
  - **25 — the same lines, placed differently.** Where both sides added text at one place the step puts this branch's first (the
    skill log: main's first); the chats did not keep one order — counted over every both-sides insertion on the list, the skill log
    went main's-first 16 times and this-branch's-first 14, the archives 2 and 5, the walk ledger 1 and 4, the file map and the
    handoff this branch's first every time (16 and 34).
  - **6 — the chat's own new lines in place of lines it had:** its handoff block rewritten in the merge itself, which no rule can
    make (Astra 10's a3bb57b3e is of the next kind).
  - **19 — the chat's own new lines mixed with lines placed or dropped differently:** its block rewritten, and with it
    renumbers made against other open branches the replay cannot see (239b25843: the chat moved 850 to 856 because 853–855 were held
    on other branches, and wrote a "Renumbered" line in the note; the step, seeing only the two sides, kept 850 — no clash between
    them), a merged block dropped or condensed in the merge (adee1d199), and an archive day heading the chat wrote new
    (c233ee7da: both sides had filed rows under "## Moved 7 Nov 26"; the chat opened "## Moved 8 Nov 26" for one side's — the step
    keeps each row where its side put it).
  - **14 — lines kept or dropped differently, none written by the chat.** Read one by one: most are the same notes or archived
    items in the other order, spread over two places of the diff. Three are not: **0db7d583b** — the chat's handoff LOST a block's
    `<!-- /now -->` (two blocks added at once sharing git's closing line, the trap of skill note 895); the step's file has it.
    **8b54a2cd5** — main had ADDED the block for the merged branch `claude/pr-sched-marks-3205d7` (not in the base, not on
    the branch): the step kept it, as an addition on one side; the chat dropped it in the merge, its branch being merged. And
    **d55797d99** — the same block: in the base and unchanged on main, REMOVED on the branch: the step removed it, the chat kept it.
    Each follows the plan's rule; whether either chat meant its choice is for the host.
- **Identity counts** differ in 20 files; every one is in the lists above (block markers and D-numbers in rewritten handoff blocks,
  note numbers where a renumber differs, one where the step kept a block the chat dropped).
- **Renumbers the step made: 7** (377330417, 18487fc2e twice, b1edcf82b, 1c8650133, 1b3661f7e, 52de38189 — Astra 4's case, 881 → 892,
  the same number the chat chose). Where the chat's number differs it chose against other open branches.

<!-- generated by raptor-port/scripts/records-merge-replay.mjs — the list: 76 merges, 2026-11-08T00:00:00+08:00 to 2026-11-08T19:26:27+08:00 (committer date, Singapore time (+08:00)) -->

## The list — 8 Nov 26's clashing merges to 2026-11-08T19:26:27+08:00

- merges replayed: **76**
- the step settled EVERYTHING git left (nothing for the chat): **52**
- the step settled part, the rest left for the chat (rulings files, app code or a record it leaves): **19**
- the step settled nothing (every clash outside what it settles, or left): **5**
- files it settled whole: **114** — the same bytes as the chat's: **53**, different: **61**; settled in part (a record left): **1**
- the step stopped with an error: **0**

| merge | parents | git left | the step settled | left for the chat |
|---|---|---|---|---|
| c233ee7da | ca03cb8be ← 9b42a96b6 | .claude/decisions-full/how-we-work.md, .claude/rules/decisions/how-we-work.md, DECISIONS-ARCHIVE.md, DECISIONS.md, HANDOFF.md | DECISIONS-ARCHIVE.md (≠), HANDOFF.md (=) | .claude/decisions-full/how-we-work.md, .claude/rules/decisions/how-we-work.md, DECISIONS.md |
| 7c3b3afe1 | 6d80a1ce9 ← 7744e66db | .claude/skill-observations/log.md | .claude/skill-observations/log.md (=) | — |
| 086bf4e0a | b4a3c86af ← 7744e66db | .claude/skill-observations/log.md, HANDOFF.md | .claude/skill-observations/log.md (=), HANDOFF.md (≠) | — |
| 1ac1c0e8e | 8899067ab ← 4fbf85a49 | .claude/skill-observations/log.md | .claude/skill-observations/log.md (≠) | — |
| 0e147b03e | 647a4d4c6 ← 4fbf85a49 | .claude/decisions-full/how-we-work.md, .claude/rules/decisions/how-we-work.md, .claude/rules/shipping.md, DECISIONS.md, raptor-port/scripts/docsize.mjs | — | .claude/rules/shipping.md, raptor-port/scripts/docsize.mjs, .claude/decisions-full/how-we-work.md, .claude/rules/decisions/how-we-work.md, DECISIONS.md |
| 239b25843 | 7c3b3afe1 ← 4fbf85a49 | .claude/skill-observations/log.md | .claude/skill-observations/log.md (≠) | — |
| 45a9c99b3 | ead868ee9 ← 3a44fdb5f | .claude/skill-observations/log.md | .claude/skill-observations/log.md (≠) | — |
| 68f0f221a | cba72d425 ← b67d658fa | raptor-port/docs/file-map.md, raptor-port/src/state/mission-roles.ts, raptor-port/src/ui/mission-role-offer.ts | raptor-port/docs/file-map.md (=) | raptor-port/src/state/mission-roles.ts, raptor-port/src/ui/mission-role-offer.ts |
| edf223de3 | 525d48ffb ← bc3c43bce | .claude/decisions-full/how-we-work.md, .claude/rules/decisions/how-we-work.md, .claude/skill-observations/log.md, DECISIONS.md | .claude/skill-observations/log.md (=) | .claude/decisions-full/how-we-work.md, .claude/rules/decisions/how-we-work.md, DECISIONS.md |
| 1264dc677 | 239b25843 ← 4dfabb63d | .claude/skill-observations/log.md, OUTSTANDING.md, raptor-port/docs/file-map.md, raptor-port/docs/walk-ledger.md | .claude/skill-observations/log.md (=), raptor-port/docs/file-map.md (=), raptor-port/docs/walk-ledger.md (≠) | OUTSTANDING.md |
| f12d6f5a6 | 65157bb5a ← c61c33480 | .claude/skill-observations/log.md | .claude/skill-observations/log.md (=) | — |
| 57f1587e2 | 0bec8c0f9 ← c61c33480 | .claude/skill-observations/log.md | .claude/skill-observations/log.md (=) | — |
| 321529dc5 | 57f1587e2 ← eafef1634 | .claude/decisions-full/how-we-work.md, .claude/rules/bug-check.md, .claude/rules/decisions/how-we-work.md, .claude/rules/doc-structure.md, .claude/skill-observations/log.md, DECISIONS.md, raptor-port/docs/bug-check-order.md | .claude/skill-observations/log.md (≠) | .claude/rules/bug-check.md, .claude/rules/doc-structure.md, raptor-port/docs/bug-check-order.md, .claude/decisions-full/how-we-work.md, .claude/rules/decisions/how-we-work.md, DECISIONS.md |
| 4c43c8fdf | e363be80c ← eafef1634 | .claude/decisions-full/design.md, .claude/rules/decisions/design.md, .claude/skill-observations/log.md, DECISIONS.md | .claude/skill-observations/log.md (≠) | .claude/decisions-full/design.md, .claude/rules/decisions/design.md, DECISIONS.md |
| ae71c90f2 | 5ed392df8 ← d7ed6441d | .claude/skill-observations/log.md, DECISIONS.md | .claude/skill-observations/log.md (≠) | DECISIONS.md |
| f90e51614 | 273b2e7cd ← 4e517e948 | .claude/skill-observations/log.md | .claude/skill-observations/log.md (=) | — |
| e42a746ca | a3f1cbffb ← 4e517e948 | .claude/skill-observations/log.md | .claude/skill-observations/log.md (=) | — |
| 377330417 | 647853e71 ← 4f743c21f | .claude/skill-observations/log.md | .claude/skill-observations/log.md (≠) | — |
| d87d40766 | a860f6850 ← 4d5b3828a | .claude/skill-observations/log.md, OUTSTANDING-ARCHIVE.md, raptor-port/docs/file-map.md | .claude/skill-observations/log.md (=), OUTSTANDING-ARCHIVE.md (≠), raptor-port/docs/file-map.md (=) | — |
| 7009fe1f2 | d21b4e72f ← 4d5b3828a | .claude/skill-observations/log.md, raptor-port/docs/file-map.md | .claude/skill-observations/log.md (=), raptor-port/docs/file-map.md (≠) | — |
| 2474800d6 | 473b69a6a ← d3e0d90ff | .claude/skill-observations/log.md, HANDOFF.md, OUTSTANDING-ARCHIVE.md, raptor-port/docs/file-map.md | .claude/skill-observations/log.md (=), HANDOFF.md (=), OUTSTANDING-ARCHIVE.md (≠), raptor-port/docs/file-map.md (=) | — |
| 68be77639 | eef1f8eb0 ← d3e0d90ff | .claude/skill-observations/log.md, HANDOFF.md, OUTSTANDING-ARCHIVE.md, raptor-port/docs/file-map.md, raptor-port/docs/walk-ledger.md | .claude/skill-observations/log.md (≠), HANDOFF.md (≠), OUTSTANDING-ARCHIVE.md (=), raptor-port/docs/file-map.md (=), raptor-port/docs/walk-ledger.md (=) | — |
| adee1d199 | 539d5f3ec ← d3e0d90ff | .claude/skill-observations/log.md, HANDOFF.md, OUTSTANDING.md, raptor-port/docs/walk-ledger.md | .claude/skill-observations/log.md (=), HANDOFF.md (≠), raptor-port/docs/walk-ledger.md (=) | OUTSTANDING.md |
| f142d848c | 30d47559d ← d3e0d90ff | .claude/skill-observations/log.md, HANDOFF.md | .claude/skill-observations/log.md (≠), HANDOFF.md (≠) | — |
| 6698140d6 | adee1d199 ← db0c6640b | .claude/skill-observations/log.md, HANDOFF.md | .claude/skill-observations/log.md (=), HANDOFF.md (≠) | — |
| 2588688b7 | 3db6b4100 ← db0c6640b | HANDOFF.md | HANDOFF.md (≠) | — |
| ab43e7413 | ee16bd4e5 ← db0c6640b | .claude/decisions-full/how-we-work.md, .claude/decisions-full/scheduler.md, .claude/rules/decisions/how-we-work.md, .claude/rules/decisions/scheduler.md, DECISIONS-ARCHIVE.md, DECISIONS.md, HANDOFF.md | DECISIONS-ARCHIVE.md (≠), HANDOFF.md (=) | .claude/decisions-full/how-we-work.md, .claude/decisions-full/scheduler.md, .claude/rules/decisions/how-we-work.md, .claude/rules/decisions/scheduler.md, DECISIONS.md |
| b348f7bdc | 12167eb77 ← cd8a5dd67 | .claude/skill-observations/log.md, HANDOFF.md | .claude/skill-observations/log.md (=), HANDOFF.md (=) | — |
| 031288dc8 | 583f83f81 ← dddcc8277 | HANDOFF.md | HANDOFF.md (≠) | — |
| 7c00f7b1c | 1d4562559 ← dddcc8277 | HANDOFF.md | HANDOFF.md (≠) | — |
| 18487fc2e | 8d238b08c ← dddcc8277 | .claude/skill-observations/log.md, HANDOFF.md, raptor-port/docs/file-map.md | .claude/skill-observations/log.md (≠), HANDOFF.md (≠), raptor-port/docs/file-map.md (=) | — |
| 0db7d583b | ea6cbea7e ← dddcc8277 | .claude/skill-observations/log.md, HANDOFF.md, raptor-port/docs/walk-ledger.md | .claude/skill-observations/log.md (≠), HANDOFF.md (≠), raptor-port/docs/walk-ledger.md (=) | — |
| 655dbb6bc | a7a0519f6 ← d41066ae5 | DECISIONS.md | — | DECISIONS.md |
| bd56fcb71 | ca70ece3c ← dec261e0b | HANDOFF.md | HANDOFF.md (=) | — |
| a4d23f2fa | 18487fc2e ← dec261e0b | HANDOFF.md | HANDOFF.md (≠) | — |
| 66d3a613f | 8d951c79d ← dec261e0b | DECISIONS.md, HANDOFF.md | HANDOFF.md (=) | DECISIONS.md |
| b1edcf82b | 38e6d38ff ← 47adcc39f | .claude/skill-observations/log.md, HANDOFF.md | .claude/skill-observations/log.md (≠), HANDOFF.md (=) | — |
| 7d403d12c | 41d7481d0 ← 47adcc39f | HANDOFF.md, raptor-port/docs/file-map.md, raptor-port/docs/ui-contracts.md | HANDOFF.md (=), raptor-port/docs/file-map.md (≠) | raptor-port/docs/ui-contracts.md |
| b8011e768 | 6462d8229 ← f9267b2fe | HANDOFF.md | HANDOFF.md (≠) | — |
| 1c8650133 | a0b3f0de5 ← bf09f369b | .claude/skill-observations/log.md, HANDOFF.md, raptor-port/docs/ui-contracts.md | .claude/skill-observations/log.md (≠), HANDOFF.md (≠) | raptor-port/docs/ui-contracts.md |
| e0b0b0d36 | b84a96ac0 ← bf09f369b | .claude/skill-observations/log.md, HANDOFF.md, raptor-port/docs/file-map.md | .claude/skill-observations/log.md (≠), HANDOFF.md (=), raptor-port/docs/file-map.md (≠) | — |
| 110b3a2c2 | 58031149c ← bf09f369b | .claude/skill-observations/log.md, DECISIONS.md, HANDOFF.md, raptor-port/docs/file-map.md | .claude/skill-observations/log.md (≠), HANDOFF.md (≠), raptor-port/docs/file-map.md (≠) | DECISIONS.md |
| f0cc7636c | ef035e763 ← 87eb82978 | raptor-port/docs/file-map.md | raptor-port/docs/file-map.md (=) | — |
| 1b3661f7e | 811aca3ab ← 87eb82978 | .claude/skill-observations/log.md | .claude/skill-observations/log.md (≠) | — |
| 8ed7e85a8 | 5cd094766 ← e865e8ad3 | .claude/skill-observations/log.md, HANDOFF.md | .claude/skill-observations/log.md (≠) | HANDOFF.md |
| d0334d539 | 1b3661f7e ← e865e8ad3 | DECISIONS.md | — | DECISIONS.md |
| 32e9b096d | 29938aa22 ← 8ae7285fc | HANDOFF.md, raptor-port/docs/file-map.md, raptor-port/docs/ui-contracts.md | HANDOFF.md (=), raptor-port/docs/file-map.md (=) | raptor-port/docs/ui-contracts.md |
| 7141b1bd8 | b7a81fbd8 ← 8ae7285fc | HANDOFF.md | HANDOFF.md (≠) | — |
| d2194c2d3 | 6c6e4e667 ← 8ae7285fc | HANDOFF.md | HANDOFF.md (=) | — |
| 50cc26a5c | cfa24efc3 ← 6010c3e35 | OUTSTANDING-ARCHIVE.md | OUTSTANDING-ARCHIVE.md (≠) | — |
| 7faf81f3b | 86ac0c54b ← 6010c3e35 | .claude/skill-observations/log.md, DECISIONS.md, HANDOFF.md, raptor-port/docs/file-map.md | .claude/skill-observations/log.md (≠), HANDOFF.md (≠), raptor-port/docs/file-map.md (=) | DECISIONS.md |
| 883efe49c | ce312b01b ← 6010c3e35 | .claude/skill-observations/log.md, HANDOFF.md | .claude/skill-observations/log.md (≠), HANDOFF.md (=) | — |
| c6fe5a302 | f10abbc44 ← 0568264be | HANDOFF.md | HANDOFF.md (part) | HANDOFF.md |
| 966712bc0 | 2e5ac7eb5 ← 0568264be | HANDOFF.md | HANDOFF.md (≠) | — |
| 2a825037b | d2194c2d3 ← 0568264be | HANDOFF.md | HANDOFF.md (=) | — |
| 95dd5a9c0 | 883efe49c ← 0568264be | HANDOFF.md | HANDOFF.md (≠) | — |
| 2b2fbefc7 | 7faf81f3b ← 0568264be | HANDOFF.md | HANDOFF.md (≠) | — |
| 2792c00a1 | 966712bc0 ← dd2b7c234 | HANDOFF.md | HANDOFF.md (≠) | — |
| fdbe3b4b9 | 2a825037b ← dd2b7c234 | HANDOFF.md | HANDOFF.md (=) | — |
| c4ab4a889 | ef05afd5d ← 0abda89d5 | HANDOFF.md | HANDOFF.md (=) | — |
| 52de38189 | f713485d2 ← 0abda89d5 | .claude/skill-observations/log.md | .claude/skill-observations/log.md (≠) | — |
| 916d42e3c | f936541cc ← 41b264227 | HANDOFF.md, raptor-port/docs/file-map.md | HANDOFF.md (=), raptor-port/docs/file-map.md (≠) | — |
| 31ac0ebd8 | 0edba187a ← 41b264227 | HANDOFF.md, raptor-port/docs/file-map.md | HANDOFF.md (=), raptor-port/docs/file-map.md (=) | — |
| 790598011 | 52de38189 ← 41b264227 | raptor-port/docs/file-map.md, raptor-port/docs/walk-ledger.md | raptor-port/docs/file-map.md (=), raptor-port/docs/walk-ledger.md (=) | — |
| 015000f0b | 31ac0ebd8 ← 99ecc114d | HANDOFF.md | HANDOFF.md (=) | — |
| 765b2b9a0 | 91fb25ed1 ← 99ecc114d | HANDOFF.md | HANDOFF.md (=) | — |
| 8b54a2cd5 | 29fa3147e ← d8d5b1f57 | .claude/skill-observations/log.md, HANDOFF.md, raptor-port/docs/file-map.md | .claude/skill-observations/log.md (≠), HANDOFF.md (≠), raptor-port/docs/file-map.md (=) | — |
| e97e0852b | 5ae068c34 ← e7fb20aad | .claude/rules/decisions/design.md | — | .claude/rules/decisions/design.md |
| a3bb57b3e | 0f2697c78 ← e7fb20aad | .claude/skill-observations/log.md, HANDOFF.md | .claude/skill-observations/log.md (≠), HANDOFF.md (≠) | — |
| f54a6a272 | 2c0d4d545 ← fc85d7df9 | HANDOFF.md | HANDOFF.md (=) | — |
| f9a2ff6e5 | 24fe29936 ← fc85d7df9 | HANDOFF.md | HANDOFF.md (=) | — |
| 8712be8d2 | 2acd75a51 ← 535fdc94f | HANDOFF.md | HANDOFF.md (=) | — |
| 423e6c76b | f635a5442 ← ae0fe14fe | HANDOFF.md, OUTSTANDING-ARCHIVE.md, OUTSTANDING.md | HANDOFF.md (≠), OUTSTANDING-ARCHIVE.md (≠) | OUTSTANDING.md |
| d55797d99 | 2f06b1815 ← ae0fe14fe | .claude/skill-observations/log.md, HANDOFF.md | .claude/skill-observations/log.md (≠), HANDOFF.md (≠) | — |
| 2cfdfe2d2 | b0809f551 ← 6376895f4 | .claude/skill-observations/log.md, DECISIONS.md, raptor-port/docs/file-map.md | .claude/skill-observations/log.md (≠), raptor-port/docs/file-map.md (≠) | DECISIONS.md |
| 5d2de831b | 606285e5d ← aee0de3f2 | OUTSTANDING.md | — | OUTSTANDING.md |

### Renumbers the step made

- 377330417: renumbered in .claude/skill-observations/log.md: Observation 863 → 864 "A chat number given in a starting brief was already taken" (main has its own 863)
- 18487fc2e: renumbered in .claude/skill-observations/log.md: Observation 866 → 875 "A helper's "the code is unchanged since commit X" must be checked before its build label is believed" (main has its own 866)
- 18487fc2e: renumbered in .claude/skill-observations/log.md: Observation 873 → 876 "A pin that goes red or green by the machine's pace was handed over as "unexplained" — slow the processor to reproduce it" (main has its own 873)
- b1edcf82b: renumbered in .claude/skill-observations/log.md: Observation 878 → 879 "A blind reader told to find related rules "by name" misses the ones that change the subject" (main has its own 878)
- 1c8650133: renumbered in .claude/skill-observations/log.md: Observation 879 → 880 "Red first for a style-only fix, in the same lock turn as the green run" (main has its own 879)
- 1b3661f7e: renumbered in .claude/skill-observations/log.md: Observation 880 → 883 "Red first for a style-only fix, in the same lock turn as the green run" (main has its own 880)
- 52de38189: renumbered in .claude/skill-observations/log.md: Observation 881 → 892 "Times written into a handoff after a compaction came from the summary, not the clock" (main has its own 881)

### Every file whose settled result differs from the chat's (61)

Each line: `-` the step wrote it and the chat's file lacks it, `+` the chat's file has it and the step's lacks it; «chat wrote» marks a line neither parent holds (written in the merge itself). None is judged here.

#### c233ee7da — DECISIONS-ARCHIVE.md

Identity counts: all equal.

```diff
@@ -396,0 +397,5 @@
+    «chat kept»
+ ## Moved 8 Nov 26   «chat wrote (in neither parent)»
+    «chat kept»
+ | # | Date | His ruling, in his words where short enough | What it means | Where it lives now |   «chat kept»
+ |---|---|---|---|---|   «chat kept»
```

#### 086bf4e0a — HANDOFF.md

Identity counts: all equal.

```diff
@@ -33 +33 @@
- - **Next — his:** answer the page from his phone (one tap "All as recommended", or per question). **Next — a chat's (chat 4 or later, on his word):** record ...   «step kept»
+ - **Next — his:** answer the page from his phone (one tap "All as recommended", or per question). **Next — a chat's (the next free number, on his word — 5 as...   «chat wrote (in neither parent)»
```

#### 1ac1c0e8e — .claude/skill-observations/log.md

Identity counts: all equal.

```diff
@@ -3889,26 +3888,0 @@
- ### Observation 851: A replacement must be written before the old text is moved out   «step kept»
-    «step kept»
- **Status:** OPEN   «step kept»
- **Date:** 2026-11-08   «step kept»
- **Session context:** chat 2, the rules diet's step 4 part 2 (the five always-loaded rule files as checklists); numbered past 850, the highest on any branch   «step kept»
- **Skill:** New skill candidate: rewriting a loaded rules file (the move script `backlog-archive.mjs --move` and the briefs that use it)   «step kept»
- **Type:** internal   «step kept»
- **Phase/Area:** the build brief's order of steps   «step kept»
-    «step kept»
- **Issue:** The build brief said to move each file's old text whole to the archive first, then write the checklist in its place. The move script checks the wh...   «step kept»
- **Suggested improvement:** In any brief or guide step that replaces loaded text by moving the old text out, say "write the replacement above the old text, th...   «step kept»
- **Principle:** When a tool verifies the whole state after each step, order the steps so every intermediate state is valid: add the new thing before you remov...   «step kept»
-    «step kept»
- ### Observation 852: A blind reader's findings leaked into a file the other reader could open   «step kept»
-    «step kept»
- **Status:** OPEN   «step kept»
- **Date:** 2026-11-08   «step kept»
- **Session context:** chat 2, the rules diet's step 4 part 1 (two blind reads running at once, D1739)   «step kept»
- **Skill:** claudex-loop (blind cross-reads) and the bug-check order §4 (fresh, blind readers)   «step kept»
- **Type:** open-source   «step kept»
- **Phase/Area:** keeping two parallel readers blind to each other   «step kept»
-    «step kept»
- **Issue:** The first reader's report was kept outside the working folder, but its findings were then summarised into the handoff note inside the working fold...   «step kept»
- **Suggested improvement:** While any blind reader is running, write nothing about another reader's findings anywhere in the folder it reads — the handoff not...   «step kept»
- **Principle:** Blindness covers every copy and summary of a report, not only the report file; anything the reader can open is visible.   «step kept»
-    «step kept»
@@ -3953,0 +3928,26 @@
+ ### Observation 851: A replacement must be written before the old text is moved out   «chat kept»
+    «chat kept»
+ **Status:** OPEN   «chat kept»
+ **Date:** 2026-11-08   «chat kept»
+ **Session context:** chat 2, the rules diet's step 4 part 2 (the five always-loaded rule files as checklists); numbered past 850, the highest on any branch   «chat kept»
+ **Skill:** New skill candidate: rewriting a loaded rules file (the move script `backlog-archive.mjs --move` and the briefs that use it)   «chat kept»
+ **Type:** internal   «chat kept»
+ **Phase/Area:** the build brief's order of steps   «chat kept»
+    «chat kept»
+ **Issue:** The build brief said to move each file's old text whole to the archive first, then write the checklist in its place. The move script checks the wh...   «chat kept»
+ **Suggested improvement:** In any brief or guide step that replaces loaded text by moving the old text out, say "write the replacement above the old text, th...   «chat kept»
+ **Principle:** When a tool verifies the whole state after each step, order the steps so every intermediate state is valid: add the new thing before you remov...   «chat kept»
+    «chat kept»
+ ### Observation 852: A blind reader's findings leaked into a file the other reader could open   «chat kept»
+    «chat kept»
+ **Status:** OPEN   «chat kept»
+ **Date:** 2026-11-08   «chat kept»
+ **Session context:** chat 2, the rules diet's step 4 part 1 (two blind reads running at once, D1739)   «chat kept»
+ **Skill:** claudex-loop (blind cross-reads) and the bug-check order §4 (fresh, blind readers)   «chat kept»
+ **Type:** open-source   «chat kept»
+ **Phase/Area:** keeping two parallel readers blind to each other   «chat kept»
+    «chat kept»
+ **Issue:** The first reader's report was kept outside the working folder, but its findings were then summarised into the handoff note inside the working fold...   «chat kept»
+ **Suggested improvement:** While any blind reader is running, write nothing about another reader's findings anywhere in the folder it reads — the handoff not...   «chat kept»
+ **Principle:** Blindness covers every copy and summary of a report, not only the report file; anything the reader can open is visible.   «chat kept»
+    «chat kept»
```

#### 239b25843 — .claude/skill-observations/log.md

Identity counts that differ:

- Observation numbers — ### Observation 850: step 1, chat 0; ### Observation 856: step 0, chat 1

```diff
@@ -3915 +3915 @@
- ### Observation 850: A key held down was never pressed by a keyboard walk — the reader found it   «step kept»
+ ### Observation 856: A key held down was never pressed by a keyboard walk — the reader found it   «chat wrote (in neither parent)»
@@ -3917,0 +3918 @@
+ **Renumbered:** written as 850 on the board-keys branch; renumbered 856 when main came in on 8 Nov 26 (851 and 852 were live, 853 to 855 held by other branches)   «chat wrote (in neither parent)»
```

#### 45a9c99b3 — .claude/skill-observations/log.md

Identity counts: all equal.

```diff
@@ -3953,0 +3954,13 @@
+ ### Observation 853: A handoff block's times were written from memory and were wrong twice in one night   «chat kept»
+    «chat kept»
+ **Status:** OPEN   «chat kept»
+ **Date:** 8 Nov 26   «chat kept»
+ **Session context:** Chat 3's pictures round (D1747), run unattended overnight; numbered past 852, which other open branches hold.   «chat kept»
+ **Skill:** session-handoff (and the overnight guide's "save the state at every step")   «chat kept»
+ **Type:** open-source   «chat kept»
+ **Phase/Area:** writing the progress lines of a handoff block during a long run   «chat kept»
+    «chat kept»
+ **Issue:** The block's progress lines carry a time each. Three were written as guesses and had to be corrected against the clock in a commit of their own; la...   «chat kept»
+ **Suggested improvement:** In the handoff guide's step that writes a progress line: take the time from the clock in the same command that writes it (the shel...   «chat kept»
+ **Principle:** A time in a record is a measured fact; read it from the clock or the commit at the moment of writing, the same as any other number a later rea...   «chat kept»
+    «chat kept»
@@ -3993,13 +4005,0 @@
- ### Observation 853: A handoff block's times were written from memory and were wrong twice in one night   «step kept»
-    «step kept»
- **Status:** OPEN   «step kept»
- **Date:** 8 Nov 26   «step kept»
- **Session context:** Chat 3's pictures round (D1747), run unattended overnight; numbered past 852, which other open branches hold.   «step kept»
- **Skill:** session-handoff (and the overnight guide's "save the state at every step")   «step kept»
- **Type:** open-source   «step kept»
- **Phase/Area:** writing the progress lines of a handoff block during a long run   «step kept»
-    «step kept»
- **Issue:** The block's progress lines carry a time each. Three were written as guesses and had to be corrected against the clock in a commit of their own; la...   «step kept»
- **Suggested improvement:** In the handoff guide's step that writes a progress line: take the time from the clock in the same command that writes it (the shel...   «step kept»
- **Principle:** A time in a record is a measured fact; read it from the clock or the commit at the moment of writing, the same as any other number a later rea...   «step kept»
-    «step kept»
```

#### 1264dc677 — raptor-port/docs/walk-ledger.md

Identity counts: all equal.

```diff
@@ -374 +373,0 @@
- | 2026-11-08 | The board's last two menus by the keys (the ⋯ beside the highlighter, the day bar's Templates — D1646), one board menu at a time, a held Enter...   «step kept»
@@ -375,0 +375 @@
+ | 2026-11-08 | The board's last two menus by the keys (the ⋯ beside the highlighter, the day bar's Templates — D1646), one board menu at a time, a held Enter...   «chat kept»
```

#### 321529dc5 — .claude/skill-observations/log.md

Identity counts: all equal.

```diff
@@ -3972,0 +3973,13 @@
+ ### Observation 859: A sweep for what a new ruling leaves behind missed the guides outside a hand-picked list   «chat kept»
+    «chat kept»
+ **Status:** OPEN   «chat kept»
+ **Date:** 8 Nov 26   «chat kept»
+ **Session context:** chat 2 recording his answers D1760–D1762 (who reads a plan and a guide change) and bringing older text in step (D201); numbered past 857...   «chat kept»
+ **Skill:** New skill candidate: ruling-sweep (the D201 step of recording a ruling)   «chat kept»
+ **Type:** open-source   «chat kept»
+ **Phase/Area:** finding every place an older rule is still stated   «chat kept»
+    «chat kept»
+ **Issue:** the sweep for "who reads a guide change" searched a hand-picked list of files (the rule files, the project guide, the bug-check order, the Codex g...   «chat kept»
+ **Suggested improvement:** the D201 sweep searches every Markdown file in the repo by the rule's subject (archives and full-text rulings excluded), not a lis...   «chat kept»
+ **Principle:** a search for stale statements of a rule must cover every place a rule can be written, chosen by the search itself, never by the writer's memor...   «chat kept»
+    «chat kept»
@@ -3986,13 +3998,0 @@
-    «step kept»
- ### Observation 859: A sweep for what a new ruling leaves behind missed the guides outside a hand-picked list   «step kept»
-    «step kept»
- **Status:** OPEN   «step kept»
- **Date:** 8 Nov 26   «step kept»
- **Session context:** chat 2 recording his answers D1760–D1762 (who reads a plan and a guide change) and bringing older text in step (D201); numbered past 857...   «step kept»
- **Skill:** New skill candidate: ruling-sweep (the D201 step of recording a ruling)   «step kept»
- **Type:** open-source   «step kept»
- **Phase/Area:** finding every place an older rule is still stated   «step kept»
-    «step kept»
- **Issue:** the sweep for "who reads a guide change" searched a hand-picked list of files (the rule files, the project guide, the bug-check order, the Codex g...   «step kept»
- **Suggested improvement:** the D201 sweep searches every Markdown file in the repo by the rule's subject (archives and full-text rulings excluded), not a lis...   «step kept»
- **Principle:** a search for stale statements of a rule must cover every place a rule can be written, chosen by the search itself, never by the writer's memor...   «step kept»
```

#### 4c43c8fdf — .claude/skill-observations/log.md

Identity counts: all equal.

```diff
@@ -4024,0 +4025,12 @@
+ ### Observation 858: A layout drawing made only at the owner's own screen width missed that the option breaks on smaller desktops   «chat kept»
+    «chat kept»
+ **Status:** OPEN   «chat kept»
+ **Date:** 8 Nov 26   «chat kept»
+ **Session context:** the pictures round (chat 3); his follow-up on question 8, "how would 8 look like for a smaller screen if i choose A". Numbered past 855–...   «chat kept»
+ **Skill:** brainstorming (`mockups-on-the-real-app.md`) and the pictures-round brief   «chat kept»
+ **Type:** open-source   «chat kept»
+ **Phase/Area:** drawing a layout change on the running app — which screen sizes to draw it at   «chat kept»
+    «chat kept»
+ **Issue:** A change that makes a table give up room for a side window was drawn only at the owner's PC width (1536) and his phone. It looked fine there. Aske...   «chat kept»
+ **Suggested improvement:** In the mock-up guide's rules for drawing a change that alters widths or makes room (a side panel, a window that pushes content, a ...   «chat kept»
+ **Principle:** A layout option is judged at the edges of the range it will run in, not only at the size of the person reviewing it. A fixed-width table that ...   «chat kept»
@@ -4038,13 +4049,0 @@
-    «step kept»
- ### Observation 858: A layout drawing made only at the owner's own screen width missed that the option breaks on smaller desktops   «step kept»
-    «step kept»
- **Status:** OPEN   «step kept»
- **Date:** 8 Nov 26   «step kept»
- **Session context:** the pictures round (chat 3); his follow-up on question 8, "how would 8 look like for a smaller screen if i choose A". Numbered past 855–...   «step kept»
- **Skill:** brainstorming (`mockups-on-the-real-app.md`) and the pictures-round brief   «step kept»
- **Type:** open-source   «step kept»
- **Phase/Area:** drawing a layout change on the running app — which screen sizes to draw it at   «step kept»
-    «step kept»
- **Issue:** A change that makes a table give up room for a side window was drawn only at the owner's PC width (1536) and his phone. It looked fine there. Aske...   «step kept»
- **Suggested improvement:** In the mock-up guide's rules for drawing a change that alters widths or makes room (a side panel, a window that pushes content, a ...   «step kept»
- **Principle:** A layout option is judged at the edges of the range it will run in, not only at the size of the person reviewing it. A fixed-width table that ...   «step kept»
```

#### ae71c90f2 — .claude/skill-observations/log.md

Identity counts: all equal.

```diff
@@ -4036,0 +4037 @@
+    «chat kept»
```

#### 377330417 — .claude/skill-observations/log.md

Identity counts: all equal.

```diff
@@ -4113 +4113 @@
- **Issue:** the starting session wrote "this chat is number 5" from its own reading of the handoff, but a parallel session had already given 5 to a build chat...   «step kept»
+ **Issue:** the starting session wrote "this chat is number 5" from its own reading of the handoff, but a parallel session had already given 5 to a build chat...   «chat wrote (in neither parent)»
```

#### d87d40766 — OUTSTANDING-ARCHIVE.md

Identity counts: all equal.

```diff
@@ -8003,13 +8002,0 @@
- *Moved here 2026-11-08 by backlog-archive.mjs ([LW-TWO-BOX-LETTERS]). Forward facts: `raptor-port/docs/handpass/2026-11-06-lw-cell-combos.md`, `raptor-port/d...   «step kept»
-    «step kept»
- ### [LW-TWO-BOX-LETTERS] Two boxes side by side clip three letters (found 25 Oct 26, the M3 build's FULL check, W2 30)   «step kept»
-    «step kept»
- A day holding two whole-day entries draws them side by side, each the full height (his D1167), each half about 10 px wide on   «step kept»
- a 26 px day; a three-letter code there ("FO*", "TRG", "CSE", "DTY") is clipped by its box ("O*", "RG" — picture   «step kept»
- `raptor-port/docs/img/handpass/2026-10-25-lw-m3-build/w2/f-30-cell-zoom.png`). Older than the M3 build (a course beside a   «step kept»
- leave did it), but common now: a weekend duty under Unavailable that earns OIL always shows its FO* beside it (D1357). How   «step kept»
- to draw it is his: options to draw for him — letters a step smaller and closer set; the letters stacked; the day's second   «step kept»
- entry as the "+1" corner when either code has three letters (narrowing D1167). Not built.   «step kept»
- **Overtaken 6 Nov 26 by D1727 (pull request 650):** two whole days stand side by side with their codes reading bottom to top, whole — checked by the pictures...   «step kept»
-    «step kept»
-    «step kept»
@@ -8029,0 +8017,12 @@
+ *Moved here 2026-11-08 by backlog-archive.mjs ([LW-TWO-BOX-LETTERS]). Forward facts: `raptor-port/docs/handpass/2026-11-06-lw-cell-combos.md`, `raptor-port/d...   «chat kept»
+    «chat kept»
+ ### [LW-TWO-BOX-LETTERS] Two boxes side by side clip three letters (found 25 Oct 26, the M3 build's FULL check, W2 30)   «chat kept»
+    «chat kept»
+ A day holding two whole-day entries draws them side by side, each the full height (his D1167), each half about 10 px wide on   «chat kept»
+ a 26 px day; a three-letter code there ("FO*", "TRG", "CSE", "DTY") is clipped by its box ("O*", "RG" — picture   «chat kept»
+ `raptor-port/docs/img/handpass/2026-10-25-lw-m3-build/w2/f-30-cell-zoom.png`). Older than the M3 build (a course beside a   «chat kept»
+ leave did it), but common now: a weekend duty under Unavailable that earns OIL always shows its FO* beside it (D1357). How   «chat kept»
+ to draw it is his: options to draw for him — letters a step smaller and closer set; the letters stacked; the day's second   «chat kept»
+ entry as the "+1" corner when either code has three letters (narrowing D1167). Not built.   «chat kept»
+ **Overtaken 6 Nov 26 by D1727 (pull request 650):** two whole days stand side by side with their codes reading bottom to top, whole — checked by the pictures...   «chat kept»
+    «chat kept»
```

#### 7009fe1f2 — raptor-port/docs/file-map.md

Identity counts: all equal.

```diff
@@ -3 +3 @@
- 8 Nov 26 on `claude/pr-oil-earn-ffbf07` (chat 5 — the pictures round's group 2: OIL Earn's day switch "No OIL earned", D1782; a tap on a puck that cannot ear...   «step kept»
+ 8 Nov 26 on `claude/pr-oil-earn-ffbf07` (chat 5 — the pictures round's group 2: OIL Earn's day switch "No OIL earned", D1782; a tap on a puck that cannot ear...   «chat wrote (in neither parent)»
```

#### 2474800d6 — OUTSTANDING-ARCHIVE.md

Identity counts: all equal.

```diff
@@ -8016 +8015,0 @@
-    «step kept»
```

#### 68be77639 — .claude/skill-observations/log.md

Identity counts: all equal.

```diff
@@ -4103,0 +4104,14 @@
+ ### Observation 866: A "nothing happened" check that reads a value which is never set passes whatever the app does   «chat kept»
+    «chat kept»
+ **Status:** OPEN   «chat kept»
+ **Date:** 2026-11-08   «chat kept»
+ **Session context:** chat 5, `claude/pr-oil-earn-ffbf07` — OIL Earn on the Scheduler Board (D1783: a tap on a puck that cannot earn picks nothing). Numbered ...   «chat kept»
+ **Skill:** New skill candidate: none — the walk-script and drawing-check method (`raptor-port/docs/walk-scripts.md`, `raptor-port/scripts/drawcheck/`), and t...   «chat kept»
+ **Type:** open-source   «chat kept»
+ **Phase/Area:** writing an assertion that something did NOT happen (nobody picked, no window opened)   «chat kept»
+    «chat kept»
+ **Issue:** Two checks in one job proved "nothing happened" by reading something that never changes. (1) The drawing check's "the tap picked nobody" step read...   «chat kept»
+ **Suggested improvement:** In `walk-scripts.md`'s rules for a step's assertion, and in the bug-check order §8: every assertion of absence ("nothing picked", ...   «chat kept»
+ **Principle:** A check that something did not happen is only evidence if the same check, run where it did happen, says so; run the positive case once before ...   «chat kept»
+ Met again 8 Nov 26 (chat 5, the host's re-walk): a press made by screen position on a switch scrolled off screen landed on nothing, so the check failed on th...   «chat kept»
+    «chat kept»
@@ -4130,14 +4143,0 @@
-    «step kept»
- ### Observation 866: A "nothing happened" check that reads a value which is never set passes whatever the app does   «step kept»
-    «step kept»
- **Status:** OPEN   «step kept»
- **Date:** 2026-11-08   «step kept»
- **Session context:** chat 5, `claude/pr-oil-earn-ffbf07` — OIL Earn on the Scheduler Board (D1783: a tap on a puck that cannot earn picks nothing). Numbered ...   «step kept»
- **Skill:** New skill candidate: none — the walk-script and drawing-check method (`raptor-port/docs/walk-scripts.md`, `raptor-port/scripts/drawcheck/`), and t...   «step kept»
- **Type:** open-source   «step kept»
- **Phase/Area:** writing an assertion that something did NOT happen (nobody picked, no window opened)   «step kept»
-    «step kept»
- **Issue:** Two checks in one job proved "nothing happened" by reading something that never changes. (1) The drawing check's "the tap picked nobody" step read...   «step kept»
- **Suggested improvement:** In `walk-scripts.md`'s rules for a step's assertion, and in the bug-check order §8: every assertion of absence ("nothing picked", ...   «step kept»
- **Principle:** A check that something did not happen is only evidence if the same check, run where it did happen, says so; run the positive case once before ...   «step kept»
- Met again 8 Nov 26 (chat 5, the host's re-walk): a press made by screen position on a switch scrolled off screen landed on nothing, so the check failed on th...   «step kept»
```

#### 68be77639 — HANDOFF.md

Identity counts: all equal.

```diff
@@ -36 +36 @@
- - **THE CLOSE (8 Nov 26 ~12:30, after the fifth compaction ~12:00; state re-read).** The build of `7009fe1f2` (main merged in) re-walked by the host — `rapto...   «step kept»
+ - **THE CLOSE (8 Nov 26 ~12:30, after the fifth compaction ~12:00; state re-read).** The build of `7009fe1f2` (main merged in) re-walked by the host — `rapto...   «chat wrote (in neither parent)»
```

#### adee1d199 — HANDOFF.md

Identity counts that differ:

- D-numbers — D1787: step 14, chat 6; D1792: step 6, chat 5; D1840: step 3, chat 6; D1849: step 3, chat 2; D910: step 1, chat 0; D1625: step 1, chat 0; D1424: step 1, chat 0; D1495: step 3, chat 0; D727: step 1, chat 0; D729: step 2, chat 0; D1300: step 2, chat 0; D860: step 1, chat 0; … 4 more

```diff
@@ -25,16 +25,6 @@
- - **The job** (started by chat 3): build group 5 of `raptor-port/docs/superpowers/plans/2026-11-08-pictures-round-build.md` — [INP-ADD-RIGHT] and my part of ...   «step kept»
- - **Read done:** the plan, D1787 and D1792 full rows, `notes-sched.md` Q4, `notes-marks.md` §3 (b), the page's Q8 and "On a smaller screen", `q-sched-measure...   «step kept»
- - **The build plan (my technical calls):** (1) `src/ui/InputsPage.tsx` `listTools` (~line 662): on a desktop the dates button first, a spring, then `#inNew` ...   «step kept»
- - **Then:** bug check by `raptor-port/docs/bug-check-checklist.md` (tier, roll-call, Sonnet walk with the plain-user round, gates), Astra + a fresh blind Opu...   «step kept»
- - **BUILT (8 Nov 26, committed):** steps (1)–(4) exactly as above — `InputsPage.tsx` (`newBtn`, `listTools`, `room` → `in-room`), `06-inputs.css` (the two me...   «step kept»
- - **Done since:** (a) the browser test, `e2e/inputs-calendar.spec.ts` "D1787" (6 tests: 1536, 1340, 1280, 1024, 821, the phone) — 6 passed, port 4377, under ...   «step kept»
- - **State (8 Nov 26, after the compaction at about 08:20; saved again 09:10 at 75%):** pull request **676** open into `main` (Auto-fix off, nothing watching)...   «step kept»
- - **Drawing check, 09:25 (80% full):** part list written, `raptor-port/scripts/drawcheck/specs/inp-add-right.mjs` (8 states: list, list open at 1536, 1024 an...   «step kept»
- - **At 87% (09:40), saved for the compaction — the readers are BOTH back; the walker is still running (it reports to this chat).** The drawing check's 8 draw...   «step kept»
- - **Vercel is rate-limiting previews (chat 3, 8 Nov 26 ~08:36: about 144 deployments in 24 hours):** push ONCE, everything batched; before giving him the lin...   «step kept»
- - **The bug check is DONE (8 Nov 26, committed and pushed once, the commit before this one).** The walker's table, the dragged-window fault both readers foun...   «step kept»
- - **Compacted a second time about 09:05; state re-read.** Since: the picture for Q1 (`raptor-port/docs/img/handpass/2026-11-08-chat7-inputs/q1-mock.mjs`, `q1...   «step kept»
- - **Waiting on him — his look:** https://claude.ai/artifact/14FMTxfkU37UZPcGPrpUQw (the row, the room at 1536, dragged away, 1280 covered, the marks, Q1). (1...   «step kept»
- - **Vercel REFUSED the preview of the pushed commit:** "Deployment rate limited — retry in 24 hours" (over 100 deployments in 24 hours across the chats). The...   «step kept»
- - **Context:** about 76% at this save; the job is at its end — the next chat, if any, starts from this block. **Skill notes:** 864 (the auto-loaded rulings f...   «step kept»
- - **Rulings:** none this session. **Reads owed:** none — Astra and a fresh, blind Opus both read the code. **Lessons added:** none.   «step kept»
+ - **The job** (started by chat 3): group 5 of `raptor-port/docs/superpowers/plans/2026-11-08-pictures-round-build.md` — [INP-ADD-RIGHT] (D1787) and my part o...   «chat wrote (in neither parent)»
+ - **Built and bug-checked (8 Nov 26):** "+ Input" at the list row's right end; the room for the input window from 1340 (`in-room`, `06-inputs.css`, only whil...   «chat wrote (in neither parent)»
+ - **His look, 8 Nov 26 ("all as recommended"):** **D1840** — Type narrows to 124 from 821 to 1099 wide with no window (Remarks 57 → 93 at 821, every word who...   «chat wrote (in neither parent)»
+ - **Compacted a third time, about 10:30; state re-read.** `main` brought in (the app's sync, 8 Nov 26; four note files clashed — the skill log, this file, th...   «chat wrote (in neither parent)»
+ - **Next, in order:** push once (no run of the branch in progress); GitHub's run green on that commit and its Vercel preview Ready; then, under **D1795** (ch...   «chat wrote (in neither parent)»
+ - **Context:** about 80% at this save. **Skill notes:** 864, 865 (865 met again 8 Nov 26). **Rulings:** D1840, D1841 → `inputs.md` (homes `ui-contracts.md`, ...   «chat wrote (in neither parent)»
```

#### f142d848c — .claude/skill-observations/log.md

Identity counts that differ:

- Observation numbers — ### Observation 864: step 1, chat 0; ### Observation 872: step 0, chat 1

```diff
@@ -4131 +4131 @@
- ### Observation 864: A chat number given in a starting brief was already taken   «step kept»
+ ### Observation 872: A chat number given in a starting brief was already taken   «chat wrote (in neither parent)»
@@ -4140 +4140 @@
- **Issue:** the starting session wrote "this chat is number 5" from its own reading of the handoff, but a parallel session had already given 5 to a build chat...   «step kept»
+ **Issue:** the starting session wrote "this chat is number 5" from its own reading of the handoff, but a parallel session had already given 5 to a build chat...   «chat wrote (in neither parent)»
```

#### f142d848c — HANDOFF.md

Identity counts that differ:

- D-numbers — D1737: step 3, chat 2; D1795: step 7, chat 8; D1794: step 2, chat 3

```diff
@@ -26 +26 @@
- - **Where it stands (8 Nov 26):** `.claude/rules/decisions/oil.md` is a page; the trial of the whole route ran clean on a scratch copy; the account by requir...   «step kept»
+ - **Where it stands (8 Nov 26):** `.claude/rules/decisions/oil.md` is a page; the trial of the whole route ran clean on a scratch copy; the account by requir...   «chat wrote (in neither parent)»
```

#### 6698140d6 — HANDOFF.md

Identity counts: all equal.

```diff
@@ -28 +28 @@
- - **Compacted a third time, about 10:30; state re-read.** `main` brought in (the app's sync, 8 Nov 26; four note files clashed — the skill log, this file, th...   «step kept»
+ - **Compacted a third time, about 10:30; state re-read.** `main` brought in (the app's sync, 8 Nov 26; four note files clashed — the skill log, this file, th...   «chat wrote (in neither parent)»
```

#### 2588688b7 — HANDOFF.md

Identity counts that differ:

- D-numbers — D1810: step 3, chat 4; D1819: step 3, chat 4

```diff
@@ -33,4 +33,4 @@
- - **THE READS LANDED (8 Nov 26 ~10:45, after the fourth compaction ~10:30; state re-read).** Copied whole: `raptor-port/docs/superpowers/briefs/2026-11-08-oi...   «step kept»
- - **ALL READS DISPOSED (8 Nov 26 ~11:20).** F2 FIXED red-first (`140727d5f`): `.lgmix` joins `routeClick`'s blank-click controls (`interactions.ts`), so a pr...   «step kept»
- - **~11:45 (chat ~90% full — the app may compact):** `main` MERGED IN (`7009fe1f2`; level; it brought chat 6's engine change, none of my files; file-map and ...   «step kept»
- - **THE CLOSE (8 Nov 26 ~12:30, after the fifth compaction ~12:00; state re-read).** The build of `7009fe1f2` (main merged in) re-walked by the host — `rapto...   «step kept»
+ - **THE READS LANDED (8 Nov 26 ~10:25, after the fourth compaction; state re-read).** Copied whole: `raptor-port/docs/superpowers/briefs/2026-11-08-oil-earn-...   «chat wrote (in neither parent)»
+ - **ALL READS DISPOSED (8 Nov 26 ~10:37).** F2 FIXED red-first (`140727d5f`): `.lgmix` joins `routeClick`'s blank-click controls (`interactions.ts`), so a pr...   «chat wrote (in neither parent)»
+ - **~10:40 (chat ~90% full — the app may compact):** `main` MERGED IN (`7009fe1f2`; level; it brought chat 6's engine change, none of my files; file-map and ...   «chat wrote (in neither parent)»
+ - **THE CLOSE (8 Nov 26 ~10:55, after the fifth compaction; state re-read).** The build of `7009fe1f2` (main merged in) re-walked by the host — `raptor-port/...   «chat wrote (in neither parent)»
```

#### ab43e7413 — DECISIONS-ARCHIVE.md

Identity counts: all equal.

```diff
@@ -386,16 +385,0 @@
- | D86 | 23 Sep 26 | **SPENT 7 Nov 26 — the two chats of the 23 Sep re-test ran; one lock for every chat's full checks is D228's.** *"Or i can run the tracker...   «step kept»
- | D602 | 6 Oct 26 | **SPENT 7 Nov 26 — both steps done: the crew-rest fault fixed, and the start-load measure and cut made ([CONTEXT-START-SIZE], D969–D971; ...   «step kept»
- | D832 | 13 Oct 26 | **SPENT 7 Nov 26 — the draft was read and its wording approved (D836).** Told that no outside writing skill is worth installing and that...   «step kept»
- | D972 | 17 Oct 26 | **SPENT 7 Nov 26 — the capitals sweep ([CAPS-SWEEP]) is done and archived.** *"I'm also thinking after this job where else did we write ...   «step kept»
- | D973 | 17 Oct 26 | **SPENT 7 Nov 26 — the capitals sweep ([CAPS-SWEEP]) is done and archived.** *"Yes agreeed"* — to the recommendation after the capitals ...   «step kept»
- | D974 | 17 Oct 26 | **SPENT 7 Nov 26 — a one-off for the start-size job's six commits; nothing more to do.** *"Keep them"* — to "keep these document changes...   «step kept»
- | D1556 | 2 Nov 26 | **SPENT 7 Nov 26 — the three drafts were moved, read and merged live.** *"Yes all three"* — his answer, after "show me first", to the th...   «step kept»
- | D1566 | 2 Nov 26 | **SPENT 7 Nov 26 — pull request 611 merged; the drawing check stays a standing step (D1495).** *"As recommended"* — his answer to the ye...   «step kept»
- | D1659 | 5 Nov 26 | **SPENT 7 Nov 26 — pull request 636 merged; the drawing check stays a standing step (D1495).** *"My fade looks good. The rest as recomme...   «step kept»
- | D1736 | 7 Nov 26 | **SPENT 7 Nov 26 — the plan's steps 1 and 2 landed (pull requests 656 and 657), as its own text says.** *"As recommended"* — his answer,...   «step kept»
- | D775 | 12 Oct 26 | **SPENT 7 Nov 26 — both tidy-ups done: [LW-ROWS-SPLIT] 13 Oct 26, [TRK-FILE-TRANSFER-SPLIT] 17 Oct 26.** Asked whether the Tracker's and...   «step kept»
-    «step kept»
- ## Moved 8 Nov 26   «step kept»
-    «step kept»
- | # | Date | His ruling, in his words where short enough | What it means | Where it lives now |   «step kept»
- |---|---|---|---|---|   «step kept»
@@ -409,0 +394,11 @@
+ | D1736 | 7 Nov 26 | **SPENT 7 Nov 26 — the plan's steps 1 and 2 landed (pull requests 656 and 657), as its own text says.** *"As recommended"* — his answer,...   «chat kept»
+ | D1659 | 5 Nov 26 | **SPENT 7 Nov 26 — pull request 636 merged; the drawing check stays a standing step (D1495).** *"My fade looks good. The rest as recomme...   «chat kept»
+ | D1566 | 2 Nov 26 | **SPENT 7 Nov 26 — pull request 611 merged; the drawing check stays a standing step (D1495).** *"As recommended"* — his answer to the ye...   «chat kept»
+ | D1556 | 2 Nov 26 | **SPENT 7 Nov 26 — the three drafts were moved, read and merged live.** *"Yes all three"* — his answer, after "show me first", to the th...   «chat kept»
+ | D974 | 17 Oct 26 | **SPENT 7 Nov 26 — a one-off for the start-size job's six commits; nothing more to do.** *"Keep them"* — to "keep these document changes...   «chat kept»
+ | D973 | 17 Oct 26 | **SPENT 7 Nov 26 — the capitals sweep ([CAPS-SWEEP]) is done and archived.** *"Yes agreeed"* — to the recommendation after the capitals ...   «chat kept»
+ | D972 | 17 Oct 26 | **SPENT 7 Nov 26 — the capitals sweep ([CAPS-SWEEP]) is done and archived.** *"I'm also thinking after this job where else did we write ...   «chat kept»
+ | D832 | 13 Oct 26 | **SPENT 7 Nov 26 — the draft was read and its wording approved (D836).** Told that no outside writing skill is worth installing and that...   «chat kept»
+ | D775 | 12 Oct 26 | **SPENT 7 Nov 26 — both tidy-ups done: [LW-ROWS-SPLIT] 13 Oct 26, [TRK-FILE-TRANSFER-SPLIT] 17 Oct 26.** Asked whether the Tracker's and...   «chat kept»
+ | D602 | 6 Oct 26 | **SPENT 7 Nov 26 — both steps done: the crew-rest fault fixed, and the start-load measure and cut made ([CONTEXT-START-SIZE], D969–D971; ...   «chat kept»
+ | D86 | 23 Sep 26 | **SPENT 7 Nov 26 — the two chats of the 23 Sep re-test ran; one lock for every chat's full checks is D228's.** *"Or i can run the tracker...   «chat kept»
```

#### 031288dc8 — HANDOFF.md

Identity counts that differ:

- D-numbers — D1795: step 3, chat 4; D1796: step 0, chat 1

```diff
@@ -24,2 +24,2 @@
- ### CHAT 13 — the pictures round's group 3, the schedule's marks and words (D1784, D1785, D1792 a, d) — PLANNED, build not started; written 8 Nov 26 — verify...   «step kept»
- - **Waiting on:** pull request 679 (chat 5, OIL Earn on the board) — it changes `ui/board.ts`, `ui/board-html.ts`, `ui/html.ts`; the build starts only once i...   «step kept»
+ ### CHAT 13 — the pictures round's group 3, the schedule's marks and words (D1784, D1785, D1792 a, d) — BUILDING; written 8 Nov 26 — verify before use   «chat wrote (in neither parent)»
+ - **Pull request 679 merged; `main` brought in.** Astra designed the scenarios (32): `raptor-port/docs/handpass/parts/2026-11-08-sched-marks-scenarios.md`; i...   «chat wrote (in neither parent)»
@@ -29 +29 @@
- - **Next:** build (helper) → open the pull request → roll-call, sizing, scenarios by Astra → Sonnet walk with the plain-user round → drawing check (a part li...   «step kept»
+ - **Next:** build (helper) → open the pull request → roll-call, sizing, scenarios by Astra → Sonnet walk with the plain-user round → drawing check (a part li...   «chat wrote (in neither parent)»
```

#### 7c00f7b1c — HANDOFF.md

Identity counts: all equal.

```diff
@@ -31 +31 @@
- - **Chat numbers (D1744):** this is chat 4; the next free number is 5.   «step kept»
+ - **Chat numbers (D1744):** this is chat 4; 5 to 14 were taken by later chats — read the open chats' titles for the next free one.   «chat wrote (in neither parent)»
```

#### 18487fc2e — .claude/skill-observations/log.md

Identity counts that differ:

- Observation numbers — ### Observation 874: step 1, chat 0; ### Observation 877: step 0, chat 1

```diff
@@ -4176 +4176 @@
- **Session context:** chat 9, the Tracker's group 7 — the drawing check run by a background helper while the host fixed the readers' findings (numbered past 8...   «step kept»
+ **Session context:** chat 9, the Tracker's group 7 — the drawing check run by a background helper while the host fixed the readers' findings (numbered past 8...   «chat wrote (in neither parent)»
@@ -4189 +4189 @@
- **Session context:** chat 10, the Tracker's group 7 — fixing the one red browser check chat 9 left (a double-click during the chart's slide); 872 is taken on...   «step kept»
+ **Session context:** chat 10, the Tracker's group 7 — fixing the one red browser check chat 9 left (a double-click during the chart's slide); 872 is taken on...   «chat wrote (in neither parent)»
@@ -4198 +4198 @@
- ### Observation 874: A merge approval relayed in another session's brief is refused by the safety check — the merging chat needs his word typed there   «step kept»
+ ### Observation 877: A merge approval relayed in another session's brief is refused by the safety check — the merging chat needs his word typed there   «chat wrote (in neither parent)»
@@ -4202 +4202 @@
- **Session context:** Chat 10, a side session started by chat 9 to fix the Tracker's last red check and carry chat 9's "merge live" through to the live app   «step kept»
+ **Session context:** Chat 10, a side session started by chat 9 to fix the Tracker's last red check and carry chat 9's "merge live" through to the live app (w...   «chat wrote (in neither parent)»
```

#### 18487fc2e — HANDOFF.md

Identity counts that differ:

- D-numbers — D1744: step 4, chat 3; D1860: step 2, chat 1; D1869: step 3, chat 2; D1640: step 1, chat 0; D1795: step 4, chat 3; D1794: step 2, chat 1; D1090: step 2, chat 0

```diff
@@ -24,9 +24,5 @@
- ### `claude/pr-tracker-787259` — CHAT 10 (D1744; took over chat 9's job): the pictures round's group 7, the Tracker; written 8 Nov 26 — verify before use   «step kept»
- - **The job** (started by chat 3, plan `raptor-port/docs/superpowers/plans/2026-11-08-pictures-round-build.md` item 7; built, walked and read by chat 9): D17...   «step kept»
- - **HIS "MERGE LIVE" WAS GIVEN IN CHAT 9, 8 Nov 26 ~10:35, typed by him** (D1640: his look is done — never ask him again; D1795 too). Carry it the whole way:...   «step kept»
- - **Chat 10 fixed the one red check** (the Tracker smoke's double-click pin). Cause, probed frame by frame: each event's invisible press circle is drawn with...   «step kept»
- - **`main` brought in** (local merge, chat 10): both sides kept in this file, `file-map.md`, `OUTSTANDING-ARCHIVE.md` and the skill log; `docsize` OK.   «step kept»
- - **State when written (chat 10, 11:40, after a compaction at about 11:35):** pushed once (b348f7bdc, level with `main` cd8a5dd67 at 11:38), pull request 687...   «step kept»
- - **Follow-ups, not this job's:** [TRK-KEPT-COPIES], [TRK-NOSTORE-SAVED]; S30 Restore's keyboard ring is the browser's own; S9 the window does not follow a w...   «step kept»
- - **Push only as** `git push origin claude/pr-tracker-787259:refs/heads/claude/pr-tracker-787259` (its upstream checked: `refs/heads/claude/pr-tracker-787259`).   «step kept»
- - **Rulings:** none (chats 9 and 10).   «step kept»
+ ### CHAT 10 (took over chat 9's job) — the pictures round's group 7, the Tracker — MERGED 8 Nov 26 (pull request 687, on his "merge live" typed in chat 10; c...   «chat wrote (in neither parent)»
+ - **Live:** D1790 (the marking window: where it would not fit under the event, the chart slides the event up under the tabs and the window opens whole 4px un...   «chat wrote (in neither parent)»
+ - **Filed, open:** [TRK-POP-ASKED] (the two questions put to him 8 Nov 26 — the typed marks in two messages, F8, and the short-screen placement, Astra's read...   «chat wrote (in neither parent)»
+ - **Rulings:** none (chats 9 and 10). Skill notes 875–877 (renumbered when `main` was brought in).   «chat wrote (in neither parent)»
+ - **Remove this block at the next handoff** — nothing else is open from chat 10.   «chat wrote (in neither parent)»
```

#### 0db7d583b — .claude/skill-observations/log.md

Identity counts: all equal.

```diff
@@ -4159,13 +4158,0 @@
- ### Observation 873: Time stamps written into a handoff from the agent's sense of elapsed time ran up to two hours ahead of the clock   «step kept»
-    «step kept»
- **Status:** OPEN   «step kept»
- **Date:** 2026-11-08   «step kept»
- **Session context:** chat 5, `claude/pr-oil-earn-ffbf07` — the close of OIL Earn on the board, across five compactions   «step kept»
- **Skill:** session-handoff   «step kept»
- **Type:** open-source   «step kept»
- **Phase/Area:** writing the "where it stands" lines of a handoff block as the work goes on   «step kept»
-    «step kept»
- **Issue:** Each line the chat added to its handoff block carried a time ("~11:20", "~12:30", "~12:45"), written from a feel for how long the work had taken. ...   «step kept»
- **Suggested improvement:** In the handoff step (and wherever a record takes a time): read the clock (`date`) or the commit's own time before writing a time, ...   «step kept»
- **Principle:** An agent has no reliable sense of elapsed time, least of all across a context reset; any time written into a record is read from a clock or le...   «step kept»
-    «step kept»
@@ -4198,0 +4186,12 @@
+ ### Observation 873: Time stamps written into a handoff from the agent's sense of elapsed time ran up to two hours ahead of the clock   «chat kept»
+    «chat kept»
+ **Status:** OPEN   «chat kept»
+ **Date:** 2026-11-08   «chat kept»
+ **Session context:** chat 5, `claude/pr-oil-earn-ffbf07` — the close of OIL Earn on the board, across five compactions   «chat kept»
+ **Skill:** session-handoff   «chat kept»
+ **Type:** open-source   «chat kept»
+ **Phase/Area:** writing the "where it stands" lines of a handoff block as the work goes on   «chat kept»
+    «chat kept»
+ **Issue:** Each line the chat added to its handoff block carried a time ("~11:20", "~12:30", "~12:45"), written from a feel for how long the work had taken. ...   «chat kept»
+ **Suggested improvement:** In the handoff step (and wherever a record takes a time): read the clock (`date`) or the commit's own time before writing a time, ...   «chat kept»
+ **Principle:** An agent has no reliable sense of elapsed time, least of all across a context reset; any time written into a record is read from a clock or le...   «chat kept»
```

#### 0db7d583b — HANDOFF.md

Identity counts: all equal.

```diff
@@ -32 +31,0 @@
- <!-- /now -->   «step kept»
```

#### a4d23f2fa — HANDOFF.md

Identity counts: all equal.

```diff
@@ -27 +27 @@
- - **Rulings:** none (chats 9 and 10). Skill notes 875–877 (renumbered when `main` was brought in).   «step kept»
+ - **Rulings:** none (chats 9 and 10). Skill notes 876–878 (renumbered when `main` was brought in).   «chat wrote (in neither parent)»
```

#### b1edcf82b — .claude/skill-observations/log.md

Identity counts: all equal.

```diff
@@ -4215 +4215 @@
- **Session context:** chat 15, the rules diet's step 5a on the IT flow guide — two blind readers checked that a rewritten rules page still carried every part ...   «step kept»
+ **Session context:** chat 15, the rules diet's step 5a on the IT flow guide — two blind readers checked that a rewritten rules page still carried every part ...   «chat wrote (in neither parent)»
```

#### 7d403d12c — raptor-port/docs/file-map.md

Identity counts: all equal.

```diff
@@ -4 +3,0 @@
-    «step kept»
```

#### b8011e768 — HANDOFF.md

Identity counts that differ:

- D-numbers — D151: step 3, chat 2

```diff
@@ -26 +26 @@
- - **Pull request 691** opened into `main`, level with it at `7d403d12c` (Auto-fix switched off, D1090); its GitHub run started there — the roll-call (27 rows...   «step kept»
+ - **Pull request 691** open into `main` (Auto-fix switched off, D1090); `main` moved on (pull request 690, the rules diet's step 5a) and the clash in this fi...   «chat wrote (in neither parent)»
```

#### 1c8650133 — .claude/skill-observations/log.md

Identity counts: all equal.

```diff
@@ -4199,0 +4200,13 @@
+ ### Observation 880: Red first for a style-only fix, in the same lock turn as the green run   «chat wrote (in neither parent)»
+    «chat kept»
+ **Status:** OPEN   «chat kept»
+ **Date:** 8 Nov 26   «chat kept»
+ **Session context:** chat 7, the D1843 build (a line round the desktop Inputs list, "No document" inside its column) — a two-rule stylesheet change, its brow...   «chat kept»
+ **Skill:** test-driven-development   «chat kept»
+ **Type:** open-source   «chat kept»
+ **Phase/Area:** RED — watching the test fail, when the build is shared and taken in turns   «chat kept»
+    «chat kept»
+ **Issue:** the fix was already written and committed when the test was, and every browser run rebuilds the app under one lock shared with other chats; showin...   «chat kept»
+ **Suggested improvement:** in the skill's RED section, a short case: "code written before the test" — reverse-apply the fix's own diff to get the old behavio...   «chat kept»
+ **Principle:** when the fix came first, recreate the old behaviour by taking back only the fix's own diff — never by checking out an older file — prove the t...   «chat kept»
+    «chat kept»
@@ -4252,14 +4264,0 @@
-    «step kept»
- ### Observation 880: Red first for a style-only fix, in the same lock turn as the green run   «step wrote»
-    «step kept»
- **Status:** OPEN   «step kept»
- **Date:** 8 Nov 26   «step kept»
- **Session context:** chat 7, the D1843 build (a line round the desktop Inputs list, "No document" inside its column) — a two-rule stylesheet change, its brow...   «step kept»
- **Skill:** test-driven-development   «step kept»
- **Type:** open-source   «step kept»
- **Phase/Area:** RED — watching the test fail, when the build is shared and taken in turns   «step kept»
-    «step kept»
- **Issue:** the fix was already written and committed when the test was, and every browser run rebuilds the app under one lock shared with other chats; showin...   «step kept»
- **Suggested improvement:** in the skill's RED section, a short case: "code written before the test" — reverse-apply the fix's own diff to get the old behavio...   «step kept»
- **Principle:** when the fix came first, recreate the old behaviour by taking back only the fix's own diff — never by checking out an older file — prove the t...   «step kept»
-    «step kept»
```

#### 1c8650133 — HANDOFF.md

Identity counts: all equal.

```diff
@@ -32 +32 @@
- - **Compacted a fifth time, about 12:35; state re-read.** **D1843 BUILT AND CHECKED (8 Nov 26 ~13:30):** `#intbl{box-shadow:0 0 0 1px var(--edge)}` and `.ina...   «step kept»
+ - **Compacted a fifth time, about 12:35; state re-read.** **D1843 BUILT AND CHECKED (8 Nov 26 ~13:30):** `#intbl{box-shadow:0 0 0 1px var(--edge)}` and `.ina...   «chat wrote (in neither parent)»
```

#### e0b0b0d36 — .claude/skill-observations/log.md

Identity counts: all equal.

```diff
@@ -4171,0 +4172,20 @@
+ ### Observation 875: A drawing with recorded figures but no part list — measure the build with the drawing script's own measure   «chat kept»
+    «chat kept»
+ **Status:** OPEN   «chat kept»
+ **Date:** 8 Nov 26   «chat kept»
+ **Session context:** chat 11, the board's layout (D1780, D1781) — the drawing check; numbered past 873, held on another branch (Numbered 875 at the rebase on...   «chat kept»
+ **Skill:** New skill candidate: drawing-check-from-figures (or a section of `raptor-port/docs/walk-scripts.md` §10)   «chat kept»
+ **Type:** open-source   «chat kept»
+ **Phase/Area:** the drawing check before the walk (bug-check order §7.0, §7.10)   «chat kept»
+    «chat kept»
+ **Issue:** The approved drawings had been made by a script that measured each drawn option and saved the figures (line   «chat kept»
+ heights, widths, what was cut) to a file, but no part list existed for the standing drawing-check tool. Writing a part   «chat kept»
+ list first would have cost a separate job; instead the build was measured with the drawing script's own measuring   «chat kept»
+ function, copied whole, and compared figure by figure (78 figures, 2px). It caught nothing false and named the one real   «chat kept»
+ difference — a state the drawing showed scrolled while the build, rightly, does not scroll.   «chat kept»
+ **Suggested improvement:** In the walk-scripts guide's drawing-check section, add: where a drawing was produced by a   «chat kept»
+ script that saved its measured figures, the drawing check may reuse that script's measure (copied whole, never   «chat kept»
+ rewritten) against the saved figures, in place of building a part list first; each difference is still named.   «chat kept»
+ **Principle:** When a design was drawn by code that measured itself, compare the build with the same measuring code —   «chat kept»
+ the same ruler on both sides removes a whole class of false differences.   «chat kept»
+    «chat kept»
@@ -4223,21 +4242,0 @@
-    «step kept»
- ### Observation 875: A drawing with recorded figures but no part list — measure the build with the drawing script's own measure   «step kept»
-    «step kept»
- **Status:** OPEN   «step kept»
- **Date:** 8 Nov 26   «step kept»
- **Session context:** chat 11, the board's layout (D1780, D1781) — the drawing check; numbered past 873, held on another branch (Numbered 875 at the rebase on...   «step kept»
- **Skill:** New skill candidate: drawing-check-from-figures (or a section of `raptor-port/docs/walk-scripts.md` §10)   «step kept»
- **Type:** open-source   «step kept»
- **Phase/Area:** the drawing check before the walk (bug-check order §7.0, §7.10)   «step kept»
-    «step kept»
- **Issue:** The approved drawings had been made by a script that measured each drawn option and saved the figures (line   «step kept»
- heights, widths, what was cut) to a file, but no part list existed for the standing drawing-check tool. Writing a part   «step kept»
- list first would have cost a separate job; instead the build was measured with the drawing script's own measuring   «step kept»
- function, copied whole, and compared figure by figure (78 figures, 2px). It caught nothing false and named the one real   «step kept»
- difference — a state the drawing showed scrolled while the build, rightly, does not scroll.   «step kept»
- **Suggested improvement:** In the walk-scripts guide's drawing-check section, add: where a drawing was produced by a   «step kept»
- script that saved its measured figures, the drawing check may reuse that script's measure (copied whole, never   «step kept»
- rewritten) against the saved figures, in place of building a part list first; each difference is still named.   «step kept»
- **Principle:** When a design was drawn by code that measured itself, compare the build with the same measuring code —   «step kept»
- the same ruler on both sides removes a whole class of false differences.   «step kept»
-    «step kept»
```

#### e0b0b0d36 — raptor-port/docs/file-map.md

Identity counts: all equal.

```diff
@@ -4 +3,0 @@
-    «step kept»
```

#### 110b3a2c2 — .claude/skill-observations/log.md

Identity counts that differ:

- Observation numbers — ### Observation 874: step 1, chat 0; ### Observation 881: step 0, chat 1

```diff
@@ -4224 +4224 @@
- ### Observation 874: Times written into a handoff after a compaction came from the summary, not the clock   «step kept»
+ ### Observation 881: Times written into a handoff after a compaction came from the summary, not the clock   «chat wrote (in neither parent)»
@@ -4228 +4228 @@
- **Session context:** chat 14, [LW-PIN-LAST-FRAME] — saving the state at 90% full, just after a compaction (numbered past 873, held on another branch)   «step kept»
+ **Session context:** chat 14, [LW-PIN-LAST-FRAME] — saving the state at 90% full, just after a compaction (numbered past 873, held on another branch; renumbe...   «chat wrote (in neither parent)»
```

#### 110b3a2c2 — HANDOFF.md

Identity counts that differ:

- D-numbers — D1789: step 2, chat 3

```diff
@@ -30 +30 @@
- - **State at this write (8 Nov 26 ~05:20Z by the PC clock; two compactions so far; committed locally, NOT pushed — nothing pushed since 22caf4ca9; last commi...   «step kept»
+ - **State at this write (8 Nov 26 05:34Z by the PC clock; three compactions so far, the third ~05:30Z; `main` brought in at 05:34Z — four notes clashes settl...   «chat wrote (in neither parent)»
```

#### 110b3a2c2 — raptor-port/docs/file-map.md

Identity counts that differ:

- D-numbers — D1789: step 1, chat 2; D1870: step 0, chat 2

```diff
@@ -3 +3 @@
- 8 Nov 26 on `claude/lw-pin-last-frame` (chat 14 — [LW-PIN-LAST-FRAME], his D1850: a PROTOTYPE, measured, not for keeps until he answers). **New:** `scripts/h...   «step kept»
+ 8 Nov 26 on `claude/lw-pin-last-frame` (chat 14 — [LW-PIN-LAST-FRAME], his D1850: the prototype, measured; built for keeps by chat 16 on his D1870). **New:**...   «chat wrote (in neither parent)»
```

#### 1b3661f7e — .claude/skill-observations/log.md

Identity counts: all equal.

```diff
@@ -4199,0 +4200,14 @@
+ ### Observation 880: Red first for a style-only fix, in the same lock turn as the green run   «chat kept»
+    «chat kept»
+ **Status:** OPEN   «chat kept»
+ **Date:** 8 Nov 26   «chat kept»
+ **Session context:** chat 7, the D1843 build (a line round the desktop Inputs list, "No document" inside its column) — a two-rule stylesheet change, its brow...   «chat kept»
+ **Skill:** test-driven-development   «chat kept»
+ **Type:** open-source   «chat kept»
+ **Phase/Area:** RED — watching the test fail, when the build is shared and taken in turns   «chat kept»
+    «chat kept»
+ **Issue:** the fix was already written and committed when the test was, and every browser run rebuilds the app under one lock shared with other chats; showin...   «chat kept»
+ **Suggested improvement:** in the skill's RED section, a short case: "code written before the test" — reverse-apply the fix's own diff to get the old behavio...   «chat kept»
+ **Principle:** when the fix came first, recreate the old behaviour by taking back only the fix's own diff — never by checking out an older file — prove the t...   «chat kept»
+    «chat kept»
+    «chat kept»
@@ -4220,14 +4233,0 @@
- ### Observation 883: Red first for a style-only fix, in the same lock turn as the green run   «step wrote»
-    «step kept»
- **Status:** OPEN   «step kept»
- **Date:** 8 Nov 26   «step kept»
- **Session context:** chat 7, the D1843 build (a line round the desktop Inputs list, "No document" inside its column) — a two-rule stylesheet change, its brow...   «step kept»
- **Skill:** test-driven-development   «step kept»
- **Type:** open-source   «step kept»
- **Phase/Area:** RED — watching the test fail, when the build is shared and taken in turns   «step kept»
-    «step kept»
- **Issue:** the fix was already written and committed when the test was, and every browser run rebuilds the app under one lock shared with other chats; showin...   «step kept»
- **Suggested improvement:** in the skill's RED section, a short case: "code written before the test" — reverse-apply the fix's own diff to get the old behavio...   «step kept»
- **Principle:** when the fix came first, recreate the old behaviour by taking back only the fix's own diff — never by checking out an older file — prove the t...   «step kept»
-    «step kept»
-    «step kept»
@@ -4286,13 +4285,0 @@
- ### Observation 880: A change of what scrolls breaks every test that names the old scroller, not only its own spec   «step kept»
-    «step kept»
- **Status:** OPEN   «step kept»
- **Date:** 8 Nov 26   «step kept»
- **Session context:** chat 11, the board layout (D1780: the sideways board scrolls as one page). Numbered past 878–879, held by other branches.   «step kept»
- **Skill:** New skill candidate: bug-check sizing (walk-ledger / the bug-check order §3)   «step kept»
- **Type:** open-source   «step kept»
- **Phase/Area:** sizing the walk and the local test run before the first push   «step kept»
-    «step kept»
- **Issue:** The change moved a screen's scrolling from an inner pane to the whole surface. Its own new browser spec passed locally and the walk passed, but an...   «step kept»
- **Suggested improvement:** When a change alters which element scrolls, the sizing step greps every test and every scroll-reading function for the old scrolle...   «step kept»
- **Principle:** A layout change that moves the scroller invalidates every caller that measured the old one; find them by the selector, not by the files the ch...   «step kept»
-    «step kept»
@@ -4310,0 +4298,13 @@
+ ### Observation 883: A change of what scrolls breaks every test that names the old scroller, not only its own spec   «chat wrote (in neither parent)»
+    «chat kept»
+ **Status:** OPEN   «chat kept»
+ **Renumbered:** 880 on `main` (chat 11, the board layout); renumbered 883 when chat 18 brought `main` into `claude/pr-inputs-add-right-5b2653`, which already...   «chat wrote (in neither parent)»
+ **Date:** 8 Nov 26   «chat kept»
+ **Session context:** chat 11, the board layout (D1780: the sideways board scrolls as one page). Numbered past 878–879, held by other branches.   «chat kept»
+ **Skill:** New skill candidate: bug-check sizing (walk-ledger / the bug-check order §3)   «chat kept»
+ **Type:** open-source   «chat kept»
+ **Phase/Area:** sizing the walk and the local test run before the first push   «chat kept»
+    «chat kept»
+ **Issue:** The change moved a screen's scrolling from an inner pane to the whole surface. Its own new browser spec passed locally and the walk passed, but an...   «chat kept»
+ **Suggested improvement:** When a change alters which element scrolls, the sizing step greps every test and every scroll-reading function for the old scrolle...   «chat kept»
+ **Principle:** A layout change that moves the scroller invalidates every caller that measured the old one; find them by the selector, not by the files the ch...   «chat kept»
```

#### 8ed7e85a8 — .claude/skill-observations/log.md

Identity counts: all equal.

```diff
@@ -4243 +4242,0 @@
-    «step kept»
```

#### 7141b1bd8 — HANDOFF.md

Identity counts: all equal.

```diff
@@ -31 +31 @@
- - **Chats (D1744):** this chat is 19; the next new chat takes 21.   «step kept»
+ - **Chats (D1744):** this chat is 19; 21 went to the coordinator (chat 3's successor, 8 Nov 26 about 14:50) — the next new chat takes 22. Reports for this jo...   «chat wrote (in neither parent)»
@@ -122 +122 @@
- - **Chats (D1744):** before numbering a new chat, read the open chats' titles — numbers went twice on 8 Nov 26. At 08:50 that day the highest in use was 12 (...   «step kept»
+ - **Chats (D1744):** before numbering a new chat, read the open chats' titles — numbers went twice on 8 Nov 26. At 08:50 that day the highest in use was 12 (...   «chat wrote (in neither parent)»
```

#### 50cc26a5c — OUTSTANDING-ARCHIVE.md

Identity counts: all equal.

```diff
@@ -8160,0 +8161 @@
+    «chat kept»
```

#### 7faf81f3b — .claude/skill-observations/log.md

Identity counts: all equal.

```diff
@@ -4286,26 +4285,0 @@
- ### Observation 882: A new text-fit browser test was checked only in this PC's letters and went red on the CI's Linux machines — the trap of Observation 680 ...   «step kept»
-    «step kept»
- **Status:** OPEN   «step kept»
- **Date:** 8 Nov 26   «step kept»
- **Session context:** Chat 18 taking over chat 7's merge of the Inputs list's right-end line (D1843); GitHub's run of the pull request red on the new test. Nu...   «step kept»
- **Skill:** New skill candidate: none — the bug-check order (`raptor-port/docs/bug-check-order.md` §7.2) and `raptor-port/docs/gates-and-deploy.md` (§A geomet...   «step kept»
- **Type:** open-source   «step kept»
- **Phase/Area:** writing a browser test that measures text against a fixed width, before its first push   «step kept»
-    «step kept»
- **Issue:** A new browser test asserted that a short label ("No document") ends inside a fixed-width table column, with a 0.5px tolerance. It was written, pro...   «step kept»
- **Suggested improvement:** Make it a default rather than a judgement: in the bug-check order §8 (writing the tests) and the gates guide's trap, "a new browse...   «step kept»
- **Principle:** When a system draws text in whatever font each machine has, every assertion about text width is an assertion about one machine's font. Pin the...   «step kept»
- ### Observation 883: A change of what scrolls breaks every test that names the old scroller, not only its own spec   «step kept»
-    «step kept»
- **Status:** OPEN   «step kept»
- **Renumbered:** 880 on `main` (chat 11, the board layout); renumbered 883 when chat 18 brought `main` into `claude/pr-inputs-add-right-5b2653`, which already...   «step kept»
- **Date:** 8 Nov 26   «step kept»
- **Session context:** chat 11, the board layout (D1780: the sideways board scrolls as one page). Numbered past 878–879, held by other branches.   «step kept»
- **Skill:** New skill candidate: bug-check sizing (walk-ledger / the bug-check order §3)   «step kept»
- **Type:** open-source   «step kept»
- **Phase/Area:** sizing the walk and the local test run before the first push   «step kept»
-    «step kept»
- **Issue:** The change moved a screen's scrolling from an inner pane to the whole surface. Its own new browser spec passed locally and the walk passed, but an...   «step kept»
- **Suggested improvement:** When a change alters which element scrolls, the sizing step greps every test and every scroll-reading function for the old scrolle...   «step kept»
- **Principle:** A layout change that moves the scroller invalidates every caller that measured the old one; find them by the selector, not by the files the ch...   «step kept»
-    «step kept»
@@ -4339,0 +4314,26 @@
+    «chat kept»
+ ### Observation 882: A new text-fit browser test was checked only in this PC's letters and went red on the CI's Linux machines — the trap of Observation 680 ...   «chat kept»
+    «chat kept»
+ **Status:** OPEN   «chat kept»
+ **Date:** 8 Nov 26   «chat kept»
+ **Session context:** Chat 18 taking over chat 7's merge of the Inputs list's right-end line (D1843); GitHub's run of the pull request red on the new test. Nu...   «chat kept»
+ **Skill:** New skill candidate: none — the bug-check order (`raptor-port/docs/bug-check-order.md` §7.2) and `raptor-port/docs/gates-and-deploy.md` (§A geomet...   «chat kept»
+ **Type:** open-source   «chat kept»
+ **Phase/Area:** writing a browser test that measures text against a fixed width, before its first push   «chat kept»
+    «chat kept»
+ **Issue:** A new browser test asserted that a short label ("No document") ends inside a fixed-width table column, with a 0.5px tolerance. It was written, pro...   «chat kept»
+ **Suggested improvement:** Make it a default rather than a judgement: in the bug-check order §8 (writing the tests) and the gates guide's trap, "a new browse...   «chat kept»
+ **Principle:** When a system draws text in whatever font each machine has, every assertion about text width is an assertion about one machine's font. Pin the...   «chat kept»
+ ### Observation 883: A change of what scrolls breaks every test that names the old scroller, not only its own spec   «chat kept»
+    «chat kept»
+ **Status:** OPEN   «chat kept»
+ **Renumbered:** 880 on `main` (chat 11, the board layout); renumbered 883 when chat 18 brought `main` into `claude/pr-inputs-add-right-5b2653`, which already...   «chat kept»
+ **Date:** 8 Nov 26   «chat kept»
+ **Session context:** chat 11, the board layout (D1780: the sideways board scrolls as one page). Numbered past 878–879, held by other branches.   «chat kept»
+ **Skill:** New skill candidate: bug-check sizing (walk-ledger / the bug-check order §3)   «chat kept»
+ **Type:** open-source   «chat kept»
+ **Phase/Area:** sizing the walk and the local test run before the first push   «chat kept»
+    «chat kept»
+ **Issue:** The change moved a screen's scrolling from an inner pane to the whole surface. Its own new browser spec passed locally and the walk passed, but an...   «chat kept»
+ **Suggested improvement:** When a change alters which element scrolls, the sizing step greps every test and every scroll-reading function for the old scrolle...   «chat kept»
+ **Principle:** A layout change that moves the scroller invalidates every caller that measured the old one; find them by the selector, not by the files the ch...   «chat kept»
```

#### 7faf81f3b — HANDOFF.md

Identity counts: all equal.

```diff
@@ -30 +30 @@
- - **State at this write (8 Nov 26 ~07:30Z by the PC clock; compacted three times, the last ~06:45Z; the chat ~82% full): D1871 answered (kept as built); his ...   «step kept»
+ - **State at this write (8 Nov 26 ~07:30Z by the PC clock; compacted three times, the last ~06:45Z; the chat ~82% full): D1871 answered (kept as built); his ...   «chat wrote (in neither parent)»
```

#### 883efe49c — .claude/skill-observations/log.md

Identity counts: all equal.

```diff
@@ -4285,0 +4286,13 @@
+ ### Observation 881: A later ruling says "narrows Dx" in its own row, but Dx's row carries no mark — the change check cannot see it   «chat kept»
+    «chat kept»
+ **Status:** OPEN   «chat kept»
+ **Date:** 8 Nov 26   «chat kept»
+ **Session context:** chat 17, the rules diet's step 5a — People & accounts as a page (numbered past 880, held by two open branches)   «chat kept»
+ **Skill:** New skill candidate: rules-diet page conversion   «chat kept»
+ **Type:** open-source   «chat kept»
+ **Phase/Area:** drafting a page from its rulings; the change-mark check   «chat kept»
+    «chat kept»
+ **Issue:** D1651's own meaning cell said "Narrows D1510 and D149", and D1510's row carried the mark, but D149's did not (nor D218's, which still listed SCHED...   «chat kept»
+ **Suggested improvement:** in the rulings check, for every row whose meaning cell says "narrows / replaces / answers D<n>", require D<n>'s row to carry a mar...   «chat kept»
+ **Principle:** a link recorded on one side only is invisible to a check that reads the other side — when a record can be changed from either end, check both ...   «chat kept»
+    «chat kept»
@@ -4311,13 +4323,0 @@
-    «step kept»
- ### Observation 881: A later ruling says "narrows Dx" in its own row, but Dx's row carries no mark — the change check cannot see it   «step kept»
-    «step kept»
- **Status:** OPEN   «step kept»
- **Date:** 8 Nov 26   «step kept»
- **Session context:** chat 17, the rules diet's step 5a — People & accounts as a page (numbered past 880, held by two open branches)   «step kept»
- **Skill:** New skill candidate: rules-diet page conversion   «step kept»
- **Type:** open-source   «step kept»
- **Phase/Area:** drafting a page from its rulings; the change-mark check   «step kept»
-    «step kept»
- **Issue:** D1651's own meaning cell said "Narrows D1510 and D149", and D1510's row carried the mark, but D149's did not (nor D218's, which still listed SCHED...   «step kept»
- **Suggested improvement:** in the rulings check, for every row whose meaning cell says "narrows / replaces / answers D<n>", require D<n>'s row to carry a mar...   «step kept»
- **Principle:** a link recorded on one side only is invisible to a check that reads the other side — when a record can be changed from either end, check both ...   «step kept»
```

#### 966712bc0 — HANDOFF.md

Identity counts: all equal.

```diff
@@ -28 +28 @@
- - **NEXT, in order:** (1) GitHub's run of `32e9b096d` GREEN, every check (15:05); this records commit pushed after it — its own run green before the merge; (...   «step kept»
+ - **NEXT:** `main` brought in again about 15:10 (only this file clashed; chats 18, 15 and 10's merged blocks gone, chat 21's kept). GitHub's run of `2e5ac7eb...   «chat wrote (in neither parent)»
```

#### 95dd5a9c0 — HANDOFF.md

Identity counts: all equal.

```diff
@@ -31 +31 @@
- - **Rulings:** none this session so far.   «step kept»
+ - **Rulings:** none this session. Pull request 700, green; `main` brought in twice (notes only clashed — the handoff blocks and the skill log).   «chat wrote (in neither parent)»
```

#### 2b2fbefc7 — HANDOFF.md

Identity counts: all equal.

```diff
@@ -23,9 +22,0 @@
- <!-- now:claude/lw-pin-last-frame -->   «step kept»
- ### CHAT 16 — [LW-PIN-LAST-FRAME] built for keeps (D1870), `claude/lw-pin-last-frame` (from `main` 0bbb1c686, 100 behind `main` on 8 Nov 26 ~04:40Z — no open...   «step kept»
- - **The job (his D1870, 8 Nov 26):** build for keeps chat 14's prototype (commit 399d3759b) — the Leave War's pinned dates row (`.mxfixed`) and Quals' pinned...   «step kept»
- - **Tier said out loud:** the eight questions all NO (no OIL, record, saved data, shared drawer — each screen its own copy —, new control, surface, role, war...   «step kept»
- - **The fixes planned (each red-first, an e2e test on the prototype build first):** (1) **screen reader / keys:** the copy stays in the accessibility tree an...   «step kept»
- - **Chat 14's measure (8 Nov 26):** blinks 40 of 40 runs before, 0 of 40 after; median frame 16.7 ms both; Leave War phone frames over 33 ms 6 → 20 (p95 33.3...   «step kept»
- - **Merging (D1796, his word to chat 3, 8 Nov 26, relayed):** once completed (walk with pictures, gates, GitHub's run green on the last pushed commit, every ...   «step kept»
- - **State at this write (8 Nov 26 ~07:30Z by the PC clock; compacted three times, the last ~06:45Z; the chat ~82% full): D1871 answered (kept as built); his ...   «step kept»
- <!-- /now -->   «step kept»
@@ -41,0 +33,9 @@
+ <!-- now:claude/lw-pin-last-frame -->   «chat kept»
+ ### CHAT 16 — [LW-PIN-LAST-FRAME] built for keeps (D1870), `claude/lw-pin-last-frame` (from `main` 0bbb1c686, 100 behind `main` on 8 Nov 26 ~04:40Z — no open...   «chat kept»
+ - **The job (his D1870, 8 Nov 26):** build for keeps chat 14's prototype (commit 399d3759b) — the Leave War's pinned dates row (`.mxfixed`) and Quals' pinned...   «chat kept»
+ - **Tier said out loud:** the eight questions all NO (no OIL, record, saved data, shared drawer — each screen its own copy —, new control, surface, role, war...   «chat kept»
+ - **The fixes planned (each red-first, an e2e test on the prototype build first):** (1) **screen reader / keys:** the copy stays in the accessibility tree an...   «chat kept»
+ - **Chat 14's measure (8 Nov 26):** blinks 40 of 40 runs before, 0 of 40 after; median frame 16.7 ms both; Leave War phone frames over 33 ms 6 → 20 (p95 33.3...   «chat kept»
+ - **Merging (D1796, his word to chat 3, 8 Nov 26, relayed):** once completed (walk with pictures, gates, GitHub's run green on the last pushed commit, every ...   «chat kept»
+ - **State at this write (8 Nov 26 ~07:30Z by the PC clock; compacted three times, the last ~06:45Z; the chat ~82% full): D1871 answered (kept as built); his ...   «chat wrote (in neither parent)»
+ <!-- /now -->   «chat kept»
```

#### 2792c00a1 — HANDOFF.md

Identity counts that differ:

- D-numbers — D1796: step 2, chat 1

```diff
@@ -24 +24 @@
- ### CHAT 13 — the pictures round's group 3, the schedule's marks and words (D1784, D1785, D1792 a, d) — BUILT, WALKED, READ, FIXED, RE-WALKED; the evidence s...   «step kept»
+ ### CHAT 13 — the pictures round's group 3, the schedule's marks and words (D1784, D1785, D1792 a, d) — MERGED 8 Nov 26 on his "merge live", typed in this ch...   «chat wrote (in neither parent)»
@@ -28 +28 @@
- - **NEXT:** `main` brought in again about 15:10 (only this file clashed; chats 18, 15 and 10's merged blocks gone, chat 21's kept). GitHub's run of `2e5ac7eb...   «step kept»
+ - **Merged** on his "merge live" ("merge live dont clash with the rest"), typed here: `main` brought in a third time (only this file clashed — chat 17's bloc...   «chat wrote (in neither parent)»
```

#### 52de38189 — .claude/skill-observations/log.md

Identity counts: all equal.

```diff
@@ -4299,29 +4298,0 @@
- ### Observation 892: Times written into a handoff after a compaction came from the summary, not the clock   «step wrote»
-    «step kept»
- **Status:** OPEN   «step kept»
- **Date:** 2026-11-08   «step kept»
- **Session context:** chat 14, [LW-PIN-LAST-FRAME] — saving the state at 90% full, just after a compaction (numbered past 873, held on another branch; renumbe...   «step kept»
- **Skill:** session-handoff (writing the block's times)   «step kept»
- **Type:** open-source   «step kept»
- **Phase/Area:** the state written into the handoff block   «step kept»
-    «step kept»
- **Issue:** The block said the measure ran "~03:40–04:05Z" and the preview was looked for "at 04:06Z"; the clock read 03:36Z and the results files were writte...   «step kept»
- **Suggested improvement:** In the handoff skill's block-writing step: every time or date written into the block is read from the clock (`date -u`) or from th...   «step kept»
- **Principle:** After a compaction, a time is a fact to look up, not to remember; read it from the clock or the artifact it describes.   «step kept»
- Met again 2026-11-08, the same chat ten minutes later: "04:00Z" and "03:50Z" written from memory for what the clock and the files put at 03:45Z and 03:42Z — ...   «step kept»
-    «step kept»
- ### Observation 884: A frame count at a threshold hid the change; the raw intervals and a switch-off run told it   «step kept»
-    «step kept»
- **Status:** OPEN   «step kept»
- **Date:** 8 Nov 26   «step kept»
- **Session context:** chat 16, [LW-PIN-LAST-FRAME] (D1870) — re-measuring a pinned row after a CSS scroll-timeline change (numbered past 883, held on another ...   «step kept»
- **Skill:** New skill candidate: measuring-scroll-performance   «step kept»
- **Type:** open-source   «step kept»
- **Phase/Area:** the before/after frame measure   «step kept»
-    «step kept»
- **Issue:** The measure counted frames "over 33.4 ms" — the exact edge of two screen refreshes — so a frame landing a tenth of a millisecond either side flipp...   «step kept»
-    «step kept»
- **Suggested improvement:** A frame measure records every raw interval, reports buckets around each refresh multiple rather than one threshold count, repeats ...   «step kept»
-    «step kept»
- **Principle:** A threshold placed on a quantised value measures rounding; bucket around the quanta, repeat the run, and isolate a suspected cause by removing...   «step kept»
-    «step kept»
@@ -4365,0 +4337,31 @@
+    «chat kept»
+ ### Observation 892: Times written into a handoff after a compaction came from the summary, not the clock   «chat wrote (in neither parent)»
+    «chat kept»
+ *Numbered 881 on `claude/lw-pin-last-frame`; renumbered 892 when `main` was brought in on 8 Nov 26 — `main` holds its own 881.*   «chat wrote (in neither parent)»
+    «chat kept»
+ **Status:** OPEN   «chat kept»
+ **Date:** 2026-11-08   «chat kept»
+ **Session context:** chat 14, [LW-PIN-LAST-FRAME] — saving the state at 90% full, just after a compaction (numbered past 873, held on another branch; renumbe...   «chat kept»
+ **Skill:** session-handoff (writing the block's times)   «chat kept»
+ **Type:** open-source   «chat kept»
+ **Phase/Area:** the state written into the handoff block   «chat kept»
+    «chat kept»
+ **Issue:** The block said the measure ran "~03:40–04:05Z" and the preview was looked for "at 04:06Z"; the clock read 03:36Z and the results files were writte...   «chat kept»
+ **Suggested improvement:** In the handoff skill's block-writing step: every time or date written into the block is read from the clock (`date -u`) or from th...   «chat kept»
+ **Principle:** After a compaction, a time is a fact to look up, not to remember; read it from the clock or the artifact it describes.   «chat kept»
+ Met again 2026-11-08, the same chat ten minutes later: "04:00Z" and "03:50Z" written from memory for what the clock and the files put at 03:45Z and 03:42Z — ...   «chat kept»
+    «chat kept»
+ ### Observation 884: A frame count at a threshold hid the change; the raw intervals and a switch-off run told it   «chat kept»
+    «chat kept»
+ **Status:** OPEN   «chat kept»
+ **Date:** 8 Nov 26   «chat kept»
+ **Session context:** chat 16, [LW-PIN-LAST-FRAME] (D1870) — re-measuring a pinned row after a CSS scroll-timeline change (numbered past 883, held on another ...   «chat kept»
+ **Skill:** New skill candidate: measuring-scroll-performance   «chat kept»
+ **Type:** open-source   «chat kept»
+ **Phase/Area:** the before/after frame measure   «chat kept»
+    «chat kept»
+ **Issue:** The measure counted frames "over 33.4 ms" — the exact edge of two screen refreshes — so a frame landing a tenth of a millisecond either side flipp...   «chat kept»
+    «chat kept»
+ **Suggested improvement:** A frame measure records every raw interval, reports buckets around each refresh multiple rather than one threshold count, repeats ...   «chat kept»
+    «chat kept»
+ **Principle:** A threshold placed on a quantised value measures rounding; bucket around the quanta, repeat the run, and isolate a suspected cause by removing...   «chat kept»
```

#### 916d42e3c — raptor-port/docs/file-map.md

Identity counts: all equal.

```diff
@@ -4 +3,0 @@
-    «step kept»
```

#### 8b54a2cd5 — .claude/skill-observations/log.md

Identity counts: all equal.

```diff
@@ -4329,26 +4328,0 @@
- ### Observation 887: A pull request that clashes with main starts no checks, and nothing says so   «step kept»
-    «step kept»
- **Status:** OPEN   «step kept»
- **Date:** 2026-11-08   «step kept»
- **Session context:** Chat 13, the schedule's marks and words (pull request 691); numbered past 886, the highest on another open branch.   «step kept»
- **Skill:** New skill candidate: shipping-checks (the rule lives in `.claude/rules/shipping.md` §The checks)   «step kept»
- **Type:** open-source   «step kept»
- **Phase/Area:** after a push — waiting for the pull request's run   «step kept»
-    «step kept»
- **Issue:** Two pushes to an open pull request started no GitHub Actions run — only the preview host's checks appeared. The cause, found only after both: note...   «step kept»
- **Suggested improvement:** In `shipping.md` §The checks, beside "read the run list before a push": right after any push to an open pull request, read its mer...   «step kept»
- **Principle:** When a check is expected to start by itself, confirm it started; a missing run is a signal, and the most common silent cause is that the platf...   «step kept»
-    «step kept»
- ### Observation 888: A blind reader that compacts gets the host's handoff pasted in by the start hook   «step kept»
-    «step kept»
- **Status:** OPEN   «step kept»
- **Date:** 2026-11-08   «step kept»
- **Session context:** Chat 13 — the final code read, three readers blind to each other; the fresh Opus reader compacted mid-read.   «step kept»
- **Skill:** New skill candidate: blind-read (the bug-check order's §4 reads; the compaction start hook)   «step kept»
- **Type:** internal   «step kept»
- **Phase/Area:** a blind reader's session after its own compaction   «step kept»
-    «step kept»
- **Issue:** The fresh, blind Opus reader ran long enough to compact. The project's compaction start hook then pasted the branch's HANDOFF.md block into it — t...   «step kept»
- **Suggested improvement:** The compaction start hook pastes the HANDOFF block only into the chat that owns the branch — not into a helper or reader session (...   «step kept»
- **Principle:** Anything injected into a session automatically can break a reader's blindness; blindness must be guarded where the injection happens, not only...   «step kept»
-    «step kept»
@@ -4404,0 +4379,25 @@
+ ### Observation 887: A pull request that clashes with main starts no checks, and nothing says so   «chat kept»
+    «chat kept»
+ **Status:** OPEN   «chat kept»
+ **Date:** 2026-11-08   «chat kept»
+ **Session context:** Chat 13, the schedule's marks and words (pull request 691); numbered past 886, the highest on another open branch.   «chat kept»
+ **Skill:** New skill candidate: shipping-checks (the rule lives in `.claude/rules/shipping.md` §The checks)   «chat kept»
+ **Type:** open-source   «chat kept»
+ **Phase/Area:** after a push — waiting for the pull request's run   «chat kept»
+    «chat kept»
+ **Issue:** Two pushes to an open pull request started no GitHub Actions run — only the preview host's checks appeared. The cause, found only after both: note...   «chat kept»
+ **Suggested improvement:** In `shipping.md` §The checks, beside "read the run list before a push": right after any push to an open pull request, read its mer...   «chat kept»
+ **Principle:** When a check is expected to start by itself, confirm it started; a missing run is a signal, and the most common silent cause is that the platf...   «chat kept»
+    «chat kept»
+ ### Observation 888: A blind reader that compacts gets the host's handoff pasted in by the start hook   «chat kept»
+    «chat kept»
+ **Status:** OPEN   «chat kept»
+ **Date:** 2026-11-08   «chat kept»
+ **Session context:** Chat 13 — the final code read, three readers blind to each other; the fresh Opus reader compacted mid-read.   «chat kept»
+ **Skill:** New skill candidate: blind-read (the bug-check order's §4 reads; the compaction start hook)   «chat kept»
+ **Type:** internal   «chat kept»
+ **Phase/Area:** a blind reader's session after its own compaction   «chat kept»
+    «chat kept»
+ **Issue:** The fresh, blind Opus reader ran long enough to compact. The project's compaction start hook then pasted the branch's HANDOFF.md block into it — t...   «chat kept»
+ **Suggested improvement:** The compaction start hook pastes the HANDOFF block only into the chat that owns the branch — not into a helper or reader session (...   «chat kept»
+ **Principle:** Anything injected into a session automatically can break a reader's blindness; blindness must be guarded where the injection happens, not only...   «chat kept»
```

#### 8b54a2cd5 — HANDOFF.md

Identity counts that differ:

- now markers — <!-- now:claude/pr-sched-marks-3205d7 -->: step 1, chat 0
- D-numbers — D1743: step 2, chat 1; D1090: step 2, chat 1; D1784: step 2, chat 0; D1785: step 2, chat 0; D1792: step 2, chat 0; D1820: step 1, chat 0; D1829: step 1, chat 0

```diff
@@ -35,10 +34,0 @@
- <!-- now:claude/pr-sched-marks-3205d7 -->   «step kept»
- ### CHAT 13 — the pictures round's group 3, the schedule's marks and words (D1784, D1785, D1792 a, d) — MERGED 8 Nov 26 on his "merge live", typed in this ch...   «step kept»
- - **Built** (an Opus builder helper, reviewed by the host): the waiting mark on an Unavailable row (D1784); the unreadable week's notice and grey refusal (D1...   «step kept»
- - **Checked — the sheet is CLOSED:** `raptor-port/docs/handpass/2026-11-08-sched-marks.md` (§1–§15, the roll-call's 27 rows, every reader's claim and its dis...   «step kept»
- - **`main` brought in** (`32e9b096d`, about 14:45): the pull request had gone into a clash (three notes files — the handoff, the file map, the screen contrac...   «step kept»
- - **Merged** on his "merge live" ("merge live dont clash with the rest"), typed here: `main` brought in a third time (only this file clashed — chat 17's bloc...   «step kept»
- - **To put to him** (none blocks the merge): whether an Unavailable change's mark should also show in OIL Earn (Opus reading b); whether the older-version re...   «step kept»
- - **Filed:** `[DAMAGED-WEEK-LEFTOVERS]` (point 5 added — the Leave War's pending bid on a damaged date); `[SCHED-MARKS-WALK-ODDS]` (new — the changes window'...   «step kept»
- - **Rulings:** none this session (D1820–D1829 unused). **Reads owed:** none (Astra read; Sol 6.1 in the second seat inside D1743's window; the fresh Opus rea...   «step kept»
- <!-- /now -->   «step kept»
```

#### a3bb57b3e — .claude/skill-observations/log.md

Identity counts: all equal.

```diff
@@ -4329,26 +4328,0 @@
- ### Observation 887: A pull request that clashes with main starts no checks, and nothing says so   «step kept»
-    «step kept»
- **Status:** OPEN   «step kept»
- **Date:** 2026-11-08   «step kept»
- **Session context:** Chat 13, the schedule's marks and words (pull request 691); numbered past 886, the highest on another open branch.   «step kept»
- **Skill:** New skill candidate: shipping-checks (the rule lives in `.claude/rules/shipping.md` §The checks)   «step kept»
- **Type:** open-source   «step kept»
- **Phase/Area:** after a push — waiting for the pull request's run   «step kept»
-    «step kept»
- **Issue:** Two pushes to an open pull request started no GitHub Actions run — only the preview host's checks appeared. The cause, found only after both: note...   «step kept»
- **Suggested improvement:** In `shipping.md` §The checks, beside "read the run list before a push": right after any push to an open pull request, read its mer...   «step kept»
- **Principle:** When a check is expected to start by itself, confirm it started; a missing run is a signal, and the most common silent cause is that the platf...   «step kept»
-    «step kept»
- ### Observation 888: A blind reader that compacts gets the host's handoff pasted in by the start hook   «step kept»
-    «step kept»
- **Status:** OPEN   «step kept»
- **Date:** 2026-11-08   «step kept»
- **Session context:** Chat 13 — the final code read, three readers blind to each other; the fresh Opus reader compacted mid-read.   «step kept»
- **Skill:** New skill candidate: blind-read (the bug-check order's §4 reads; the compaction start hook)   «step kept»
- **Type:** internal   «step kept»
- **Phase/Area:** a blind reader's session after its own compaction   «step kept»
-    «step kept»
- **Issue:** The fresh, blind Opus reader ran long enough to compact. The project's compaction start hook then pasted the branch's HANDOFF.md block into it — t...   «step kept»
- **Suggested improvement:** The compaction start hook pastes the HANDOFF block only into the chat that owns the branch — not into a helper or reader session (...   «step kept»
- **Principle:** Anything injected into a session automatically can break a reader's blindness; blindness must be guarded where the injection happens, not only...   «step kept»
-    «step kept»
@@ -4379,0 +4354,25 @@
+ ### Observation 887: A pull request that clashes with main starts no checks, and nothing says so   «chat kept»
+    «chat kept»
+ **Status:** OPEN   «chat kept»
+ **Date:** 2026-11-08   «chat kept»
+ **Session context:** Chat 13, the schedule's marks and words (pull request 691); numbered past 886, the highest on another open branch.   «chat kept»
+ **Skill:** New skill candidate: shipping-checks (the rule lives in `.claude/rules/shipping.md` §The checks)   «chat kept»
+ **Type:** open-source   «chat kept»
+ **Phase/Area:** after a push — waiting for the pull request's run   «chat kept»
+    «chat kept»
+ **Issue:** Two pushes to an open pull request started no GitHub Actions run — only the preview host's checks appeared. The cause, found only after both: note...   «chat kept»
+ **Suggested improvement:** In `shipping.md` §The checks, beside "read the run list before a push": right after any push to an open pull request, read its mer...   «chat kept»
+ **Principle:** When a check is expected to start by itself, confirm it started; a missing run is a signal, and the most common silent cause is that the platf...   «chat kept»
+    «chat kept»
+ ### Observation 888: A blind reader that compacts gets the host's handoff pasted in by the start hook   «chat kept»
+    «chat kept»
+ **Status:** OPEN   «chat kept»
+ **Date:** 2026-11-08   «chat kept»
+ **Session context:** Chat 13 — the final code read, three readers blind to each other; the fresh Opus reader compacted mid-read.   «chat kept»
+ **Skill:** New skill candidate: blind-read (the bug-check order's §4 reads; the compaction start hook)   «chat kept»
+ **Type:** internal   «chat kept»
+ **Phase/Area:** a blind reader's session after its own compaction   «chat kept»
+    «chat kept»
+ **Issue:** The fresh, blind Opus reader ran long enough to compact. The project's compaction start hook then pasted the branch's HANDOFF.md block into it — t...   «chat kept»
+ **Suggested improvement:** The compaction start hook pastes the HANDOFF block only into the chat that owns the branch — not into a helper or reader session (...   «chat kept»
+ **Principle:** Anything injected into a session automatically can break a reader's blindness; blindness must be guarded where the injection happens, not only...   «chat kept»
```

#### a3bb57b3e — HANDOFF.md

Identity counts that differ:

- D-numbers — D1890: step 3, chat 2; D1744: step 5, chat 3; D1761: step 1, chat 0; D56: step 1, chat 0; D1899: step 1, chat 0; D1891: step 1, chat 0

```diff
@@ -24 +24 @@
- ### CHAT 19 — night 3, job 7: the checks themselves, `claude/chat19-checks` (from `main` at `bf09f369b`, `main` brought in at `e865e8ad3`), pull request 698;...   «step kept»
+ ### CHAT 19 → CHAT 27 — night 3, job 7: the checks themselves, `claude/chat19-checks`, pull request 698; built by chat 19 (handed off about 15:10), read and ...   «chat wrote (in neither parent)»
@@ -30,4 +30,3 @@
- - **GitHub:** pull request 698's first full run passed, "checks passed" green on it (27 passed, 2 skipped, none failed). `main` brought in three times since ...   «step kept»
- - **Next chat on this branch (it takes the next free number, D1744 — 22 if chat 21's React Doctor chat has not taken it), in order:** (1) confirm the script ...   «step kept»
- - **Merge:** a hook and a workflow change — only on his "merge live" typed in the chat that holds this branch. **Rulings:** D1890 → `scheduler.md` (range D18...   «step kept»
- - **Chats (D1744):** this chat is 19; 21 went to the coordinator (chat 3's successor, 8 Nov 26 about 14:50) — the next new chat takes 22, the one after 23 (c...   «step kept»
+ - **Chat 27 did (8 Nov 26):** (1) **the script guard live** — NOT provable in chat 27: the app read its hook settings when chat 27 started, on `main`, which ...   «chat wrote (in neither parent)»
+ - **Next, in order:** (1) GitHub's run on the last pushed commit green, "checks passed" among it; (2) his "merge live" typed in the chat holding this branch ...   «chat wrote (in neither parent)»
+ - **Merge:** a hook and a workflow change — only on his "merge live" typed in the chat that holds this branch. **Rulings:** D1890 (chat 19) → `scheduler.md`;...   «chat wrote (in neither parent)»
```

#### 423e6c76b — HANDOFF.md

Identity counts that differ:

- D-numbers — D1557: step 1, chat 0; D1086: step 0, chat 1

```diff
@@ -30,2 +30,4 @@
- - **Next:** (a) the three browser files green (re-run if the background run was lost: `E2E_PORT=4229 node scripts/gatelock.mjs exec "…" -- npx playwright tes...   «step kept»
- - **Rulings:** none yet (range D1920–D1929 held).   «step kept»
+ - **Compacted ~18:00 (8 Nov 26);** went on from this block and the evidence sheet.   «chat wrote (in neither parent)»
+ - **State at ~19:30:** the walk done — one Sonnet walker, 160 pictures, nothing found in the change; its one FAIL (J1, the changes window reopening at its us...   «chat wrote (in neither parent)»
+ - **Next:** GitHub's run of 707 on the last push green → the preview link and pictures to him → his "merge live" typed in this chat only → tell chat 30 first...   «chat wrote (in neither parent)»
+ - **Rulings:** none (range D1920–D1929 held, unused).   «chat wrote (in neither parent)»
```

#### 423e6c76b — OUTSTANDING-ARCHIVE.md

Identity counts: all equal.

```diff
@@ -8191,18 +8190,0 @@
- *Moved here 2026-11-08 by backlog-archive.mjs ([MED-ROOM-DRAGGED]). Forward facts: `raptor-port/src/ui/scheduler/16-medical.css`, `raptor-port/docs/handpass/...   «step kept»
-    «step kept»
- ### [MED-ROOM-DRAGGED] The Medical tab's room stays for a window dragged away (found 8 Nov 26)   «step kept»
- **Found by both code readers of chat 7** (Astra, `raptor-port/docs/superpowers/briefs/2026-11-08-chat7-inputs-read-astra.md` (1),   «step kept»
- and the fresh Opus reader): the Medical tab makes room for the input window (D1300, `.med-room`, `16-medical.css`), but a window   «step kept»
- he has dragged away keeps its place for the session, so the cards stay squeezed AND covered. **Fix:** as the Inputs list's of   «step kept»
- 8 Nov 26 (`06-inputs.css`): the room only while the window stands where it opens — `body:has(.floatwin.inpedwin:not([data-placed]))`   «step kept»
- before the room's rules; a browser test that drags the window away first, red. **Place:** with the next Medical or Inputs batch.   «step kept»
-    «step kept»
-    «step kept»
- *Moved here 2026-11-08 by backlog-archive.mjs ([INP-ROOM-TIDY]). Forward facts: `raptor-port/src/ui/scheduler/25-inputs-calendar.css`, `raptor-port/docs/hand...   «step kept»
-    «step kept»
- ### [INP-ROOM-TIDY] Tidy-ups the code read of 8 Nov 26 filed   «step kept»
- **Filed by the fresh Opus reader of chat 7, not fixed (D489):** (1) the room's size (the window's 430px, its 16px) is written in   «step kept»
- both `06-inputs.css` and `16-medical.css` — one variable would keep them together; (2) `.ib-sub .ib-expand`'s font size and   «step kept»
- line height (`25-inputs-calendar.css`) styled the typed mark and now style nothing. **Place:** with [MED-ROOM-DRAGGED].   «step kept»
-    «step kept»
-    «step kept»
@@ -8317,0 +8300,16 @@
+ *Moved here 2026-11-08 by backlog-archive.mjs ([MED-ROOM-DRAGGED]). Forward facts: `raptor-port/src/ui/scheduler/16-medical.css`, `raptor-port/docs/handpass/...   «chat kept»
+    «chat kept»
+ ### [MED-ROOM-DRAGGED] The Medical tab's room stays for a window dragged away (found 8 Nov 26)   «chat kept»
+ **Found by both code readers of chat 7** (Astra, `raptor-port/docs/superpowers/briefs/2026-11-08-chat7-inputs-read-astra.md` (1),   «chat kept»
+ and the fresh Opus reader): the Medical tab makes room for the input window (D1300, `.med-room`, `16-medical.css`), but a window   «chat kept»
+ he has dragged away keeps its place for the session, so the cards stay squeezed AND covered. **Fix:** as the Inputs list's of   «chat kept»
+ 8 Nov 26 (`06-inputs.css`): the room only while the window stands where it opens — `body:has(.floatwin.inpedwin:not([data-placed]))`   «chat kept»
+ before the room's rules; a browser test that drags the window away first, red. **Place:** with the next Medical or Inputs batch.   «chat kept»
+    «chat kept»
+    «chat kept»
+ *Moved here 2026-11-08 by backlog-archive.mjs ([INP-ROOM-TIDY]). Forward facts: `raptor-port/src/ui/scheduler/25-inputs-calendar.css`, `raptor-port/docs/hand...   «chat kept»
+    «chat kept»
+ ### [INP-ROOM-TIDY] Tidy-ups the code read of 8 Nov 26 filed   «chat kept»
+ **Filed by the fresh Opus reader of chat 7, not fixed (D489):** (1) the room's size (the window's 430px, its 16px) is written in   «chat kept»
+ both `06-inputs.css` and `16-medical.css` — one variable would keep them together; (2) `.ib-sub .ib-expand`'s font size and   «chat kept»
+ line height (`25-inputs-calendar.css`) styled the typed mark and now style nothing. **Place:** with [MED-ROOM-DRAGGED].   «chat kept»
```

#### d55797d99 — .claude/skill-observations/log.md

Identity counts: all equal.

```diff
@@ -4329,25 +4328,0 @@
- ### Observation 886: The cure a note recommended for a hang was itself a hang for one interpreter; and a new hook cannot be proved live in the chat that adds it   «step kept»
-    «step kept»
- **Status:** OPEN   «step kept»
- **Date:** 8 Nov 26   «step kept»
- **Session context:** chat 19 building [SHELL-SCRIPT-GUARD] (D811) — measuring the shell before writing the guard (numbered past 882, the highest on another o...   «step kept»
- **Skill:** New skill candidate: writing a command-refusing hook (the conditions of notes 270, 285, 598, 626)   «step kept»
- **Type:** open-source   «step kept»
- **Phase/Area:** measuring the harness; proving a hook live   «step kept»
-    «step kept»
- **Issue:** A filed note's advice for commands that wait on input was "give every script `< /dev/null`". Measured before building: right for `cat` and `node`,...   «step kept»
- **Suggested improvement:** In the hook-writing conditions: measure each remedy a note proposes, per tool and interpreter, before a refusal message repeats it...   «step kept»
- **Principle:** A workaround recorded once is a claim like any other; measure the cure as well as the fault, in each environment the advice will reach.   «step kept»
-    «step kept»
- ### Observation 885: A walk script kept in a scratch folder cannot import the project's browser library   «step kept»
-    «step kept»
- **Status:** OPEN   «step kept»
- **Date:** 8 Nov 26   «step kept»
- **Session context:** chat 19, a one-off picture for a question to him ([DESIGN-CHECK-GOLD-DOT]); numbered past 884, held by another open branch   «step kept»
- **Skill:** New skill candidate: walk scripts (`raptor-port/docs/walk-scripts.md`)   «step kept»
- **Type:** open-source   «step kept»
- **Phase/Area:** writing a throwaway browser script outside the repo   «step kept»
-    «step kept»
- **Issue:** A one-off picture script written to the session's scratch folder failed at once with "module not found" for the browser library, though it was run...   «step kept»
- **Suggested improvement:** In the walk-scripts guide: a script kept outside the project loads the library with `createRequire(process.cwd() + '/package.json'...   «step kept»
- **Principle:** Module lookup follows the file, not the shell; and a selector guessed from a word is checked against the live page before a script relies on it.   «step kept»
@@ -4403,0 +4379,25 @@
+ ### Observation 886: The cure a note recommended for a hang was itself a hang for one interpreter; and a new hook cannot be proved live in the chat that adds it   «chat kept»
+    «chat kept»
+ **Status:** OPEN   «chat kept»
+ **Date:** 8 Nov 26   «chat kept»
+ **Session context:** chat 19 building [SHELL-SCRIPT-GUARD] (D811) — measuring the shell before writing the guard (numbered past 882, the highest on another o...   «chat kept»
+ **Skill:** New skill candidate: writing a command-refusing hook (the conditions of notes 270, 285, 598, 626)   «chat kept»
+ **Type:** open-source   «chat kept»
+ **Phase/Area:** measuring the harness; proving a hook live   «chat kept»
+    «chat kept»
+ **Issue:** A filed note's advice for commands that wait on input was "give every script `< /dev/null`". Measured before building: right for `cat` and `node`,...   «chat kept»
+ **Suggested improvement:** In the hook-writing conditions: measure each remedy a note proposes, per tool and interpreter, before a refusal message repeats it...   «chat kept»
+ **Principle:** A workaround recorded once is a claim like any other; measure the cure as well as the fault, in each environment the advice will reach.   «chat kept»
+    «chat kept»
+ ### Observation 885: A walk script kept in a scratch folder cannot import the project's browser library   «chat kept»
+    «chat kept»
+ **Status:** OPEN   «chat kept»
+ **Date:** 8 Nov 26   «chat kept»
+ **Session context:** chat 19, a one-off picture for a question to him ([DESIGN-CHECK-GOLD-DOT]); numbered past 884, held by another open branch   «chat kept»
+ **Skill:** New skill candidate: walk scripts (`raptor-port/docs/walk-scripts.md`)   «chat kept»
+ **Type:** open-source   «chat kept»
+ **Phase/Area:** writing a throwaway browser script outside the repo   «chat kept»
+    «chat kept»
+ **Issue:** A one-off picture script written to the session's scratch folder failed at once with "module not found" for the browser library, though it was run...   «chat kept»
+ **Suggested improvement:** In the walk-scripts guide: a script kept outside the project loads the library with `createRequire(process.cwd() + '/package.json'...   «chat kept»
+ **Principle:** Module lookup follows the file, not the shell; and a selector guessed from a word is checked against the live page before a script relies on it.   «chat kept»
@@ -4430,13 +4429,0 @@
- ### Observation 895: Two handoff blocks added at once share their closing line in git's conflict   «step kept»
-    «step kept»
- **Status:** OPEN   «step kept»
- **Date:** 2026-11-08   «step kept»
- **Session context:** chat 24, the rules diet's design page; bringing `main` in while another chat had added its own `## Now` block at the top of the handoff ...   «step kept»
- **Skill:** session-handoff   «step kept»
- **Type:** open-source   «step kept»
- **Phase/Area:** writing a block — merging a branch whose block clashes with another chat's new block   «step kept»
-    «step kept»
- **Issue:** Both branches added a new block at the same place, each ending in the identical closing marker line. Git's conflict took that shared last line out...   «step kept»
- **Suggested improvement:** In the skill's merge step: when the handoff file clashes, resolve by keeping both blocks whole, then count the opening and closing...   «step kept»
- **Principle:** When both sides of a conflict end in the same line, git keeps that line once, outside the conflict; "keep both" then needs that line added bac...   «step kept»
-    «step kept»
@@ -4454,0 +4442,12 @@
+ ### Observation 895: Two handoff blocks added at once share their closing line in git's conflict   «chat kept»
+    «chat kept»
+ **Status:** OPEN   «chat kept»
+ **Date:** 2026-11-08   «chat kept»
+ **Session context:** chat 24, the rules diet's design page; bringing `main` in while another chat had added its own `## Now` block at the top of the handoff ...   «chat kept»
+ **Skill:** session-handoff   «chat kept»
+ **Type:** open-source   «chat kept»
+ **Phase/Area:** writing a block — merging a branch whose block clashes with another chat's new block   «chat kept»
+    «chat kept»
+ **Issue:** Both branches added a new block at the same place, each ending in the identical closing marker line. Git's conflict took that shared last line out...   «chat kept»
+ **Suggested improvement:** In the skill's merge step: when the handoff file clashes, resolve by keeping both blocks whole, then count the opening and closing...   «chat kept»
+ **Principle:** When both sides of a conflict end in the same line, git keeps that line once, outside the conflict; "keep both" then needs that line added bac...   «chat kept»
```

#### d55797d99 — HANDOFF.md

Identity counts that differ:

- now markers — <!-- now:claude/pr-sched-marks-3205d7 -->: step 0, chat 1
- D-numbers — D1743: step 1, chat 2; D1090: step 2, chat 3; D1792: step 1, chat 3; D1784: step 0, chat 2; D1785: step 0, chat 2; D1820: step 0, chat 1; D1829: step 0, chat 1

```diff
@@ -56,0 +57,10 @@
+ <!-- now:claude/pr-sched-marks-3205d7 -->   «chat kept»
+ ### CHAT 13 — the pictures round's group 3, the schedule's marks and words (D1784, D1785, D1792 a, d) — MERGED 8 Nov 26 on his "merge live", typed in this ch...   «chat kept»
+ - **Built** (an Opus builder helper, reviewed by the host): the waiting mark on an Unavailable row (D1784); the unreadable week's notice and grey refusal (D1...   «chat kept»
+ - **Checked — the sheet is CLOSED:** `raptor-port/docs/handpass/2026-11-08-sched-marks.md` (§1–§15, the roll-call's 27 rows, every reader's claim and its dis...   «chat kept»
+ - **`main` brought in** (`32e9b096d`, about 14:45): the pull request had gone into a clash (three notes files — the handoff, the file map, the screen contrac...   «chat kept»
+ - **Merged** on his "merge live" ("merge live dont clash with the rest"), typed here: `main` brought in a third time (only this file clashed — chat 17's bloc...   «chat kept»
+ - **To put to him** (none blocks the merge): whether an Unavailable change's mark should also show in OIL Earn (Opus reading b); whether the older-version re...   «chat kept»
+ - **Filed:** `[DAMAGED-WEEK-LEFTOVERS]` (point 5 added — the Leave War's pending bid on a damaged date); `[SCHED-MARKS-WALK-ODDS]` (new — the changes window'...   «chat kept»
+ - **Rulings:** none this session (D1820–D1829 unused). **Reads owed:** none (Astra read; Sol 6.1 in the second seat inside D1743's window; the fresh Opus rea...   «chat kept»
+ <!-- /now -->   «chat kept»
```

#### 2cfdfe2d2 — .claude/skill-observations/log.md

Identity counts: all equal.

```diff
@@ -4328,0 +4329,44 @@
+ ### Observation 891: A fault seen only in the walker's own phone set-up is re-checked with its exact steps, not only with the test suite's phone   «chat kept»
+    «chat kept»
+ **Status:** OPEN   «chat kept»
+ **Date:** 2026-11-08   «chat kept»
+ **Session context:** Chat 16, [LW-PIN-LAST-FRAME] (D1870): walker L found the pinned dates row shown early after a resize or a phone turn (L22). Numbered pas...   «chat kept»
+ **Skill:** New skill candidate: walk-scripts (raptor-port/docs/walk-scripts.md) / bug-check order §7 (re-walk after a fix)   «chat kept»
+ **Type:** open-source   «chat kept»
+ **Phase/Area:** turning a walker's finding into a red-first test, and the re-walk after the fix   «chat kept»
+    «chat kept»
+ **Issue:** The walker saw the fault on a desktop narrowed to 420 and on a phone turned sideways and back (its phone: device scale 2, mobile, touch, 402x874)....   «chat kept»
+ **Suggested improvement:** In the re-walk step, and in walk-scripts.md's "turning a finding into a test": when a red-first test does not go red for one of th...   «chat kept»
+ **Principle:** A test that never went red for a case is not evidence that the fix cures that case; reproduce with the finder's own set-up before and after.   «chat kept»
+    «chat kept»
+ ### Observation 892: Times written into a handoff after a compaction came from the summary, not the clock   «chat kept»
+    «chat kept»
+ *Numbered 881 on `claude/lw-pin-last-frame`; renumbered 892 when `main` was brought in on 8 Nov 26 — `main` holds its own 881.*   «chat kept»
+    «chat kept»
+ **Status:** OPEN   «chat kept»
+ **Date:** 2026-11-08   «chat kept»
+ **Session context:** chat 14, [LW-PIN-LAST-FRAME] — saving the state at 90% full, just after a compaction (numbered past 873, held on another branch; renumbe...   «chat kept»
+ **Skill:** session-handoff (writing the block's times)   «chat kept»
+ **Type:** open-source   «chat kept»
+ **Phase/Area:** the state written into the handoff block   «chat kept»
+    «chat kept»
+ **Issue:** The block said the measure ran "~03:40–04:05Z" and the preview was looked for "at 04:06Z"; the clock read 03:36Z and the results files were writte...   «chat kept»
+ **Suggested improvement:** In the handoff skill's block-writing step: every time or date written into the block is read from the clock (`date -u`) or from th...   «chat kept»
+ **Principle:** After a compaction, a time is a fact to look up, not to remember; read it from the clock or the artifact it describes.   «chat kept»
+ Met again 2026-11-08, the same chat ten minutes later: "04:00Z" and "03:50Z" written from memory for what the clock and the files put at 03:45Z and 03:42Z — ...   «chat kept»
+    «chat kept»
+ ### Observation 884: A frame count at a threshold hid the change; the raw intervals and a switch-off run told it   «chat kept»
+    «chat kept»
+ **Status:** OPEN   «chat kept»
+ **Date:** 8 Nov 26   «chat kept»
+ **Session context:** chat 16, [LW-PIN-LAST-FRAME] (D1870) — re-measuring a pinned row after a CSS scroll-timeline change (numbered past 883, held on another ...   «chat kept»
+ **Skill:** New skill candidate: measuring-scroll-performance   «chat kept»
+ **Type:** open-source   «chat kept»
+ **Phase/Area:** the before/after frame measure   «chat kept»
+    «chat kept»
+ **Issue:** The measure counted frames "over 33.4 ms" — the exact edge of two screen refreshes — so a frame landing a tenth of a millisecond either side flipp...   «chat kept»
+    «chat kept»
+ **Suggested improvement:** A frame measure records every raw interval, reports buckets around each refresh multiple rather than one threshold count, repeats ...   «chat kept»
+    «chat kept»
+ **Principle:** A threshold placed on a quantised value measures rounding; bucket around the quanta, repeat the run, and isolate a suspected cause by removing...   «chat kept»
+    «chat kept»
@@ -4392,44 +4435,0 @@
-    «step kept»
- ### Observation 891: A fault seen only in the walker's own phone set-up is re-checked with its exact steps, not only with the test suite's phone   «step kept»
-    «step kept»
- **Status:** OPEN   «step kept»
- **Date:** 2026-11-08   «step kept»
- **Session context:** Chat 16, [LW-PIN-LAST-FRAME] (D1870): walker L found the pinned dates row shown early after a resize or a phone turn (L22). Numbered pas...   «step kept»
- **Skill:** New skill candidate: walk-scripts (raptor-port/docs/walk-scripts.md) / bug-check order §7 (re-walk after a fix)   «step kept»
- **Type:** open-source   «step kept»
- **Phase/Area:** turning a walker's finding into a red-first test, and the re-walk after the fix   «step kept»
-    «step kept»
- **Issue:** The walker saw the fault on a desktop narrowed to 420 and on a phone turned sideways and back (its phone: device scale 2, mobile, touch, 402x874)....   «step kept»
- **Suggested improvement:** In the re-walk step, and in walk-scripts.md's "turning a finding into a test": when a red-first test does not go red for one of th...   «step kept»
- **Principle:** A test that never went red for a case is not evidence that the fix cures that case; reproduce with the finder's own set-up before and after.   «step kept»
-    «step kept»
- ### Observation 892: Times written into a handoff after a compaction came from the summary, not the clock   «step kept»
-    «step kept»
- *Numbered 881 on `claude/lw-pin-last-frame`; renumbered 892 when `main` was brought in on 8 Nov 26 — `main` holds its own 881.*   «step kept»
-    «step kept»
- **Status:** OPEN   «step kept»
- **Date:** 2026-11-08   «step kept»
- **Session context:** chat 14, [LW-PIN-LAST-FRAME] — saving the state at 90% full, just after a compaction (numbered past 873, held on another branch; renumbe...   «step kept»
- **Skill:** session-handoff (writing the block's times)   «step kept»
- **Type:** open-source   «step kept»
- **Phase/Area:** the state written into the handoff block   «step kept»
-    «step kept»
- **Issue:** The block said the measure ran "~03:40–04:05Z" and the preview was looked for "at 04:06Z"; the clock read 03:36Z and the results files were writte...   «step kept»
- **Suggested improvement:** In the handoff skill's block-writing step: every time or date written into the block is read from the clock (`date -u`) or from th...   «step kept»
- **Principle:** After a compaction, a time is a fact to look up, not to remember; read it from the clock or the artifact it describes.   «step kept»
- Met again 2026-11-08, the same chat ten minutes later: "04:00Z" and "03:50Z" written from memory for what the clock and the files put at 03:45Z and 03:42Z — ...   «step kept»
-    «step kept»
- ### Observation 884: A frame count at a threshold hid the change; the raw intervals and a switch-off run told it   «step kept»
-    «step kept»
- **Status:** OPEN   «step kept»
- **Date:** 8 Nov 26   «step kept»
… 10 more lines
```

#### 2cfdfe2d2 — raptor-port/docs/file-map.md

Identity counts: all equal.

```diff
@@ -5,0 +6 @@
+    «chat kept»
```

## The held-out merges — committed after the list was cut (2)

- merges replayed: **2**
- the step settled EVERYTHING git left (nothing for the chat): **1**
- the step settled part, the rest left for the chat (rulings files, app code or a record it leaves): **1**
- the step settled nothing (every clash outside what it settles, or left): **0**
- files it settled whole: **6** — the same bytes as the chat's: **3**, different: **3**; settled in part (a record left): **0**
- the step stopped with an error: **0**

| merge | parents | git left | the step settled | left for the chat |
|---|---|---|---|---|
| ed6282e0b | 62cf7f8b7 ← ee8323438 | .claude/skill-observations/log.md, HANDOFF.md, raptor-port/docs/walk-ledger.md | .claude/skill-observations/log.md (=), HANDOFF.md (=), raptor-port/docs/walk-ledger.md (≠) | — |
| 7dd5dd730 | d3b714982 ← b6f2e7caf | .claude/skill-observations/log.md, HANDOFF.md, OUTSTANDING.md, raptor-port/docs/walk-ledger.md | .claude/skill-observations/log.md (=), HANDOFF.md (≠), raptor-port/docs/walk-ledger.md (≠) | OUTSTANDING.md |

### Every file whose settled result differs from the chat's (3)

Each line: `-` the step wrote it and the chat's file lacks it, `+` the chat's file has it and the step's lacks it; «chat wrote» marks a line neither parent holds (written in the merge itself). None is judged here.

#### ed6282e0b — raptor-port/docs/walk-ledger.md

Identity counts: all equal.

```diff
@@ -383 +382,0 @@
- | 2026-11-08 | The "Not kept" band in a browser that keeps nothing, with the `?nostore` switch (D1901, [TRK-NOSTORE-SAVED]), and the Tracker's magnifier the ...   «step kept»
@@ -384,0 +384 @@
+ | 2026-11-08 | The "Not kept" band in a browser that keeps nothing, with the `?nostore` switch (D1901, [TRK-NOSTORE-SAVED]), and the Tracker's magnifier the ...   «chat kept»
```

#### 7dd5dd730 — HANDOFF.md

Identity counts: all equal.

```diff
@@ -33 +33 @@
- - **Pick up here:** nothing — his "merge live" was typed in chat 35 and chat 35 carries the merge (after 706, chat 30's order) and confirms the live app. `[R...   «step kept»
+ - **Pick up here:** nothing — his "merge live" was typed in chat 35 and chat 35 carries the merge (after 706, chat 30's order) and confirms the live app. `[R...   «chat wrote (in neither parent)»
```

#### 7dd5dd730 — raptor-port/docs/walk-ledger.md

Identity counts: all equal.

```diff
@@ -383 +382,0 @@
- | 2026-11-08 | React Doctor's last findings in People & accounts: 13 import cycles broken (the save layer handed its four loaders and every command type by s...   «step kept»
@@ -385,0 +385 @@
+ | 2026-11-08 | React Doctor's last findings in People & accounts: 13 import cycles broken (the save layer handed its four loaders and every command type by s...   «chat kept»
```

