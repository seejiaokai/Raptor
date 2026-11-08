# [MERGE-ONCE-RECORDS] — the settle step's replay on real merges (8 Nov 26, chat 33)

**What this is.** The evidence for part 2 of the plan (`raptor-port/docs/superpowers/plans/2026-11-08-merge-once-records-plan.md`
§After the red team, with its Round 3 note): the settle step, `raptor-port/scripts/records-merge.mjs`, run on every clashing merge of
8 Nov 26 exactly as a chat would have run it, and each file it settled compared with the file the chat committed. No screen changes,
so there is no walk (the plan's §Cost); the reads are Astra's and a fresh, blind Opus reader's (`raptor-port/docs/superpowers/briefs/2026-11-08-merge-once-records-read-astra.md`,
`…-read-opus.md`), then their narrow re-read of the fixes (`…-reread-astra.md`, `…-reread-opus.md`). **This is the run after round 3**
— the host's guardrails after the re-read: the insertion-only files settle only text that cannot be confused, the skill log is left
whole when a day heading was added and its citations are never rewritten, a code block that never closes is text, two new handoff
sections at one place are both kept, and the replay's fail rule counts every line. **Rerun after round 4** (9 Nov 26,
`…-round3-astra.md`, `…-round3-opus.md`), refusals only: the log is left whole when either side changes its day headings
at all, or any version holds a code block that never closes; an insertion is settled only at an entry's boundary with no
indented first line; list items join like table rows; the replay fails on every abnormal end of the step. The list's
figures are unchanged by it; the replay passes (exit 0).

**How.** The list — each merge and its two parents — is committed as data, `raptor-port/scripts/records-merge-replay.json`: every
two-parent merge on any branch whose committer date falls between 8 Nov 26 00:00 and the moment the list was cut (Singapore time,
+08:00), kept when its two parents clash again under `git merge-tree`. The held-out merges are the clashing ones committed after the
cut. Each runs in one throwaway clone (its remote and local branches removed, so a renumber sees only the two sides): the first
parent checked out, `git merge --no-commit --no-ff` of the second, the step with `--no-checks`, then each file it settled whole
compared byte for byte with the committed merge, and each file it settled in part compared record by record (every block, note,
section or item it settled, against the chat's of the same name). Every difference is kept whole, nothing shortened, in the
companion file [2026-11-08-merge-once-records-diffs.md](2026-11-08-merge-once-records-diffs.md); below, each file has its counts and a
link. **The replay can fail:** in every file the step settled, an identity — a skill-note number, a handoff block's marker, an `[ID]`
heading, a ruling's row, a `## ` heading, a walk-ledger row — standing more often than in the chat's file and in each parent, or ANY
line that is not blank, standing more often than in the chat's file and more than the most of each parent's count and the two
parents' counts less the base's (a line both sides added stands that often in a correct merge — the host's option 2), fails it
(only a renumbered note's heading is exempt); so does a step that stopped with an error. Re-run:
`node raptor-port/scripts/records-merge-replay.mjs --out raptor-port/docs/handpass/2026-11-08-merge-once-records.md`.

**Nothing below is judged fine by the builder.** Every difference is listed for the host and the readers; the marks on each line say
only where the line came from.

## What the builder saw in it — a sort, not a verdict (for the host and the readers to check)

- **The replay passes (exit 0): nothing doubled, no error, on the list or the held-out set.** The first run after round 3 failed
  twice, on one line, both times with the step's file the sound one: the new every-line rule counted `<!-- /now -->` (the line
  that closes a handoff block). **0db7d583b** — the base had 6 blocks, each side added one (7 and 7), the step wrote 8 blocks with
  8 closing lines; the chat's file has 8 blocks but only 7 closing lines (the lost closer of skill note 895). **8b54a2cd5** —
  base 4 blocks, each side added one, the step kept both (6 closing lines); the chat dropped one, its branch being merged (5). A
  line both sides added stands more often in a correct merge than in either parent, so the host ruled (option 2) that the rule
  is bounded by the base: a line fails only above the chat's count and above the most of each parent's count and the two
  parents' counts less the base's. What that no longer catches — a row both sides added the same and the step wrote twice — the
  step cannot write in round 3 (it never settles a region whose sides share a line), and a doubled block or note is still caught
  by its identity. The regressions (a doubled ledger row, a doubled file-map row, a doubled handoff block, a crash) still fail.
- **Merges.** Of the list's 76 clashing merges the step settled everything in **48**, part in **22** (left: the rulings files, which
  go to `backlog-archive.mjs --rulings --merge`, app code, a working guide, or a record it leaves), nothing in **6**. It stopped with
  an error on none. Against the run before round 3 (52 / 19 / 5): fewer settled, as accepted.
- **Files.** It settled **108** files whole: **49** byte for byte the chat's, **59** different. One file it settled in part
  (c6fe5a302, HANDOFF.md, one block left in git's marks): of its 10 settled records 9 are the chat's; the 1 that differs is the chat's
  own block, rewritten by the chat in the merge itself.
- **What round 3 changed, file by file, against the run before it:**
  - **5 backlog-archive files now left** for the chat (d87d40766, 2474800d6, 50cc26a5c, 423e6c76b — each had differed from the
    chat's — and 68be77639, which had matched): each is items archived by both sides at one place under a "## Moved <day>" heading,
    which the strict rule never joins. The day-heading cases of the rulings archive and the skill log are left the same way; none of
    the list's skill-log clashes added a day heading on a side, so no log changed outcome.
  - **3 file-map files now differ** from the chat's (32e9b096d, 31ac0ebd8, 8b54a2cd5 — each matched before): the notes at the
    file map's head are paragraph-shaped, so the host's rule puts one blank line between this branch's note and main's; the chats
    wrote them one under the other with none. The one differing line in each is that blank line.
  - No file that the step still settles changed in any other way.
- **The held-out set: 7** clashing merges committed after the list was cut (19:26) and before this run (two more than round 2's
  run: 64655d92a, and a01a3d6cc, whose only clash is `DECISIONS.md`, a rulings file the step leaves): everything settled in 2,
  part in 3 (the backlog, `OUTSTANDING.md`, left; app code), nothing in 2 (the backlog; a01a3d6cc). Of
  the **11** files it settled, **7** are the chat's bytes and **4** differ (a walk-ledger row in the other order, twice; one line of
  7dd5dd730's handoff block; 64655d92a's log, where the step renumbered 891 → 903 and the chat chose otherwise against other open
  branches) — whole in the companion. Nothing doubled, no error. **After round 4: 10** — three more since: 9cf023865
  (`DECISIONS-ARCHIVE.md`, the chat's bytes), 40151e9ea (its handoff block differs) and 0fd9bc799 (this branch's own
  bringing in of `main`: log, handoff and file map, all the chat's bytes); everything settled in 2, part in 6, nothing in
  2; of the **16** files settled, **11** the chat's bytes, **5** differ. Nothing doubled, no error.
- **The differences, sorted by shape** (counted on the first run; of the 59 here, 5 are no longer settled and 3 are new, as above):
  - **the same lines, placed differently** — where both sides added text at one place the step puts this branch's first (the skill
    log: main's first); the chats did not keep one order (the skill log main's-first 16 times and this-branch's-first 14, the
    archives 2 and 5, the walk ledger 1 and 4, the file map and the handoff this branch's first every time, 16 and 34);
  - **the chat's own new lines** — its handoff block rewritten in the merge itself, renumbers it made against other open branches
    the replay cannot see (239b25843: 850 → 856), a merged block dropped in the merge (adee1d199), an archive day heading it wrote new
    (c233ee7da);
  - **lines kept or dropped differently, none written by the chat** — mostly notes or items in the other order; three not:
    0db7d583b (the chat's lost block closer, above), 8b54a2cd5 (main's added block, kept by the step, dropped by the chat), and
    d55797d99 (a block removed on the branch: the step removed it, the chat kept it). Each follows the plan's rule; whether either
    chat meant its choice is for the host.
- **Renumbers the step made: 7** on the list (377330417, 18487fc2e twice, b1edcf82b, 1c8650133, 1b3661f7e, 52de38189 — Astra 4's case,
  881 → 892, the chat's own number) and 1 held out (64655d92a). Where the chat's number differs it chose against other open
  branches. Citations are now listed, never rewritten.

<!-- generated by raptor-port/scripts/records-merge-replay.mjs — the list: 76 merges, 2026-11-08T00:00:00+08:00 to 2026-11-08T19:26:27+08:00 (committer date, Singapore time (+08:00)) -->

## The list — 8 Nov 26's clashing merges to 2026-11-08T19:26:27+08:00

- merges replayed: **76**
- the step settled EVERYTHING git left (nothing for the chat): **48**
- the step settled part, the rest left for the chat (rulings files, app code or a record it leaves): **22**
- the step settled nothing (every clash outside what it settles, or left): **6**
- files it settled whole: **108** — the same bytes as the chat's: **49**, different: **59**
- files it settled in part: **1** — their records it settled, compared with the chat's: **10** (the same: **9**, different: **1**); records left in git's marks: **1**
- **identities the step's file holds more often than the chat's and both parents' (a doubled record — the replay fails on any): 0**
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
| d87d40766 | a860f6850 ← 4d5b3828a | .claude/skill-observations/log.md, OUTSTANDING-ARCHIVE.md, raptor-port/docs/file-map.md | .claude/skill-observations/log.md (=), raptor-port/docs/file-map.md (=) | OUTSTANDING-ARCHIVE.md |
| 7009fe1f2 | d21b4e72f ← 4d5b3828a | .claude/skill-observations/log.md, raptor-port/docs/file-map.md | .claude/skill-observations/log.md (=), raptor-port/docs/file-map.md (≠) | — |
| 2474800d6 | 473b69a6a ← d3e0d90ff | .claude/skill-observations/log.md, HANDOFF.md, OUTSTANDING-ARCHIVE.md, raptor-port/docs/file-map.md | .claude/skill-observations/log.md (=), HANDOFF.md (=), raptor-port/docs/file-map.md (=) | OUTSTANDING-ARCHIVE.md |
| 68be77639 | eef1f8eb0 ← d3e0d90ff | .claude/skill-observations/log.md, HANDOFF.md, OUTSTANDING-ARCHIVE.md, raptor-port/docs/file-map.md, raptor-port/docs/walk-ledger.md | .claude/skill-observations/log.md (≠), HANDOFF.md (≠), raptor-port/docs/file-map.md (=), raptor-port/docs/walk-ledger.md (=) | OUTSTANDING-ARCHIVE.md |
| adee1d199 | 539d5f3ec ← d3e0d90ff | .claude/skill-observations/log.md, HANDOFF.md, OUTSTANDING.md, raptor-port/docs/walk-ledger.md | .claude/skill-observations/log.md (=), HANDOFF.md (≠), raptor-port/docs/walk-ledger.md (=) | OUTSTANDING.md |
| f142d848c | 30d47559d ← d3e0d90ff | .claude/skill-observations/log.md, HANDOFF.md | .claude/skill-observations/log.md (≠), HANDOFF.md (≠) | — |
| 6698140d6 | adee1d199 ← db0c6640b | .claude/skill-observations/log.md, HANDOFF.md | .claude/skill-observations/log.md (=), HANDOFF.md (≠) | — |
| 2588688b7 | 3db6b4100 ← db0c6640b | HANDOFF.md | HANDOFF.md (≠) | — |
| ab43e7413 | ee16bd4e5 ← db0c6640b | .claude/decisions-full/how-we-work.md, .claude/decisions-full/scheduler.md, .claude/rules/decisions/how-we-work.md, .claude/rules/decisions/scheduler.md, DECISIONS-ARCHIVE.md, DECISIONS.md, HANDOFF.md | HANDOFF.md (=) | DECISIONS-ARCHIVE.md, .claude/decisions-full/how-we-work.md, .claude/decisions-full/scheduler.md, .claude/rules/decisions/how-we-work.md, .claude/rules/decisions/scheduler.md, DECISIONS.md |
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
| 32e9b096d | 29938aa22 ← 8ae7285fc | HANDOFF.md, raptor-port/docs/file-map.md, raptor-port/docs/ui-contracts.md | HANDOFF.md (=), raptor-port/docs/file-map.md (≠) | raptor-port/docs/ui-contracts.md |
| 7141b1bd8 | b7a81fbd8 ← 8ae7285fc | HANDOFF.md | HANDOFF.md (≠) | — |
| d2194c2d3 | 6c6e4e667 ← 8ae7285fc | HANDOFF.md | HANDOFF.md (=) | — |
| 50cc26a5c | cfa24efc3 ← 6010c3e35 | OUTSTANDING-ARCHIVE.md | — | OUTSTANDING-ARCHIVE.md |
| 7faf81f3b | 86ac0c54b ← 6010c3e35 | .claude/skill-observations/log.md, DECISIONS.md, HANDOFF.md, raptor-port/docs/file-map.md | .claude/skill-observations/log.md (≠), HANDOFF.md (≠), raptor-port/docs/file-map.md (=) | DECISIONS.md |
| 883efe49c | ce312b01b ← 6010c3e35 | .claude/skill-observations/log.md, HANDOFF.md | .claude/skill-observations/log.md (≠), HANDOFF.md (=) | — |
| c6fe5a302 | f10abbc44 ← 0568264be | HANDOFF.md | HANDOFF.md (part: 9 =, 1 ≠, 1 left) | HANDOFF.md |
| 966712bc0 | 2e5ac7eb5 ← 0568264be | HANDOFF.md | HANDOFF.md (≠) | — |
| 2a825037b | d2194c2d3 ← 0568264be | HANDOFF.md | HANDOFF.md (=) | — |
| 95dd5a9c0 | 883efe49c ← 0568264be | HANDOFF.md | HANDOFF.md (≠) | — |
| 2b2fbefc7 | 7faf81f3b ← 0568264be | HANDOFF.md | HANDOFF.md (≠) | — |
| 2792c00a1 | 966712bc0 ← dd2b7c234 | HANDOFF.md | HANDOFF.md (≠) | — |
| fdbe3b4b9 | 2a825037b ← dd2b7c234 | HANDOFF.md | HANDOFF.md (=) | — |
| c4ab4a889 | ef05afd5d ← 0abda89d5 | HANDOFF.md | HANDOFF.md (=) | — |
| 52de38189 | f713485d2 ← 0abda89d5 | .claude/skill-observations/log.md | .claude/skill-observations/log.md (≠) | — |
| 916d42e3c | f936541cc ← 41b264227 | HANDOFF.md, raptor-port/docs/file-map.md | HANDOFF.md (=), raptor-port/docs/file-map.md (≠) | — |
| 31ac0ebd8 | 0edba187a ← 41b264227 | HANDOFF.md, raptor-port/docs/file-map.md | HANDOFF.md (=), raptor-port/docs/file-map.md (≠) | — |
| 790598011 | 52de38189 ← 41b264227 | raptor-port/docs/file-map.md, raptor-port/docs/walk-ledger.md | raptor-port/docs/file-map.md (=), raptor-port/docs/walk-ledger.md (=) | — |
| 015000f0b | 31ac0ebd8 ← 99ecc114d | HANDOFF.md | HANDOFF.md (=) | — |
| 765b2b9a0 | 91fb25ed1 ← 99ecc114d | HANDOFF.md | HANDOFF.md (=) | — |
| 8b54a2cd5 | 29fa3147e ← d8d5b1f57 | .claude/skill-observations/log.md, HANDOFF.md, raptor-port/docs/file-map.md | .claude/skill-observations/log.md (≠), HANDOFF.md (≠), raptor-port/docs/file-map.md (≠) | — |
| e97e0852b | 5ae068c34 ← e7fb20aad | .claude/rules/decisions/design.md | — | .claude/rules/decisions/design.md |
| a3bb57b3e | 0f2697c78 ← e7fb20aad | .claude/skill-observations/log.md, HANDOFF.md | .claude/skill-observations/log.md (≠), HANDOFF.md (≠) | — |
| f54a6a272 | 2c0d4d545 ← fc85d7df9 | HANDOFF.md | HANDOFF.md (=) | — |
| f9a2ff6e5 | 24fe29936 ← fc85d7df9 | HANDOFF.md | HANDOFF.md (=) | — |
| 8712be8d2 | 2acd75a51 ← 535fdc94f | HANDOFF.md | HANDOFF.md (=) | — |
| 423e6c76b | f635a5442 ← ae0fe14fe | HANDOFF.md, OUTSTANDING-ARCHIVE.md, OUTSTANDING.md | HANDOFF.md (≠) | OUTSTANDING-ARCHIVE.md, OUTSTANDING.md |
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

### Every file whose settled result differs from the chat's (60)

Each with its identity counts that differ and its count of differing lines; every line of every difference, whole, is in the companion file, [2026-11-08-merge-once-records-diffs.md](2026-11-08-merge-once-records-diffs.md), under the same heading.

- **c233ee7da — DECISIONS-ARCHIVE.md** — 5 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#c233ee7da--decisions-archivemd)); identity counts: ## headings — ## Moved 8 Nov 26: step 0, chat 1
- **086bf4e0a — HANDOFF.md** — 2 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#086bf4e0a--handoffmd)); identity counts: all equal
- **1ac1c0e8e — .claude/skill-observations/log.md** — 52 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#1ac1c0e8e--claudeskill-observationslogmd)); identity counts: all equal
- **239b25843 — .claude/skill-observations/log.md** — 3 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#239b25843--claudeskill-observationslogmd)); identity counts: skill-note numbers — Observation 850: step 1, chat 0; Observation 856: step 0, chat 1
- **45a9c99b3 — .claude/skill-observations/log.md** — 26 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#45a9c99b3--claudeskill-observationslogmd)); identity counts: all equal
- **1264dc677 — raptor-port/docs/walk-ledger.md** — 2 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#1264dc677--raptor-portdocswalk-ledgermd)); identity counts: all equal
- **321529dc5 — .claude/skill-observations/log.md** — 26 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#321529dc5--claudeskill-observationslogmd)); identity counts: all equal
- **4c43c8fdf — .claude/skill-observations/log.md** — 25 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#4c43c8fdf--claudeskill-observationslogmd)); identity counts: all equal
- **ae71c90f2 — .claude/skill-observations/log.md** — 1 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#ae71c90f2--claudeskill-observationslogmd)); identity counts: all equal
- **377330417 — .claude/skill-observations/log.md** — 2 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#377330417--claudeskill-observationslogmd)); identity counts: all equal
- **7009fe1f2 — raptor-port/docs/file-map.md** — 2 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#7009fe1f2--raptor-portdocsfile-mapmd)); identity counts: all equal
- **68be77639 — .claude/skill-observations/log.md** — 28 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#68be77639--claudeskill-observationslogmd)); identity counts: all equal
- **68be77639 — HANDOFF.md** — 2 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#68be77639--handoffmd)); identity counts: all equal
- **adee1d199 — HANDOFF.md** — 22 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#adee1d199--handoffmd)); identity counts: all equal
- **f142d848c — .claude/skill-observations/log.md** — 4 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#f142d848c--claudeskill-observationslogmd)); identity counts: skill-note numbers — Observation 864: step 1, chat 0; Observation 872: step 0, chat 1
- **f142d848c — HANDOFF.md** — 2 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#f142d848c--handoffmd)); identity counts: all equal
- **6698140d6 — HANDOFF.md** — 2 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#6698140d6--handoffmd)); identity counts: all equal
- **2588688b7 — HANDOFF.md** — 8 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#2588688b7--handoffmd)); identity counts: all equal
- **031288dc8 — HANDOFF.md** — 6 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#031288dc8--handoffmd)); identity counts: all equal
- **7c00f7b1c — HANDOFF.md** — 2 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#7c00f7b1c--handoffmd)); identity counts: all equal
- **18487fc2e — .claude/skill-observations/log.md** — 8 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#18487fc2e--claudeskill-observationslogmd)); identity counts: skill-note numbers — Observation 874: step 1, chat 0; Observation 877: step 0, chat 1
- **18487fc2e — HANDOFF.md** — 14 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#18487fc2e--handoffmd)); identity counts: all equal
- **0db7d583b — .claude/skill-observations/log.md** — 25 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#0db7d583b--claudeskill-observationslogmd)); identity counts: all equal
- **0db7d583b — HANDOFF.md** — 1 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#0db7d583b--handoffmd)); identity counts: all equal
- **a4d23f2fa — HANDOFF.md** — 2 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#a4d23f2fa--handoffmd)); identity counts: all equal
- **b1edcf82b — .claude/skill-observations/log.md** — 2 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#b1edcf82b--claudeskill-observationslogmd)); identity counts: all equal
- **7d403d12c — raptor-port/docs/file-map.md** — 1 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#7d403d12c--raptor-portdocsfile-mapmd)); identity counts: all equal
- **b8011e768 — HANDOFF.md** — 2 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#b8011e768--handoffmd)); identity counts: all equal
- **1c8650133 — .claude/skill-observations/log.md** — 27 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#1c8650133--claudeskill-observationslogmd)); identity counts: all equal
- **1c8650133 — HANDOFF.md** — 2 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#1c8650133--handoffmd)); identity counts: all equal
- **e0b0b0d36 — .claude/skill-observations/log.md** — 41 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#e0b0b0d36--claudeskill-observationslogmd)); identity counts: all equal
- **e0b0b0d36 — raptor-port/docs/file-map.md** — 1 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#e0b0b0d36--raptor-portdocsfile-mapmd)); identity counts: all equal
- **110b3a2c2 — .claude/skill-observations/log.md** — 4 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#110b3a2c2--claudeskill-observationslogmd)); identity counts: skill-note numbers — Observation 874: step 1, chat 0; Observation 881: step 0, chat 1
- **110b3a2c2 — HANDOFF.md** — 2 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#110b3a2c2--handoffmd)); identity counts: all equal
- **110b3a2c2 — raptor-port/docs/file-map.md** — 2 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#110b3a2c2--raptor-portdocsfile-mapmd)); identity counts: all equal
- **1b3661f7e — .claude/skill-observations/log.md** — 54 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#1b3661f7e--claudeskill-observationslogmd)); identity counts: all equal
- **8ed7e85a8 — .claude/skill-observations/log.md** — 1 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#8ed7e85a8--claudeskill-observationslogmd)); identity counts: all equal
- **32e9b096d — raptor-port/docs/file-map.md** — 1 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#32e9b096d--raptor-portdocsfile-mapmd)); identity counts: all equal
- **7141b1bd8 — HANDOFF.md** — 4 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#7141b1bd8--handoffmd)); identity counts: all equal
- **7faf81f3b — .claude/skill-observations/log.md** — 52 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#7faf81f3b--claudeskill-observationslogmd)); identity counts: all equal
- **7faf81f3b — HANDOFF.md** — 2 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#7faf81f3b--handoffmd)); identity counts: all equal
- **883efe49c — .claude/skill-observations/log.md** — 26 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#883efe49c--claudeskill-observationslogmd)); identity counts: all equal
- **c6fe5a302 — HANDOFF.md** (settled in part; records different: now:claude/chat19-checks) — 6 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#c6fe5a302--handoffmd)); identity counts: all equal
- **966712bc0 — HANDOFF.md** — 2 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#966712bc0--handoffmd)); identity counts: all equal
- **95dd5a9c0 — HANDOFF.md** — 2 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#95dd5a9c0--handoffmd)); identity counts: all equal
- **2b2fbefc7 — HANDOFF.md** — 18 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#2b2fbefc7--handoffmd)); identity counts: all equal
- **2792c00a1 — HANDOFF.md** — 4 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#2792c00a1--handoffmd)); identity counts: all equal
- **52de38189 — .claude/skill-observations/log.md** — 60 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#52de38189--claudeskill-observationslogmd)); identity counts: all equal
- **916d42e3c — raptor-port/docs/file-map.md** — 1 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#916d42e3c--raptor-portdocsfile-mapmd)); identity counts: all equal
- **31ac0ebd8 — raptor-port/docs/file-map.md** — 1 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#31ac0ebd8--raptor-portdocsfile-mapmd)); identity counts: all equal
- **8b54a2cd5 — .claude/skill-observations/log.md** — 51 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#8b54a2cd5--claudeskill-observationslogmd)); identity counts: all equal
- **8b54a2cd5 — HANDOFF.md** — 10 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#8b54a2cd5--handoffmd)); identity counts: now markers — <!-- now:claude/pr-sched-marks-3205d7 -->: step 1, chat 0
- **8b54a2cd5 — raptor-port/docs/file-map.md** — 1 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#8b54a2cd5--raptor-portdocsfile-mapmd)); identity counts: all equal
- **a3bb57b3e — .claude/skill-observations/log.md** — 51 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#a3bb57b3e--claudeskill-observationslogmd)); identity counts: all equal
- **a3bb57b3e — HANDOFF.md** — 9 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#a3bb57b3e--handoffmd)); identity counts: all equal
- **423e6c76b — HANDOFF.md** — 6 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#423e6c76b--handoffmd)); identity counts: all equal
- **d55797d99 — .claude/skill-observations/log.md** — 75 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#d55797d99--claudeskill-observationslogmd)); identity counts: all equal
- **d55797d99 — HANDOFF.md** — 10 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#d55797d99--handoffmd)); identity counts: now markers — <!-- now:claude/pr-sched-marks-3205d7 -->: step 0, chat 1
- **2cfdfe2d2 — .claude/skill-observations/log.md** — 88 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#2cfdfe2d2--claudeskill-observationslogmd)); identity counts: all equal
- **2cfdfe2d2 — raptor-port/docs/file-map.md** — 1 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#2cfdfe2d2--raptor-portdocsfile-mapmd)); identity counts: all equal

## The held-out merges — committed after the list was cut (10)

- merges replayed: **10**
- the step settled EVERYTHING git left (nothing for the chat): **2**
- the step settled part, the rest left for the chat (rulings files, app code or a record it leaves): **6**
- the step settled nothing (every clash outside what it settles, or left): **2**
- files it settled whole: **16** — the same bytes as the chat's: **11**, different: **5**
- files it settled in part: **0** — their records it settled, compared with the chat's: **0** (the same: **0**, different: **0**); records left in git's marks: **0**
- **identities the step's file holds more often than the chat's and both parents' (a doubled record — the replay fails on any): 0**
- the step stopped with an error: **0**

| merge | parents | git left | the step settled | left for the chat |
|---|---|---|---|---|
| ed6282e0b | 62cf7f8b7 ← ee8323438 | .claude/skill-observations/log.md, HANDOFF.md, raptor-port/docs/walk-ledger.md | .claude/skill-observations/log.md (=), HANDOFF.md (=), raptor-port/docs/walk-ledger.md (≠) | — |
| 7dd5dd730 | d3b714982 ← b6f2e7caf | .claude/skill-observations/log.md, HANDOFF.md, OUTSTANDING.md, raptor-port/docs/walk-ledger.md | .claude/skill-observations/log.md (=), HANDOFF.md (≠), raptor-port/docs/walk-ledger.md (≠) | OUTSTANDING.md |
| 2d67ef3f1 | 5402d4f30 ← d9bec50bb | raptor-port/docs/file-map.md | raptor-port/docs/file-map.md (=) | — |
| 46917540c | 16ece0fe1 ← 4db6473e8 | .claude/skill-observations/log.md, HANDOFF.md, OUTSTANDING.md | .claude/skill-observations/log.md (=), HANDOFF.md (=) | OUTSTANDING.md |
| 01590506f | e8dc83e96 ← 027b2923f | OUTSTANDING.md | — | OUTSTANDING.md |
| 64655d92a | f4736152b ← 9e493393b | .claude/skill-observations/log.md, raptor-port/docs/file-map.md, raptor-port/src/ui/GuestApp.tsx | .claude/skill-observations/log.md (≠), raptor-port/docs/file-map.md (=) | raptor-port/src/ui/GuestApp.tsx |
| a01a3d6cc | ba81f7b51 ← 405a42801 | DECISIONS.md | — | DECISIONS.md |
| 9cf023865 | 5fd41c8f8 ← 2e29291ee | DECISIONS-ARCHIVE.md, DECISIONS.md | DECISIONS-ARCHIVE.md (=) | DECISIONS.md |
| 40151e9ea | a8713ef5a ← 2c1818c58 | .claude/decisions-full/how-we-work.md, .claude/rules/decisions/design.md, .claude/rules/decisions/how-we-work.md, .claude/rules/decisions/tracker.md, DECISIONS.md, HANDOFF.md, raptor-port/scripts/docsize.mjs | HANDOFF.md (≠) | raptor-port/scripts/docsize.mjs, .claude/decisions-full/how-we-work.md, .claude/rules/decisions/design.md, .claude/rules/decisions/how-we-work.md, .claude/rules/decisions/tracker.md, DECISIONS.md |
| 0fd9bc799 | 9d3d6d901 ← 2c1818c58 | .claude/decisions-full/how-we-work.md, .claude/skill-observations/log.md, HANDOFF.md, raptor-port/docs/file-map.md | .claude/skill-observations/log.md (=), HANDOFF.md (=), raptor-port/docs/file-map.md (=) | .claude/decisions-full/how-we-work.md |

### Renumbers the step made

- 64655d92a: renumbered in .claude/skill-observations/log.md: Observation 891 → 903 "A fault seen only in the walker's own phone set-up is re-checked with its exact steps, not only with the test suite's phone" (main has its own 891)
- 0fd9bc799: renumbered in .claude/skill-observations/log.md: Observation 904 → 905 ""Add-only" was a guess about a file — its edit history said otherwise" (main has its own 904)

### Every file whose settled result differs from the chat's (5)

Each with its identity counts that differ and its count of differing lines; every line of every difference, whole, is in the companion file, [2026-11-08-merge-once-records-diffs.md](2026-11-08-merge-once-records-diffs.md), under the same heading.

- **ed6282e0b — raptor-port/docs/walk-ledger.md** — 2 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#ed6282e0b--raptor-portdocswalk-ledgermd)); identity counts: all equal
- **7dd5dd730 — HANDOFF.md** — 2 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#7dd5dd730--handoffmd)); identity counts: all equal
- **7dd5dd730 — raptor-port/docs/walk-ledger.md** — 2 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#7dd5dd730--raptor-portdocswalk-ledgermd)); identity counts: all equal
- **64655d92a — .claude/skill-observations/log.md** — 27 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#64655d92a--claudeskill-observationslogmd)); identity counts: all equal
- **40151e9ea — HANDOFF.md** — 10 differing line(s) ([whole](2026-11-08-merge-once-records-diffs.md#40151e9ea--handoffmd)); identity counts: now markers — <!-- now:claude/rules-diet-step-5a-tracker-de959c -->: step 0, chat 1

