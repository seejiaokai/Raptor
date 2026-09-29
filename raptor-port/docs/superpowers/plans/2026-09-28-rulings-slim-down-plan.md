# The rulings slim-down — plan (D390, 28 Sep 26)

**Approved by the owner, 28 Sep 26 (D390 — "Approve")**, after a proposal with a sample and a measured before/after.
Backlog item: `OUTSTANDING.md` `[RULINGS-SLIM]`. Branch: `claude/docs-rulings-slim-down-e83c74` (docs and the document
gate's scripts only — no `raptor-port/src`). Rulings range for this chat: D390–D399. **Revision 2** (same day): both
red teams' findings folded in — the review log is §6.

## 1. The problem, measured

Every chat loads the always-loaded rule files and the general rulings before any work; a build chat also loads the
project guide and its area's rulings. Measured 28 Sep 26 (tokens estimated from file size at 3.7 characters per token,
which reproduces the owner's own `/context` readings of 41k, 39k and 15k):

| File | Loads | Tokens | Of which ruling rows |
|---|---|---|---|
| `.claude/rules/decisions/how-we-work.md` | every chat | ~40.9k | ~40.7k (122 rows) |
| the other always-loaded rule files (bug-check, doc-structure, plain-language, record-decisions, shipping) | every chat | ~9.2k | — |
| `raptor-port/CLAUDE.md` | once a `raptor-port/` file is opened | ~16.2k | — |
| `.claude/rules/decisions/scheduler.md` | any scheduler / board / engine / state / ui file | ~41.9k | ~33.0k (82 rows) |
| `.claude/rules/decisions/leave-war.md` | any Leave War file | ~10.9k | ~4.8k (13 rows) |
| `.claude/rules/decisions/oil.md` | OIL, publishing, placeholder, Leave War files | ~9.9k | ~9.2k (29 rows) |
| `.claude/rules/decisions/tracker.md` | any Tracker file | ~7.8k | ~4.8k (18 rows) |

A chat that opens no project file carries ~50k; a scheduler build chat ~110k. A draft short line for all 264 rows,
taken from each row's heading, measured ~8.0k tokens in total.

## 2. The design

### 2.1 One short line loads; the full row sits beside it

- **The full row moves WHOLE, byte for byte, to `.claude/decisions-full/<area>.md`** — the area file's own basename, the
  same five-column table and header, newest first. The folder is outside `.claude/rules/`, so Claude Code never loads it
  by itself (only `.claude/rules/**/*.md` and the `CLAUDE.md` files load — confirmed by both red teams; no hook, skill,
  script or settings entry reads the folder). Its header says: never loaded, searched; each row's short line is in
  `.claude/rules/decisions/<same name>`; **a change mark on an older ruling (DECISIONS.md step 2) is written HERE.**
- **The area file** keeps its `paths:`, header, "Also read" lines and non-row sections (the "Settled before this list"
  notes and the Architecture sections stay as they are — the proposal's question 4 was optional and not answered). Its
  table becomes `| # | Date | The rule |` / `|---|---|---|` with one line per ruling:
  `| D<n> | <date> | <the rule>[ — changed by D<a>, D<b>] |` — the date equal to the full row's date cell.
- **How a chat opens a full row** (in the area file's header, `record-decisions.md` and every Astra brief): search the
  folder with the shell — `grep -h '^| D149 |' .claude/decisions-full/*.md` — or find the line number and Read that one
  line. **Not the Grep tool**: it prints "[Omitted long matching line]" for a row, and a search that returned no text is
  not a read (Fable, red team). The rule: **open a ruling's full row before acting on its detail, and before putting a
  question to him about it** (D68 already says never skip a read the work needs; this names the read).
- **The short line's rule text** states the rule **as it stands in force**, alone, in at most 350 characters (the change
  tail not counted), with no `|` character at all. Where the row's own first bold sentence in its **meaning cell**
  already does that and the row carries no change mark, the short line IS that sentence, word for word (an extract).
  **Every row that carries a change mark, and every row whose heading does not stand alone, gets a hand-written short
  line** stating the rule after its changes — D294's heading still says "Fully delete", renamed by D298; D287's says
  "deleted outright", changed by D290 and D297 (Fable, red team).
- **The change tail** ` — changed by D<a>, D<b>` names exactly the rulings the full row's marks name — no more, no fewer
  (set equality, checked both ways). A mark is a bold span, in the ruling cell or the meaning cell, holding one of the
  change words — NARROWED, AMENDED (AGAIN), REPLACED, SUPERSEDED, EXTENDED, WIDENED, REFINED, SET ASIDE, ANSWERED,
  CORRECTED, REVERSED — optionally "IN PART" and a date, then BY; it names every D-number from BY to the first colon or
  the end of the span (D305 names D310 and D322). A tail may name a ruling in any area.
- **The meaning read (D138)** — Fable, every short line against its full row, one verdict per line
  (faithful / omits / stale / says more), told which lines are extracts and which hand-written, given the mark and
  back-mark reports (§2.5), and never to fix by rewording the full row. The questions: (a) does it say anything the row
  does not; (b) would a chat acting on it alone do something the row forbids; (c) would it omit something the row
  requires (a process step, a check, a picture first — D224's plan and FULL check, D289's mock-up first); (d) is it the
  rule in force after the row's marks; (e) does it omit a condition the row's readings make part of the rule; (f) is it
  distinguishable from every other short line in its file (red teams: Astra 6, Fable 6).

### 2.2 A new area: People & accounts

`.claude/rules/decisions/people-accounts.md` (short lines) + `.claude/decisions-full/people-accounts.md` (full rows).
It takes from How we work the accounts, one-door and posting rulings — D165, D166, D200, D204, D210, D211, D213–D217,
D219–D227, D229, D280–D301, D303–D310, D320–D323, D325–D329 (60 rows) — **and from the scheduler file D149 and D218**
(a member edits his own Quals row; only an admin changes a callsign — D200, which builds D149, moves too; Fable, red team).
How we work keeps the general ones (D302, D228, D324, D201, D203, D173, D180 among them). Its `paths:` are **derived
from every existing file the 62 rows name as a home**, then widened by intent (Admin → Users, Quals, the sign-in and
access screens, the welcome-back note, the Leave War's posting sheets, posting logic and roster projection, the person
add / delete / rename code, their tests, mock-ups, look cards and plans, `engine-rules.md`, `ui-contracts.md`,
`data-model.md`, `data-schema.md`, `handover-dataverse.md`, `architecture-direction.md`) — short lines are cheap, so the
paths are generous (D68). A chat that PLANS such work before opening a file is covered by the router line in
`doc-structure.md` (below). "Also read" lines are added where the new area's rulings govern another area's surface:
scheduler.md and oil.md name D297, D299, D321, D327 (a deleted or archived man on published days and in the crowd) and
D213, D215 (the guest view of the schedule); leave-war.md's line naming them "in how-we-work.md" is corrected (D201).
Rulings filed after this plan (the parallel branches' D347–D376) are classified at merge — D350 (Undo does not take back
adding, archiving, restoring or deleting a person) is a candidate for People & accounts (Astra, red team).

### 2.3 How a new ruling is recorded

- **Step 1, unchanged:** one full row at the top of its area's table. **Added:** the first bold sentence of its meaning
  cell becomes the line every chat sees, so it must state the rule on its own, in at most 350 characters, with no `|`.
- **Step 2, changed:** marking an older ruling happens in its **full row, in `.claude/decisions-full/`** (a REPLACED /
  SPENT mark at the head of the ruling cell as today; a narrowing mark in its own words) — and its short line's text is
  rewritten to state the rule as it now stands. `--rulings` refreshes the change tail from the marks; the rewrite is the
  chat's. A NEW row that names an older one with a change verb ("narrows D293") while D293's full row carries no mark
  naming it fails the gate (the back-mark check, §2.5).
- **Step 3, unchanged:** `node raptor-port/scripts/backlog-archive.mjs --rulings`.

### 2.4 The converter (`backlog-archive.mjs --rulings`), extended

Every rulings file is parsed fence-aware; a row is classified by its count of unescaped `|`: **4 is a short line, 6 is a
full row, anything else is refused with its file and line** (Astra 1 and 10; Fable 10d). All results are built in
memory, then written, then the gate's inventory runs, and every file is put back if it is not clean — **the refusal
names the row and the edit to make** ("D391's first bold sentence is 500 characters — shorten it in the meaning cell"),
so the Stop hook never loops blind (Fable 11).

1. **A full row in an area file** whose number has no full row elsewhere → moved to the top of that area's full-text
   table (the file created with its header if missing); a short line (the extract + its tail) inserted at the **top** of
   the short table (Fable 2b). No bold heading in the meaning cell, a heading over 350 characters or ending in ":" →
   refused. A full row in an area file whose number already has a DIFFERENT full row in a full-text file → refused
   ("edit the full row in `.claude/decisions-full/`"); an identical one → the area copy is dropped.
2. **Change tails** refreshed from the marks (set equality). The rule text is never touched.
3. **A short line and its full row in different areas** → the full row follows the short line.
4. **A number retired in `DECISIONS-ARCHIVE.md` and still live** → the live copies go (reported by name).
5. **Marked rows** (REPLACED / SPENT at the head of the ruling cell) wherever they sit → the full row to the archive,
   its short line deleted.
6. **The map** in `DECISIONS.md` rewritten from the short lines.

**`--rulings --merge`** — replaces the first plan's `--take-both`, which both red teams showed unsafe (raw conflict
blocks keep two table headers, stale "Also read" text and doubled archive headings; and "the area copy is the newer"
would have lost this branch's own D390 marks on D136, D140 and D141 in either merge order). Run during a conflicted
`git merge` (MERGE_HEAD present). It never reads conflict blocks:
- The **structure side** is the side whose tree has `.claude/decisions-full/` (ours if both). Its rulings files are the
  starting point, read from git, so every conflict marker in them is gone.
- The **other side's changes since the merge base**, per D-number, are replayed onto it, three-way: a new number → a
  full row at the top of its area's table, then converted as in step 1; changed on the other side only → its full row
  replaces ours (a short line that was the old heading word for word is regenerated; a hand-written one is listed "rewrite
  this short line"); changed on ours only → kept; **changed on both sides → the command stops and names the row**, with
  both versions, for hand resolution; retired to the archive on the other side (D182's shape) → archived here too;
  moved between areas on the other side → moved here.
- **Every non-row line the other side changed** in a rulings file — "Also read" lines, headers, `DECISIONS.md` prose
  such as the ranges paragraph — is **printed, never written**: "re-apply by hand: file, before → after". The ranges
  paragraph keeps every range.
- It prints every short line it generated, headed "UNREAD — have one reviewer read these" (Fable 2c); new numbers the
  other side filed in How we work are listed "classify: does this belong in another area?" (D350).
- Then steps 2–6 and the inventory, as a plain `--rulings`.

**`--rulings --move-rows D<a>,D<b>… --to <area>`** — the one way a ruling changes area: short line and full row move,
bytes unchanged, each landing in its date order (newest first). It is how the 62 rows reach People & accounts.

### 2.5 The document check (`docsize.mjs`), extended

- **Identity** is the full row (six `|`), wherever it sits: `DECISIONS.md`, an area file, a full-text file, the archive.
  Lost / newly doubled / marked-still-live / archived-without-mark are judged on full rows, and the full-text folder
  joins every "now", "base" and "commit since" read — so a move into it is a move, never a loss.
- **The short index:** every live full row has exactly one short line and every short line one full row; same area
  basename; equal date; rule text ≤ 350 characters and no `|`; change tail = the full row's marks, both ways. A row with
  any other `|` count fails. A full row left in an area file fails with the converter's own diagnosis.
- **The map** covers area files only; the full-text folder never needs a map row (Fable 10e).
- **Tripwires in UTF-8 bytes, whole file** (frontmatter, headers, "Also read" and non-row sections included), for EVERY
  `.claude/rules/decisions/*.md` — an area file with no registered tripwire fails, path-scoped or not (Astra 9). Crossing
  one means **split the area** (a new area file, paths, map row and full-text file via `--move-rows`) or raise it with
  its reason — never trim a ruling (D136, D141). The full-text files have none (searched, never loaded). The other
  always-loaded files keep their line ceilings.
- **Reports, never failures:** the back-mark report for older rows (a row naming an older one next to a change verb —
  narrows, amends, sets aside, replaces, widens, extends, refines, settles, answers, corrects — where the older row has
  no mark naming it; it FAILS only for a row new since the base); the drift report (a short line changed since the base
  while its row did not; a row's heading changed while its short line did not); a scoped area's row whose `raptor-port/`
  home matches none of that area's paths and no other area's "Also read" names it.
- **The guide's pairing** (§2.6).
- **`docsize-selftest.mjs`**: the fixtures move to the new shape; new cases for a clean conversion and a second run that
  changes nothing; a new full row converted to the top; a refused heading and its message; the five malformed rows'
  shapes refused; a short line with a missing, extra or `|`-carrying change tail; a date mismatch; a lost number; a
  marked full row in a full-text file archived; the back-mark failure for a new row; an unregistered area file; and
  **real `git merge` fixtures, both orders**, for the parallel branches' shapes: new rows only, a one-sided edit (D67), a
  row spent on the other side (D182), a row marked on our side only (D136 — the mark kept), a two-sided edit (stops),
  and an "Also read" edit (printed, not written).

### 2.6 The project guide (`raptor-port/CLAUDE.md`) — last

**Now, on its own branch, in a fresh chat (D391, 28 Sep 26 — narrowing D390's "after the small-fixes branch merges")**, leaving untouched the guide's Leave War row of §Where things live, which `claude/small-fixes-batch-d223f6` edits.
`raptor-port/docs/guide-full.md` is created first with a heading per section and the map table's header; then each block
moves with `backlog-archive.mjs --move … --under "<its heading>" --pointer "<one-line short form> · full text:
docs/guide-full.md §<heading>"` — byte-exact, one line left in its place (Fable 12). What every task needs to work safely
stays in full in the guide (the five gate commands, the slot-key grammar's key list, the two funnels, the product
invariants). **Pairing gate:** every `##`/`###` heading of `guide-full.md` is named by exactly one pointer in the guide,
and every pointer names an existing heading (a lighter form of Astra 8's manifest). A `doc-structure.md` row: a rule
every task needs → its short form in the guide, its full text in `guide-full.md`. Fable reads every short form (D138).
Estimate ~16k → ~6k.

**Built 28 Sep 26** on `claude/rulings-slim-d391-078ad2` (cut from `main` after PR #458 merged — the same tree as this
branch). 35 blocks moved, each under its own `###` in `guide-full.md` (its `##` sections mirror the guide's), each
leaving a short form of at most **350 characters** — the ruling short line's cap, enforced by the gate so the guide
cannot grow back one long line at a time. The pairing gate (`docsize.mjs guidePairing`, 11 self-test cases): every short
form names an existing `###`; every `###` is named by exactly one short form (the `##` sections are checked to mirror
the guide's instead of being named); a `§` pointer not at a line's end fails; a full text must sit under the `##` its short form sits in. Every ruling number the guide carried is
still in it. **Measured:** 60.1k → ~35k bytes (~16.2k → ~9.5k tokens), not ~6k: what stayed in full (the gate
commands, the slot-key list, the two funnels, the store, the product invariants) is ~11k bytes and the map table ~9k,
the Leave War row alone 2.2k — left untouched here (D391). The guide's line tripwire went 760 → 340. Fable's meaning
read (brief `raptor-port/docs/superpowers/briefs/2026-09-28-guide-short-forms-meaning-brief.md`): 30 of 35 faithful; five
rewritten from its replacements — the whole-ecosystem line had dropped "in doubt, a one-line heads-up"; the process line
"a wide visual change is MEDIUM"; the person-identity line "sim `who` stays free text"; the highlight-menus line "don't
restyle the bare `.hl-grp`"; and the Models line had called the 17 Sep "no cheaper model" rule history, which it is not.
D390's short line faithful. Also folded: the moved-groups preamble, the `doc-structure.md` row (a full text only when a
rule outgrows its line), and its gate points (the section check, a doubled-heading case, a clearer message).

### 2.7 The documents the old rules left behind (D201)

`DECISIONS.md` (how the rulings are kept; steps 1–3 as §2.3; the People & accounts map row; the D390–D399 range);
`.claude/rules/record-decisions.md` (§Keeping the list whole; "read it before you ask him" searches
`.claude/decisions-full/` too; how to open a full row; a full row's "this file" / "this row" home means its area);
`.claude/rules/doc-structure.md` (what a chat reads; the router — before planning or editing people, accounts,
sign-in, one-door, posting in or out, archive, restore or delete work, open `people-accounts.md`; where a new fact goes;
when it leaves); `raptor-port/docs/doc-budget.md` (the full-text tier; the byte tripwire; splitting an area);
`.claude/hooks/record-decisions.sh` and `backlog-guard.sh` (their words); `raptor-port/docs/file-map.md` (new files);
`raptor-port/CLAUDE.md` §Where things live (the rulings row); the area headers (leave-war.md's stale "no ruling is
filed under the Leave War alone yet" corrected); the LF pin of the rulings files stays `[RULINGS-LF-PIN]`'s (its scope now names `.claude/decisions-full/` too): a
change to `.gitattributes` starts a full check run, which this docs-only branch must not; the brief template for Astra names the full-text files. D136, D140 and
D141 carry their narrowing marks from the moment D390 is recorded.

### 2.8 Considered and not built now

- **A hook that, on an Edit or Write, names the rulings whose home is the file being edited** (Fable 8) — the strongest
  structural guard for "open the full row", but its output channel and its noise need settling first. Filed as
  `[RULING-HOME-HOOK]`.
- **A link on every short line to its full row** (Astra 6) — the pairing is by file name and gated; links would add
  ~4k tokens to every chat.
- **An edit-authorization flag for old rows** (Astra 3) — the merge replay applies only one-sided edits and stops on
  two-sided ones (git's own rule); outside a merge a row is edited by hand, as today.
- **A version marker for the switch-over** (Astra 4) — the scripts and the conversion land in ONE commit, in one turn,
  so the gate is never left half-way at a turn's end.

## 3. Parallel chats (D302)

Told before anything changed (28 Sep 26); told again with this revision: change-recording
(`claude/change-recording-retest`, D347–D359 — new rows, an edit to D67, D182 marked spent and archived, two "Also read"
edits, a line in `DECISIONS.md`'s ranges paragraph), small fixes (`claude/small-fixes-batch-d223f6`, D360–D369 — edits
the guide's Leave War row), Tracker leftovers (`claude/tracker-leftovers-f79d36`, D370–D379 — new rows only). Each keeps
adding full rows at the top as today, **with a first bold sentence in the meaning cell that states the rule alone**.
Whichever merges later runs `git merge --no-commit --no-ff origin/main` (so the merge stops before committing even
where git merges the rulings files cleanly), then `node raptor-port/scripts/backlog-archive.mjs --rulings --merge`, re-applies the printed prose lines by hand (keeping every range), has one reviewer (Astra first) read the
printed UNREAD short lines, and commits. If this branch is the later one, the same command runs here.

## 4. Order of work and checks

1. Record D390 and this plan; file `[RULINGS-SLIM]`. **Done.**
2. Red team of the plan by Fable and Astra. **Done — round 1, folded here (§6).** No second round on the plan: the core
   model held; what changed (the merge replay) is judged in code, with real merge fixtures, by both reviewers (step 8).
3. Repair the five malformed rows — delimiter only, nothing reworded: D270, D271, D272, D275 gain the missing `|`
   before their `**BUILT` text (their home cell); D51 loses the `|` before `**CORRECTED` (the correction joins its
   meaning cell). A commit of its own; the five go to the meaning read.
4. The converter, `--merge`, `--move-rows`, the gate and the self-test — **and, in the same commit, the conversion of
   every area file and the move of the 62 rows**, so the gate is never left half-way.
5. The hand-written short lines (every marked row; every heading that does not stand alone).
6. The documents of §2.7.
7. **Fable's meaning read** of every short line (§2.1's six questions); fixes.
8. **Code read of the two scripts by BOTH Fable and Astra** (they guard every record of his rulings), with the merge
   fixtures' results.
9. The project guide (§2.6) — now, on its own branch cut from this one, in a fresh chat (D391); the Leave War row left alone.
10. Measure again (the method of §1); his look; his "merge live".

Tier: the bug-check order's tier is NONE for the app — nothing under `raptor-port/src` changes; the checks here are the
document gate, its self-test, the meaning read and the two code reads.

## 5. Risk the owner accepted (D390)

A chat sees every ruling but not its detail until it opens the full row. The guards: the rule and its mechanism (§2.1),
the change tails, the hand-written lines for every changed ruling, the documents each ruling lives in (which carry the
detail too), and later `[RULING-HOME-HOOK]`.

## 6. Review log

**Round 1, 28 Sep 26 — Astra** (`gpt-5.6-sol`, high) **and Fable** (5.1, high), independently, on revision 1. Reports
kept in the session's scratchpad; every finding and what became of it:

| # | Finding | Where it went |
|---|---|---|
| A1 | Five rows are not five fields (D270–D272, D275 four; D51 six) | §4 step 3 (delimiter repair), §2.4 pipe-count classification |
| A2 / F3 | `--take-both` keeps two table headers, stale prose, doubled archive headings | replaced by `--merge` (§2.4) — never reads conflict blocks; prose printed, not written |
| A3 / F1 | "the area copy is newer" loses edits — this branch's D390 marks in either order | `--merge` is three-way per D-number; two-sided edits stop (§2.4); A3's authorization flag declined (§2.8) |
| A4 | the strict gate before the conversion leaves a red turn | scripts and conversion in one commit (§4 step 4); marker declined (§2.8) |
| A5 / F5 / F10a–b | heading and mark extraction loose (D223's ruling cell, D294, D305's second number, D85's mark in the ruling cell, no-bold rows) | §2.1 mark grammar, meaning-cell heading, refusals (§2.4 step 1), set equality |
| A6 / F6 | the meaning question misses omissions and stale extracts | §2.1's six questions; hand-written lines for every changed ruling; per-line links declined (§2.8) |
| A7 / F7 | the new area's routing: prompt-before-file, homes not in paths, D149/D218 misfiled, D350 incoming | §2.2 (derived paths, D149 + D218, Also-read lines, D350 at merge), §2.7 router, §2.5 home-vs-paths report |
| A8 / F12 | the guide split has no pairing and does not fit the mover | §2.6 (headings first, `--under`, pointer form, heading pairing gate) |
| A9 / F13 | the character tripwire undefined; a new area could escape it; what grows back | §2.5 (UTF-8 bytes, whole file, every area registered, "split the area") |
| A10 / F10d | a `|` without spaces still breaks a table | §2.1 (no `|` at all), §2.4 classification |
| F2 | the parallel branches' ~33 rows get unread machine lines, at the bottom | §2.3 heading rule, §2.4 top insertion + UNREAD list, §3 |
| F4 | step 2 marks now live in the full-text file; extra tail names unchecked | §2.3 step 2, §2.1 set equality |
| F8 | "open the full row" has no mechanism; the Grep tool omits long rows | §2.1 (shell grep or Read at the line); the edit hook filed (§2.8) |
| F9 | nothing detects short/full drift | §2.5 drift report, date equality |
| F10c, e, f, g | cap excludes the tail; full-text files outside the map; LF pin; a registry row for the new area | §2.1, §2.5; the LF pin left to `[RULINGS-LF-PIN]` (a `.gitattributes` change starts a full check run) — §2.7 |
| F11 | a refused conversion loops the Stop hook without saying why | §2.4 (the refusal names the row and the fix; the gate repeats it) |
| F14–F17 | ranges paragraph clash; "this file" homes; leave-war's stale header line; tails naming other areas | §3, §2.7, §2.1 |

Both found sound: the loading premise; identity by full row once the folder joins the base and history reads; the
60-row selection (Fable counted 60); D302, D228 and D324 staying general; the Stop hook's loop guard; counting
characters for one-line rulings.

**The final reads, 28 Sep 26** — Fable's meaning read of every short line (two halves; briefs
`raptor-port/docs/superpowers/briefs/2026-09-28-rulings-slim-meaning-brief.md`) and the code read of both scripts by
Fable AND Astra (`…/2026-09-28-rulings-slim-code-brief.md`), all read-only, in parallel.

*Meaning read:* 252 of 265 lines faithful. The 13 others were rewritten from its replacements (D179 had kept "nothing
stays live" after D183–D185 made three warnings live; D340's line had taken the settlement note for the rule; D51's read
as a build instruction for what its own correction says is not built; D45 dropped its standing test; D39 said "two
fixes" without naming them; D54 dropped "and is prevented going forward"; D229 said "account deleted" after D287; D203
lacked D291's step; D100, D171, D172, D178 were stale). **23 older rulings gained the change mark their later ruling
implied** (DECISIONS.md step 2 — "says so in its own words"; each mark ends "mark added 28 Sep 26, D390's meaning
read"), among them D179 ← D183/D184/D185, D89 and D59 ← D106, D229 ← D287, D287 ← D290/D299; each of their short lines
now states the rule in force. D141's full row and D390's said the tripwire counts "characters"; the gate counts bytes
(Astra's red team asked for one exact measure) — both rows now say bytes. 12 back-marks stay reported only, judged by
Fable as extensions or settlements the older row asked for.

*Code read:* every finding fixed, each with a self-test case (160 in all):

| Finding | What changed |
|---|---|
| Astra 1 — `--merge` chose one side when both sides retired, moved or filed the same ruling | each ruling's text, area and whether it is retired are taken three-way, attribute by attribute; a change on both sides to different states stops. **Not taken:** Astra asked that a number new on both sides with IDENTICAL text also stop — identical rows come from a cherry-pick or a criss-cross history — one ruling recorded twice — so they pass (the reason first given here, "a branch merged the other earlier", was wrong, as both verifications said: such a merge moves the base past the row) |
| Astra 2, Fable F2 — a new area file created on an old-layout branch was inserted twice | a file taken whole from the other side is neither re-inserted nor reported as prose; its map row is carried |
| Astra 3, Fable F10 — `\|`, an empty line or a second "— changed by" inside a short line passed | one validator (`shortTextProblem`) in the gate and the converter; `--short-text` refuses an empty line and names an unused one |
| Astra 4 — an unusable `DOCSGUARD_BASE` fell back to HEAD~1 and missed a ruling dropped two commits back | it falls through to the fork point from main; HEAD~1 only when that fork point is HEAD itself |
| Astra 5 — a failed write could leave a half-converted tree | every file written to a temporary copy, read back, then renamed; any failure puts every file back and removes what the run created |
| Astra 6, Fable F6 — mixed line endings | a file mixing CRLF and LF is refused, and so are rulings files that do not share one ending; a new full-text file takes that ending |
| Fable F1, F7 — a new row under an archived number was silently dropped; a retired row could be archived twice | a live row is dropped only when it is the same ruling as the archived one; other text under an archived number is refused (a number is never reused, D78) |
| Fable F3 — the other side's hand-written short line for a new row was replaced by an unread extract | it is carried, and not listed UNREAD |
| Fable F4 — the merge's put-back could not see the other side's numbers | before writing, every number either side or the base held must still be live or retired, or nothing is written |
| Fable F5 — the retire mark was defined twice and refused its dated, dashed form | one `MARKED` in `docsize-rulings.mjs`, accepting `**— REPLACED 27 Sep 26 BY D300: …**` |
| Fable F8, F9, F12 — re-apply lines cut at 140 characters; `git merge` could auto-commit; a refusal mid-merge pointed at the wrong file | lines printed whole with `git show <ref>:<file>`; the command is `git merge --no-commit --no-ff origin/main`; the refusal names `--short-text` |
| Fable F11 — an old-layout file holding a marked row needed two runs | the header rewrite runs after the retirements |
| both — self-test gaps | 20 new cases: both-new-layout merges, a new area on the other side, a clash, divergent moves, another conflicted file, no MERGE_HEAD, a row moved here and marked there, the injected second-write failure, mixed endings, the tripwire refusal, the dated retire mark, a reused archived number, multi-row moves |
| the area-file tripwire | the converter refuses, before writing, an area file with no `RULING_BYTES` row |

**The verification of the fixes, 28 Sep 26** — both reviewers read commit 253c9aa7 against their own and each other's
findings. Fable found no path that loses a ruling. Every point they raised is settled, each with a self-test case (178 in all):

| Point | What became of it |
|---|---|
| Astra — a number new on both sides with identical text should still stop | **Kept passing, on Fable's argument** (the reviewers disagreed): byte-identical rows come only from a cherry-pick or a criss-cross history, so they are one ruling; stopping would force a pointless renumber. The reason recorded above is corrected. Both sides filing it with different short lines: ours is kept and theirs is printed under REWRITE |
| Astra, Fable — the same-ruling test set aside ANY leading bold span, so a new ruling could pass as an old one's copy | only a span that is itself a retire mark is set aside; a lookalike is refused as a reused number, a stale copy opening with his own bold words is dropped |
| Astra — an edit to a map row's "loads by itself" cell was dropped | a map row's area, file and loading cells are compared like prose and printed; only its list of numbers is rewritten |
| Astra — a run killed between its renames could leave a temporary copy the next run overwrites | the next run refuses while any `.docmove-tmp` sits beside a rulings file. **Not taken:** a journal with durable backups — the window is milliseconds and every file is under git, which restores the state before the run |
| Fable — a false stop when this side retired a ruling whose short line the other side rewrote | a ruling no longer live here takes no short line from the other side |
| Fable — "renumber" advice for the same ruling filed on both sides and retired on one | it stays retired, no stop |
| Fable — the retire grammar still written twice | one `REPLACED_BY` pattern; `MARKED` is built from it |
| both — fixture gaps | the mark grammar read directly (AMENDED AGAIN, IN PART, two numbers, a mark in the ruling cell, SETTLED); a whole CRLF set; a full row holding `\|`; the other side alone moving a ruling; retired there and changed here; a refused heading mid-merge; the map row edit; the stale temporary copy |
| **Found by a real trial merge** of the three open parallel branches (in a throwaway worktree): Tracker leftovers (D370–D376) and small fixes (D360) merged clean; change-recording's merge converted D347–D353 and carried D182's retirement, then the gate rightly asked for its hand work (a new ruling's "Also read" home, D347's mark for D348) — and put every file back, so the chat could never do that work | during `--merge` a failing gate now leaves the result WRITTEN and names the hand work (every number was checked present first); a plain run still puts everything back. With the hand work done, that trial ends green |
| **Found by the new self-test case** for the other side moving a ruling into an area file it created | such a file is taken without the rows this side already holds, which the replay then places — before, the moved row was imported twice |
