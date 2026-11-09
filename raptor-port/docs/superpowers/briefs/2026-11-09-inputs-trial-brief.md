# The Inputs page in the Tracker trial's shape — the drafting helper's brief (9 Nov 26, chat 41, D1943)

You are a fresh Opus helper. You draft; two other readers (Astra and a fresh Opus reader) will check your work blind, so
write down every judgement where they can test it. Branch `claude/rules-diet-inputs-trial`, in the checkout
`C:\Users\User\projects\Raptor` (stay in it; never `cd ..` out of it). The page before you start is commit `b87243496`.

## Why (open each full row before you start: `grep -h '^| D1943 |' .claude/decisions-full/*.md`, the shell)
- **D1939, D1941:** a rulings page is a concise statement of how that part of the app works and what the owner likes —
  his standing rules, his likes, and what a fresh model would get wrong if not told. The exact detail of what is built
  (screen words, sizes, places, button order) lives in the app and its tests; his words, the history and the agent's
  readings stay in the full rows, never deleted. A new ruling rewrites the old line on its subject instead of standing
  beside it.
- **D1942:** the Tracker trial approved as shown — the shape to copy; **D1943:** his go for the Inputs pages, alone.
- **D1932:** a converted page is under the size of the list it replaced, a hard limit, never raised without his word.
- The test for every line: *without this line, would a fresh model working on the Inputs pages likely do the wrong
  thing — and would no test catch it?*

## The model to copy
- The Tracker page as it stands: `.claude/rules/decisions/tracker.md` (its head, its sections, "Settled — leave as they
  are", "Built, stated here: their tests hold only part", "Built, held by tests", "From other areas").
- Its sorting table: `raptor-port/docs/superpowers/briefs/2026-11-09-tracker-trial-sorting.md` (same columns for yours).
- **Its readers' reports — read both before you sort:** `…/2026-11-09-tracker-trial-read-astra.md` and `…-read-opus.md`.
  The first pass moved 39 rulings to "Built, held by tests"; the readers sent 20 back, because the test held only part:
  a list of what is NOT done (D372's "not undoable"), an exception (D64's smoke lines), the equal-access principle
  reduced to examples (D121), a size "and nothing moves" with only the number tested (D1170). Do not repeat this.

## The source
- `.claude/rules/decisions/inputs.md` — a one-line list, 165 rulings (D1943 the newest), and its "Also read" paragraph
  of other areas' rulings. Its `paths:` block stays exactly as it is.
- `.claude/decisions-full/inputs.md` — every full row: his words (col 3), what it means (col 4: the first bold sentence
  is the rule; the "agent's reading" parts are NOT his rule), where it lives (col 5). Read every row you sort.

## Step 1 — sort every one of the 165 rulings (the table, saved as `raptor-port/docs/superpowers/briefs/2026-11-09-inputs-trial-sorting.md`)
Kinds: **standing** (a lasting rule, like, principle, constraint or "leave it / don't reopen": stays, stated) ·
**built** (detail of something built: leaves for the "Built, held by tests" line ONLY when a test holds it whole) ·
**not built** (stays, one short line naming its backlog item — check `OUTSTANDING.md` for the item) · **spent /
history** (a one-off job done, a request to design something that was then designed: list it under "Proposed to
archive — his word first" at the end of the table, and still state it briefly on the page; never archive anything).

**Built, held whole — the strict test.** Find the tests with the gate's one finder (the number as a word in a
`*.test.ts(x)` / `*.spec.ts(x)` file under `raptor-port/src` or `raptor-port/e2e`; `git grep -n -w D569 -- 'raptor-port/src/**/*.test.*' 'raptor-port/e2e/**'`).
Open each test and read its assertions. "Holds it whole" means EVERY part of the rule sentence in the full row's bold
cell — each condition, exception, exclusion ("not X", "never Y"), scope ("only on the SANS calendar", "for flying
only"), and any words on screen he chose — has an assertion that fails if that part goes. A number in a comment or a
test title only is not a test. A part with no assertion → the ruling stays written out (under "Built, stated here:
their tests hold only part", with the unpinned part named in the table). **Unsure → it stays.** Write no test and
change no test: the tests that would let a ruling leave are a later job, on his word.

A ruling a later one changed (" — changed by" on its short line, the NARROWED / ANSWERED marks in its row): state the
rule as it stands now, once, citing the ruling and every one that changed it on that line (the gate checks this).
Several rulings on one subject become one line citing them all.

## Step 2 — write the page
- Keep the `paths:` front matter byte for byte. Then `# The Inputs pages — how it works now`, then on their own lines
  `<!-- shape: page -->` and `<!-- trial: built rulings by test -->`.
- A head like the Tracker's (under about 600 characters): what loads it, what it holds, that built detail is in the app
  and its tests, the full rows' path, the map `DECISIONS.md`. Keep the old file's one standing note that matters for a
  fresh model: a ruling that governs BOTH an Inputs page and the schedule lives in `scheduler.md`, this page points to it.
- `## What it keeps` first: D1943's line (this page is the trial on the Inputs pages, approved shape D1942, no other area
  changes until he says) and the area's broadest standing rules. Then sections by topic (for example: the Inputs list;
  the Inputs calendar; an input's window and card; the SANS calendar; the Calendar window and holidays; the late
  cut-off; filing and cancelling) — your judgement, as long as a fresh model finds a rule where it would look.
- `## Settled — leave as they are` (the "don't reopen" and "kept as built" ones), `## Built, stated here: their tests hold
  only part`, `## Built, held by tests` (ONE bullet opening exactly `Built, held by tests` then the numbers), and
  `## From other areas (each stated on its own area's file)`: the old "Also read" paragraph as bare pointer lines like the
  Tracker's — a few words naming the area and subject, then the numbers; **every number the paragraph cites kept**.
- One-line bullets (a wrapped line costs bytes); each line at least four words plus two per ruling cited; citations in
  `[D…, D…]` after the statement; ordinary letters, no capitals for emphasis.
- **Never state an agent's reading as his rule.** If a line truly needs one, say "(the agent's reading)".
- Change no meaning. Where a newer ruling does not clearly cover a case an older one sets (D90), do not decide: keep both
  stated, and list it under "Questions for him" in your report.

## Step 3 — the gate (run from `raptor-port/`)
- In `raptor-port/scripts/docsize.mjs`: add the PAGE_LIMITS row `['.claude/rules/decisions/inputs.md', 52689, 52689,
  'D1932'],   // the one-line list at b87243496` and set the RULING_BYTES row for inputs.md to `2, 52689` with a comment
  in the style of the Tracker's row (D1932, D1943: the trial; the size of the list it replaced). No other limit changes.
- `npm run docsize` and `npm run rulecheck` green; `node scripts/docsize-selftest.mjs` green. Read every failure the
  gate prints — it names the edit owed.
- **Other pages now cite a converted area's rulings:** once this file is a page, the gate also checks that a line on
  another page citing an Inputs ruling cites each later ruling that changed it. If that fails on another page, add only
  the missing numbers to that line; if a page's hard limit will not take them, STOP and report it — never raise a
  limit, never cut that page's words.

## Step 4 — the map lines (one line each, nothing else in those files)
Name Inputs among the converted areas where the Tracker is named: `DECISIONS.md`'s head (line 8), `AGENTS.md` item 5,
`raptor-port/CLAUDE.md`'s map row "EVERY RULING THE OWNER HAS MADE", and the head of `.claude/decisions-full/inputs.md`
if it describes the area file as one-line. `git grep -n "inputs.md"` for any other text calling the Inputs file a
one-line list, and correct it.

## Step 5 — save and report
- Commit on the branch (do not push): the page, the table, the gate rows, the map lines. Message ending with the line
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Your report back (plain, short): the page's bytes before and after; how many rulings stated, how many on "held by
  tests", how many "hold only part"; the gate results; every judgement you were unsure of; "Questions for him"; the
  "Proposed to archive" list. Do not paste the page.

## Traps on this PC
Edit files with the Edit and Write tools. A script: write it to a file with Write, then run the file (a typed script
with a backslash is refused by a guard; `node -e` loses escapes; in JS use `s.replace(a, () => b)`, never a string
replacement, since `$'` in prose expands). `git show <ref>:<path>` needs `MSYS_NO_PATHCONV=1` first in Git Bash. The
Grep tool hides long rows — use the shell's grep for a full row. No `jq`.
