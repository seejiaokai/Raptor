# AGENTS.md — for Codex working in this repo (D494, D496, 2 Oct 26)

**D496 supersedes the temporary model/review mapping below until Monday 5 Oct 26, 19:00:**
Astra plans and coordinates; Sol 6.1 independently challenges its plans, builds and fixes; Astra
independently reviews Sol's code. The host delegates automatically without changing the chat's
selected model. Read `raptor-port/docs/codex-review-workflow.md` for the exact arrangement.
The writer never approves its own artifact. Claude's Monday review and every hard limit below
still stand. The older D494 mapping below is historical for its review timing, superseded by D496.

You are the Codex host on the owner's selected **Sol 6.1**, with **Astra** delegated to plan and coordinate (D496).
Older documents used Astra for Codex generally; D496 names the actual two models explicitly. Until his Claude allowance
resets (**Monday 5 Oct 26, 19:00**) Codex plans with him and builds, heavy work included (D494). Claude reviews what you
built after the reset, when he brings the work back to Claude Code. This file is a bridge: it holds no rules of its
own beyond the short list below — it tells you which files carry them. **Nothing in this repo loads by itself
for you. Open what is named here, with your own reads, before you plan or change anything.**

## Read first, every session, in this order

1. `HANDOFF.md` — where things stand; the newest block under `## Now` is the work you continue.
2. Every rule file Claude gets loaded in every chat — read each one whole:
   `.claude/rules/plain-language.md` · `.claude/rules/record-decisions.md` · `.claude/rules/bug-check.md` ·
   `.claude/rules/shipping.md` · `.claude/rules/doc-structure.md` · `.claude/rules/decisions/how-we-work.md`.
3. `raptor-port/CLAUDE.md` — the project guide and its map (§Where things live). Most of its rules are one line;
   the full text of each is a heading of `raptor-port/docs/guide-full.md` — search it, never read it whole.
4. Before planning or changing anything in an AREA, that area's rulings file under `.claude/rules/decisions/`
   (`scheduler.md`, `leave-war.md`, `oil.md`, `tracker.md`, `people-accounts.md`, `it-flow-guide.md`) — the `paths:`
   at the top of each says which source files it governs. Before any build: `.claude/rules/raptor-executor.md`.
5. A ruling there is ONE line. Before acting on its detail or asking him about it, open its full row:
   `grep -h '^| D149 |' .claude/decisions-full/*.md`.
6. `OUTSTANDING.md` — the one backlog — before telling him anything is undecided, missing or unbuilt (D53).

## What Claude gets from its hooks — you do these by hand

- **Record his rulings the moment he makes them, BEFORE the work they imply** — the three steps at the head of
  `DECISIONS.md`, then `node raptor-port/scripts/backlog-archive.mjs --rulings`. Ask yourself on EVERY message of his:
  is this a decision, a preference, a correction, a "leave it", a no? Every closing report carries a `Rulings:` line.
  **Your numbers start at D496.**
- **Run the document check before you end any turn that changed a document:** `cd raptor-port && npm run docsize`.
  It must pass; read what it says rather than working around it.
- **A background command starts in the wrong folder** — move into `raptor-port/` by its full path inside the command.
- **Speak to him plainly** (`plain-language.md`): he is not technical. No file names, function names, log lines or
  commit ids in what he reads. Run its "check before you send" on every message.

## Where the rules name Claude's models, read them like this until the reset

- "Opus 5.5 plans and builds" → **you** plan and build (D494).
- "Fable and Astra review" / "the final code reads" / "a plan's red team" → **D496 now supplies independent
  Codex-side reads: Sol challenges Astra's plan; Astra reviews Sol's code. You never review, inspect or approve
  an artifact your model wrote** (D67 — the builder never inspects). Claude's further reads remain owed after
  the reset. Write each owed read in your `HANDOFF.md` block and in the bug
  check's evidence sheet as `OWED: Claude's read after the reset`, naming the branch.
- The bug-check order (`raptor-port/docs/bug-check-order.md`) is yours to run in full EXCEPT those reads: state the
  tier, the roll-call, the walk of the RUNNING app with pictures, the gates, the evidence sheet with its `Walk:` line.
- "A skill" (`.claude/skills/…`) is a Claude working guide. Read one as a document where a rule points at it; never
  edit one (D70 — a change to a working guide is read by both reviewers before he approves it). The skill
  observation log (`.claude/skill-observations/log.md`) is not yours to write.
- The second cheaper-walker trial (D480) is a Claude trial — it waits for the first walk Claude runs after the reset.

## Hard limits

- **Never push to `main`, never merge a pull request, never open one for merging.** "Merge live" is his word alone,
  and until the reset it cannot be given for anything you built: Claude's read comes first (D494). Push BRANCHES
  freely — each gives him a Vercel link to look at (`shipping.md`).
- **Branches:** planning and filing continue on `claude/planning-filing-3-oct`. Each build job gets its own branch,
  `codex/<short-name>`, based on that branch (it carries this file and the filed items; `main` does not yet).
- **One full check at a time on his PC:** take the lock before the full unit suite, a multi-file browser run, the
  Tracker smoke or a fanned-out walk — `node raptor-port/scripts/gatelock.mjs take "<branch> — <what>"`; release it
  the moment the run ends (`shipping.md` §The checks).
- Never edit `.claude/hooks/`, `.claude/settings*.json`, `.claude/skills/`, a reviewer's brief after its run, or
  this file's limits to get a result accepted. Never weaken a test to pass. Never delete data or history.
- `reference/` is read-only; `src/engine/` bodies are verbatim ports — a change there is the behaviour change only.
- A change inside `raptor-port/src` never trims a document (D29).

## The order of work (D495) and how to plan it with him

**Current owner direction — D568/D580, 5 Oct 26:** the immediate D567 caps/ops
new-chat handoff is cancelled; no new chat was created. The replacement task is
[SANS-COMMITMENT-CALENDAR] Inputs/SANS build is authorized from delegated recommendations
under D580 while the owner sleeps. Caps/ops, other Inputs work
and Tracker remain outstanding. All hard limits, checks and owed reads remain.
See `OUTSTANDING.md` and the D569 SANS design-start note linked there.

**Original D495 order (reference; no automatic start under D568):**
After a small first job to prove the loop — `[DISCARD-MARKS-REMOVE]` — the batches run: the negative work-hours fix
(`[WORKSPAN-NEGATIVE]`) → Insights (mission types per person, with `[INSIGHTS-BOARD-DOOR]`) → the workflow UI pass
(`[CSS-SPLIT-BY-SCREEN]` first) → how inputs show on the calendar → the Tracker's progress graph (with
`[TRK-FILE-TRANSFER-SPLIT]`) → caps and ops limits → one whole-app check. The list and his words:
`OUTSTANDING.md` `[FEATURE-WISHLIST]`. Related features share a branch and one bug check sized by the riskiest
change (D485); an area's small finds ride with its batch (D490).

**No feature on that list is designed.** Before building one, ask him what it means — in rounds of at most four
questions, each with your recommended answer; product choices only, the technical how is yours. Search the rulings
first so you never ask what he has already ruled. Write a short design note under
`raptor-port/docs/superpowers/specs/<date>-<name>.md`, linked from the backlog item; a visual change gets a
picture first. His bugs, when he gives them: file each under its area in `OUTSTANDING.md` with its place in the
priority list.

## When you stop

Rewrite ONLY your own block under `## Now` in `HANDOFF.md` (the shape is at the head of that file): what you
built, on which branch, what was checked and how, every read owed to Claude, and what is next. Commit and push the
branch. Monday's Claude chat starts from that block.
