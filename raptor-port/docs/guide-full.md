# The project guide — full text (D391, 28 Sep 26)

**Never loaded by itself; searched, or read at the heading you need.** The project guide, `raptor-port/CLAUDE.md`,
holds each of these rules as ONE line — its short form — ending `· full text: docs/guide-full.md §<heading>`; the text
under that heading here is what stood in the guide until 28 Sep 26, moved whole, byte for byte, by
`backlog-archive.mjs --move` (D138: a move never rewords). **Open the full text before acting on a rule's detail, and
before putting a question to him about it** — the same rule as a ruling's full row (D390). What every task needs to
work safely stayed in the guide in full: the five gate commands, the slot-key list, the two funnels, the product
invariants, the map.

- **Paths inside a moved block were written from `raptor-port/`**, where the guide sits: `docs/…` means
  `raptor-port/docs/…`, `src/…` means `raptor-port/src/…`, and `../` means the repo root. "This file" means the guide;
  "above" and "below" mean where the block stood in it — its `##` section is named here.
- **The document check pairs the two** (`raptor-port/scripts/docsize.mjs`): every `###` heading here is named by
  exactly one short form in the guide, every short form names a heading here, and every `##` here is a section of
  the guide. A new rule of this kind goes in as a short form in the guide and, when it outgrows one line, its full
  text here, under a new `###` heading its short form names (`.claude/rules/doc-structure.md`).

## How to work here

### Write his rulings down at the moment

**WRITE HIS RULINGS DOWN AT THE MOMENT HE SAYS THEM — one file per area, `DECISIONS.md` is the map**
(owner, 21 Sep 26: *"This is a recurring problem. Whenever we discussed something important to
note down. I dont see u noting them down."*). The cause is not forgetting, it is misclassifying:
a ruling stated mid-task gets absorbed into the WORK, executed correctly, and that feels handled.
It is not. File it in its area's rulings file BEFORE doing the work it implies, name the file that will
carry it, then make that file carry it — **where it belongs, not where you happen to be working**,
which is the error that keeps recurring. The rulings are an index, never the only home. Sweep
for missed rulings before any handoff or closing report, and carry a `Rulings:` line in that
report. Full rule and the two worked misses: `../.claude/rules/record-decisions.md`; the check
fires on every message via `../.claude/hooks/record-decisions.sh`.

### The newest owner instruction wins

**THE NEWEST OWNER INSTRUCTION WINS (owner, 17 Sep 26 — "most probably the
latest instructions I gave is usually the most correct one to follow").** This
file is full of dated rulings, and some reverse earlier ones. When two rules
conflict, follow the one with the LATER date, and say out loud which one you
followed and which you set aside. A rule with no date loses to a dated one.
If the newer ruling doesn't clearly cover the case, ask rather than pick.
This exists because a superseded rule that still read as live got a fix merged
without him on 9 Sep 26 — when you notice that shape, fix the stale text in the
same PR instead of just working around it. **Re-confirmed 24 Sep 26 (D90, now a row
in `../.claude/rules/decisions/how-we-work.md`, loaded in every session):** *"i think
latest rule is the most correct?"* — said while starting the amendment re-test.

### Weigh the whole ecosystem

**STANDING ORDER — weigh the whole ecosystem, and surface what you find
(owner, 28 Aug 26 — "Whenever u create or edit or change a feature. Make sure
u think how does it affect the whole ecosystem in the app, other areas.
Potential bugs u may face. Questions u may face. Ask me").** On EVERY feature
you create, edit or change — before building and again before calling it done
— reason out loud about how it lands across the WHOLE app, not just the file
in front of you: which other surfaces read the same data or rule, what could
break downstream, the drift-seams it might open (§Architecture, the
robustness doctrine below), the edge cases and user errors it invites.
`docs/feature-impact.md` is the map for that walk. Then TELL the owner what
you found in your report — the ripple effects, the risks you are carrying,
the assumptions you made — and ASK him wherever the change raises a genuine
question that is his to answer (a product-direction fork, a behaviour that
could go two ways, a trade-off he'd want a say in). This does NOT reopen the
7 Aug rule that pure implementation choices stay yours — keep deciding the
technical *how* yourself, and don't manufacture questions. What it adds is
that cross-feature impact, real risks and product-affecting ambiguities are
RAISED, never quietly absorbed: a concern he can wave off costs a sentence, a
silent one costs a bug. When in doubt whether something is "implementation"
(decide) or "his call" (ask), lean toward a one-line heads-up that states
your call and invites a correction.

### Sweep the rules, then hand-test against them

**STANDING ORDER — SWEEP THE RULES, THEN HAND-TEST AGAINST THEM (owner, 20 Sep
26 — "for all things that u built I want u to search through all the things
that we discussed like rules and how the app should perform or designed for
things that are applicable, list them down, hand test it yourself and see if it
performs to what we wanted and tell me anytime if a new ruling clashes with the
current one").** On EVERY build, four steps, in order:

1. **SEARCH** the record for every ruling that applies — not only the spec for
   the task in hand. Rulings, "how the app should perform", design decisions,
   across every doc and every earlier session. A rule missing from the task's
   own spec is not evidence it does not apply.
2. **LIST them down** and show him the list, in the words the app uses.
3. **HAND-TEST the build against that list** in the running app (the live-view
   pass below — real bundle, phone and desktop), walking the list ruling by
   ruling and reporting pass/fail per ruling. Unit tests alone do not satisfy
   this; the 16 Sep 26 scenario rule already says the same thing, and this adds
   *against the enumerated rules*.
4. **FLAG A CLASH THE MOMENT IT APPEARS** — any new ruling that contradicts or
   NARROWS an existing one. Name both, say which is newer, put it to him. This
   is the active half of the newest-instruction-wins rule above.

**Why this is an order and not advice.** On 20 Sep 26 a defect survived two
full cross-provider CODE inspections and 5103 green tests. It was not a coding
mistake: the code did exactly what its own comment said. The build had taken
H2 (a medical cuts leave in half-day steps) and used it for a second job that
ruling never claimed — deciding whether a medical and a leave clash at all —
while a LATER ruling the same day (H3 as overruled, real times) governed that
second job. Nothing went red because NO TEST NAMED EITHER RULING. A rules-first
sweep across both providers then found ten more of the same shape in ONE pass,
four of them August rulings still live after September ones replaced them.
Reviewing code against itself cannot catch this. Only reading the rules against
the behaviour can.

### The bug-check standing order

**THE BUG-CHECK STANDING ORDER IS `docs/bug-check-order.md` (adopted 21 Sep 26).** Read it before
any bug check, and follow its tier rule. It absorbs and REPLACES the 16 Sep scenario rule, the
20 Sep rules sweep above, and the 21 Sep "test like a human" rule — all three live inside it. The
short form, because it is the one that keeps being broken: **a code review plus green tests is NOT
a bug check.** Two frontier models reviewed the OIL build and passed it; the owner then found three
defects by opening the app, all of them surfaces that were never wired up, which reading code
cannot find. Every bug check now needs a ROLL-CALL (every place the app draws the thing, each with
a written yes / no-because / MISSING), a WALK of the running app across those surfaces and both
orders of every gesture, and an evidence sheet with pictures. The closing report carries a
mandatory `Walk:` line; without it a change cannot be reported ready for "merge live". §4 of that
file says which jobs to spend Fable and Codex on, and — just as important — which jobs are a waste
of them.

### The two instruments

**The two instruments, both standing.** A per-feature BEHAVIOUR REGISTER in
plain words, one line per ruling with its id (worked example:
`docs/superpowers/specs/2026-09-20-one-absence-behaviour-register.md`), and
`npm run rulecheck` — a gate that fails when a ruling no test names appears
outside the recorded baseline. The script catches "nothing is watching this
rule"; the sweep catches "the code does not obey this rule". Run both. The
reusable sweep brief is `docs/superpowers/briefs/rules-first-red-team.md`, and
it is now the THIRD standing review beside the pre-build design red team and
the post-build code inspection.

### Brainstorming is the heavy path

**`/brainstorming` overrides this section, and usually should not.** That
skill mandates a committed spec document and then a task-by-task
implementation plan — the HEAVY path. For a list of concrete asks ("rename
this, sort that"), skip it: ask the questions, then build. Invoking it on a
15-item UI list on 10 Aug 26 cost ~15 minutes writing a spec the owner's own
default says not to write. Reach for it when the SHAPE is genuinely unsettled,
not when the ask is already a list.

### Match the process to the risk

**Match the process to the risk — the owner chose MEDIUM as the default
(owner, 7 Aug 26), after the stores-configuration feature took a full day
under the heaviest one.** Medium is: understand the ask, build it, have one
reviewer check the finished work, report. No separate spec document, no
task-by-task plan, no per-step sign-off. Drop to LIGHT — just build it and
run the gates — for cosmetic work, copy, a new column, a filter. Escalate
to HEAVY (spec → plan → task-by-task with a review and fix loop on each)
only where a defect would be SILENT rather than obvious: persisted data,
roles and permissions, the validation engine, anything the byte-exact
reference parity or the perf ceilings sit on top of. Say at the time that
you are escalating, and why. A visual change across many surfaces is still
MEDIUM (the 6–7 Sep 26 drag-lift build ran HEAVY at about an hour a task and
the owner called it extreme); whichever path is chosen, state the expected
time before the first task starts. And prefer BATCHES — most of the cost is
loading this app into context, so five related changes in one pass cost
barely more than one.

### The owner is non-technical

- **The owner is non-technical.** Explanations to him are plain-language
  and complete; terseness applies to tool use and internal work, never to
  what he reads. **He does not want technical/implementation decisions put
  to him either (owner, 7 Aug 26)** — make that call yourself and tell him
  what you decided and why, in plain terms; this is distinct from the
  product-direction options §Product bar & ideation still asks for, which
  stay owner choices. **He restated the plain-language rule on 6 Aug 26
  because it was being ignored**, so it is spelled out rather than left to
  judgment:
  - **Never paste raw output at him** — no log lines, stack traces, JSON,
    run IDs, commit hashes, HTTP codes, file:line references or CSS class
    names. Read the thing yourself and report what it MEANS. "The publish
    step gave up after ten minutes" — not `##[error]Timeout reached`.
  - **Lead with what it means for him**, then the detail if it earns its
    place. He wants to know: is it working, is it live, what do I do now.
  - **Name things the way the app does.** "The ring around the puck", "the
    warning list", "the previous day" — not `.boxdash`, `dayWarnHTML`,
    `WARN.trace[prevDi]`. Internal names belong in code comments and
    commit messages, which are written for the next agent, not for him.
  - **Say what you did and whether it worked.** A gate table with counts is
    fine — it is a result, not jargon. A diff walkthrough is not.
  - This is about VOCABULARY, not depth. Do not thin out the reasoning, the
    trade-offs or the caveats; say them in ordinary words. Never hide a
    limitation because explaining it would take a sentence more.
  - **Keep it SHORT and ordinary** (owner, 10 Aug 26 — "can u speak to me in
    layman terms, u are starting to sound weird"). Plain-language is not a
    licence for length or for a literary register. Short sentences, everyday
    words, no flourishes, no drum-roll structure, no repeating a point for
    effect. The 6 Aug rule above bans jargon; this one bans PADDING. If a
    reply is running past a screen, most of it is probably restatement.

### Models

- **MODELS — SUPERSEDED 23 Sep 26 by D67: Opus 5.5 PLANS and BUILDS; Fable 5.1 and Astra REVIEW the plan and the code, never the model that wrote it (both on money / published records / permissions / persistence); when ASTRA builds, Opus 5.5 reviews; a bug Opus 5.5 cannot crack escalates to Fable 5.1. The 7 Sep 26 text below is history.** (Was: MODELS (owner, 7 Sep 26) — heavy work runs on Opus 4.8; Fable 5.1 is
  budget-limited.** The owner prefers Opus 4.8 and Fable 5.1 for work ("they
  hallucinate less and are more correct"); he has plenty of Opus tokens and a
  LIMITED Fable allowance, which he spends deliberately on the SMART work —
  bug checks, verification, complex reasoning ("sometimes I use fable for
  things like bug check because it's smarter"). So split by kind, not by
  importance: put the VOLUMINOUS work — long reads, wide scans, parallel
  reviewer subagents, many-turn orchestration — on Opus 4.8, and put the
  HARD-REASONING work — the verify pass on findings, tricky design calls,
  a focused bug check — on Fable. A session running on Fable keeps its own
  turns few and short. For subagents, OMIT the model override so
  they INHERIT the session's model, and NEVER write the bare `opus` alias — the
  harness resolves it and it may not land on 4.8.
  **WHILE THE CLAUDEX LOOP IS THE WORK (owner, 17 Sep 26): Opus is the
  workhorse and nothing is handed to a cheaper model — no sonnet, no haiku.**
  Fable and Astra (Codex) review on their top models; Opus builds; the model
  that wrote a thing never reviews it. A subagent may still take a READ-ONLY
  sweep, but it inherits Opus — a helper is never a downgrade. The
  implementation itself never leaves the main session
  (`../.claude/rules/raptor-executor.md`). This settles the old conflict with
  the Delegate-frugally bullet below.
  **One trial, 1 Oct 26 (D476): on the next walk ONE extra walker runs on Sonnet 5.5 beside the Opus ones, on the
  same scenarios, and the two are compared for him (`docs/bug-check-order.md` §4). Everything else in this rule
  stands until he rules on the result.**

### Delegate frugally

- **Delegate frugally, by judgment.** The main session plans, reviews
  diffs and runs the gates first-hand. **SUPERSEDED for the claudex loop
  (owner, 17 Sep 26 — see §MODELS above): no haiku, no sonnet; a subagent
  inherits Opus and takes read-only sweeps only, and the implementation never
  leaves the main session.** The old split — exploration on haiku, mechanical
  code-writing on sonnet — stands only if he later reopens cheaper helpers.
  *(1 Oct 26, D476: he has opened ONE trial — a Sonnet 5.5 walker beside the Opus ones on the next walk; nothing
  else moves until he rules on its result.)*
  Whoever is delegated to is handed a precise spec (files, expected
  shape, which tests to run) so it never explores. Agents return diffs
  and conclusions, never file dumps. Small precise work stays inline —
  spawning an agent costs more than a one-file fix.

### Token discipline

- **Token discipline.** Never let a tool dump raw output — send a long run to
  a file, keep its exit code, and `tail`/`grep` the FILE (a pipe hides the
  exit code), ask GitHub MCP tools for `minimal_output: true`, paginate 5–10,
  and prefer a 2-line `curl | grep` over a full API object when checking one
  field. Never read `reference/` whole (6.6k lines) — `grep` it; same for any
  file over ~300 lines (Grep or offset/limit Reads). While iterating run only
  the affected test file (`npx vitest run <file>`); the full gate set ONCE,
  before the PR — not between the sub-changes of a batch. Four full passes is
  ~20 wasted minutes, and that is a real reading from 10 Aug 26, not a
  caution. Trust this index instead of re-exploring. Prefer a fresh session
  per task; a long conversation re-sends itself every turn.

### The rules-engine robustness doctrine

**The rules-engine robustness doctrine (owner, 21 Aug 26 — "Remember
this").** Any change that touches the rules engine carries a standing bar:
be ~95% sure it breaks nothing before calling it done, test it, and check
your own work. The owner named the gotcha families to walk EVERY time —
they are his words, keep walking them:
- **People not following the format.** What is the tolerance for
  near-identical spellings (`0900` = `09:00` = `0900H` = `0900L`)? Loose
  where variants mean the same thing, refused where a value could be a typo
  (the `RULE_SPEC` bounds, the brief-lead 1–240 guard).
- **Missing input.** If the user doesn't type what you wanted, what is
  registered instead? Every default must be stated somewhere the user can
  see (`openEnd`, `simLen`, the blank-B suggested brief), and "no usable
  value" must fail CLOSED for pickers (null = unknown, never free) while
  staying visibly inert rather than silently wrong.
- **User errors.** A refused value is put back to the live value on screen,
  never left looking saved; an impossible clock is skipped, not rolled into
  a different time.
- **Deletions and edits from another page.** The engine re-runs on every
  mutation path (`afterSchedMutate`, `ruleApply`), so ask of each new rule:
  which pages display its result, and do they all repaint?
- **Sync between copies.** A rule read in two places (validator + crew
  picker + Logic-tab prose) is a drift seam. One VCONF key, one function —
  never a second literal. When a rule CHANGES, grep for the old rule's
  WORDING as well as its identifiers: prose restatements (logic-html rows,
  docs) don't show up in code greps. The 19:00 AAR literal that sat in both
  `events.ts` and `avail.ts` until 21 Aug 26 is the standing example (the
  owner then removed the clock from that rule entirely — night AAR is the
  wave's flag or an explicit NAAR — but the seam lesson stands). Two
  SETTINGS for one physical moment are the same seam: `showLead` sat beside
  `step` at the same 60 until 21 Aug 26, so editing the step timing moved
  the busy windows but not the crew-rest line — merged into `step`; when a
  new setting names a moment the squadron already has a word for, reuse the
  existing key.
Also standing: prefer a `VCONF` + `RULE_SPEC` setting over a hard-coded
number for anything a squadron could plausibly set policy on, and put the
edit box on the Logic-tab row where the number is QUOTED, not only where it
is defined.

### Task-observer activation

**Task-observer activation (owner, 15 Aug 26).** At the start of any
task-oriented session — any interaction where you will use tools and produce
deliverables — invoke the `task-observer` skill before beginning work, so
skill-improvement opportunities are captured throughout the session. When
loading any skill, also check the observation log for OPEN observations tagged
to it and apply their insights even if the skill file has not been updated yet.
A vendored `SessionStart` hook (`.claude/hooks/task-observer-session-start.sh`,
wired in `.claude/settings.json`) is the enforceable half of this; this line is
the structural half that survives compaction. The skill is vendored at
`../.claude/skills/task-observer/` and its observation log IS committed, at
`../.claude/skill-observations/log.md` — read it, append to it, and do not
treat it as session-only. Provenance and opt-out:
`../.claude/skills/TASK-OBSERVER-VENDORED.md`.

## Product bar & ideation (owner, 7 Aug 26)

### Ideate before building non-trivial UX

- **Ideate before building non-trivial UX.** Restate the problem BEHIND the
  literal ask, then offer 2–3 directions — the conventional one, a more
  ambitious one where it genuinely serves the user, a leaner one where it
  exists — each with a one-line case and rough effort, plus a
  recommendation, and let the owner pick. Small unambiguous asks skip
  straight to building. (The 7 Aug blue-selection build-and-rollback is the
  standing example: the ideation question is cheaper than the build.)
  **When a direction is visual, show a PICTURE before product code (owner,
  7 Aug 26):** a throwaway HTML comp in the app's own stylesheet,
  screenshotted at phone and desktop widths — pixel-faithful because it IS
  the real palette — so the owner approves what it looks like, not a
  description of it.

### UI quality is a decision axis on every change

- **UI quality is a standing decision axis on EVERY change** (owner, 12 Aug
  26 — "see how I am also concerned about user interface… remember this when
  making decisions"). On a phone: easy to view, spacious, smooth, logical
  view and navigation, layout that reads top-to-bottom, reachable controls.
  On a desktop: the same, plus actually USING the real estate — a wide
  screen should make things more accessible, not just stretch them. Weigh
  this axis when choosing a shape, say in the report how the choice serves
  it, and when driving the built bundle (the live-view pass below), LOOK for
  UI faults and improvement openings beyond the change being made — and
  report them. As options, which is the next rule.

### UI copy reads production

- **UI copy reads PRODUCTION, never prototype** (owner, 25 Aug 26 — "Is it
  possible to create a production ready interface. Don't need to put all
  these unnecessary instructions … word it such that when this goes to
  database what would the user actually see"). No "session-only", "demo",
  "no server yet" or "this is where controls will land" caveats on screen —
  write every label and note as the database-era user will read it, and
  keep the prototype truths as CODE COMMENTS beside the control (plus
  HANDOFF) so the migration doesn't forget them. Helper text that explains
  what a control DOES (what a template is, what a wipe removes) stays —
  it is instruction, not apology.

### Performance and scalability

- **Performance & scalability.** THE SPEED LEDGER AND THE GUARDRAILS LIVE IN
  `docs/performance.md` — read Part 1 before any layout, interface, design or
  rendering-touching change, and run the change through its checklist. It is the
  single index of every speed round and the invariant each one must not lose
  (only the page on screen repaints; a changed day rewrites only its changed
  blocks; the ghost rides its own transform layer; no inherited/custom property
  toggled on body or a grid ancestor; the Leave War window engine; etc.), so a
  later change cannot quietly undo them and let the app rot back into lag.
  The gate's law is `docs/performance.md` §The perf gate: DOM ceilings
  re-measured in `probes/perf-port.cjs` (never copied into prose), raised only
  as a deliberate, argued edit in the same PR; the three per-node TIMING budgets
  stopped being assertions on 10 Aug 26 (owner — they caught nothing in the life
  of the repo and went red on unchanged code), so read them but never gate on
  them. Reasoning: `docs/probe-sweep.md`. Dense surfaces stay string-built (§Architecture).
  True scaling — shared data, real accounts — is server work (`HANDOFF.md`
  §Standing constraints); until then every write goes through the mutation funnel
  and storage through `HOOKS.storeBackend`, which is precisely what keeps
  that migration possible. Do not add state outside those two paths.

### Security

- **Security.** No secrets, tokens or credentials in the repo or its
  history — the deploy needs none. Every user-entered string is escaped at
  the builder (two unescaped sinks were found 6 Aug; assume more is
  possible). Role checks live at the PAGE, the write path and the command gate, not the nav
  (the 6 Aug lesson) — and since `[ACCOUNTS]` (26 Sep 26, D200 (3)) every one of them asks ONE module,
  `src/state/perms.ts`, which mirrors `docs/data-model.md` §11 (drift-tested; a gate anywhere else fails
  `perms-scan.test.ts`): a new rule goes into `perms.ts` and §11 TOGETHER. And never present
  the prototype auth as security: since D59 (23 Sep 26) the repo is private and the
  app sits behind his Vercel sign-in, but that is Vercel's lock, not the app's — until the database,
  accounts live in one browser and the sign-in only stands for Microsoft's, and anything genuinely
  sensitive stays out of the demo data.

### Future development and DevOps

- **Future development & DevOps.** Ship through the gated pipeline only —
  five gates in CI on every PR and push (the Tracker smoke is one of them),
  plus the two local-only gates for UI work; nothing deploys red. Write for the next session: comments say
  WHY, each fact goes to its one home in the same PR (`../.claude/rules/doc-structure.md`) —
  a decision that must not be relitigated to its area's rulings file (`../.claude/rules/decisions/`),
  the cross-cutting ones to §Stable decisions — and the deploy and gate traps (OIDC re-runs,
  dispatch-cancels-push, the old ten-minute Pages ceiling) are documented in
  `docs/gates-and-deploy.md` before they are ever debugged twice.

## Build & verify

### The Windows desktop is the only environment

> **ENVIRONMENT (owner, 17 Sep 26): the WINDOWS DESKTOP is the only place work
> happens.** He remote-controls that same session from his phone — the phone is
> a remote control, not a second environment. The container paths below
> (`/home/user/Raptor`, `/opt/pw-browsers/chromium`, the agent proxy) are
> LEGACY, kept only for their measured traps; do not follow them literally here.

### A background command starts in the chat's starting folder

> **Background commands start in the folder the CHAT started in, not where the foreground shell is.**
> A foreground command keeps whatever folder the session's shell has moved to, but a
> `run_in_background` job launches a fresh shell in the chat's STARTING folder (`$CLAUDE_PROJECT_DIR` —
> usually the repo root or a worktree's root), where there is no `package.json` — so a bare
> `npm run test:e2e` (or any `npm` script) fails INSTANTLY with `ENOENT … package.json`, and the wrapper's
> own exit code can read 0, masking it. ALWAYS move into `raptor-port/` inside a backgrounded gate, BY ITS
> FULL PATH (`cd "<repo>/raptor-port" && …`), which works whatever folder the shell starts in. This bit
> twice (test:e2e, 30 Aug 26) and each miss wastes a full ~10-minute re-run. **Enforced since 26 Sep 26**
> ([BG-CWD-GUARD], D162): a hook, `../.claude/hooks/bg-cwd-guard.mjs`, refuses a backgrounded `npm`/`npx`
> step that would run outside `raptor-port/` — it follows the line step by step (a `cd`/`Set-Location`/`Push-Location`
> into a folder that IS `raptor-port` or lies inside it, or `npm --prefix …raptor-port` on the step itself) — and names
> the full path in its refusal; a chat that STARTED inside
> `raptor-port` may run a bare `npm` (its background shells are already there). *(Corrected 26 Sep 26,
> [BG-GUARD-FALSE]: this note said background shells start "at the REPO ROOT"; measured, they start in the
> chat's starting folder — the accounts chat, started inside `raptor-port`, then found `cd raptor-port && …`
> failing.)*

### Stand up the live view

**Stand up the live view for any UI-visible task, every session** (owner ask,
6 Aug 26 — a standing instruction, not a per-task one). Build, serve, and
drive the real thing in a real browser BEFORE saying it works:

```
npm run build && npx vite preview --port 4173     # the production bundle
```

Drive the LOCAL preview at its ROOT — `http://localhost:4173/`, NOT
`/Raptor/`. `vite.config.ts` sets `base:'./'`, so the preview serves assets
from `/assets/…`; loading `/Raptor/` returns the SPA index (a 200) but every
asset then 404s from `/Raptor/assets/…` and the page renders blank. The
`/Raptor/` sub-path is the DEPLOYED Pages URL only. To add a standalone wave
without clicking the picker, the probe bridge exposes `window.setPage('editsched')`,
`window.addWave(di,'sc')` and `window.openScheduler(di)`.

then a short Playwright script (`executablePath` rule below) to log in,
navigate, **screenshot the element in question and LOOK at it**, read
computed style, and watch for console errors, 4xx responses and page errors.
`vite.config.ts` sets `base:'./'`, so this preview is the deployed page in
every respect except the hostname — a local check is not a proxy for the real
thing, it IS the real bundle.

The reason is not diligence for its own sake. A crew-rest ring shipped drawn
as a fat solid box while 604 vitest tests passed, because jsdom loads no
stylesheet and reports every rect as 0×0: it could prove which CLASS was
emitted and nothing about what was painted. The same pass caught a 404 on
every page load, and caught a first favicon that was invisible at 16px. None
of those are reachable from `npm test`.

### Stop a stray preview server by its port

**Stopping a stray preview server: kill by PORT, never by a command-line
pattern.** On WINDOWS: `Get-NetTCPConnection -LocalPort 4173` → `Stop-Process`
(`:4179` for the smoke suite's). The legacy container form was
`lsof -ti :4173 | xargs -r kill`. Never `pkill -f "vite preview"` /
`pgrep -f … | xargs kill` inside a compound command: it matches the CALLER's own
shell (its command line carries the pattern) and kills it — exit 144, the rest
of the line never runs. It happened three times in one day (9 Sep 26) despite
two logged warnings; the port form cannot express the mistake.

### A new Playwright script uses the repo's browser fallback

**A NEW Playwright script uses the repo's own fallback, NOT a hardcoded path**
(corrected 17 Sep 26 — the old rule said every script "must pass
`executablePath:'/opt/pw-browsers/chromium'`", which on the Windows desktop
fails with the very "Executable doesn't exist" error it warned about).
`playwright.config.ts` and `scripts/tracker/smoke.mjs` both do
`existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}` — copy that: the
container symlink when it is there, Playwright's own browser otherwise. IN THE
CONTAINER ONLY, never run `npx playwright install` — it re-downloads for
nothing. The probes in `reference/probes/` still hardcode the container path.

### Signing in for a walk

Login is `ad`/`a` (admin, signed in as Saber) or `us`/`us` (squadron member, signed in as Ranger — NOT view-only
since 5 Aug 26: a member edits their own Inputs and their own Quals row; the split is in `docs/engine-rules.md` §Auth /
roles). Since `[ACCOUNTS]` (26 Sep 26, D166) these are two SEEDED accounts among others on Admin → Users — every account
is one person — not hard-coded logins; an account the admin adds takes any password (the sign-in stands for the
defence mail's; the app keeps no password), a name on no list lands on "Request access". The account names changed from
a/a · user/user on 24 Aug 26 (owner ask, which also removed the credentials hint from the sign-in card — don't re-print
them there). The username is lowercased before matching; the two seeded passwords are compared
exactly, so `AD`/`a` works and `ad`/`A` is rejected.

## Architecture rules (apply to nearly every task)

### New modules follow the one command layer

**NEW modules follow the ONE command layer, never a fourth store-pattern** (owner,
16 Sep 26). The app is deliberately being unified onto a single write/command layer
over stable ids — every change a recorded, worded command that undo, persistence,
sync and the database all consume ([ARCH-STACK] step 2,
`docs/superpowers/specs/2026-09-16-arch-stack-2-command-layer-design.md`;
`docs/architecture-direction.md`). Do NOT build a new app/tab/module with its own
store/notify + own storage seam + own undo the way Scheduler / Leave War / Tracker
each did — that "one pattern built three times" is the root cause the stack is
undoing. Any new module routes writes through the shared command layer (or, until
step 2 lands, is built so it can adopt it with no rework: writes through one funnel,
stable ids, no bespoke undo). Raise this in the design step, not after.

### The slot-key grammar and row ids

**The slot-key grammar** — everything addresses through this, and the day
index is always first after the prefix (`keyDay()` depends on it). Every
row also carries `rid` (`engine/rowids.ts`, 10 Sep 26) — identity for the
database: minted by one walk before every baseline and snapshot
(`initStore`/`loadWeek`/`histInit`/`histPush`), kept by a move, an undo, a
restore, re-minted on a copy (day template, duplicated wave), never printed
(parity stays byte-identical). **Since addressing-by-rid (11 Sep 26) the
amendment book RESOLVES rows by `rid`, not by position** — the persisted keys
(`SCHED.pending`/`changes`/`added`, every `al.keys`/`snap.c`, the edit log) are
`rid`-anchored, translated to/from the positional DOM address at the write-in
(`ridWriteKey`) and paint (`ridKey` in `alAttr`) boundary, so a delete or
reorder never renumbers another row's stored key. A new row-creating path needs
no code: the walk mints what it finds missing, and the write-in translate
self-heals a still-id-less row. A day-template / duplicated-wave COPY must strip
ids (`stripRowIds`) so the copy is a new row — but a parked DRAFT deliberately
KEEPS them (`drafts.ts`, 11 Sep 26): it is an alternate VERSION of the same day,
so the live day, its drafts and its issued document share ONE `rid`-space.

### Person identity is a stable hidden id

**Person identity is a stable hidden id (who→personId, ARCH-STACK 1C, 14 Sep
26).** Every crew reference stores the PEOPLE key (`bane`), never the display
callsign (`cs`): flying seats, duty `id`, sim `p/w/pax`, `more[]` and INPUTS
`.person` always did; ground and Common-Programme `who` now do too
(`setSlotVal`/`acceptInput` store the id). `whoId(v)` (engine/people.ts) is the
ONE id-first resolver every ground/programme consumer shares
(`PEOPLE[v]?v:nameToId(v)` — a stored id wins, a legacy callsign still
resolves; free text like 'EXT SQN' stays text). So **renaming is a label change
that moves nothing** (`renameCallsign` sets `cs` + remaps `ID_BY_CS`; the old
DAYS-walk that rewrote row strings — and missed snapshots/drafts/other weeks —
is gone), and no reused callsign can cross two people. The one add
(`state/roster-add.ts newPersonProblem`, Admin → Users — the only door for a new
person since `[ACCOUNTS-NEW-PERSON]`, D217) refuses a callsign that resolves to
any existing person ON THE ROSTER by id OR callsign (the closed add back-door) — **narrowed by D286, built 27 Sep 26 (`[POST-OUT-OUTCOMES]`): the callsign index holds the roster and the placeholders only, so an archived man's callsign is free; Restore refuses while a roster man holds it and Quals offers another on the spot (D295); a DELETED man is a hidden mark (`deleted`, D290 — `state/person-delete.ts`), in no index and on no list, while every day he already flew still points at him (D297)**. Sim `who` is FREE TEXT only now — never resolved to a person.
Parity holds byte-for-byte: `data-person` and the printed name both derive from
the resolved id, so an id-form `who` renders identically to a callsign one.

### What actually persists

**WHAT ACTUALLY PERSISTS (verified 17 Sep 26 — read this before believing any
"session-only" sentence elsewhere in this file).** A BUILT SITE runs on the
Browser backend (`storage/boot.ts chooseBackend`), and across a reload it KEEPS:
`INPUTS`, `PEOPLE`, the `plan` layer (PLANPUCKS/DAYRMK), every stashed week AND
the live week (`persistAll`), the 14 durable settings keys (incl. `qualcols` and, since `[ACCOUNTS]`, `accounts`, `accessreqs`, `guestview`),
the whole Leave War world, the Tracker's `ocu:` data, and medical documents
(IndexedDB). MEMORY-ONLY is now just the `vite` dev server, `MODE==='test'`,
`?fresh=1`, or a browser whose storage cannot be touched. Genuinely still
session-only, by design: **undo/redo history and the view-state
registries (`LATEOFF`, the armed slot, selection)** — none is in `persistAll`.
*(Corrected 1 Oct 26, `[STORE-READER-SWEEP]`: this named the edit log too. The change history has been KEPT since
`[DRAFT-PENDING]` — D338, 28 Sep 26: it outlives a sign-out and a reload, a row per line, `engine/editlog.ts elogLoad`.)*
Several August "session-only / a reload forgets" rules elsewhere in this file
were written before the 8 Sep 26 storage work and are marked superseded where
they sit; if you find another, it is stale — fix it, don't obey it.

## Coding conventions

### Keep the records true in the same PR

- **Keep the records true in the same PR — each fact in its ONE home** (D140; the routing is
  `../.claude/rules/doc-structure.md`, loaded in every chat). A change that adds, removes or renames a file
  edits `docs/file-map.md`. A change that creates a known issue or leaves work open files it in
  `../OUTSTANDING.md`, the ONE backlog; a change that resolves one moves its item out with
  `scripts/backlog-archive.mjs` — its contract goes to the structured doc, its story to the commit message, never
  a "RESOLVED" narrative left anywhere. Where things stand goes in the chat's own block under `## Now` in
  `../HANDOFF.md`, which holds current state only: it is read at the start of every chat, so every line costs
  every chat. The history is frozen in `../HANDOFF-ARCHIVE.md` (search it, never append to it); a passage no
  longer needed where it sits moves WHOLE to `docs/archive/` (D138, D141 — the old wording of this bullet is
  there, `raptor-claude-md-2026-09-24.md`). **A code change never trims a document** (D29): a file over its
  ceiling is its own docs-only pass. Stale is worse than absent — the next session trusts it.

## Stable decisions (do not relitigate)

### A click-open popup closes on a click outside it

- **A click-open popup closes on a click outside it** (owner, 4 Sep 26). Any
  transient panel/menu/palette a tap OPENS must dismiss on an outside
  pointer-down (and, where sensible, right after the choice that finished it).
  `Sheet` does this via scrim+Escape; a smaller inline popup adds a capturing
  document `pointerdown` listener, treating a press on the popup or its toggle as
  "inside" (worked example: the ⚙ colour palette, `SettingsSheet.tsx`).

### A control tapped repeatedly must not move

- **A control the user TAPS REPEATEDLY must not move under them** (owner, 2 Sep
  26). `RangePicker` pads EVERY month to a constant six rows so the ‹ › month
  arrows (and the bottom-anchored sheet) hold still. Raptor's TOP-anchored
  calendars (`InputsCal`, `WeekCal`) grow downward, arrows already fixed —
  unchanged (checked). General rule: keep a repeated-tap control's screen
  position invariant to the content it changes. Pin: `rangepicker.test.tsx`.

### The highlight menus read apart from their chips

- **The highlight MENUS read apart from their CHIPS** (owner, 25 Aug 26). `.hl-gtab`
  is a solid RAISED control (`--ink`, bold caret); `.fchip` stays flatter/quieter
  (`--panel-2`/`--ink-2`), filling blue (`--accent`) only when picked; an open
  `.hl-grp.open` wraps tab+chips in one tray (scoped to `.filters`/`.ic-pick-cats`
  — don't restyle the bare `.hl-grp`, History reuses it). Don't flatten tabs back
  to the chip recipe. `scheduler.css`; strip is `ui/hlchips.tsx`.

### The groups moved to the area files

- **Leave War roster & display** (owner, 3–4 Sep 26) — moved 24 Sep 26, whole, to `../.claude/rules/decisions/leave-war.md` §Settled before this list (loads with any Leave War file).
- **The late-input mark** (owner, 9 Aug 26 unless noted) — moved 24 Sep 26, whole, to `../.claude/rules/decisions/scheduler.md` §Settled before this list (loads with any scheduler, board, engine or storage file).
- **Board behaviour** — moved 24 Sep 26, whole, to `../.claude/rules/decisions/scheduler.md` §Settled before this list (loads with any scheduler, board, engine or storage file).
- **Waves & duties — templates and defaults** — moved 24 Sep 26, whole, to `../.claude/rules/decisions/scheduler.md` §Settled before this list (loads with any scheduler, board, engine or storage file).
- **Drag-reordering (sections, waves, dense rows)** — moved 24 Sep 26, whole, to `../.claude/rules/decisions/scheduler.md` §Settled before this list (loads with any scheduler, board, engine or storage file).
- **Time format** — moved 24 Sep 26, whole, to `../.claude/rules/decisions/scheduler.md` §Settled before this list (loads with any scheduler, board, engine or storage file).
- **Week navigation & cross-week continuity** — moved 24 Sep 26, whole, to `../.claude/rules/decisions/scheduler.md` §Settled before this list (loads with any scheduler, board, engine or storage file).
- **Inputs & Admin** — moved 24 Sep 26, whole, to `../.claude/rules/decisions/scheduler.md` §Settled before this list (loads with any scheduler, board, engine or storage file).
- **Leave War grid & scheduler render/drag performance** — moved 24 Sep 26, whole: the scheduler half to `../.claude/rules/decisions/scheduler.md` §Settled before this list, the Leave War half to `leave-war.md` (each loads with its files).
