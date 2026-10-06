# The Codex-only arrangement of 2–5 Oct 26 — its text in the working guides, moved whole on 7 Oct 26

Moved byte for byte on 7 Oct 26 (his ruling D609, options 5 and 6 of `[START-CONTEXT-AUDIT]`; the proposal and the two
reads: `raptor-port/docs/superpowers/specs/2026-10-07-expired-guide-text.md`). From 2 Oct 26 until Monday 5 Oct 26,
19:00, Codex planned and built by itself (D494, D496) while his Claude allowance was used up; what it built was checked
by Claude as one stack and went live as PR #481 on 6 Oct 26 (D589, D604). The rulings behind this text are in
`DECISIONS-ARCHIVE.md`, marked SPENT. **History, not rules: nothing here is in force.** What is in force is in
`AGENTS.md`, `raptor-port/docs/codex-review-workflow.md` and `raptor-port/docs/bug-check-order.md`.

## The banner at the head of raptor-port/CLAUDE.md

**D496 temporary Codex model mapping (2 Oct 26):** until Monday 5 Oct 26, 19:00, Astra plans/coordinates, Sol 6.1 challenges plans and builds/fixes, and a fresh Astra inspector reads Sol code. This narrows the model/count mapping below only; Claude's further read remains owed before main. Exact roles: `docs/codex-review-workflow.md`.

## The banner at the head of raptor-port/docs/guide-full.md

**D496 temporary Codex model mapping (2 Oct 26):** until Monday 5 Oct 26, 19:00, Astra plans/coordinates, Sol 6.1 challenges plans and builds/fixes, and a fresh Astra inspector reads Sol code. This narrows the model/count mapping below only; Claude's further read remains owed before main. Exact roles: `codex-review-workflow.md`.

## The banner at the head of raptor-port/docs/bug-check-order.md

**Temporary Codex mapping — D496 (2 Oct 26), until Monday 5 Oct 26 at 19:00:** Astra plans and designs scenarios;
Sol 6.1 challenges Astra's plans and builds; a fresh independent Astra inspector reads Sol's final code.
The temporary same-provider reads replace the model/count mapping only, preserve every applicable check below,
and do not count as cross-provider approval. Claude's further reads are owed before main (D494).
Exact roles and bounded review/fix loop: `codex-review-workflow.md`. Existing Claude skills remain unchanged.

## raptor-port/docs/codex-review-workflow.md — its first section, part 1 (the paragraph on review rounds stayed in the guide)

# Temporary Codex roles — D496, 2 Oct 26

Until Monday 5 Oct 26 at 19:00 (Asia/Singapore), the owner uses Codex only:

- Astra (`gpt-6-astra`) plans and coordinates: read the relevant rules and backlog,
  propose product questions in rounds of at most four with a recommendation each,
  then write a plan from the owner's answers. It must not invent unanswered requirements.
- Sol 6.1 (`gpt-6.1-sol`) independently challenges Astra's plan, then builds and fixes.
- Astra independently designs the build's check scenarios. A separate fresh Astra inspector
  reads Sol's final code; the planning/coordinating agent may reconcile findings, but never
  approve its own plan or any code it wrote. Final reads preserve the fresh-session safeguard.
- Sol runs the applicable bug check in full: the running app and pictures, automated gates,
  recorded failures and fixes, and the evidence sheet. Passing tests alone is not approval.

The main chat remains on the owner's selected Sol 6.1 model. The host cannot change that
selection; it calls model-specific subagents and relays questions and findings here. This is
automatic delegation, not an assertion that the visible conversation changed models.

## raptor-port/docs/codex-review-workflow.md — its first section, part 2

This adapts the installed Claudex loop's bounded review/fix pattern to the owner's explicit
same-provider request. It does not run the Claudex cross-provider approval runner, invoke Claude,
or claim Claude/Fable approval. The existing Claude skills and hooks are unchanged.

D496 narrows D494's ban on Codex-side independent reads and the temporary reviewer roles/counts
under D67, D70, D353 and D492. It does not remove the independence rule: the model that wrote an
artifact does not approve it. Work already authored by Astra needs a Sol read now; Astra cannot
certify its own earlier work. Claude reviews all Codex branches and plans after the reset,
including any working-guide changes, before anything reaches main (D494). No pull request for
merging, merge or main push is authorized. Each build keeps its own codex/ branch.

The first job remains Discard marks removal; the subsequent batch order remains D495. File this
temporary arrangement with the Monday handoff. After the reset, return to the original
cross-provider reviewer arrangement unless the owner gives another ruling.

## raptor-port/docs/bug-check-order.md §4 — the three paragraphs of trials that have run (D476, D480, D508)

**A TRIAL, ON THE NEXT WALK ONLY (owner, D476, 1 Oct 26 — "Trial", to save tokens: the three walkers of one FULL
check cost about 1.9 million).** ONE extra walker runs on Sonnet 5.5 beside the Opus ones — the same brief, the same
scenario list, the same frozen build as ONE of the Opus walkers, in its own world; it replaces nobody. The host
reproduces every finding of both, as above, and reports to him in plain words: what each found, what each missed
that the other found, the false alarms, whether each opened its pictures, and the tokens each cost. Until he rules
on that report nothing else goes to a cheaper model (the 17 Sep 26 rule, `guide-full.md` §Models): every other
walker, the build, the roll-call and the reviews stay as they are. The open job: `OUTSTANDING.md`
`[SONNET-WALKER-TRIAL]`.
**A SECOND TRIAL (owner, D480, 1 Oct 26 — "One more trial").** The first ran on `[INSIGHTS-WHICH-COPY]`'s walk: the same
verdict from both walkers on all 19 scenarios, no false alarm, about half the cost — on a build with nothing in it to catch.
So on the NEXT walk one Sonnet 5.5 walker runs beside an Opus walker again, the same way, **on a build with known
defects**: the build as it stood BEFORE its fix (or an earlier commit whose walk found real ones), neither walker told
what is wrong, and the report says what each CAUGHT apart from whether each followed the brief. Until he rules on that
second report nothing else goes to a cheaper model.
**ONE EXCEPTION, ONCE (owner, D508, 3 Oct 26 — his allowance at 94% before the reset).** For the two Codex builds
(`codex/discard-marks-remove`, `codex/rally-workspan`) Opus 5.5 plans a small, targeted check and Sonnet 5.5 does the
reading and the walking, with no Fable; the host reproduces every find. It is an early signal on Codex's reliability,
NOT a bug check: the full check, this second trial and the second reads stay owed after the reset, before "merge live".

## AGENTS.md as it stood until 7 Oct 26

# AGENTS.md — for Codex working in this repo (D494, D496, 2 Oct 26)

**SINCE THE RESET (Monday 5 Oct 26, 19:00) — D590, D589:** the work is back in Claude Code. Opus 5.5 plans and builds;
Codex is called as the REVIEWER — Astra reviews what Opus wrote, and Sol 6.1 is the second reader where two are required
(earned leave, published records, permissions, saved data, an important plan, a changed working guide); each reads
independently and never reads the other's report first. Claude is checking everything built under the arrangement below
as one stack, on `claude/codex-stack-review` (D589). What follows records that arrangement as it ran until the reset; starting another build in Codex
does not renew D496 — follow the current rulings and his instruction for that build. Every hard limit below stands either way.

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
