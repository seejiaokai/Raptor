# Where information lives — read what the job needs, keep it tidy (loaded in every chat)

**Owner, 24 Sep 26 — D140:** *"read only what's applicable for the job automatically and knows how to navigate …
new info going into the repo will follow this structure automatically … so that I don't need to do another
optimisation in the future or spring cleaning."* **D141:** no line targets — the test is whether a block is NEEDED
where it sits, organised and written clearly. **D138:** a move never rewords; a rewrite is checked for meaning.
The full policy and the tiers: `raptor-port/docs/doc-budget.md`. This file is its short, always-loaded form.

## What a chat reads, and when
- **Already loaded:** the rule files under `.claude/rules/` without `paths:` (this one, `shipping.md`,
  `plain-language.md`, `bug-check.md`, `record-decisions.md`) and the general rulings `decisions/how-we-work.md`.
  `raptor-port/CLAUDE.md` — the project guide and its map, §Where things live — loads once any file under
  `raptor-port/` is opened; most of its rules are ONE line, each naming its full text in `raptor-port/docs/guide-full.md` (D391).
- **At the start of a chat:** `HANDOFF.md` — where things stand (`## Now`, a block per chat) and what is next.
- **By itself, per area:** `.claude/rules/decisions/scheduler.md`, `leave-war.md`, `oil.md`, `tracker.md`,
  `people-accounts.md`, `it-flow-guide.md` — each area's rulings, settled decisions and architecture — load when a matching file is opened
  **with the Read tool**. A shell read (`cat`, `grep`) does not load them, and neither does planning before any file is
  open: **before planning or editing in an area, open its file yourself** — People & accounts for any work on
  accounts, sign-in, Admin → Users, Quals, one-door, posting in or out, archive, restore or delete (D390). A brief for
  ASTRA names the area files the change touches and their full-text files — Codex loads none of this by itself (D140).
- **A ruling loads as one line; its full row does not (D390).** Before acting on a ruling's detail or asking him about
  it, open its full row in `.claude/decisions-full/` — `grep -h '^| D149 |' .claude/decisions-full/*.md` (the shell;
  the Grep tool hides a long row).
- **When the job needs it:** the reference doc the map names. **Never whole:** an archive, a full-text rulings file or the guide's full text —
  search it.
- **Before telling him anything is undecided or missing:** search every rulings file, `DECISIONS-ARCHIVE.md` and
  `OUTSTANDING.md` (`record-decisions.md`).

## Where a new fact goes — one home each
| It is… | Its home |
|---|---|
| a ruling — a decision, preference, correction, "leave it", "no" | one full row at the top of its area's rulings table, the moment he says it; `backlog-archive.mjs --rulings` moves the row to `.claude/decisions-full/` and leaves its short line (`record-decisions.md`, D390) |
| an open job, a found-not-fixed, a deferral, a question to put to him later | an `OUTSTANDING.md` item — the ONE backlog — and a line in its priority list |
| how a rule or a surface behaves (a contract) | `engine-rules.md`, `ui-contracts.md`, `feature-impact.md`, `performance.md`, `data-schema.md` (in `raptor-port/docs/`) |
| a rule EVERY task needs, whatever the area | an unscoped file under `.claude/rules/` (a general ruling: `decisions/how-we-work.md`) — `raptor-port/CLAUDE.md` loads only once a `raptor-port/` file is opened, so it carries the project-side copy or pointer, never the only one |
| a project rule every task under `raptor-port/` needs (how to build, verify, code) | ONE line in `raptor-port/CLAUDE.md` — at most 350 characters when it names a full text; if it outgrows the line, its detail goes under its own `###` heading in `raptor-port/docs/guide-full.md`, named by the line's ending pointer, one heading per short form (D391; the gate pairs them) |
| a rule or piece of architecture ONE area needs | that area's file under `.claude/rules/decisions/` |
| where things stand, what this chat left, what is next | this chat's own block under `## Now` in `HANDOFF.md`, rewritten at each handoff |
| a gate count | `HANDOFF.md` §Gate baseline — only a count from a run you watched |
| a gate or deploy trap | `raptor-port/docs/gates-and-deploy.md` |
| a new, renamed or deleted file | `raptor-port/docs/file-map.md`, in the same change |
| the story of how something was found or fixed | the commit message; a bug check's evidence sheet (`raptor-port/docs/handpass/`) |
| a plan, design, brief, review log, scenario list (the Claudex loop's too) | `raptor-port/docs/superpowers/{specs,plans,briefs}/<date>-<name>.md`, linked from its backlog item — never the repo root |
| a reference doc every chat of an area needs | `raptor-port/docs/`, AND a row in `raptor-port/CLAUDE.md` §Where things live (the gate checks) |
| a one-off handoff for a big job | NOT a new root file — this chat's block in `HANDOFF.md ## Now`, plus a tier-3 doc linked from its backlog item |

## When it leaves — moved whole, never deleted, never reworded
- A **finished backlog item** → `OUTSTANDING-ARCHIVE.md`, by `node raptor-port/scripts/backlog-archive.mjs <ID> --homes <file>`
  after its lasting facts have a pointer in a live doc (D29).
- A **replaced ruling or a spent one-off permission** → `DECISIONS-ARCHIVE.md`, by `… backlog-archive.mjs --rulings` (D136) —
  its mark written in its full row in `.claude/decisions-full/`; the command drops its short line (D390).
- A `## Now` **block whose work has merged** → removed at the next handoff, once its open residue is filed.
- A **passage a newer ruling supersedes**, in a file every chat reads → moved whole to `raptor-port/docs/archive/` IN
  THE SAME CHANGE, leaving the new rule and a one-line pointer (newest-instruction-wins says fix the stale text; this
  says where the old text goes).
- **Anything no longer needed where it sits** (D141) → moved whole by `… backlog-archive.mjs --move` (exact anchors,
  byte for byte, a one-line pointer naming the destination) to its home above. `node raptor-port/scripts/docsize.mjs
  --moves` then lists what left and did not arrive — the rewrites a reviewer must read.

## In his workflow
He works until the context is full, then hands off to a fresh chat; he seldom compacts; he merges only when happy,
on his "merge live"; he sometimes runs two worktrees in parallel and merges both (D140).
- **The handoff** is the step that matters: the session-handoff skill rewrites this chat's `## Now` block, files
  what is open, removes merged blocks, and gives him a ready-to-paste opening line that names `HANDOFF.md` and the
  branch. **Beside it, always, in plain words (D368, 29 Sep 26): whether the new chat needs a WORKTREE and what to base it
  on, and which branch to PICK in the new-chat picker and which to avoid** — a new job: a worktree on `main`; an unmerged
  branch continuing: that `claude/<name>` branch; a just-merged branch: never. Compaction, if it happens, is the same:
  persist first.
- **Unattended runs (D596, 5 Oct 26):** when he leaves a job to run while he is asleep or away, a question never stops
  the run. Search the rulings and the backlog first (D53); a choice that is truly his is parked in ONE list — the
  question in the app's own words, a recommended answer, and what waits on it — only that piece is left undone, and
  everything else carries on. One notification at the end or when truly blocked; nothing merges, nothing touches `main`.
- **Parallel chats** each touch only their own `## Now` block, their own backlog items and their own D-number range;
  the later merge brings `main` in first (D78).
- **The Claudex loop** (Opus 5.5 builds; Astra reviews, Sol 6.1 second where two readers are required, Fable on call only — D67, D590): plans and review logs are tier-3 docs (the
  table above); the ripple walk reads `feature-impact.md`.

## The check that keeps it
`npm run docsize` — in CI (the Docs guard) and, for everything but sizes, at the end of every turn (the Stop hook):
a lost or doubled backlog item or ruling, a rulings map out of step, a misfiled document (a new `.md` at the repo
root outside its short list, a document outside `raptor-port/docs/`, an always-loaded rules file nobody registered,
two `## Now` blocks for one branch, a new reference doc no map names), and `HANDOFF.md` losing its shape — a block's
`<!-- /now -->`, or one of `## Now`, `## Next, in order`, `## Gate baseline` (each once, in that order). Each always-read file also has a size
TRIPWIRE (D141): crossing it means "move what does not belong here to its home", never "cut to a number" — and a
change that touches `raptor-port/src` never trims a document (D29).
