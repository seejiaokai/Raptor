# The rules diet, step 2 — the new short texts, for the two blind reads and for him (7 Nov 26)

Step 2 of the plan (`../plans/2026-11-07-rules-diet-plan.md` §7) moves text whole and writes only a few short texts. The
moves are done on `claude/rules-diet-step2` (commit `41afc64f3` and after) with `backlog-archive.mjs --move`, bytes
unchanged; `docsize --moves` lists 9 lines that left and did not arrive — every one a pointer edit, listed in part D.
**Every new short text is read for meaning by a fresh Opus reader and by Astra, each blind to the other (D1739);** the
skill-notes short form then goes to him for approval before it is switched on (D969, point F). Nothing goes live without
his "merge live" (D1737). Parts A and B are drafts **not yet switched on**: their hooks are unchanged on the branch until
the reads are done and he approves.

**Switched on 7 Nov 26 (D1740):** both hooks now print parts A and B, and part B's steps 2–4 are in (part E, "The
switch-on's reads"). The short form is 7,448 bytes with D1740's citation — 7,373 as drafted, 7,419 after the readers' fixes.

---

## A. The note on each of his messages (`.claude/hooks/record-decisions.sh`) — 1,188 bytes → 625

**Today** (the whole note):

```
<decision-check>
Before acting on this message: does it contain a DECISION, RULING, PREFERENCE,
CORRECTION, "leave it", explicit NO, or a supersession of something earlier —
anything that outlives the task in front of you?

If yes: record it FIRST, in its AREA's file under .claude/rules/decisions/ (the
three steps are at the head of DECISIONS.md) — his words, what it means, and the
file that will now carry it; mark any ruling it replaces or one-off permission it
spends (in its FULL row, under .claude/decisions-full/); then run
`node raptor-port/scripts/backlog-archive.mjs --rulings` (it moves the new full row
there, leaves its one-line short form, updates the map and archives marked rows —
D390). Before acting on a ruling's detail, open its full row. Then make sure the named
file actually carries it. The work absorbing a ruling is not the record keeping it.
If it OVERWRITES or narrows an earlier ruling, fix what the old one left behind in the
same change: the documents stating it, the app (file the build), the lists (D201).

If no (an ordinary task instruction), ignore this and carry on.

Either way, the closing report carries a `Rulings:` line.
</decision-check>
```

**Proposed** (the plan §5 kept its list of what counts — the hook's whole purpose, D13):

```
<decision-check>
Before acting on this message: does it hold a decision, ruling, preference, correction,
"leave it", explicit no, or a change to something earlier — anything that outlives the
task in front of you? If yes, record it first, in its area's rulings file, before the
work it implies (the rule: `.claude/rules/record-decisions.md`; the steps: the head of
`DECISIONS.md`); if it changes an earlier ruling, fix what that one left behind in the
same change (D201). The work absorbing a ruling is not the record keeping it. If no,
carry on. Either way, the closing report carries a `Rulings:` line.
</decision-check>
```

**Where each part that leaves the note is carried — every one in a file that loads in every chat, or in the steps the
note points to:**

| Part of today's note | Carried by |
|---|---|
| in its area's file under `.claude/rules/decisions/`; the three steps at the head of `DECISIONS.md` | `record-decisions.md` §The rule ("add it to its area's rulings file BEFORE doing the work it implies (the three steps are at the head of `DECISIONS.md`)") — always loaded; the note keeps the pointer to both |
| his words, what it means, and the file that will now carry it | `DECISIONS.md` step 1; `record-decisions.md` §The rule ("Every entry names the file that will now carry it — and then you make that file carry it") |
| mark a ruling it replaces or a permission it spends, in its full row | `DECISIONS.md` step 2; `record-decisions.md` §Two catches, 1 |
| run `backlog-archive.mjs --rulings` (what it does) | `DECISIONS.md` step 3 |
| before acting on a ruling's detail, open its full row | `doc-structure.md` §What a chat reads ("A ruling loads as one line; its full row does not (D390)") and the head of `how-we-work.md` — both always loaded |
| then make sure the named file actually carries it | `record-decisions.md` §The rule (as above) |
| if it overwrites or narrows an earlier ruling, fix what the old one left behind (D201) | `record-decisions.md` §When a ruling overwrites another; `DECISIONS.md` step 2's last sentence |
| the rulings whose full rows name this hook as a home — D13 (the check at the moment he speaks), D137 (each ruling filed in its area's file), D201 (fix what the old one left behind) | the note itself, still: it asks the question, names the area's file and states D201 (the fresh Opus reader's A1) |
| the capitals (DECISION, FIRST, AREA, FULL, OVERWRITES) | none — ordinary letters (D970) |

The hook script changes only its printed text; its comment block stays.

---

## B. The skill-notes guide's short form (his D969, point F) — 27,191 bytes (about 10,200 tokens) a chat → 7,373 bytes (about 2700 tokens)

**The text:** `.claude/skills/task-observer/SHORT-FORM.md` (on the branch; nothing loads it yet). It is drawn from the
vendored guide `.claude/skills/task-observer/SKILL.md` and the project's own notes on it,
`.claude/skills/TASK-OBSERVER-VENDORED.md`.

**How it would be switched on (after the reads and his approval):**
1. `.claude/hooks/task-observer-session-start.sh` prints the short form's text (read from that file) in place of today's
   instruction to invoke the skill; if the file cannot be read, it prints today's instruction unchanged (it fails open).
2. `raptor-port/CLAUDE.md` §How to work here, its "Task-observer activation" line, becomes:
   > **Task-observer activation** (owner, 15 Aug 26; D969): the start hook gives the skill-notes short form (`../.claude/skills/task-observer/SHORT-FORM.md`) — a session it did not reach reads that file; the full skill only for a review, a skill's creation or edit, its setup, or a case it misses; the log: `../.claude/skill-observations/log.md` · full text: docs/guide-full.md §Task-observer activation
   (Within the guide's 350-character limit for a one-line rule; "apply the log's OPEN notes to any skill you load" stays
   in the short form and the full text.)
3. `raptor-port/docs/guide-full.md` §Task-observer activation gains, after its paragraph (which stays):
   > *Since 7 Nov 26 (D969, point F — the rules diet's step 2):* the start hook gives the short form,
   > `.claude/skills/task-observer/SHORT-FORM.md`, in place of the instruction above to invoke the skill before beginning
   > work; the full skill is invoked only to run a review, to create or edit a skill, for a question about its setup, or
   > for a case the short form does not cover. For this project the short form replaces the skill description's
   > instruction to invoke the full skill at every session start; if the hook cannot read the short form, it prints the
   > old instruction, and the full skill is invoked as before. What the paragraph above says of the log and of the OPEN
   > notes stands.
4. `.claude/skills/TASK-OBSERVER-VENDORED.md` §Local changes gains a line naming `SHORT-FORM.md` and the hook change, so
   an upstream refresh keeps them — and the one behaviour change: resolved notes are archived at each review's clean-up,
   not on every write as the guide's "Archival on Write" says.

**What it leaves to the full skill, on purpose:**
- Reviews (the weekly procedure), creating or editing a skill, the taxonomy's licensing and attribution, setup and
  storage-less environments — each invokes the full skill, as the short form's first paragraph says.
- **One behaviour changes:** the full guide's "Archival on Write" moves resolved notes to the archive on *every* write.
  The short form appends only; resolved notes are archived at each review, which is what this project's notes already
  say happens (`TASK-OBSERVER-VENDORED.md` §Reviews in this repo, "Clean up when the review ends"). Any write beyond an
  append follows the full skill's "Log-write safety"; the archive at the review keeps "Archival on Write"'s date rule and
  count check.
- The skill's own description, listed to every chat, still says to invoke it at the start of every session. The short
  form, given by the project's hook, says otherwise for this project. The vendored description is left as it is (an edit
  to a vendored skill belongs to a review); the short form and the guide's paragraph say that for this project the short
  form replaces that instruction (both readers).

---

## C. The other new short texts on the branch (already written; read for faithfulness)

1. **Two pointer lists** — the Leave War rulings that govern the Inputs pages and the Quals page, which no longer load
   with those files once `leave-war.md` loads only on its own files (plan §2): `.claude/rules/decisions/inputs.md`
   (51 bullets, after its "Also read" paragraph) and `.claude/rules/decisions/people-accounts.md` (11 bullets), each
   under a three-line head "**From the Leave War** — …". Each bullet names its ruling's subject in a few words and its
   number (plus the rulings its short line says changed it). A pointer names what a ruling is about; it does not
   restate the rule. **Check each against its short line in `.claude/rules/decisions/leave-war.md`** (and, where it
   ends "— changed by", that its later rulings are cited), and whether any Leave War ruling that governs those pages
   is missing (a helper judged all 373 short lines; its exclusions: D1720, D1727–D1730, D1544, D1550, D1543, D1375, D1308,
   D1681, D1254, D1143, D1210, D1142, D1309, D1291, D1330, D1346, D1448, D1461, D1466, D1467, D1692, D1697, D1698,
   D1711, D1229, D1234, D1203, D1220, D1242, D1326, D1319, D1446, D1173 — the war's own look and controls).
2. **The two seam files' heads** — `.claude/rules/seams/leave-war.md` and `seams/tracker.md`: their `paths:` (the area's
   own paths and the seam paths, copied line for line from the area files) and a three-line note of what the file is.
3. **The project guide's two map rows**, now short (`raptor-port/CLAUDE.md` §Where things live — the Leave War tab, the
   Tracker tab): each keeps its first words and points to the rest of the row, moved whole into its seam file under
   "## The project guide's map row — moved whole …".
4. **The pointers left by the moves** — in `leave-war.md` (§Architecture, the qual catalogue bullet) and `tracker.md`
   (§Architecture); the repointed lines in part D.
5. **The handoff's archive file's head** — `raptor-port/docs/archive/handoff-right-now-2026-11-07.md` — and the pointer
   and today's "RIGHT NOW" line in `HANDOFF.md`.

## D. The 9 lines `docsize --moves` lists as left and not arrived — each a pointer edit

`raptor-port/CLAUDE.md` (the Leave War's and the Tracker's "SECOND / THIRD app" lines: "and on 7 Nov 26 to
`../.claude/rules/seams/…`" added); `leave-war.md` (its head: "its architecture in `.claude/rules/seams/leave-war.md`");
`tracker.md` (its head: "its architecture — `.claude/rules/seams/tracker.md`"); `people-accounts.md` ("the Leave War's
posting sheets and stints: `.claude/rules/seams/leave-war.md`", and its "Also read" paragraph's line ending, which the
pointer list now follows); `raptor-port/docs/data-schema.md` and `engine-rules.md` (one path each). Historical records
(briefs, plans, evidence sheets, full rows, a code comment in `src/tracker/app/core.js`) keep "§Architecture": each area
file's pointer line sends a reader on.

## E. The two blind reads, and what was done (7 Nov 26)

Astra (`2026-11-07-rules-diet-step2-read-astra.md`) and a fresh Opus reader (`…-read-opus.md`), each blind to the
other, both on the texts as first drafted. **A:** Astra no change; the Opus reader one medium — the hook is a named home
of D13, D137 and D201, so the note keeps the area's file and D201 (taken; the table gains its row). **B:** twelve
findings from Astra, seven from the Opus reader, none high; every one taken into `SHORT-FORM.md` — the scan of OPEN notes
at the start; the review date's file; the full list of what to watch; the internal-note exception; the collision notes;
the backup and heading count on a script's write; the flush on presenting a deliverable; the trap's "costs nothing extra";
the citing check; the end-of-session checks; the archival sentence made consistent (both); the merge keeps the reviewed
side and corrects cross-references (both); and the short form says it replaces the description's instruction (Astra).
The switch-on wording above changed with them (the Opus reader's B1 and B7, Astra's 12). **C1:** all 62 bullets checked by
both; fixed — D1352's bullet said the SANS calendar's need is lowered, it is raised (Astra); D1154 added and taken off
the exclusions (Astra); D1338, replaced by D1356, dropped from D998's bullet (Opus); `engine/qualcols.ts` added to
`people-accounts.md`'s paths and named in its head, so the Quals column rulings load with the column list (Opus); D1215
and D1221 added to the People list (Opus). **C5:** the handoff's shortened paths written out (Astra) and its pointer to
the older archive corrected (Opus). Not read a second time, by the agent's call: each fix takes the reader's own words or
a fact checked against the file.

### The switch-on's reads (7 Nov 26, after his approval — D1740)

The switch-on (both hooks, part B's steps 2–4, the file map, and the document check's count of what a chat reads at its
start) was read blind by a fresh Opus reader (all six questions of `2026-11-07-rules-diet-step2-switchon-read-brief.md`;
D1736: a hook change read by one fresh reader before it is switched on) and by Astra (questions 1, 3 and 4 — the meaning of
the texts; D1739). Reports saved whole: `2026-11-07-rules-diet-step2-switchon-read-opus.md`,
`2026-11-07-rules-diet-step2-switchon-read-astra.md`.

- **Both:** D1740's short line is its full row's rule word for word; the hooks print exactly the approved texts; part B's
  steps 2–4 say what part B says. Verdicts: switch on after the named fixes.
- **Astra, medium:** the file map's new row said an area's rulings file loads only with its own files — the Tracker's also
  loads on the shared sign-out file. Fixed with that file named.
- **Opus F1, medium:** the document check counted the short form at the start *and* the full guide in every job, so the
  saving (about 7,500 tokens a chat) would have read as a cost. Fixed: the full guide is no task read when the start gives
  the short form; two self-test cases.
- **Opus F2, medium:** the backlog still called the short form unbuilt. Fixed in its priority line and its item.
- **Opus F3–F5, low:** the start hook now strips a stray control character (it would have broken the output, and the
  session would get no note), and prints the old instruction when the short form is empty or past 9,500 characters (the
  app cuts a note past 10,000 to a 2,000-character preview); the check counts a hook that names the file only in a comment,
  or an empty file, by the fallback it prints. Tested on six cases and two more self-test cases.
- **Opus F6–F9, low:** D1740's full row names the switch-on's homes; this document's head is dated; the file map's two
  sentences and the project guide's map row corrected; the hook's comment names "its setup".
- Not read a second time: each fix takes the reader's own words or code, and the code fixes are pinned by the self-test
  and the hook's six cases.
