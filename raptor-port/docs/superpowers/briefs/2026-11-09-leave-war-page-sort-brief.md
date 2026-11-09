# The Leave War's page — the sorting helpers' brief (9 Nov 26, chat 45, D1947)

You are a fresh Opus helper, one of four sorting the Leave War's rulings in parallel; a fifth helper drafts the page
from your four tables, and two other readers (Astra and a fresh Opus reader) then check the page blind. So write down
every judgement where they can test it. Branch `claude/rules-diet-leave-war-page`, in the checkout
`C:\Users\User\projects\Raptor\.claude\worktrees\beautiful-merkle-20a6b2` (stay in it; never `cd ..` out of it). The
file you sort is `.claude/rules/decisions/leave-war.md` **as at commit `0ce71adab`** (read it with
`MSYS_NO_PATHCONV=1 git show 0ce71adab:.claude/rules/decisions/leave-war.md` if the working file has moved on).

**Write ONLY your own table file (named below). Change no other file, run no script that writes, commit nothing, push
nothing** — the host commits. Three other helpers are working in this same checkout at the same time.

## Why (open each full row first: `grep -h '^| D1947 |' .claude/decisions-full/*.md`, the shell)
- **D1939, D1941:** a rulings page is a concise statement of how that part of the app works and what the owner likes —
  his standing rules, his likes, and what a fresh model would get wrong if not told. The exact detail of what is built
  (screen words, sizes, places, button order, colours as numbers) lives in the app and its tests; his words, the history
  and the agent's readings stay in the full rows, never deleted. A new ruling rewrites the old line on its subject
  instead of standing beside it.
- **D1942, D1943, D1944:** the Tracker, the Inputs pages and the scheduler done this way; **D1947:** his word for the
  Leave War — one page in the same shape.
- **D1932:** a converted page is under the size of the list it replaced (121,825 bytes), a hard limit, never raised
  without his word.
- The test for every line: *without this line, would a fresh model working on the Leave War likely do the wrong thing —
  and would no test catch it?*

## Read before you sort — the trials and what their readers caught
- The pages: `.claude/rules/decisions/scheduler.md` (the newest and largest — copy its shape), `inputs.md`, `tracker.md`.
- The scheduler's sorting table head and a few rows, `raptor-port/docs/superpowers/briefs/2026-11-09-scheduler-page-sort-A.md`
  (your columns are the same), and its readers' findings and fixes: `…/2026-11-09-scheduler-page-read-astra.md`,
  `…-read-opus.md`, `…-fixes.md`.
- **What the readers caught, every time — do not repeat it:**
  - **"Held by tests" is where most mistakes were.** Of the numbers first put on that line: on the Tracker 20 of 39 were
    sent back, the Inputs 6 of 17, the scheduler 25 of 56 — the test holding only part (a list of what is NOT done, an
    exception, a principle reduced to its examples, a size "and nothing moves" with only the number tested, words he
    chose that no assertion reads). Be strict; unsure → it stays written out.
  - A later ruling's widening (of who may do something, of where a rule applies) dropped back to the earlier, narrower
    ruling; a permissions rule above all.
  - A merged line that left out one case, or put a condition on the wrong case.
  - Lines narrowed to the phone or to one screen width when the ruling was wider; a rule pinned on one example.
  - **The agent's readings stated as his rule** (the scheduler's D1751). Only the bold cell is his rule; the "agent's
    readings" in the full row are not — mark any you need "(the agent's reading)".
  - A ruling proposed for archive on a wrong claim; a lost "once X, it is the scheduler's / admin's" clause (D755).
  - A ruling that approves a guide's or a drawing's wording "as worded / as drawn" shortened to a headline, dropping
    its safeguards — state each safeguard, or point to the guide's section or the drawing.
  - Numbers against another page: a line here contradicting the OIL page (the scheduler's draft said duty desks from
    templates "earn no OIL", against the OIL page). **The OIL page (`oil.md`) loads with every Leave War file** — check
    every OIL statement against it, and point to it rather than restating.

## Your share
- **Sorter A:** the table rows on lines 39–164 at `0ce71adab` — D1947 down to D1400 (126 rulings). Table:
  `raptor-port/docs/superpowers/briefs/2026-11-09-leave-war-page-sort-A.md`.
- **Sorter B:** lines 165–290 — D1399 down to D1236 (126). Table: `…-sort-B.md`. Note: the bid windows' redesign
  (D1311 and the rulings round it) and the colour sets (D1165, D1175, D1316, D1322, D1323) are long chains of later
  rulings changing earlier ones — state each subject once as it stands now.
- **Sorter C:** lines 291–417 — D1235 down to D159 (127). Table: `…-sort-C.md`. Note: the overhaul's plan (D1140,
  D1250) and the design-process rulings (D1301) may be spent or standing — say which, and why.
- **Sorter D:** everything that is not a table row: the head (lines 15–38: the head notes, the OIL paragraph, the "Also
  read" paragraph, "Where the detail lives") and the section "Settled before this list" (lines 419–571, two groups —
  "Leave War roster & display" and "Leave War grid performance" — the owner's settled decisions from before the
  D-numbers, moved there word for word on 24 Sep 26). Table: `…-sort-D.md`. Your extra column is in "Sorter D" below.

## The kinds
**standing** (a lasting rule, like, principle, constraint or "leave it / don't reopen": stays, stated) · **built**
(detail of something built: leaves for the "Built, held by tests" line ONLY when a test holds it whole) · **not built**
(stays, one short line naming its backlog item — check `OUTSTANDING.md` for the item) · **spent / history** (a one-off
job done, a request to design something that was then designed: listed under "Proposed to archive — his word first" at
the end of your table, and still stated briefly on the page; never archive anything).

**Built, held whole — the strict test.** Find the tests with the gate's finder: the number as a word in a test file —
`git grep -n -w D1225 -- 'raptor-port/src/**/*.test.*' 'raptor-port/e2e/**'` (the Leave War's own tests sit under
`raptor-port/src/leavewar/`). Open each test and read its assertions. "Holds it whole" means EVERY part of the rule
sentence in the full row's bold cell — each condition, exception, exclusion ("not X", "never Y"), scope ("only on the
grid", "for members only", "on a phone"), and any words on screen he chose — has an assertion that fails if that part
goes. A number in a comment or a test title only is not a test. A part with no assertion → the ruling stays written out,
the unpinned part named in your table. **Unsure → it stays.** Write no test and change no test.

A ruling a later one changed (" — changed by" on its short line; the NARROWED / WIDENED / ANSWERED marks in its full
row): your line states the rule as it stands NOW, citing the ruling and every one that changed it (the gate checks
this). Several rulings on one subject: one line citing them all — name the group in the Note column so the drafter can
merge across the four tables.

## The sections (use these names; propose a new one in your report if a ruling fits none)
1. **What it keeps** — the war's broadest standing rules: one year grid for the whole period, who runs it, the stages
   and his order of work, the one absence record shared with the Inputs page, what is never built.
2. **Every screen** — rules that govern every screen of the app though filed here (a button in the same place on a phone
   as on a desktop, no glow, documents on any input, how a half day is written). Stated as app-wide; check
   `.claude/rules/decisions/design.md` and say in the Note whether it states the same rule or points here.
3. **Periods, stages and bidding** — creating a period, opening dates, closing, a member's closed days, publishing.
4. **The grid** — names, groups and order (Rearrange, counters), colours and kinds, two entries on a day, posted-out and
   SANS marks, pinned rows and corner, zoom and pinch, the top row and tabs, the Legend, the Events list, the phone.
5. **The bid windows and the day's list** — the one-day and drag windows, Remarks, Attach, Other, moves, delete, what a
   window shows a day holds.
6. **Manning** — the Required and Available rows, amber and red, the manning bubble, the clash note.
7. **Approvals and decisions** — the Approvals list, Approve / Refuse / Approve all, "Approve what I enter", what is
   greyed and why.
8. **Balances and leave grades** — the Balances page, the person window's tiles, App bal and War bal, the lock, grades,
   the 1 January roll-over, carried-forward leave.
9. **OIL on the war** — OIL taken and given on the grid, Grant OIL, the OIL tracker; point to the OIL page for every
   rule it states.
10. **Members, the bell and undo** — what a member may do, what the bell tells whom, Undo / Redo on the war.
11. **Inputs, postings and the schedule** — what crosses to and from the Inputs page and the schedule: an Other, an
    overseas duty, a course, posting out (its outcomes, its stripes), deleted and archived men.
12. **Settings and speed** — the Settings window, its lists, the grid's speed.
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
  cites the ruling, name it in the Note, and say whether that page states it (then the page here may point to it in
  a few words, citing the number) or only points here. The host already knows these ten other-page lines owe later
  numbers and fixes them itself: Inputs lines citing D1381, D1356; the scheduler's citing D1356, D882; the IT flow
  guide's D1177; People & accounts' D1850, D1692 — name them in the Note, no more.
- Then: **Questions for him** (where a newer ruling does not clearly cover a case an older one sets — D90 — keep both
  stated; never decide; a one-line worked example each), **Proposed to archive — his word first**, and **Unsure** (every
  judgement you would want a reader to check).

## Sorter D — the extra column, and the head
- One row per settled entry (name it by its group and first words in place of a D-number), with one more column,
  **Its detail**: where the built detail of the entry lives once the page states only the rule — "already in
  `docs/ui-contracts.md` §…" or `docs/performance.md` §E (check it is there, word for word or in substance), or "move
  whole to `docs/…` §…" (the reference doc the entry already points to; D138: a move never rewords), or "stated in full
  on the page". Nothing is deleted. Every D-number the section cites is cited on the line that states it.
- The OIL paragraph and the "Also read" paragraph become "From other areas (each stated on its own area's file)"
  pointer lines, as on the scheduler's page — a few words naming the area and subject, then the numbers; **every
  number they cite kept**. The head notes and "Where the detail lives" become the page's head (under about 700
  characters, as the scheduler's) — draft it; the seams file (`.claude/rules/seams/leave-war.md`) keeps the
  architecture and is pointed to.

## Your report back (plain, short — under 300 words; do not paste the table)
Your counts by kind and by section; how many go to "held by tests"; the groups you propose to merge; the cross-area
citations; the questions for him; the archive proposals; your unsure list.

## Traps on this PC
Write files with the Write tool. A script: write it to a file with Write, then run the file (a typed script with a
backslash is refused by a guard; `node -e` loses escapes; in JS use `s.replace(a, () => b)`). `git show <ref>:<path>`
needs `MSYS_NO_PATHCONV=1` first in Git Bash. The Grep tool hides long rows — use the shell's grep for a full row:
`grep -h '^| D1225 |' .claude/decisions-full/*.md`. No `jq`. No `sed -i`.
