# The scheduler's page — the sorting helpers' brief (9 Nov 26, chat 42, D1944)

You are a fresh Opus helper, one of four sorting the scheduler's rulings in parallel; a fifth helper drafts the page
from your four tables, and two other readers (Astra and a fresh Opus reader) then check the page blind. So write down
every judgement where they can test it. Branch `claude/rules-diet-scheduler-page`, in the checkout
`C:\Users\User\projects\Raptor` (stay in it; never `cd ..` out of it). The file you sort is
`.claude/rules/decisions/scheduler.md` **as at commit `5d8ddf6f8`** (read it with
`MSYS_NO_PATHCONV=1 git show 5d8ddf6f8:.claude/rules/decisions/scheduler.md` if the working file has moved on).

**Write ONLY your own table file (named below). Change no other file, run no script that writes, commit nothing, push
nothing** — the host commits. Three other helpers are working in this same checkout at the same time.

## Why (open each full row first: `grep -h '^| D1944 |' .claude/decisions-full/*.md`, the shell)
- **D1939, D1941:** a rulings page is a concise statement of how that part of the app works and what the owner likes —
  his standing rules, his likes, and what a fresh model would get wrong if not told. The exact detail of what is built
  (screen words, sizes, places, button order) lives in the app and its tests; his words, the history and the agent's
  readings stay in the full rows, never deleted. A new ruling rewrites the old line on its subject instead of standing
  beside it.
- **D1942:** the Tracker trial approved as shown; **D1943:** the Inputs pages done the same way; **D1944:** his word for
  the scheduler — one page in the same shape, not split by screen, by screen inside the one page.
- **D1932:** a converted page is under the size of the list it replaced, a hard limit, never raised without his word.
- The test for every line: *without this line, would a fresh model working on the schedule likely do the wrong thing —
  and would no test catch it?*

## Read before you sort — the two trials and what their readers caught
- The pages: `.claude/rules/decisions/tracker.md` and `.claude/rules/decisions/inputs.md` (their sections and lines are
  the shape to copy).
- The Inputs sorting table, `raptor-port/docs/superpowers/briefs/2026-11-09-inputs-trial-sorting.md` (its head and a few
  rows: your columns are the same plus two), and the Inputs readers' findings and fixes:
  `…/2026-11-09-inputs-trial-read-astra.md`, `…-read-opus.md`, `…-fixes.md`.
- **What the readers caught, every time — do not repeat it:** on the Tracker, 20 of 39 rulings first put on "held by
  tests" were sent back, the test holding only part (a list of what is NOT done, an exception, a principle reduced to its
  examples, a size "and nothing moves" with only the number tested); on the Inputs, 6 of 17. And on the Inputs: a
  permissions widening by a later ruling dropped back to the earlier, narrower one; a merged line that left out one case
  and put a condition on the wrong case; a ruling proposed for archive on a wrong claim; four lines narrowed to the phone
  or to one screen width when the ruling was wider. On the screen-design page: a ruling that approves a guide's wording
  "as worded" was shortened to a headline, dropping the safeguards in the guide's text — state each safeguard, or point
  to the guide's section.

## Your share
- **Sorter A:** the table rows on lines 57–167 at `5d8ddf6f8` — D1944 down to D925 (111 rulings). Table:
  `raptor-port/docs/superpowers/briefs/2026-11-09-scheduler-page-sort-A.md`. Note: D1038's full row still says "Not
  built", though step 5a found the code draws it — check the code and its tests, and say which.
- **Sorter B:** lines 168–278 — D901 down to D514 (111). Table: `…-sort-B.md`. Note: D660 and D762 are a question
  left for him by chat 41 (the filer's OIL answer for all, each changing his own, against no answer of a shared input's
  man) — state both as they stand, and put the conflict under "Questions for him" with a one-line worked example.
- **Sorter C:** lines 279–390 — D513 down to D27 (112). Table: `…-sort-C.md`.
- **Sorter D:** everything that is not a table row: the head (lines 25–55: the head notes, the "Also read" paragraph,
  "Where the detail lives") and the section "Settled before this list" (lines 392–796: about 30 entries in eight groups,
  the owner's settled decisions from before the D-numbers, moved there word for word on 24 Sep 26). Table: `…-sort-D.md`.
  Your extra column is in "Sorter D" below.

## The kinds
**standing** (a lasting rule, like, principle, constraint or "leave it / don't reopen": stays, stated) · **built**
(detail of something built: leaves for the "Built, held by tests" line ONLY when a test holds it whole) · **not built**
(stays, one short line naming its backlog item — check `OUTSTANDING.md` for the item) · **spent / history** (a one-off
job done, a request to design something that was then designed: listed under "Proposed to archive — his word first" at
the end of your table, and still stated briefly on the page; never archive anything).

**Built, held whole — the strict test.** Find the tests with the gate's finder: the number as a word in a test file —
`git grep -n -w D569 -- 'raptor-port/src/**/*.test.*' 'raptor-port/e2e/**'`. Open each test and read its assertions.
"Holds it whole" means EVERY part of the rule sentence in the full row's bold cell — each condition, exception,
exclusion ("not X", "never Y"), scope ("only on the Board", "for flying only", "on a phone"), and any words on screen he
chose — has an assertion that fails if that part goes. A number in a comment or a test title only is not a test. A part
with no assertion → the ruling stays written out, the unpinned part named in your table. **Unsure → it stays.** Write
no test and change no test.

A ruling a later one changed (" — changed by" on its short line; the NARROWED / ANSWERED marks in its full row): your
draft line states the rule as it stands NOW, citing the ruling and every one that changed it (the gate checks this).
Several rulings on one subject: one line citing them all — name the group in the Note column so the drafter can merge
across the four tables.

## The sections (use these names; propose a new one in your report if a ruling fits none)
1. **What it keeps** — the area's broadest standing rules.
2. **Every screen** — rules that govern every screen of the app though filed here: the phone, its keys and keyboard,
   notes that pass, the top bar, scrolling. Stated as app-wide (step 5a's lesson); check
   `.claude/rules/decisions/design.md` and say in the Note whether it states the same rule or points here.
3. **The week on Edit Schedule** — days, waves, duties, sims, ground, the programme, rows, drag-reordering, time format,
   week navigation and what carries across weeks.
4. **Crew and pucks** — placing people, the palette, ALL / ALL AVAIL, quals, rest, people's marks on the schedule.
5. **Warnings and the rules engine** — the warning list, the Logic page, rule settings.
6. **Publishing, amendments and signing** — the working copy, publishing, amendment numbers and marks, signing, saved
   plans.
7. **History and undo** — the change history, History mode, Undo / Redo.
8. **View-only Sched, print and export.**
9. **The Scheduler Board.**
10. **Insights.**
11. **OIL on the schedule** — OIL Earn and what the schedule gives the OIL page.
12. **Admin, settings and saving** — Admin pages, the gear, storage, the database-step rules filed here.
Plus, for kinds: **Not built yet** · **Settled — leave as they are** · **Built, stated here: their tests hold only part**
(by the sections above) · **Done once — kept until he archives them** · **Built, held by tests**.

## Your table (saved as your file named above)
A head of a few lines: what it is, your share, your counts. Then one row per ruling, in the file's order:

| D | Kind | Section | The line as it should stand on the page | Tests read — what they hold; the part not held | Note |

- **The line** is one sentence, in ordinary letters (capitals only where a name or a short form such as OIL has them),
  at least four words plus two per ruling cited, citations after it as `[D…, D…]`, and it changes no meaning: each
  condition, exception and scope of the bold cell kept. **Never state an agent's reading as his rule**; if a line truly
  needs one, mark it "(the agent's reading)". For a ruling going to "held by tests", the line is "—".
- **Cross-area:** `git grep -n -w D<n> -- .claude/rules/decisions/ .claude/rules/*.md` — if another page or rule file
  cites the ruling, name it in the Note (once this file is a page, the gate checks every other page's citation of it
  carries the later rulings that changed it).
- Then: **Questions for him** (where a newer ruling does not clearly cover a case an older one sets — D90 — keep both
  stated; never decide), **Proposed to archive — his word first**, and **Unsure** (every judgement you would want a
  reader to check).

## Sorter D — the extra column, and the head
- One row per settled entry (name it by its group and first words in place of a D-number), with one more column,
  **Its detail**: where the built detail of the entry lives once the page states only the rule — "already in
  `docs/ui-contracts.md` §…" (check it is there, word for word or in substance), or "move whole to `docs/…` §…" (the
  reference doc the entry already points to; D138: a move never rewords), or "stated in full on the page". Nothing is
  deleted. The nine D-numbers the section cites are cited on the line that states them.
- The "Also read" paragraph becomes "From other areas (each stated on its own area's file)" pointer lines, as on the
  Inputs and Tracker pages — a few words naming the area and subject, then the numbers; **every number it cites kept**.
  The "Where the detail lives" lines and the head note on the Inputs file become the page's head (under about 600
  characters) — draft it.

## Your report back (plain, short — under 300 words; do not paste the table)
Your counts by kind and by section; how many go to "held by tests"; the groups you propose to merge; the cross-area
citations; the questions for him; the archive proposals; your unsure list.

## Traps on this PC
Write files with the Write tool. A script: write it to a file with Write, then run the file (a typed script with a
backslash is refused by a guard; `node -e` loses escapes; in JS use `s.replace(a, () => b)`). `git show <ref>:<path>`
needs `MSYS_NO_PATHCONV=1` first in Git Bash. The Grep tool hides long rows — use the shell's grep for a full row:
`grep -h '^| D569 |' .claude/decisions-full/*.md`. No `jq`. No `sed -i` (a guard refuses it).
