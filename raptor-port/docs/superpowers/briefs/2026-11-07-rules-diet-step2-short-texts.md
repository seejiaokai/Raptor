# The rules diet, step 2 — the new short texts, for the two blind reads and for him (7 Nov 26)

Step 2 of the plan (`../plans/2026-11-07-rules-diet-plan.md` §7) moves text whole and writes only a few short texts. The
moves are done on `claude/rules-diet-step2` (commit `41afc64f3` and after) with `backlog-archive.mjs --move`, bytes
unchanged; `docsize --moves` lists 9 lines that left and did not arrive — every one a pointer edit, listed in part D.
**Every new short text is read for meaning by a fresh Opus reader and by Astra, each blind to the other (D1739);** the
skill-notes short form then goes to him for approval before it is switched on (D969, point F). Nothing goes live without
his "merge live" (D1737). Parts A and B are drafts **not yet switched on**: their hooks are unchanged on the branch until
the reads are done and he approves.

---

## A. The note on each of his messages (`.claude/hooks/record-decisions.sh`) — 1,188 bytes → about 560

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
task in front of you? If yes, record it first, before the work it implies
(`.claude/rules/record-decisions.md`; the steps are at the head of `DECISIONS.md`): the
work absorbing a ruling is not the record keeping it. If no, carry on. Either way, the
closing report carries a `Rulings:` line.
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
| the capitals (DECISION, FIRST, AREA, FULL, OVERWRITES) | none — ordinary letters (D970) |

The hook script changes only its printed text; its comment block stays.

---

## B. The skill-notes guide's short form (his D969, point F) — 27,191 bytes (about 10,200 tokens) a chat → 5,889 (about 2,200)

**The text:** `.claude/skills/task-observer/SHORT-FORM.md` (on the branch; nothing loads it yet). It is drawn from the
vendored guide `.claude/skills/task-observer/SKILL.md` and the project's own notes on it,
`.claude/skills/TASK-OBSERVER-VENDORED.md`.

**How it would be switched on (after the reads and his approval):**
1. `.claude/hooks/task-observer-session-start.sh` prints the short form's text (read from that file) in place of today's
   instruction to invoke the skill; if the file cannot be read, it prints today's instruction unchanged (it fails open).
2. `raptor-port/CLAUDE.md` §How to work here, its "Task-observer activation" line, becomes:
   > **Task-observer activation** (owner, 15 Aug 26; D969): the start hook gives the skill-notes short form (`../.claude/skills/task-observer/SHORT-FORM.md`); the full skill only for a review, a skill's creation or edit, or a case it misses; the one log: `../.claude/skill-observations/log.md` · full text: docs/guide-full.md §Task-observer activation
   (Within the guide's 350-character limit for a one-line rule; "apply the log's OPEN notes to any skill you load" stays
   in the short form and the full text.)
3. `raptor-port/docs/guide-full.md` §Task-observer activation gains, after its paragraph (which stays):
   > *Since 7 Nov 26 (D969, point F — the rules diet's step 2):* the start hook gives the short form,
   > `.claude/skills/task-observer/SHORT-FORM.md`, in place of the instruction above to invoke the skill before beginning
   > work; the full skill is invoked only to run a review, to create or edit a skill, for a question about its setup, or
   > for a case the short form does not cover. What the paragraph above says of the log and of the OPEN notes stands.
4. `.claude/skills/TASK-OBSERVER-VENDORED.md` §Local changes gains a line naming `SHORT-FORM.md` and the hook change, so
   an upstream refresh keeps them.

**What it leaves to the full skill, on purpose:**
- Reviews (the weekly procedure), creating or editing a skill, the taxonomy's licensing and attribution, setup and
  storage-less environments — each invokes the full skill, as the short form's first paragraph says.
- **One behaviour changes:** the full guide's "Archival on Write" moves resolved notes to the archive on *every* write.
  The short form appends only; resolved notes are archived at each review, which is what this project's notes already
  say happens (`TASK-OBSERVER-VENDORED.md` §Reviews in this repo, "Clean up when the review ends"). Any write beyond an
  append still follows the full skill's two sections.
- The skill's own description, listed to every chat, still says to invoke it at the start of every session. The short
  form, given by the project's hook, says otherwise for this project. The vendored description is left as it is (an edit
  to a vendored skill belongs to a review).

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
   D1681, D1254, D1143, D1210, D1142, D1154, D1309, D1291, D1330, D1346, D1448, D1461, D1466, D1467, D1692, D1697, D1698,
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
