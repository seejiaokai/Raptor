# The Leave War's page — the drafting helper's brief (9 Nov 26, chat 45, D1947)

You are a fresh Opus helper. You draft the page; two other readers (Astra and a fresh Opus reader) will check it blind,
so write down every judgement where they can test it. Branch `claude/rules-diet-leave-war-page`, in the checkout
`C:\Users\User\projects\Raptor\.claude\worktrees\beautiful-merkle-20a6b2` (stay in it; never `cd ..` out of it). The
list before you start is `.claude/rules/decisions/leave-war.md` at commit `0ce71adab` — 121,825 bytes, 379 rulings, a
head and the two groups of §Settled before this list.

## Why (open each full row first: `grep -h '^| D1947 |' .claude/decisions-full/*.md`, the shell)
- **D1939, D1941:** a rulings page is a concise statement of how that part of the app works and what the owner likes —
  his standing rules, his likes, and what a fresh model would get wrong if not told. Built detail lives in the app and
  its tests; his words, the history and the agent's readings stay in the full rows, never deleted. A new ruling rewrites
  the old line on its subject instead of standing beside it.
- **D1942, D1943, D1944:** the Tracker, Inputs and scheduler pages — the shape to copy (`scheduler.md` above all).
  **D1947:** his word for the Leave War — one page in the same shape. **D1932:** the page stays under the list it
  replaced (121,825 bytes), a hard limit, never raised without his word.
- The test for every line: *without this line, would a fresh model working on the Leave War likely do the wrong thing —
  and would no test catch it?*

## Your input — four sorting tables, already made (read every row of each)
`raptor-port/docs/superpowers/briefs/2026-11-09-leave-war-page-sort-A.md`, `-B.md`, `-C.md` (the 379 rulings: kind,
section, a drafted line, the tests read, notes) and `-D.md` (the head, the OIL and "Also read" paragraphs, the settled
entries with where each one's detail lives). Their brief is `…-sort-brief.md` — read it; its sections and kinds are
yours. You own the page: a sorter's line is a draft, not a verdict. Where you change a sorter's kind or line, say so in
your report with the reason. Check every merge group the sorters name across tables, and any "held by tests" whose note
shows doubt (the readers of the last three trials sent back between a third and a half of those — unsure means it stays
stated).

## Step 1 — write the page (replace the whole file except its front matter)
- Keep the `paths:` front matter byte for byte. Then `# The Leave War — how it works now`, then on their own lines
  `<!-- shape: page -->` and `<!-- trial: built rulings by test -->` (copy the two marks from `scheduler.md`).
- A head like the scheduler page's (under about 700 characters): what loads it, what it holds, that built detail is in
  the app and its tests, the full rows' path, the map `DECISIONS.md`, the architecture in `.claude/rules/seams/leave-war.md`,
  and that the OIL page loads with it (sorter D drafts it).
- `## What it keeps` first: D1947's line and the area's broadest standing rules. Then the sorters' sections in this
  order: Every screen (stated as app-wide; the design page may point here), Periods stages and bidding, The grid, The bid
  windows and the day's list, Manning, Approvals and decisions, Balances and leave grades, OIL on the war, Members the
  bell and undo, Inputs postings and the schedule, Settings and speed. Then `## Not built yet`,
  `## Settled — leave as they are` (with a `###` named **"Settled before this list"** holding the old settled entries'
  statements — documents and code comments point to "§Settled before this list" and each must still land:
  `git grep -n "Settled before this list" -- . ':!*.png'` and check every Leave War pointer), `## Built, stated here:
  their tests hold only part` (with `###` sub-sections by the same sections), `## Done once — kept until he archives
  them`, `## Built, held by tests` (ONE bullet opening exactly `Built, held by tests` then the numbers), and last
  `## From other areas (each stated on its own area's file)`: the old OIL and "Also read" paragraphs as bare pointer
  lines — **every number they cite kept**.
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
- **The OIL page (`oil.md`) loads with every Leave War file:** no line here may contradict it; where it states a rule,
  point to it in a few words with the number rather than restating.

## Step 2 — the gate (run from `raptor-port/`)
- In `raptor-port/scripts/docsize.mjs`: add the PAGE_LIMITS row `['.claude/rules/decisions/leave-war.md', 121825,
  121825, 'D1932'],   // the one-line list at 0ce71adab` beside the scheduler's, and set the RULING_BYTES row for
  leave-war.md (now `2, 136000`) to `2, 121825` with a comment in the style of the scheduler's row (D1932, D1947: the
  page; the size of the list it replaced). No other limit changes.
- `node scripts/backlog-archive.mjs --rulings` (from the repo root) until it prints "the inventory is clean"; then
  `npm run docsize`, `npm run rulecheck` green. Read every failure — it names the edit owed. Run
  `node scripts/docsize-selftest.mjs` in the background with no time limit under 30 minutes (it takes about 17 minutes
  here) and read its result.
- **Other pages' statements of the Leave War's rulings now owe the rulings that changed them.** Measured before you
  started — ten lines on four pages:
  - `inputs.md` line 149 (D1381 owes D1389, D1390) and line 197 (D1356 owes D1388, D1357, D1365);
  - `scheduler.md` line 237 (D1356 owes D1388, D1357, D1365) and line 361 (D882 owes D1782, D1221);
  - `people-accounts.md` line 90 (D1850 owes D1870) and lines 99, 107, 108 (D1692 owes D1697, D1698) — 236 bytes of
    room under its hard limit;
  - `it-flow-guide.md` lines 21 and 24 (D1177 owes D1225) — **already done by the host** on his "Tighten, no raise"
    (D1948, spent and archived): leave that page alone.
  For each: open the later rulings' full rows; if the line already states the rule as it stands since then, add only
  the numbers; if it does not (People & accounts' line 108 says "marked posted out" where D1697 made the mark the purple
  line; the IT guide's flow line and D1225's deleting a pending bid on a closed day), rewrite only the words that are now
  wrong, and list every such rewrite in your report — the readers check them. Never raise a limit; if People &
  accounts will not take its numbers, STOP on that page alone and report the shortfall in bytes.

## Step 3 — the map lines (one line each, nothing else in those files)
Name the Leave War among the converted areas where the scheduler is named: `DECISIONS.md`'s head (line 8),
`AGENTS.md` item 5, `raptor-port/CLAUDE.md`'s map row "EVERY RULING THE OWNER HAS MADE", `.claude/rules/doc-structure.md`
if it names the converted areas, and the head of `.claude/decisions-full/leave-war.md` (if it calls the area file a list
of one-line short forms). `git grep -n "leave-war.md"` for any other text calling it a one-line list, and correct it —
but change no always-loaded rule file beyond a name in a list of converted areas, and say which you touched.

## Step 4 — save and report
- Commit on the branch (do not push): the page, any moves, the gate rows, the other pages' changes, the map lines.
  Message ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Your report back (plain, under 400 words): the page's bytes; how many rulings stated, on "held by tests", "hold only
  part"; what moved where; the other pages' changes (every rewrite named); the gate results; every judgement you were
  unsure of; where you overrode a sorter; "Questions for him"; the "Proposed to archive" list. Do not paste the page.

## The host's notes from the four sorters' reports (read with the tables)
- **Keep a heading named "Settled before this list"** (a `###` under `## Settled — leave as they are`, holding the
  settled entries' statements): `raptor-port/CLAUDE.md`, `guide-full.md`, `performance.md`, `scheduler.md` and the full
  rows of D159, D160 and D1476 point to it or its old group names ("Leave War roster & display", "Leave War grid
  performance") — each must still land. **Sorter D's proposal to move the old head and settled text whole to
  `docs/archive/` is not taken:** state each entry; move only the detail sorter D marks "move whole" to a reference doc
  that already covers it. Its four pieces of detail with no reference doc yet (the chip's quals list, the built-in
  groups' colours, the groups list's drop rule, pilots above WSOs) stay stated on the page — do not invent a home.
- **Stale reference docs sorter D found** (`ui-contracts.md`'s "TWO orders", its old one-row top and zoom-pair passages;
  `file-map.md`'s "no grip"; the pointer to "`performance.md` §Leave War window engine", which is §C and §E): not yours
  to fix — list them in your report; the host files them. On the page itself, point to the sections that exist.
- **The head:** D347 is on `design.md`, not How we work — point there. D265 and D1440 are this area's own rows.
- **Held by tests — 65 of 379 proposed** (A 9, B 28, C 28): more than any trial kept after its reads (the scheduler kept
  28 of 56). Re-open strictly every one a sorter listed as unsure or close: A's D1440, D1476 (accepted against a helper's
  doubt); B's permissions D1242, D1263, D1379, and D1288 (pinch tested only on shared code); C's D1225 (it narrows
  D1177, which the IT guide and others state) and C's seven kept stated (D1235, D1228, D1215, D1164, D1147, D1016, D882 —
  keep them stated). B's D1357 and D1277: a test reader said held, B said part — keep them stated.
- **Cross-table merges** (each sorter's table head names the members): COLOURS (B's colour sets D1316, D1322, D1323 with
  C's D1165, D1175 and A's CELL), NAV (D1254, D1244, D1227 and A's PHONE-TOP), ZOOM and PINCH (D1282–D1288, D159, D1228,
  D1276), BUBBLE (D1258, D1272, D1274, D1277, D1358, D1344), DAY-LINE (D1313, D1314), AUTO-APPROVE (D1302, D1463, D1186,
  D1182), LEAVE-YEAR (D1235, D1474, D1489), PENDING / TILES (D1472, D1479, D1238, D1252), HELD-DAY (A's and B's), ROUND3
  / DATE-DURATION (D1330, D1332 with D1212, D331, D335), OPEN-PAST / OPEN-WHOLE (D1265, D1267, D1269, D1177), SANS
  (D1215, D1221, D1692, D1697, D1698), Rearrange (D160, D1254, D1275), the settings window (D1499, D1205, D669).
- **A later ruling that changed an earlier one without a mark** — state the rule as it stands, both numbers on the line;
  mark no full row yourself; list each pair in your report for the host to check and mark: D1330 / D1332 over D1212,
  D331, D335 (C); D1254 over D1227's place for My leave (C); D1316 over D1175's course, overseas-duty and medical colours
  (C); D1019 largely overtaken (C — say by what). **D1326's short line is stale** (B): it reads "CSE · OD · UNA" and cites
  the archived D1338 — state the bid row as it stands; the gate will name the citation owed.
- **Question for him (B):** may a member file an overseas duty or a course on a past day — D1318 says "any date", D1211
  says a member never bids before today. Keep both stated; list it under "Questions for him" with that example.
- **Not built:** D1724 ([LW-FULL-EDITING]) and D1001 (sorting by flight) — one short line each naming the item.
- **Proposed to archive — about 24** (A: D1850, D1723, D1559, D1563, D1475, D1404; B: D1348, D1343, D1340, D1319,
  D1317, D1299, D1265, D1250; C: D1140, D1204, D1206, D1232, D1199, D1182, D1165, D1161; D: the table-format note, the
  "CLOSED" preamble and two moved-out pointers). Each still stated briefly under "Done once"; check none is cited as a
  live rule elsewhere (D1265's past-dates note, D1182's tick, D1165's colours — B and C use some on merged lines: if a
  number carries a live part, it is not spent; say so).
- **Every screen:** D1188 (a button in the same place on a phone as on a desktop), D1387, D1327, D1328, D1525, D1246,
  D1150 / D1159 — stated as app-wide; D1151 stays here. Note in your report which `design.md` does not state.
- Sorter D kept "a remembered war is never reopened at the next start" beside D1177 (the code and a test hold it) — keep
  it, named in your report for the readers.

## Traps on this PC
Edit files with the Edit and Write tools. A script: write it to a file with Write, then run the file (a typed script
with a backslash is refused by a guard; `node -e` loses escapes; in JS use `s.replace(a, () => b)`). No `sed -i`.
`git show <ref>:<path>` needs `MSYS_NO_PATHCONV=1` first in Git Bash. The Grep tool hides long rows — use the shell's
grep for a full row. No `jq`. A background command starts in the chat's folder: `cd` into `raptor-port` by its full path
inside it.
