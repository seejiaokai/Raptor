# The rules diet — the plan, with sizes before and after (D1732, 7 Nov 26)

**Status: v1, for his approval. Nothing in it is done; no rule changes until he approves (D1732).** Read blind by a fresh
Opus reader and by Astra (his call, D1734) — the brief: `raptor-port/docs/superpowers/briefs/2026-11-07-rules-diet-plan-read.md`.
The brief before this plan: `2026-11-06-rules-diet.md`. Backlog item: `[RULES-DIET]`. Two samples written for it, each a
real conversion measured: `2026-11-07-rules-diet-sample-how-we-work.md` and `2026-11-07-rules-diet-sample-oil.md`.

---

## Part 1 — for him, in one page

**The problem, measured today.** Before a chat touches any code, the project's own rules ask it to read a lot. Counted in
tokens (the unit the chat fills up in), for a chat that does every read its rules ask for:

| A chat that… | Today | The diet as you named it | The diet plus six more reads cut |
|---|---|---|---|
| only writes notes | 92,000 | 67,000 | 40,000 |
| fixes the Leave War, with a walk | 319,000 | 222,000 | 131,000 |
| changes a scheduler screen, with a walk | 300,000 | 212,000 | 121,000 |
| works on the Inputs pages, with a walk | 368,000 | 239,000 | 131,000 |
| works on the Tracker, with a walk | 266,000 | 200,000 | 109,000 |

The rules every chat loads before you type are about 40,000 of these (the app's own count on 7 Nov said 38,000 — the
measure agrees). On top of every row, the app itself takes about 112,000 (its own instructions and tools — not ours to
cut), and a chat compacts at about 384,000 (D1671). So a Leave War job that did every read its rules ask for would need
about 430,000 and an Inputs job about 480,000 — more than a chat holds — before writing a line of code. A chat cannot obey
all its reading rules and still work: it skips reads, or compacts before it starts. That is the forgetting and the
constant handoffs you see. After the full diet the same Inputs job starts at about 243,000, leaving about 140,000 for the
work itself.

**Why trimming did not last.** The rulings were 754 on 17 Oct and are 1,337 today — about 28 a day. The 17 Oct trim
(D969–D971) was refilled within weeks, because every ruling stays a line in a file that loads. The diet changes the shape,
not just the size: each area becomes a page of how it works NOW; a new ruling usually rewrites a line that is already
there instead of adding one; your words and the history stay whole in the searched files, as today.

**What changes, in five lines.**
1. Each area's rulings file (Leave War, scheduler, Inputs, design, people, Tracker, OIL, IT guide) becomes a short page:
   "how it works now", each line ending with the ruling numbers behind it, then a list of settled designs by screen.
   Your words, the dates and the history stay whole in the full rows, searched — nothing is deleted.
2. The general rulings and the five rule files every chat loads become checklists; their stories move whole to the guide.
3. The bug-check order becomes a one-page checklist that names the section to open at each step.
4. Rules become automatic checks: the document check fails if any live ruling is missing from its area's page, or if a
   page still leans on a ruling that was replaced — so nothing can be lost or left stale without the check going red.
5. Every converted page is read by a fresh reader against the rows it replaces, line by line, for meaning (D138).

**The two samples, measured.** The general rulings every chat loads: 21,200 → 4,900 tokens (−77%), all 207 rulings
accounted for — 184 placed on the page, 23 proposed for the archive as spent or restated. The OIL rulings: 5,900 → 3,800
(−36%) — a small area where nearly every ruling is still live. The big areas fall between; the projection uses the middle.

**What you are asked to rule** (§7 has each with the agent's recommendation):
1. Approve the shape: area pages plus searched full rows, in place of "every ruling loads as one line" (sets aside D136
   and the loading part of D390). D141 stands — no size targets; the test is meaning.
2. Which of the six extra reads to cut too (the right-hand column above): the design guide opened by section, the
   ripple map opened by entry, a short form of the skill-notes guide, the shorter note on every message, the handoff's old
   "right now" lines and the project guide's long map rows, and the Leave War's and Tracker's links to the rest of the
   app split into small files of their own. Recommended: all six.
3. Your permission to change the document check, the recording script and the ruling hook for it, each tested and read by
   one fresh reader before it is switched on (as D976 and D1539 did).
4. Optional: Astra as a second reader on the two biggest pages (Leave War, scheduler) — your call each time (D1734).

**Cost and order.** About 8 to 10 chats (or 3 to 4 nights), in six steps, each its own pull request on your "merge live":
the checks first, then the every-chat files, then the areas smallest first with a re-measure and a report to you after the
first five, then the bug-check checklist, then the extra reads, then the final measure.

---

## Part 2 — the plan in detail (for the readers and the builder)

### 1. How it was measured

- Script: kept outside the repo this session (`/tmp/measure/readsize.mjs`); step 1 adds it as `docsize --reads` so the
  same numbers can be taken again (§5). Bytes are exact. Tokens use the project's own estimate, calibrated on measured
  loads (`docsize.mjs` `estTokens`, D969, 17 Oct 26 — about 2.74 characters a token, capitals dearer); it gives 39,775 for
  the every-chat files, and the app's own count on 7 Nov 26 was about 38,000 (D1732's reading 3), so take every figure as
  ±10%. (Anthropic's older public tokenizer read the same files about 30% lower — not used.) The app's own share — its
  prompt and tools, about 112,000 (150,000 before he types on 6 Nov, less the 38,000 of ours) — and his PC's own memory
  notes are not measurable from here.
- "By rule" means every read a rule tells a chat to do for that kind of job, whole where the rule says open a document,
  in part where it names a part. Assumptions: the Leave War job also loads `oil.md` and `people-accounts.md` (their paths
  match the grid and state files); the Inputs job loads `scheduler.md` (any `src/ui` file) and `leave-war.md`
  (`InputsPage.tsx`, `inputedit.tsx` are on its seam paths); the ripple map read is `feature-impact.md` §1 (surfaces) and
  §3 (checklist); 40 messages a chat for the per-message note.

**The layers today (tokens):**

| Layer | What | Tokens |
|---|---|---|
| A. Every chat, before he types | the five unscoped rule files 15,576 (shipping 5,422 · doc-structure 3,381 · record-decisions 2,599 · plain-language 2,057 · bug-check 2,117) · `how-we-work.md` 21,236 · task-observer note 334 · skill and helper descriptions 2,629 | 39,775 |
| B. Every chat, at its first task, by rule | task-observer `SKILL.md` 10,198 · `HANDOFF.md` 8,499 · `OUTSTANDING.md` head and priority list 14,886 | 33,583 |
| C. Over a chat's life | the decision-check note, about 470 tokens on each of his messages × 40 | 18,803 |
| D. Any `raptor-port/` file opened | `raptor-port/CLAUDE.md` | 15,188 |
| E. Any `raptor-port/src` file opened | `raptor-executor.md` 1,883 · `ui-design.md` 2,768 · `decisions/design.md` 7,920 | 12,571 |
| F. The area's rulings | Leave War job 64,416 (leave-war 51,059 · oil 5,856 · people-accounts 7,501) · scheduler 45,057 · Inputs job 113,610 (inputs 17,494 · scheduler · leave-war) · Tracker 11,401 | 11,401–113,610 |
| G. A bug check of a screen | `bug-check-order.md` whole 40,301 · walk ledger's sizing step 1,620 · `walk-scripts.md` 13,220 | 55,141 |
| H. Interface work | `design-practices.md` whole ("open the ONE guide") | 50,631 |
| I. Weigh the whole ecosystem | `feature-impact.md` §1 and §3 | 28,856 |

**Other facts the plan rests on:** 1,337 live rulings (207 general, 373 Leave War, 324 scheduler, 159 Inputs, 80 people,
69 design, 68 Tracker, 48 OIL, 9 IT guide); 401 of them carry "— changed by"; **of the 1,130 rulings outside the general file, 891 (79%) have their number named in
at least one unit or browser test** (a search of `src` and `e2e` for each number — a mention, not proof that the test pins
the whole rule), so most settled designs already have a test that points at them; the
skill-notes log is 398,690 bytes with 86 notes open and its last review on 27 Oct 26.

### 1a. How the "after" numbers were projected

Measured: the two samples (general rulings 21,236 → 4,873; OIL 5,856 → 3,773). Projected for the other areas from each
file's parts (bytes): its rulings lines and preamble kept at 35% (the samples ran 23% and 64%), its "Settled" sections at
50%, its architecture at 80% (moved to a seam file, §2) — a range beside each, from "every area like the general rulings"
to "every area like OIL":

| Area | Today | Page after (range) |
|---|---|---|
| Leave War | 51,059 | 17,200 (11,200–29,700) + seam file 4,000 |
| Scheduler | 45,057 | 17,800 (11,700–30,300) |
| Inputs | 17,494 | 6,600 (4,400–11,100) |
| Design | 7,920 | 2,900 (1,800–5,000) |
| People and accounts | 7,501 | 3,100 (2,200–4,900) |
| Tracker | 11,401 | 2,700 (1,800–4,600) + seam file 3,300 |
| IT guide | 1,505 | 600 (400–1,000) |
| OIL (sample) | 5,856 | 3,773 |

The job rows of Part 1 at the pessimistic end: Leave War 239,000 / 149,000, Inputs 272,000 / 152,000 (diet as named /
with the extra reads). The checklists of §3 and §4 and the extra reads of §6 are estimates — not drafted; each is
measured when it is written.

### 2. The shape of an area page

The file keeps its name and its `paths:` (so it loads exactly when it loads today). Its body:

```
# <Area> — how it works now
<three lines: what this page is; each line ends with the rulings behind it; the full rows and how to search them;
 search them before acting on a detail or asking him>

## <topic> … (the rules a builder must keep: current behaviour and principles, one line each, [Dn, Dm])

## Settled designs — guarded by tests
<surface>: <a few words> [Dn]; <a few words> [Dm] …   (one line a surface; before changing anything on that surface,
                                                      open its rows — the list says which numbers)

## From other areas — one line each, pointing to the page that states it
```

**One home per ruling.** Each ruling is STATED on one page (its area's); another page may point to it by number. A
ruling that changes another is folded into the one current statement, which cites both — so "— changed by" chains
disappear from what loads and stay in the full rows.

**The account.** Each conversion writes an account table (as in both samples): every ruling of the old file → the line
that now carries it, or **spent**, **restated in full** (D971) or **replaced**, with the reason. The rows proposed for the
archive go through the existing route (`backlog-archive.mjs --rulings`, the mark written in the full row), each confirmed
by the fresh reader.

**The seam files (extra read 5).** The Leave War's and the Tracker's `## Architecture` sections load today on the files
where they meet the rest of the app (the 24 Sep red team widened their paths so an edit there carries the architecture).
Proposed: each section moves whole into `decisions/leave-war-seams.md` / `tracker-seams.md`, loaded on those seam paths;
the area page loads only on its own files. An Inputs job then loads the Leave War's seam file (about 4,000 tokens), not its whole
page (51,059).

### 3. The every-chat layer

- **`how-we-work.md` → the sample page** (`…-sample-how-we-work.md`): 21,236 → 4,873 tokens. It states each general
  ruling once; the ones the five rule files carry are listed by number only at its head.
- **The five rule files → checklists** (estimates — not drafted): `shipping.md` 5,422 → ~2,000 (the loop, merge live,
  the checks — the 7 Sep / 9 Sep stories and the private-repo detail to `guide-full.md`); `doc-structure.md` 3,381 →
  ~1,300 (the table stays, the policy prose to `doc-budget.md`); `record-decisions.md` 2,599 → ~1,100 (the new recording
  steps, the read-before-asking check); `plain-language.md` 2,057 → ~1,350 (already mostly a checklist); `bug-check.md`
  2,117 → ~850 (the trigger, the tier, "open the checklist"). The every-chat layer: 39,775 → about 14,400. Each passage moved WHOLE by `backlog-archive.mjs --move`
  (D138), a one-line pointer left, as D1556 did.
- **Recording a ruling after the diet** (replaces DECISIONS.md's three steps): (1) write his full row in
  `.claude/decisions-full/<area>.md` as today; (2) edit the area page's line the ruling changes — or add one — citing its
  number; a ruling it replaces is marked in its full row and archived as today; (3) run the converter, which no longer
  writes a short line. The gate (§5) fails the turn if step 2 is missed.

### 4. The bug-check order → a one-page checklist

`bug-check-order.md` (107,127 bytes, 40,301 tokens) is read whole at every WALK or FULL job ("Not from memory — open it").
Proposed: a new `bug-check-checklist.md` (~3,500 tokens) holding the steps of §5's order as a numbered list — the eight
questions and the tier; the roll-call table's columns; sizing the walk; the plain-user round; the phone pictures; the
lessons of §7.11 each as one line of what to check (the stories stay in §7.11, 18,886 bytes); the evidence sheet's
`Walk:` line; the non-substitution checks of §12 — each step naming the section of the order to open when that step
applies. `bug-check.md` (always loaded) then says: open the checklist; open each section it names. The order itself is
not cut: its sections are still read, when their step comes. Expected per bug check: ~10,000 tokens (checklist plus the
sections a typical walk opens) instead of 40,301.

### 5. Rules made into automatic checks

| Check | Carries | Replaces |
|---|---|---|
| Every live ruling (a full row not archived) is cited on its area's page | nothing lost; a new ruling cannot be recorded without its page line (record-decisions step 2) | D136's "every live ruling stays in the loaded list" |
| No page cites a ruling that is archived as replaced or restated | a stale line is rewritten in the same change (D201) | today's reliance on a later chat noticing "— changed by" |
| A page's shape: the three headings, citations as `[Dn]`, no table rows | pages stay pages | the short-line format check (D390) for converted files |
| `docsize --reads` prints the layers of §1 | the same measure, any day | nothing — a report, never a target (D141) |
| The per-message note shrinks from 1,188 to about 350 bytes ("A ruling in this message? Record it first — record-decisions.md") — extra read 4 (§6), counted there | the same prompt, the rest in the always-loaded checklist | its long text |
| The rule lines a guard already enforces shrink to one line naming the guard | push while checks run, push to `main`, the PC lock, the background command, a lost backlog item | their prose in `shipping.md` |

During the change-over the gate reads a marker in each file's frontmatter (`shape: page`) and checks a converted file the
new way and an unconverted one the old way, so areas convert one at a time and `main` stays green between them.

### 6. The extra reads (the right-hand column, each his yes or no)

| Read | Today | After | How |
|---|---|---|---|
| The design guide | 50,631 whole | ~12,000 | `ui-design.md` is already its short form; it names the section to open for each kind of job; §9's lessons each one line of what to check |
| The ripple map | 28,856 | ~7,000 | its §3 checklist first; §1 / §2 entries opened by surface |
| The skill-notes guide (task-observer) | 10,198 every chat | ~1,200 | a short project form: when to log, the format, the numbering check; the full guide only for a review. He chose full activation on 15 Aug 26 — his call |
| The note on every message | 18,803 a chat | ~5,200 | §5 |
| The handoff and the project guide | 8,499 + 15,188 | ~4,500 + ~11,500 | the handoff's dated "RIGHT NOW" lines of 13 Oct – 5 Nov moved whole to its archive, as D1733 did for the gate counts; the project guide's map rows for the Leave War and the Tracker point to their pages |
| The seam files | an Inputs job loads all 51,059 of the Leave War | ~4,000 | §2 |

### 7. What he is asked to rule — with the recommendation

1. **The shape (§2–§5).** Recommended: yes. It sets aside **D136** (every live ruling stays in the loaded list) — replaced
   by the stronger gate check that every live ruling is placed on its page; and **D390's loading shape** (each ruling loads
   as one short line) — its full rows, searched and opened before acting on a detail, stand. **D141 stands:** no size
   targets; the projected sizes are expectations, re-measured after (§9); each page's size tripwire is reset with room.
   **D68 stands:** no read is skipped — the detail is one named section or one search away, and each checklist names when
   to open it. **D138 stands:** every move whole, every rewrite read for meaning.
2. **The extra reads (§6).** Recommended: all six; the skill-notes short form is the only one that reverses a choice of
   his (15 Aug 26).
3. **Permission to change the hooks and the document check** (the decision-check hook, `docsize.mjs`,
   `docsize-rulings.mjs`, `backlog-archive.mjs`, the task-observer start hook if 2 includes it), each tested — the gate's
   self-test gains a case per new check — and read by one fresh reader before it is switched on.
4. **Readers.** Each converted page: one fresh, blind Opus reader comparing it line by line with the rows it replaces
   (D790, D1734). Astra on the Leave War and scheduler pages only if he calls for it.

### 8. Order of work

| Step | What | Check | His word |
|---|---|---|---|
| 1 | The checks and tools (§5): the two citation checks, the shape check, `--reads`, the converter without short lines, the recording steps in `DECISIONS.md`, the shorter per-message note | the gate's self-test, a dry run on the OIL sample | "merge live" (hooks change) |
| 2 | The every-chat layer (§3): `how-we-work.md` as the sample page, the five checklists, `AGENTS.md`'s pointers, `raptor-port/CLAUDE.md`'s lines about the old shape; the 23 proposed archivals | a fresh reader, row by row; the gate | "merge live" |
| 3a | Areas, smallest first: IT guide, OIL, people, design, Tracker (+ its seam file) | a fresh reader per page; the gate | "merge live" |
| — | **Re-measure and report to him before 3b** | `docsize --reads` | his look |
| 3b | Inputs, scheduler, Leave War (+ its seam file) | as 3a; Astra if he calls | "merge live" |
| 4 | The bug-check checklist (§4) | a fresh reader against the order | "merge live" |
| 5 | The extra reads he approved (§6) | a fresh reader for each moved passage | "merge live" |
| 6 | The final measure, before and after, to him | `docsize --reads` on his PC as well (the status line's fullness) | — |

Two to four of these share a branch where they touch one kind of file (D1087). **Parallel chats:** a ruling recorded on
`main` while its area converts is folded in when the converting branch brings `main` in — the citation check fails until
it is placed, so none can slip through (D78).

### 9. Risks and what holds each

| Risk | What holds it |
|---|---|
| A rule's meaning is lost or bent in the rewrite | the account table and the row-by-row fresh read (D138); the full rows untouched and searched; the citation check makes an unplaced ruling red |
| A chat changes a settled design it no longer sees in full | the settled list names each surface with its numbers and says "open its rows before changing it"; 79% of area rulings are already named by a test; `rulecheck` stays |
| The pages grow back | a new ruling rewrites the line it changes; the stale-citation check forces that; sizes reported, tripwires reset (D141) |
| Recording a ruling becomes harder (a line to rewrite, not one to append) | the converter names the page and section; it is the same work D201 already asks for, done at once |
| The sizes are off | the estimate is calibrated on measured loads (±10%); the big areas are projected from two samples, with a range (§1a); the re-measure after step 3a, before the big areas, catches a projection that does not hold |
| Codex reads stale lists | `AGENTS.md` and `codex-guide.md` updated in step 2 |

### 10. Not in this plan

The big reference documents a job opens in part (`ui-contracts.md` 1.08 MB, `file-map.md` 508 KB, `engine-rules.md`
371 KB, `walk-ledger.md` 263 KB) — read by section today; the backlog's 158 items; splitting the largest code files
(point 5 of 6 Nov, already the tidy-ups' path, D490, D775); handing off by about 40% full (point 1 of 6 Nov, still put to
him); his connectors (point 2, his setting). The skill-notes log's overdue review (86 notes open, last review 27 Oct 26)
is a job of its own.

### Review log

| Version | Reader | Result | Folded in |
|---|---|---|---|
| v1 | a fresh, blind Opus reader | (pending) | |
| v1 | Astra (his call, D1734) | (pending — run from his Codex sign-in; the brief names the commit) | |
