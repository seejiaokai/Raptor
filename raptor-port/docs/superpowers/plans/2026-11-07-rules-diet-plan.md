# The rules diet — the plan, with sizes before and after (D1732, 7 Nov 26)

**Status: v2, for his approval. Nothing in it is done; no rule changes until he approves (D1732).** v1 (commit `a294a09f`)
was read blind by a fresh Opus reader — its report, saved whole: `../briefs/2026-11-07-rules-diet-plan-read-opus.md`; every
finding and what was done with it: the review log at the end. Astra reads v1 too (his call, D1734), from his Codex sign-in
— the brief: `../briefs/2026-11-07-rules-diet-plan-read.md`. The brief before this plan: `2026-11-06-rules-diet.md`.
Backlog item: `[RULES-DIET]`. Two real conversions, measured and checked: `2026-11-07-rules-diet-sample-how-we-work.md`
and `2026-11-07-rules-diet-sample-oil.md`.

---

## Part 1 — for him, in one page

**What a chat is asked to read before it touches code.** Counted in tokens (what a chat fills up with), for a chat that
does every read its rules ask for — an upper bound, since the rules also say to read big files in parts, so a real chat
reads less by skipping or slicing:

| A chat that… | Today | After the first four steps | After all of it |
|---|---|---|---|
| only writes notes | 92,000 | 44,000 | 44,000 |
| fixes the Leave War, with a walk | 330,000 | 248,000 | 163,000 |
| changes a scheduler screen, with a walk | 311,000 | 228,000 | 152,000 |
| works on the Inputs pages, with a walk | 385,000 | 257,000 | 164,000 |
| works on the Tracker, with a walk | 277,000 | 195,000 | 129,000 |

On top of every row the app itself takes about 112,000 (its own instructions and tools — not ours to cut), and a chat
compacts at about 384,000 (D1671). So a Leave War job that obeyed every reading rule would need about 440,000 before its
first line of code — more than a chat holds. Chats cope by reading in part and skipping, and a rule that was not read is
a rule that can be missed. After all of it, the same job starts at about 275,000, about 110,000 left for the work.

**Why the 17 Oct trim did not last.** It took the rulings files from about 147,000 tokens to about 96,000 (D969–D971);
today they are 169,000. The rulings were 754 then and are 1,337 now — about 28 a day — because every ruling stays a line
in a file that loads. The diet changes the shape: each area becomes a page of how it works now, a new ruling usually
rewrites a line already there instead of adding one, and your words and the history stay whole in the searched files.

**What changes.**
1. **The checks first.** The document check learns the new shape and goes red if any live ruling is missing from the page
   that should state it, if a page leans on a ruling that was replaced, or if a later ruling's change is not carried into
   the line that states the earlier one. Tried on the two samples: the first drafts had a list of 46 bare numbers and 28
   lines missing a later ruling's change; both now pass.
2. **The cheap moves next** — nothing reworded: the skill-notes guide's short form (you approved it on 17 Oct, D969), a
   shorter note on each message (keeping its list of what counts as a ruling), the Leave War's and Tracker's links to the
   rest of the app in small files of their own, the handoff's old "right now" lines archived.
3. **The every-chat files** become checklists, and the general rulings a page (the sample: 21,200 → 6,200 tokens).
4. **The bug-check order** gets a one-page checklist that names the section to open at each step.
5. **The area rulings** become "how it works now" pages, section by section, smallest area first, with a measure and a
   report to you before the big three (the OIL sample: 5,900 → 3,900 — a small area where nearly every ruling is live).
6. **The design guide and the ripple map** are opened by section from their own checklists; your design lessons stay whole.

Every rewritten line is read by a fresh reader against the rulings it replaces (D138). Nothing is deleted: rulings that
are spent leave for the archive, which is still searched before you are asked anything.

**What you are asked to rule** (§8 has the detail):
1. **The shape** — area pages plus the searched full rows, in place of "every ruling loads as one line". It replaces D136
   and the loading part of D390, and narrows D68 and D1554 (a job reads the bug-check order, the design guide and the
   ripple map by section, from a checklist that names when). D141 stands: no size targets.
2. **Permission to change the document check, the recording scripts and the ruling hook** for it, each tested and read by
   a fresh reader before it is switched on (as D976 and D1539 did).
3. **Steps that touch only rulings files wait for your "merge live"** — they would otherwise merge by themselves (D1407).
4. Optional: **Astra as a second reader** on the Leave War and scheduler pages — your call each time (D1734).

**Cost.** About 17 to 19 chats, or about 6 nights: the big areas must be converted a few screens per chat, because their
full rows alone fill most of a chat (the reader's M3). Each step is its own pull request on your "merge live".

---

## Part 2 — the plan in detail (for the readers and the builder)

### 1. How it was measured

- Script: kept outside the repo this session (`/tmp/measure/readsize.mjs`, `after3.mjs`); step 1 adds it as
  `docsize --reads` so the same numbers can be taken again (§5). Bytes are exact. Tokens use the project's own estimate,
  calibrated on measured loads (`docsize.mjs` `estTokens`, D969, 17 Oct 26 — about 2.74 characters a token, capitals
  dearer); it gives 39,775 for the every-chat files, and the app's own count on 7 Nov 26 was about 38,000 (D1732's reading
  3), so take every figure as ±10%. The fresh reader recomputed every layer and every Part 1 row from the files and got the
  same. (Anthropic's older public tokenizer read the same files about 30% lower — not used.) The app's own share — about
  112,000 (150,000 before he types on 6 Nov, less the 38,000 of ours) — and his PC's own memory notes are not measurable
  from here.
- **"Today" is an upper bound:** every read a rule asks for, whole where the rule says "open" a document (the bug-check
  order: "Not from memory — open it"; the design guide: "open the ONE guide"), though the token-discipline rule says a file
  over about 300 lines is read in parts. The two pull against each other today; the checklists end that (§4, §6).
- Assumptions: the Leave War job also loads `oil.md` and `people-accounts.md` (their paths match the grid and state
  files); the Inputs job loads `scheduler.md` (any `src/ui` file), `leave-war.md` (`InputsPage.tsx`, `inputedit.tsx` are on
  its seam paths) and `oil.md` (`OilDayList.tsx`); the ripple map read is `feature-impact.md` §1 and §3; interface work
  reads `performance.md` Part 1 (11,025); 40 messages a chat for the per-message note (over a chat's life, not before code).

**The layers today (tokens):**

| Layer | What | Tokens |
|---|---|---|
| A. Every chat, before he types | the five unscoped rule files 15,576 (shipping 5,422 · doc-structure 3,381 · record-decisions 2,599 · plain-language 2,057 · bug-check 2,117) · `how-we-work.md` 21,236 · task-observer note 334 · skill and helper descriptions 2,629 | 39,775 |
| B. Every chat, at its first task, by rule | task-observer `SKILL.md` 10,198 · `HANDOFF.md` 8,499 · `OUTSTANDING.md` head and priority list 14,886 | 33,583 |
| C. Over a chat's life | the decision-check note, about 470 tokens on each of his messages × 40 | 18,803 |
| D. Any `raptor-port/` file opened | `raptor-port/CLAUDE.md` | 15,188 |
| E. Any `raptor-port/src` file opened | `raptor-executor.md` 1,883 · `ui-design.md` 2,768 · `decisions/design.md` 7,920 | 12,571 |
| F. The area's rulings | Leave War job 64,416 (leave-war 51,059 · oil 5,856 · people-accounts 7,501) · scheduler 45,057 · Inputs job 119,466 (inputs 17,494 · scheduler · leave-war · oil) · Tracker 11,401 | 11,401–119,466 |
| G. A bug check of a screen | `bug-check-order.md` whole 40,301 · walk ledger's sizing step 1,620 · `walk-scripts.md` 13,220 | 55,141 |
| H. Interface work | `design-practices.md` whole 50,631 · `performance.md` Part 1 11,025 | 61,656 |
| I. Weigh the whole ecosystem | `feature-impact.md` §1 and §3 | 28,856 |

**Other facts the plan rests on:** 1,337 live rulings (207 general, 373 Leave War, 324 scheduler, 159 Inputs, 80 people,
69 design, 68 Tracker, 48 OIL, 9 IT guide), 392 of their short lines carrying "— changed by"; of the 1,130 rulings outside
the general file, 888–891 have their number named in at least one unit or browser test (a mention, not proof the test pins
the rule; 242 have none); the skill-notes log is 398,690 bytes with 86 notes open, last reviewed 27 Oct 26. The 754 rulings
and the 147,000 → 96,000 of 17 Oct are from `[CONTEXT-START-SIZE]` (`OUTSTANDING-ARCHIVE.md`).

### 1a. How the "after" numbers were projected

Measured: the two samples, v2 (general rulings 21,236 → 6,243, −71%; OIL 5,856 → 3,926, −33%). Projected for the other
areas from each file's parts (bytes): its rulings lines and preamble kept at 43% — the middle of the samples' 29% and 66% —
its "Settled" sections at 50%, its architecture at 80% (moved to a seam file, §2); the range runs from "every area like the
general rulings" to "every area like OIL":

| Area | Today | Page after (range) |
|---|---|---|
| Leave War | 51,059 | 20,400 (14,000–31,300) + seam file 4,000 |
| Scheduler | 45,057 | 20,400 (14,000–31,600) |
| Inputs | 17,494 | 7,900 (5,600–11,800) |
| Design | 7,920 | 3,500 (2,400–5,300) |
| People and accounts | 7,501 | 3,600 (2,700–5,200) |
| Tracker | 11,401 | 3,300 (2,300–4,900) + seam file 3,300 |
| IT guide | 1,505 | 700 (500–1,000) |
| OIL (sample) | 5,856 | 3,926 |

Each job in Part 1's last column also opens the full rows of the surface it changes, as the page tells it to: about 13,000
for a Leave War or scheduler surface (the reader's figure: about 440 tokens a full row, about 30 rows a surface), 8,000 for
Inputs, 4,000 for the Tracker — estimates, measured on the first real jobs after. At the pessimistic end Part 1's last
column reads Leave War 179,000, Inputs 182,000. The checklists of §3, §4 and §6 are estimates, not drafted; each is
measured when it is written.

### 2. The shape of an area page

The file keeps its name and its `paths:` (so it loads exactly when it loads today); the marker that it is a page is an HTML
comment in the body, `<!-- shape: page -->` — not a frontmatter key, so the general file, which has no frontmatter, keeps
loading in every chat. Its body:

```
# <Area> — how it works now
<three lines: each line ends with the rulings behind it; the full rows and how to search them; search them before acting
 on a detail or asking him>

## <topic> … the rules a builder must keep — current behaviour and principles, one statement a bullet, [Dn, Dm]

## Settled designs, by screen
<surface>: <a few words> [Dn]; <a few words> [Dm] …   (one bullet a surface; most have a test that names them; before
                                                      changing anything on that surface, open its rows)

## From other areas — one bullet each, with a few words and the number, pointing to the page that states it
```

**Where a ruling is stated.** Each ruling is stated on its home page — the area whose full-text file holds its row — or,
for a general ruling the always-loaded files carry (recording, shipping, speaking to him, the bug check, where facts go),
in that file. Another page may point to it with a few words and its number. A ruling that changes another is cited beside
it on every line that states the earlier one, so the "— changed by" chains leave what loads and their effect stays.

**The account.** Each conversion writes an account table (as both samples do): every ruling of the old file → the line
that now states it, or a proposal for the archive by `DECISIONS.md` step 2 — **spent** (a one-off permission used up) or
**restated in full** by a named later ruling (D971) or **replaced** — with the reason, each confirmed by the fresh reader
reading the full row sentence by sentence. There is no other category.

**The seam files.** The Leave War's and the Tracker's `## Architecture` sections load today on the files where they meet
the rest of the app (the 24 Sep red team widened their paths so an edit there carries the architecture). They move whole,
byte for byte, into `.claude/rules/seams/leave-war.md` and `seams/tracker.md`, loaded on those seam paths and registered
with the document check (a tripwire each); the area page then loads only on its own files. **What the seam paths lose:**
the Leave War's rulings that govern inputs (about 41 short lines mention inputs — D1548, D1552, D1553, D1563, D1565,
D1722, D1724 among them) no longer load with `InputsPage.tsx` or `QualsPage.tsx`, so each gets a pointer bullet in the
Inputs page's and the People page's "From other areas" — the reader's M1, the very risk D611 weighed.

### 3. The every-chat layer

- **`how-we-work.md` → the sample page** (`…-sample-how-we-work.md`, v2): 21,236 → 6,243 tokens. Every one of its 207
  rulings is stated on the page or in one of the five always-loaded files, except 11 proposed for the archive (10 spent,
  D136 replaced by the ruling that approves this plan).
- **The five rule files → checklists** (estimates — not drafted): `shipping.md` 5,422 → ~2,000; `doc-structure.md`
  3,381 → ~1,300; `record-decisions.md` 2,599 → ~1,100; `plain-language.md` 2,057 → ~1,350; `bug-check.md` 2,117 → ~850.
  Each keeps every rule it carries, one statement each with its numbers — including the rules a guard enforces, in their
  own short words (the push guard lets a push through when it cannot reach GitHub, and Codex has no hooks); the stories and
  worked examples move whole to `guide-full.md` by `backlog-archive.mjs --move` (D138), a one-line pointer left, as D1556
  did. The every-chat layer: 39,775 → about 15,800.
- **Recording a ruling after the diet** (replaces `DECISIONS.md`'s three steps): (1) write his full row in
  `.claude/decisions-full/<area>.md` as today; (2) rewrite the line of the home page — or of the always-loaded file — that
  the ruling changes, or add one, citing its number beside the number it changes; a ruling it replaces is marked in its
  full row and archived as today; (3) run the converter, which no longer writes a short line and prints the page and
  section to edit. The gate (§5) fails the turn if step 2 is missed.

### 4. The bug-check order → a one-page checklist

`bug-check-order.md` (107,127 bytes, 40,301 tokens) is read whole at every WALK or FULL job ("Not from memory — open it").
Proposed: a new `bug-check-checklist.md` (~3,500 tokens) holding §5's order as numbered steps — the eight questions and the
tier; the roll-call's columns; sizing the walk; the plain-user round; the phone pictures; the lessons of §7.11, each as one
line of what to check, beside the list that keeps his words whole (§7.11 stays, 18,886 bytes); the evidence sheet's
`Walk:` line; the non-substitution checks of §12 — each step naming the section of the order to open when that step comes.
`bug-check.md` (always loaded) then says: open the checklist, and open each section it names. The order itself is not cut.
Expected per bug check: ~10,000 tokens (the checklist plus the sections a typical walk opens) instead of 40,301. This
narrows D68 ("never shrink a read") and D1554 ("never anything a job reads") for the bug check; D1732 names it.

### 5. The checks that carry the rules

| Check | Carries | Replaces |
|---|---|---|
| **Every live ruling is stated somewhere that loads:** its number on a statement line of its home page or of one of the five always-loaded files | nothing lost; a new ruling cannot be recorded without its line (§3 step 2) | D136's "every live ruling stays in the loaded list" |
| **A citation counts only on a statement:** a bullet or paragraph with at least four words, and at least two words for each number it cites — a list of numbers is not a statement; a number in a code span is an example | no "stated elsewhere" lists (the reader's H1a) | — |
| **The change-mark check:** a statement citing a ruling of its home area also cites every live ruling that ruling's full row marks as changing it (`docsize-rulings.mjs` `marksOf`) | a narrowing is carried into the line it narrows (the reader's H1b) | the short line's "— changed by" tail and its check (`docsize.mjs` the tail check) |
| **No statement cites a ruling archived as replaced or restated** | a stale line is rewritten in the same change (D201) | today's reliance on a later chat noticing |
| **A page's shape:** the `<!-- shape: page -->` marker, the three headings, no table rows; a statement in ordinary letters (D970's check) and at most about 600 characters | pages stay pages; the short line's capitals and length checks carried over | the short-line format check (D390) for converted files |
| **The map** (`DECISIONS.md`) for a converted area is built from its full-text file, and its check reads the same | the map never empties silently (the reader's H3) | the map row built from short lines |
| `docsize --reads` prints §1's layers | the same measure, any day | nothing — a report, never a target (D141) |

**Tried on the samples** (`/tmp/measure/pagecheck.mjs`, the checks' first draft): v1 of the general page had a 46-number
list and 16 statements missing a change mark, v1 of OIL 12; both v2 samples pass with none. Step 1 builds the checks properly, each
with a self-test case.

**The scripts step 1 must teach the page shape** (the reader's H3), each with a self-test case, before any area converts:
`backlog-archive.mjs --rulings` (no short line; the map from the full-text file; prints the page and section to edit);
`--merge` (a converted page taken whole from whichever side has it, never re-applied as prose; the other side's new rulings
written to the full-text file and listed "place on the page"; an unconverted branch meeting a converted `main` takes
`main`'s page and refuses to write the old shape back); `--move-rows` (moves a full row and prints the page lines to move);
the seam files registered. During the change-over the gate reads the marker in each file and checks a converted file the
new way and an unconverted one the old way, so areas convert one at a time and `main` stays green between them.

**The per-message note** shrinks from 1,188 to about 600 bytes and keeps its list of what counts — a decision, a
preference, a correction, a "leave it", an explicit no, a change to an earlier ruling — because naming the kinds at the
moment he speaks is the hook's whole purpose (D13): "Before acting: is this a ruling — a decision, preference, correction,
'leave it', explicit no, or a change to an earlier one? If so, record it first (`record-decisions.md`), then the work.
Either way, the closing report carries a `Rulings:` line."

### 6. The rest of what a job reads

| Read | Today | After | How |
|---|---|---|---|
| The skill-notes guide (task-observer) | 10,198 every chat | ~1,200 | the short project form **he approved on 17 Oct (D969, point F)**, its wording read before he approves it; the full guide only for a review |
| The note on every message | 18,803 a chat | ~7,500 | §5 |
| The handoff and the project guide | 8,499 + 15,188 | ~4,500 + ~11,500 | the handoff's dated "RIGHT NOW" lines of 13 Oct – 5 Nov moved whole to its archive, as D1733 did for the gate counts; the project guide's map rows for the Leave War and the Tracker point to their pages |
| The seam files | an Inputs job loads all 51,059 of the Leave War | ~4,000 + a pointer list | §2 |
| The design guide | 50,631 whole | ~12,000 | `ui-design.md` (already its short form) names the section to open for each kind of job; §9, his lessons, stays whole and is read whole for any design job (D941, D1417) — one line of what to check per lesson may sit beside it, never in its place |
| The ripple map | 28,856 | ~7,000 | its §3 checklist first; the §1 / §2 entries of the surfaces the change touches |

The design guide and the ripple map read by section narrow D68 and D1554 beyond what D1732 named — his ruling on question 1
covers them or they stay whole.

### 7. Order of work

| Step | What | Check | Chats |
|---|---|---|---|
| 1 | The checks and scripts (§5) | the gate's self-test, a dry run on both samples, a fresh reader | 2 |
| 2 | The cheap moves: the skill-notes short form (D969 F; its wording to him first), the per-message note, the seam files with their pointer lists, the handoff's old lines, the project guide's long map rows — **moved, not reworded** | `docsize --moves`; a fresh reader for each new short text | 1 |
| — | **Re-measure** (`docsize --reads`) | | — |
| 3 | The every-chat layer: `how-we-work.md` as the sample page, the five checklists, `AGENTS.md`'s and `codex-guide.md`'s pointers, `raptor-port/CLAUDE.md`'s lines about the old shape; the 11 proposed archivals | a fresh reader, line by line against the rows | 2 |
| 4 | The bug-check checklist (§4) | a fresh reader against the order | 1 |
| 5a | Areas, smallest first: IT guide, OIL, people, design, Tracker | a fresh reader per page; the gate | 2 |
| — | **Re-measure and report to him before 5b** — the big three converted only if still worth it | `docsize --reads` | — |
| 5b | Inputs, scheduler, Leave War — **a few screens per chat**, each with its own account and its own fresh reader; for the scheduler, his choice first between a page and splitting its "Settled" sections by screen with `--move-rows` (D611's mark is crossed; D976 kept one file) | as 5a; Astra if he calls | Inputs 2, scheduler 4, Leave War 4 |
| 6 | The design guide and the ripple map by section (§6) | a fresh reader for each moved passage | 1 |
| 7 | The final measure, before and after, to him | `docsize --reads`, and the status line's fullness on his PC | — |

About 17 to 19 chats. Two to four steps share a branch where they touch one kind of file (D1087); **every step merges on
his "merge live"** — the rulings files count as notes under D1407, so the approving ruling says they wait. **Parallel
chats:** a ruling recorded on `main` while its area converts is folded in when the converting branch brings `main` in —
`--merge` lists it "place on the page" and the citation check stays red until it is placed (D78).

### 8. What he is asked to rule — with the recommendation

1. **The shape (§2–§6). Recommended: yes.** In plain terms it:
   - **replaces D136** ("every live ruling stays in the loaded list") with the stronger check that every live ruling is
     *stated* in a file that loads;
   - **replaces the loading part of D390** ("each ruling loads as one short line"); its full rows, searched and opened
     before acting on a detail, stand;
   - **narrows D68** ("never skip or shrink a read") **and D1554** ("never anything a job reads"): the bug-check order, the
     design guide and the ripple map are read by section from checklists that name when — D1732 already covers the
     bug-check order;
   - **leaves standing:** D141 (no size targets — the sizes here are expectations, re-measured; each page's tripwire reset
     with room; D1732's reading that the diet sets D141 aside is corrected here), D138 (every move whole, every rewrite read
     for meaning), D941 and D1417 (his design lessons stay in his words), D971 (the archive route).
2. **Permission to change the hooks and the document check:** the decision-check hook, `docsize.mjs`, `docsize-rulings.mjs`,
   `backlog-archive.mjs`, the task-observer start hook for the short form — each tested, the gate's self-test gaining a
   case per new check, and read by one fresh reader before it is switched on.
3. **The merge rule for this job:** every step on his "merge live", rulings-only steps included (D1407 would merge them by
   themselves).
4. **Readers:** each converted page one fresh, blind Opus reader comparing it line by line with the rows it replaces
   (D790, D1734); Astra on the Leave War and scheduler pages only if he calls for it.

Not a question, already his: the skill-notes short form (D969, 17 Oct) — its wording comes to him before it is used.

### 9. Risks and what holds each

| Risk | What holds it |
|---|---|
| A rule's meaning is lost or bent in the rewrite | the account table; the fresh reader reads each statement against its short line and, where it has "— changed by", its full row (D138); the full rows untouched and searched; the three citation checks of §5 |
| A narrowing ruling leaves the old statement standing | the change-mark check (§5) |
| A chat changes a settled design it no longer sees in full | the settled list names each surface with its numbers and says "open its rows before changing it"; most have a test naming them (242 of 1,130 do not — a gap the list shows); `rulecheck` stays |
| Rulings that govern inputs stop loading with the Inputs pages after the seam split | the pointer lists of §2 |
| A parallel branch undoes a converted page at a merge | `--merge` taught the page shape, with a self-test case for each direction (§5) |
| The pages grow back | a new ruling rewrites the line it changes; the stale-citation check forces it; sizes reported, tripwires reset (D141) |
| Recording a ruling becomes harder | the converter names the page and section; it is the work D201 already asks for, done at once |
| A big area does not fit one chat | a few screens per chat, each with its own account and reader (§7) |
| The sizes are off | calibrated estimate (±10%), recomputed by the reader; a range for each area (§1a); the re-measures after step 2 and step 5a |
| Codex reads stale lists | `AGENTS.md` and `codex-guide.md` updated in step 3 |

### 10. Not in this plan

The big reference documents a job opens in part (`ui-contracts.md` 1.08 MB, `file-map.md` 508 KB, `engine-rules.md`
371 KB, `walk-ledger.md` 263 KB); the backlog's 158 items; splitting the largest code files (point 5 of 6 Nov, the tidy-ups'
path, D490, D775); handing off by about 40% full (point 1 of 6 Nov, still put to him); his connectors (point 2, his
setting, D969 point E). The skill-notes log's overdue review (86 notes open, last review 27 Oct 26) is a job of its own.

### Review log

| Version | Reader | Result | Folded in |
|---|---|---|---|
| v1 (`a294a09f`) | a fresh, blind Opus reader, 7 Nov 26 (`../briefs/2026-11-07-rules-diet-plan-read-opus.md`) | 3 high, 4 medium, 9 low; the numbers recomputed and found right; "not safe to put to him as written" | v2 — every finding, below |
| v1 (`a294a09f`) | Astra (his call, D1734) | pending — runs from his Codex sign-in; the brief names the commit | — |

**The fresh Opus reader's findings, and what v2 did:**
- **H1 (a) a bare list passes; (b) narrowings slip; (c) clauses lost** — taken: §5's statement rule and change-mark check,
  tried on both samples (v1: a 46-number list, 28 statements missing a mark; v2: none); the six lost clauses put back (D16, D874, D1530,
  D1536, D1554 in the general sample; D15's ⓘ rows in OIL); the fresh reader reads full rows where a short line has
  "— changed by" (§9).
- **H2 the archive list** — taken: 23 → 11 (general) and 2 → 0 (OIL); D141, D390, D905, D969, D811, D8, D10, D72, D870,
  D1531, D1732, D203 kept live, D163 and D470 too; no "history" category (§2); D969 named as already approving the
  skill-notes short form (§6, §8); D141's standing made consistent with D1732's reading (§8).
- **H3 the scripts** — taken: the map, `--merge` both ways, `--move-rows`, the seam files' registration in step 1 (§5).
- **M1 rulings narrowed but said to stand** — taken: D68, D1554 named as narrowed (§4, §6, §8); §9 of the design guide stays
  whole (D941, D1417); the seam split's loss for inputs and D611/D976 named, with pointer lists (§2, §7 step 5b).
- **M2 the numbers** — taken: "today" labelled an upper bound and the causation softened (Part 1, §1); `performance.md`
  Part 1 added; the middle is 43%; rows opened per job added; the Inputs job loads `oil.md`; layer C labelled; 392.
- **M3 the big areas** — taken: a few screens per chat, recosted at 17 to 19 chats (§7).
- **M4 the cheaper path** — taken: the moves come second, with a re-measure, and the big three only if still worth it (§7).
- **Low** — taken: the per-message note keeps its list (§5); guard-enforced rules keep their words (§3); the capitals and
  length checks carried (§5); "guarded by tests" reworded (§2, §9); D25 pointer kept on the general page; OIL's D660, the
  `[OIL-AUTO-REMOVE]` evidence pointer, the one-home pointers (D1042–D1044, D360, D1578); D1407 (§7, §8); the marker as an
  HTML comment, not frontmatter (§2).
