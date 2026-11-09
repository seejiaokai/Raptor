# The scheduler's page — the drafting helper's brief (9 Nov 26, chat 42, D1944)

You are a fresh Opus helper. You draft the page; two other readers (Astra and a fresh Opus reader) will check it blind,
so write down every judgement where they can test it. Branch `claude/rules-diet-scheduler-page`, in the checkout
`C:\Users\User\projects\Raptor` (stay in it; never `cd ..` out of it). The list before you start is
`.claude/rules/decisions/scheduler.md` at commit `5d8ddf6f8` — 120,888 bytes, 334 rulings, a head and 30 settled
entries from before the D-numbers.

## Why (open each full row first: `grep -h '^| D1944 |' .claude/decisions-full/*.md`, the shell)
- **D1939, D1941:** a rulings page is a concise statement of how that part of the app works and what the owner likes —
  his standing rules, his likes, and what a fresh model would get wrong if not told. Built detail lives in the app and
  its tests; his words, the history and the agent's readings stay in the full rows, never deleted. A new ruling rewrites
  the old line on its subject instead of standing beside it.
- **D1942, D1943:** the Tracker and Inputs pages — the shape to copy. **D1944:** his word for the scheduler — one page,
  not split by screen, by screen inside the one page. **D1932:** the page stays under the list it replaced (120,888
  bytes), a hard limit, never raised without his word.
- The test for every line: *without this line, would a fresh model working on the schedule likely do the wrong thing —
  and would no test catch it?*

## Your input — four sorting tables, already made (read every row of each)
`raptor-port/docs/superpowers/briefs/2026-11-09-scheduler-page-sort-A.md`, `-B.md`, `-C.md` (the 334 rulings: kind,
section, a drafted line, the tests read, notes) and `-D.md` (the head, the "Also read" paragraph, the 30 settled entries
with where each one's detail lives). Their brief is `…-sort-brief.md` — read it; its sections and kinds are yours.
You own the page: a sorter's line is a draft, not a verdict. Where you change a sorter's kind or line, say so in your
report with the reason. Check every merge group the sorters name across tables, and any "held by tests" whose note
shows doubt (the readers of the last two trials sent back a third of those — unsure means it stays stated).

## Step 1 — write the page (replace the whole file except its front matter)
- Keep the `paths:` front matter byte for byte. Then `# The scheduler — how it works now`, then on their own lines
  `<!-- shape: page -->` and `<!-- trial: built rulings by test -->` (copy the two marks from `inputs.md`).
- A head like the Inputs page's (under about 600 characters): what loads it, what it holds, that built detail is in the
  app and its tests, the full rows' path, the map `DECISIONS.md`, and that a ruling governing an Inputs page lives in
  `inputs.md` (sorter D drafts it).
- `## What it keeps` first: D1944's line and the area's broadest standing rules. Then the sorters' sections in this
  order: Every screen (stated as app-wide; the design page points here), The week on Edit Schedule, Crew and pucks,
  Warnings and the rules engine, Publishing amendments and signing, History and undo, View-only Sched print and export,
  The Scheduler Board, Insights, OIL on the schedule, Admin settings and saving. Then `## Not built yet`,
  `## Settled — leave as they are`, `## Built, stated here: their tests hold only part` (with `###` sub-sections by the
  same screens), `## Done once — kept until he archives them`, `## Built, held by tests` (ONE bullet opening exactly
  `Built, held by tests` then the numbers), and last `## From other areas (each stated on its own area's file)`: the
  old "Also read" paragraph as bare pointer lines — **every number it cites kept**.
- The settled entries: each stated as sorter D proposes; where its detail is to "move whole to `docs/…`", move it with
  `node raptor-port/scripts/backlog-archive.mjs --move` (exact anchors, byte for byte, a one-line pointer) — read its
  usage first (`--help` or the script's head); a move never rewords (D138); nothing is deleted. Then
  `node raptor-port/scripts/docsize.mjs --moves` must list nothing lost.
- One-line bullets (a wrapped line costs bytes); each line at least four words plus two per ruling cited; citations in
  `[D…, D…]` after the statement; at most 600 characters a line; ordinary letters.
- A ruling a later one changed: stated as it stands now, citing it and every ruling that changed it (the gate checks).
- **Never state an agent's reading as his rule** — mark one "(the agent's reading)" if a line truly needs it. Change no
  meaning: each condition, exception, exclusion and scope of the full row's bold cell kept; a permissions widening kept
  wide; nothing narrowed to the phone or one width that was wider. Where a newer ruling does not clearly cover a case an
  older one sets (D90), keep both stated and list it under "Questions for him".

## Step 2 — the gate (run from `raptor-port/`)
- In `raptor-port/scripts/docsize.mjs`: add the PAGE_LIMITS row `['.claude/rules/decisions/scheduler.md', 120888,
  120888, 'D1932'],   // the one-line list at 5d8ddf6f8` beside the Inputs one, and set the RULING_BYTES row for
  scheduler.md (now `2, 125000`) to `2, 120888` with a comment in the style of the Inputs row (D1932, D1944: the trial;
  the size of the list it replaced). No other limit changes.
- `node scripts/backlog-archive.mjs --rulings` (from the repo root) until it prints "the inventory is clean"; then
  `npm run docsize`, `npm run rulecheck` and `node scripts/docsize-selftest.mjs` green. Read every failure — it names
  the edit owed.
- **Other pages' statements of the scheduler's rulings now owe the rulings that changed them.** Measured before you
  started: about 29 numbers — the design page 1, Inputs 11, OIL 15, People & accounts 2. Add ONLY the missing numbers
  to each line the gate names, no word changed. The OIL page is at its hard limit with 41 bytes of room: you may join
  its indented continuation lines to make room (no word changed — D1940's "tighten, no raise"); if it still will not
  take them, STOP on that page alone and report the shortfall in bytes — never raise a limit, never cut a word.

## Step 3 — the map lines (one line each, nothing else in those files)
Name the scheduler among the converted areas where the Inputs pages are named: `DECISIONS.md`'s head (line 8),
`AGENTS.md` item 5, `raptor-port/CLAUDE.md`'s map row "EVERY RULING THE OWNER HAS MADE", `.claude/rules/doc-structure.md`
if it names the converted areas, and the head of `.claude/decisions-full/scheduler.md` (it calls the area file a list of
one-line short forms). `git grep -n "scheduler.md"` for any other text calling it a one-line list, and correct it — but
change no always-loaded rule file beyond a name in a list of converted areas, and say which you touched.

## Step 4 — save and report
- Commit on the branch (do not push): the page, any moves, the gate rows, the other pages' added numbers, the map lines.
  Message ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Your report back (plain, under 400 words): the page's bytes; how many rulings stated, on "held by tests", "hold only
  part"; what moved where; the other pages' additions (and any OIL shortfall); the gate results; every judgement you
  were unsure of; where you overrode a sorter; "Questions for him"; the "Proposed to archive" list. Do not paste the page.

## The host's notes from the four sorters' reports (read with the tables)
- **Keep a heading named "Settled before this list"** on the page (a `###` under `## Settled — leave as they are`, holding
  the settled entries' statements): about a dozen documents and two code comments point to "§Settled before this list"
  (`inputs.md`, `leave-war.md`, `engine-rules.md`, `performance.md`, `ui-contracts.md`, the project guide, its full text,
  `OUTSTANDING.md`, `DECISIONS.md`, `html.ts`, `latemark.test.tsx`), and each must still land. Do not archive the old
  settled text wholesale (sorter D's proposal): state each entry, move only the detail sorter D marks "move whole".
- **Cross-table merges:** the late mark (D's five rows, A's D1586, D1620, D1621, B's D742); the reporting group D497–D511
  (C) with D1026, D1034 (A), D591, D600 (B); the ALL AVAIL window with D1106; the placeholders with D43; the blue/red mix
  with D518, D521, D523, D530; D928 with the Logic notes; D1577 with the week cross; D1083 with the SC in-time.
- **A later ruling that changed an earlier one without a mark** (sorter A: D1063 against D1064; D1041 against D1044,
  D1045; D1030's "highlighted" against D1038; D1782 narrowing D844, D845, D882; D1106 narrowing D41; sorter C: D278 by
  D753 — C's reading): state the rule as it stands, both numbers on the line; mark no full row yourself — list each pair
  in your report for the host to check and mark.
- **Archived numbers cited in the settled text** (D46, D715, D718, D1574–D1576): if the gate calls one stale, cite the
  ruling that replaced it beside it, as the gate names.
- **Two settled entries belong to the Inputs pages alone** (sorter D): leave them on this page — moving them changes his
  D802 split, which is his call; list them under "Questions for him".
- **The three speed entries** fit no section: give them a section of their own, "Speed of the dense screens", before
  "Admin, settings and saving".
- **Question already found:** D511 against D1026 and D1034 (does RALLY in the "+ In-time" button's text make a rally) —
  sorter C's worked example; keep both stated. Sorter B's D660 against D762, likewise.
- **Sorter B's two new sections are taken:** "Inputs on the schedule" (after Crew and pucks) and "The Leave War's rows and
  the Event sheet on the schedule" (after OIL on the schedule). B's other notes: D838 cites the archived D843; D806 to
  archive only if a reader finds D836 restates it in full; B's unsure list (D877, D831, D840, D767, D769, D605, D748,
  D600, D594, D554) — check each against its test or row.
- **The held count:** 64 of 334 (A 18, B 28, C 18) are marked held whole — more than either trial kept after its reads.
  Re-open every one whose sorter listed it as unsure or "close" (A: D1044, D1061, D950; C: D505, D50, D40, D65, D270,
  D272, D175) and send back any whose test holds only part.
- **Stale "Not built" in full rows** (D1038, D1042–D1046, D1060–D1065 — built and tested, sorter A): state them as built;
  list them for the host to correct the rows.

## Traps on this PC
Edit files with the Edit and Write tools. A script: write it to a file with Write, then run the file (a typed script
with a backslash is refused by a guard; `node -e` loses escapes; in JS use `s.replace(a, () => b)`). No `sed -i` (a
guard refuses it: it turns Windows line endings). `git show <ref>:<path>` needs `MSYS_NO_PATHCONV=1` first in Git Bash.
The Grep tool hides long rows — use the shell's grep for a full row. No `jq`.
