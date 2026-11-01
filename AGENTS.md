# AGENTS.md — for Codex working in this repo

**Who does what now (D67, D590, D601).** Opus 5.5, in Claude Code, plans and builds; Codex is called as the REVIEWER (Astra first, Sol 6.1 second where two are required) and BUILDS only on his word, each time. The full arrangement, and how Codex reviews and builds: `raptor-port/docs/codex-guide.md` — read it before any review or build.

This file is a bridge: it holds no rules of its own beyond the short list below — it tells you which files carry them.
**Nothing in this repo loads by itself for you. Open what is named here, with your own reads, before you plan, review
or change anything.**

## Read first, every session, in this order

1. `HANDOFF.md` — where things stand; the newest block under `## Now` is the work in hand.
2. Every rule file Claude gets loaded in every chat — read each one whole:
   `.claude/rules/plain-language.md` · `.claude/rules/record-decisions.md` · `.claude/rules/bug-check.md` ·
   `.claude/rules/shipping.md` · `.claude/rules/doc-structure.md` · `.claude/rules/decisions/how-we-work.md`.
3. `raptor-port/CLAUDE.md` — the project guide and its map (§Where things live). Most of its rules are one line;
   the full text of each is a heading of `raptor-port/docs/guide-full.md` — search it, never read it whole.
4. Before planning, reviewing or changing anything in an AREA, that area's rulings file under `.claude/rules/decisions/`
   (`scheduler.md`, `inputs.md`, `leave-war.md`, `oil.md`, `tracker.md`, `people-accounts.md`, `it-flow-guide.md`) — the `paths:`
   at the top of each says which source files it governs. Before any build: `.claude/rules/raptor-executor.md`. Before any interface work — anything
   a person sees: `.claude/rules/ui-design.md` and `raptor-port/docs/design-practices.md` (D812).
5. A ruling there is ONE line. Before acting on its detail or asking him about it, open its full row:
   `grep -h '^| D149 |' .claude/decisions-full/*.md`.
6. `OUTSTANDING.md` — the one backlog — before telling him anything is undecided, missing or unbuilt (D53).

## What Claude gets from its hooks — you do these by hand

- **Record his rulings the moment he makes them, BEFORE the work they imply** — the three steps at the head of
  `DECISIONS.md`, then `node raptor-port/scripts/backlog-archive.mjs --rulings`. Ask yourself on EVERY message of his:
  is this a decision, a preference, a correction, a "leave it", a no? Every closing report carries a `Rulings:` line.
  **Take the next free number after checking the live rulings, the archived numbers and the ranges held by parallel
  branches.** A number named in `HANDOFF.md` is a hint to verify, never permission to reuse one. D567–D585 stay
  reserved for the calendar branch.
- **Run the document check before you end any turn that changed a document:** `cd raptor-port && npm run docsize`.
  It must pass; read what it says rather than working around it.
- **A background command starts in the wrong folder** — move into `raptor-port/` by its full path inside the command.
- **Speak to him plainly** (`plain-language.md`): he is not technical. No file names, function names, log lines or
  commit ids in what he reads. Run its "check before you send" on every message.

## Hard limits

- **Never push to `main`, never merge a pull request, never open one for merging.** "Merge live" is his word alone,
  and it cannot be given for anything you built until Claude has read it (D67). Push BRANCHES freely — each gives him
  a Vercel link to look at (`shipping.md`).
- **Branches:** each build job gets its own branch, `codex/<short-name>`, cut from `main` unless he names another
  base; the calendar's work continues on `codex/inputs-sans-calendar`.
- **One full check at a time on his PC:** take the lock before the full unit suite, a multi-file browser run, the
  Tracker smoke or a fanned-out walk — `node raptor-port/scripts/gatelock.mjs take "<branch> — <what>"`; release it
  the moment the run ends (`shipping.md` §The checks).
- Never edit `.claude/hooks/`, `.claude/settings*.json`, `.claude/skills/`, a reviewer's brief after its run, or
  this file's limits to get a result accepted. Never weaken a test to pass. Never delete data or history.
- `reference/` is read-only; `src/engine/` bodies are verbatim ports — a change there is the behaviour change only.
- A change inside `raptor-port/src` never trims a document (D29).

## When you stop

**After a read-only review:** return the whole report and change no file; do not commit or push. The host that asked
records the result.

**After an authorised build or filing job:** rewrite ONLY your own block under `## Now` in `HANDOFF.md` (the shape is at
the head of that file): what you changed, on which branch, what was checked and how, every read owed to Claude, and what
is next. Commit and push the branch, following the shipping rules. The next Claude chat starts from that block.
