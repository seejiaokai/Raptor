# Where information lives — read what the job needs, keep it tidy (loaded in every chat)

A chat reads only what its job needs and knows where the rest is; each new fact follows this structure by itself, so no
spring clean is needed again (D140). No line targets: the test is whether a block is needed where it sits, organised
and written clearly (D141). A move never rewords; a rewrite is checked for meaning (D138). The rulings' full text is a
searched tier, and each area converts to a page of how it works now (D140, D141, D390, D1735). The full policy and the
tiers: `raptor-port/docs/doc-budget.md`; this file is its short, always-loaded form.

## What a chat reads, and when
- **Already loaded:** the rule files under `.claude/rules/` without `paths:` (this one, `shipping.md`,
  `plain-language.md`, `bug-check.md`, `record-decisions.md`) and the general rulings `decisions/how-we-work.md`.
  `raptor-port/CLAUDE.md` — the project guide and its map, §Where things live — loads once any file under
  `raptor-port/` is opened; most of its rules are one line, each naming its full text in
  `raptor-port/docs/guide-full.md` (D391).
- **At the start of a chat:** `HANDOFF.md` — where things stand (`## Now`, a block per chat) and what is next.
- **By itself, per area:** `.claude/rules/decisions/scheduler.md`, `leave-war.md`, `oil.md`, `tracker.md`,
  `people-accounts.md`, `it-flow-guide.md`, `inputs.md` (the Inputs pages — D802), `design.md` (the screen-design
  rulings — how a screen looks and behaves, loaded with screen work, D1554, D1735) — each area's rulings, settled
  decisions and architecture — load when a matching file is opened with the Read tool. A shell read (`cat`, `grep`)
  does not load them, and neither does planning before any file is open (D390, D1735).
- **Before planning or editing in an area, open its file yourself** — People & accounts for any work on accounts,
  sign-in, Admin → Users, Quals, one-door, posting in or out, archive, restore or delete (D390, D1735).
- A brief for Astra names the area files the change touches and their full-text files — Codex loads none of this by
  itself (D140, D141, D390, D1735).
- **A ruling loads as one line — in an area converted to a page, as a statement of its page; its full row does not
  (D390, D1735).** Before acting on a ruling's detail or asking him about it, open its full row in
  `.claude/decisions-full/` — `grep -h '^| D149 |' .claude/decisions-full/*.md` (the shell; the Grep tool hides a long
  row).
- **When the job needs it:** the reference doc the map names. **Never whole:** an archive, a full-text rulings file or
  the guide's full text — search it.
- **Before telling him anything is undecided or missing:** search every rulings file, `DECISIONS-ARCHIVE.md` and
  `OUTSTANDING.md` (`record-decisions.md`).

## Where a new fact goes — one home each
| It is… | Its home |
|---|---|
| a ruling — a decision, preference, correction, "leave it", "no" | one full row at the top of its area's rulings table, the moment he says it; `backlog-archive.mjs --rulings` moves the row to `.claude/decisions-full/` and leaves its short line — in an area converted to a page, the page's line is rewritten or added instead (`record-decisions.md`, D390, D1735) |
| an open job, a found-not-fixed, a deferral, a question to put to him later | an `OUTSTANDING.md` item — the one backlog — and a line in its priority list |
| how a rule or a surface behaves (a contract) | `engine-rules.md`, `ui-contracts.md`, `feature-impact.md`, `performance.md`, `data-schema.md` (in `raptor-port/docs/`) |
| a rule every task needs, whatever the area | an unscoped file under `.claude/rules/` (a general ruling: `decisions/how-we-work.md`) — `raptor-port/CLAUDE.md` loads only once a `raptor-port/` file is opened, so it carries the project-side copy or pointer, never the only one |
| a project rule every task under `raptor-port/` needs (how to build, verify, code) | one line in `raptor-port/CLAUDE.md` — at most 350 characters when it names a full text; if it outgrows the line, its detail goes under its own `###` heading in `raptor-port/docs/guide-full.md`, named by the line's ending pointer, one heading per short form (D391; the gate pairs them) |
| a rule or piece of architecture one area needs | that area's file under `.claude/rules/decisions/` |
| where things stand, what this chat left, what is next | this chat's own block under `## Now` in `HANDOFF.md`, rewritten at each handoff |
| a gate count | `HANDOFF.md` §Gate baseline — only a count from a run you watched |
| a gate or deploy trap | `raptor-port/docs/gates-and-deploy.md` |
| a new, renamed or deleted file | `raptor-port/docs/file-map.md`, in the same change |
| the story of how something was found or fixed | the commit message; a bug check's evidence sheet (`raptor-port/docs/handpass/`) |
| a plan, design, brief, review log, scenario list (the Claudex loop's too) | `raptor-port/docs/superpowers/{specs,plans,briefs}/<date>-<name>.md`, linked from its backlog item — never the repo root |
| a reference doc every chat of an area needs | `raptor-port/docs/`, and a row in `raptor-port/CLAUDE.md` §Where things live (the gate checks) |
| a one-off handoff for a big job | not a new root file — this chat's block in `HANDOFF.md ## Now`, plus a tier-3 doc linked from its backlog item |

## When it leaves — moved whole, never deleted, never reworded
- A **finished backlog item** → `OUTSTANDING-ARCHIVE.md`, by
  `node raptor-port/scripts/backlog-archive.mjs <ID> --homes <file>`, after its lasting facts have a pointer in a live doc (D29, D137).
- A **replaced ruling, one a later ruling restates in full (D971, a fresh reader checking each), or a spent one-off
  permission** → `DECISIONS-ARCHIVE.md`, by `… backlog-archive.mjs --rulings` (D136, D137, D1735) — its mark
  written in its full row in `.claude/decisions-full/`; the command drops its short line, and on a page every line
  citing it is rewritten first (D390, D1735).
- A `## Now` **block whose work has merged** → removed at the next handoff, once its open residue is filed.
- A **passage a newer ruling supersedes**, in a file every chat reads → moved whole to `raptor-port/docs/archive/` in
  the same change, leaving the new rule and a one-line pointer (newest-instruction-wins says fix the stale text; this
  says where the old text goes).
- **Anything no longer needed where it sits** → moved whole by `… backlog-archive.mjs --move` (exact anchors, byte for
  byte, a one-line pointer naming the destination) to its home above (D141, D390, D1735).
  `node raptor-port/scripts/docsize.mjs --moves` then lists what left and did not arrive — the rewrites a reviewer must read.

## In his workflow
- He works until the context is full, then hands off to a fresh chat; he seldom compacts; he merges only when happy, on
  his "merge live"; he sometimes runs two worktrees in parallel and merges both (D140, D141, D390, D1735).
- **The handoff** is the step that matters: the session-handoff skill rewrites this chat's `## Now` block, files what is
  open, removes merged blocks, and gives him a ready-to-paste opening line that names `HANDOFF.md` and the branch; and
  Remote Control is on in the new chat — the app's setting already connects it; where it is off, the new chat switches
  it on (D1195).
- **He picks nothing — he only pastes:** the new-chat screen has no branch or worktree picker, so the outgoing chat
  releases its branch as its last step and the opening line switches the new chat to it, with what to do if the switch
  is refused — a new job: level with `main`; an unmerged branch continuing: that `claude/<name>` branch; a just-merged
  branch: never (D975). Compaction, if it happens, is the same: persist first.
- **Unattended runs** — when he leaves a job to run while he is asleep or away: moved whole to
  `raptor-port/docs/doc-budget.md` §5 (D596, D667, D766, D1556); the overnight guide carries the same rulings.
- **Parallel chats** each touch only their own `## Now` block, their own backlog items and their own D-number range;
  they never clash in anything and never merge at once — each merge under the merge lock, after a level check
  (`shipping.md`) — and the later merge brings `main` in first (D78, D1746).
- **The Claudex loop** (Opus 5.5 builds; the code read Astra's, the standing reviewer, beside a fresh, blind Opus
  read; Sol 6.1 and Fable on his call only — D67, D353, D590, D601, D790, D903, D1734, D1738, D1739, D1770): plans and review logs are tier-3
  docs (the table above); the ripple walk reads `feature-impact.md`.

## The check that keeps it
- `npm run docsize` runs in CI (the Docs guard) and, for everything but sizes, at the end of every turn (the Stop hook);
  without hooks — Codex — run it yourself before you end a turn that changed a document.
- It fails on a lost or doubled backlog item or ruling, a rulings map out of step, a misfiled document (a new `.md` at
  the repo root outside its short list, a document outside `raptor-port/docs/`, an always-loaded rules file nobody
  registered, two `## Now` blocks for one branch, a new reference doc no map names), and `HANDOFF.md` losing its shape
  — a block's `<!-- /now -->`, or one of `## Now`, `## Next, in order`, `## Gate baseline` (each once, in that order).
- Each always-read file also has a size tripwire: crossing it means "move what does not belong here to its home", never
  "cut to a number" (D141, D390, D1735). A change that touches `raptor-port/src` never trims a document (D29, D137).

## The old wording of this file, its stories and worked examples with it — moved whole to `raptor-port/docs/archive/rule-files-2026-11-08.md` (D138, D1735)
