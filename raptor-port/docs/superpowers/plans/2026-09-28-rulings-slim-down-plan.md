# The rulings slim-down — plan (D390, 28 Sep 26)

**Approved by the owner, 28 Sep 26 (D390 — "Approve")**, after a proposal with a sample and a measured before/after.
Backlog item: `OUTSTANDING.md` `[RULINGS-SLIM]`. Branch: `claude/docs-rulings-slim-down-e83c74` (docs and the document
gate's scripts only — no `raptor-port/src`). Rulings range for this chat: D390–D399.

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

So a chat that opens no project file carries ~50k; a scheduler build chat ~110k. A draft short line for all 264 rows,
taken mechanically from each row's heading, measured ~8.0k tokens in total.

## 2. The design

### 2.1 One short line loads; the full row sits beside it

- **Each area file keeps its `paths:`, its header, its "Also read" lines and any non-row sections** (the "Settled before
  this list" notes and the Architecture sections stay as they are — question 4 of the proposal was optional and not
  answered). Its table becomes one short line per ruling: `| D<n> | <date> | <the rule> |`.
- **The full row moves WHOLE, byte for byte, to `.claude/decisions-full/<area>.md`** — the same basename as the area
  file, the same five-column table, the same order (newest first). That folder is outside `.claude/rules/`, so Claude
  Code never loads it by itself (only `.claude/rules/**/*.md` and the `CLAUDE.md` files are loaded as memory). It is
  SEARCHED — by D-number (`| D302 |`) or keyword — never read whole: a whole read of one full-text file would spend
  what the change saves.
- **The rule a chat now follows** (in `.claude/rules/record-decisions.md` and each area file's header): **open a ruling's
  full row before acting on its detail, and before putting a question to him about it.** The short line says the rule;
  his words, the readings he was told and where it lives are in the full row. D68 already says never skip a read the
  work needs — this names the read.
- **The short line** is the rule itself, standing alone, in at most about two lines (a cap near 350 characters, set from
  the drafted lines). It must name every later ruling that changed it — each D-number that a marker in the full row's
  meaning cell (a bold `NARROWED / AMENDED / EXTENDED / WIDENED / REFINED / SET ASIDE / ANSWERED / REPLACED / SUPERSEDED /
  CORRECTED … BY D<n>`) points to — as "— narrowed by D297" and the like. It contains no ` | `.
- **Where a row's own bold heading already states the rule, the short line IS that heading, word for word** (an extract,
  not a rewrite). About 60 rows have a heading that does not stand alone ("a posting out has four outcomes:", "the three
  readings stand as built:", "add the guard."); their short lines are written by hand from the full row. **Every short
  line — extract or hand-written — is read by Fable against its full row for meaning (D138)** before the branch is
  offered for "merge live": does it say anything the row does not, and would a chat acting on it alone do something the
  row forbids?

### 2.2 A new area: People & accounts

`.claude/rules/decisions/people-accounts.md` (short lines) + `.claude/decisions-full/people-accounts.md` (full rows). It
takes from How we work the accounts, one-door and posting rulings — D165, D166, D200, D204, D210, D211, D213–D217,
D219–D227, D229, D280–D301, D303–D310, D320–D323, D325–D329 (60 rows). How we work keeps the general ones, among them
D302 (parallel chats), D228 (the check lock), D324 (the backlog tidy), D201, D203, D173, D180. Its `paths:` are chosen
generously (D68 — a ruling missed costs more than one loaded): the accounts and permission modules, Admin → Users,
Quals, the sign-in and access screens, the welcome-back note, the Leave War's posting sheets and posting logic, the
person add / delete / rename code, their tests, mock-ups, look cards and plans, `data-model.md` and
`handover-dataverse.md`. Every "Also read" line and pointer that names one of those numbers as "in How we work" is
corrected in the same change (D201).

### 2.3 How a new ruling is recorded — unchanged for the chats

DECISIONS.md steps 1–3 stay as they are: **one full row at the top of its area's table, then
`node raptor-port/scripts/backlog-archive.mjs --rulings`.** The command now also converts: it moves each full row it
finds in an area file to the full-text file (top of its table) and leaves the short line in its place. For a new row the
short line is the row's first bold sentence (not a marker) with its later-change notes — so **a new row's first bold
sentence must state the rule on its own** (added to step 1). If it does not, the chat edits that heading in the full
row (its own words, written the same hour) and runs the command again.

### 2.4 The converter (`backlog-archive.mjs --rulings`), extended

Order of work, all in memory, then the gate's inventory, and every file put back if that is not clean (as today):

0. **`--take-both`** (for a merge that clashed): in the area files, the full-text files and `DECISIONS-ARCHIVE.md`,
   every conflict block keeps BOTH sides (the merge-base section of a three-way block is dropped). In `DECISIONS.md` a
   block made only of map rows keeps one row per file; a block with prose stops the command and names it, to resolve
   by hand. Nothing else is touched.
1. **Full rows in an area file:** a number with no full row anywhere → moved to the top of that area's full-text table
   and replaced in place by its generated short line. A number whose full row already sits in a full-text file →
   identical: the area copy is dropped (a short line is generated only if none exists); different: the area copy
   replaces the full-text copy (the branch's edit is the newer) and the short line gains any new "changed by" notes.
2. **A number retired in `DECISIONS-ARCHIVE.md` and still live elsewhere** (a parallel branch spent or replaced it) →
   the archive copy wins: the live full row and its short line go. Reported by name.
3. **A short line and its full row in different areas** → the full row moves to the short line's area (the short line
   is what loads, and the map follows it).
4. **Marked rows** (`REPLACED BY` / `SPENT` at the head of the ruling cell, as today) → the full row to the archive,
   its short line deleted.
5. **The map** in `DECISIONS.md` rewritten from the short lines (and any full row still in an area file).

Plus **`--rulings --move-rows D<a>,D<b>… --to <area>`**, the one way a ruling changes area: its short line and its full
row move, bytes unchanged, keeping their relative order. It is how the 60 rows reach People & accounts.

### 2.5 The document check (`docsize.mjs`), extended

- A ruling's IDENTITY is its full row (five cells), wherever it sits: `DECISIONS.md`, an area file, a full-text file,
  the archive. Lost / newly doubled / marked-still-live / archived-without-mark are judged on full rows, as today, and
  the full-text folder joins every "now", "base" and "commit since" read — so a row moved from an area file to its
  full-text file is a move, never a loss.
- Short lines are an INDEX checked against it: every live full row has exactly one short line and every short line one
  full row; they sit in the same area; a short line is within the cap, carries no ` | `, and names every later ruling
  that changed its row. A full row left in an area file fails with "run `… --rulings`" (as a map out of step does today —
  the Stop hook holds the turn until it is run).
- The homes check reads the full rows wherever they are (unchanged in substance).
- **The tripwire on the loaded rulings files counts characters, not lines** (D390 narrowing D141): each ruling is one
  line either way, so a line count cannot see a file doubling. Still a tripwire, raised with its reason, never a
  target. The full-text files have no tripwire — searched, never loaded, like the archive.
- `docsize-selftest.mjs` gains cases: a clean conversion; a second run changes nothing; a new full row converts; an
  edited old row updates its full text; `--take-both` on a staged conflict; a spent-on-the-other-side row; a short line
  missing its "narrowed by" note fails; a full row left in an area file fails; a lost number still fails.

### 2.6 The project guide (`raptor-port/CLAUDE.md`) — last

Same treatment, done AFTER the small-fixes branch (`claude/small-fixes-batch-d223f6`) merges, because it edits the
guide's Leave War row: each standing order, rule block and map row keeps a one-to-two-line form in the guide; its full
text moves whole to `raptor-port/docs/guide-full.md` (named in §Where things live) with
`backlog-archive.mjs --move … --pointer "<the short form, naming guide-full.md>"` — the short form IS the pointer, so the
move stays byte-exact and every short form names where its full text is. What every task needs to work safely stays in
full (the five gate commands, the slot-key grammar's key list, the two funnels, the product invariants list). Fable
reads every short form against its full text (D138). Estimate: ~16k → ~6k.

### 2.7 The documents the old rules left behind (D201)

In the same branch: `DECISIONS.md` (how the rulings are kept; step 1's heading rule; the map's People & accounts row;
the D390–D399 range), `.claude/rules/record-decisions.md` (§Keeping the list whole; "read it before you ask him" now
searches `.claude/decisions-full/` too; the open-the-full-row rule), `.claude/rules/doc-structure.md` (what a chat
reads; where a new fact goes; when it leaves), `raptor-port/docs/doc-budget.md` (a tier for the full text; the character
tripwire), `.claude/hooks/record-decisions.sh` and `backlog-guard.sh` (their words), `raptor-port/docs/file-map.md`
(the new files), `raptor-port/CLAUDE.md` §Where things live (the rulings row), and a brief for Astra now names the
full-text files as well as the area files (Codex loads neither by itself). D136, D140 and D141 carry their narrowing
marks from the moment D390 is recorded.

## 3. Parallel chats (D302)

Told before anything changed (28 Sep 26): change-recording (`claude/change-recording-retest`, D347–D359 — it also edits
the D67 row, marks D182 spent, and edits two "Also read" lines), small fixes (`claude/small-fixes-batch-d223f6`,
D360–D369 — it edits the guide's Leave War row), Tracker leftovers (`claude/tracker-leftovers-f79d36`, D370–D379 — new
rows only). Each keeps adding full rows at the top as today. Whichever merges later merges `main` in (D78) and runs
`node raptor-port/scripts/backlog-archive.mjs --rulings --take-both`, which is written for exactly their three shapes
(new rows, an edited old row, a row spent on their side). If this branch is the later one, the same command resolves it
here.

## 4. Order of work and checks

1. Record D390 and this plan; file `[RULINGS-SLIM]` (docs-only commit).
2. **Red team of this plan by BOTH Fable and Astra** (his standing order for an important plan), capped at about three
   rounds; findings folded here with a note of what changed.
3. The converter and the check, with their self-tests (Opus 5.5, high).
4. The conversion: every area file (mechanical), then `--move-rows` to People & accounts; each step leaves the check green.
5. The hand-written short lines.
6. The documents of §2.7.
7. **Fable's meaning read** of every short line against its full row (D138); fixes.
8. **Code read of the two scripts by BOTH Fable and Astra** (they guard every record of his rulings).
9. The project guide (§2.6), once the small-fixes branch has merged — or held for a later branch if that waits.
10. Measure again (the same method as §1); his look; his "merge live".

Tier: the bug-check order's tier is NONE for the app — nothing under `raptor-port/src` changes; the checks that
matter here are the document gate, its self-test and the two reads above.

## 5. Review log

*(Each round's findings and what changed, appended here.)*
