# RAPTOR — 142 Flying Programme (React app)

A flying-schedule planner for a fighter squadron: a week of flying waves,
duty crews, sims, ground events and personal inputs, with a validation
engine that flags crew-rest breaches, double bookings, missing briefs and
qualification problems, plus an amendment (AL) workflow for publishing
changes after a day is signed off. No server — per-browser localStorage.

This file is the INDEX. It holds the rules that apply to every task and
routes to where the detail lives; don't duplicate that detail back here.
Each AREA's own rules — its rulings, its settled decisions, its architecture — load by themselves
when a file of that area is opened (`../.claude/rules/decisions/`); how a change ships
(`../.claude/rules/shipping.md`) and where each new fact goes (`../.claude/rules/doc-structure.md`)
load in every chat. Map: §Where things live, at the end.

## How to work here

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

**Reach 95% confidence before building.** If the request could reasonably
mean two different things, or a choice would materially change the result,
ask follow-up questions until it wouldn't. Small, unambiguous asks clear
that bar on their own — don't manufacture questions for them.

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

**The two instruments, both standing.** A per-feature BEHAVIOUR REGISTER in
plain words, one line per ruling with its id (worked example:
`docs/superpowers/specs/2026-09-20-one-absence-behaviour-register.md`), and
`npm run rulecheck` — a gate that fails when a ruling no test names appears
outside the recorded baseline. The script catches "nothing is watching this
rule"; the sweep catches "the code does not obey this rule". Run both. The
reusable sweep brief is `docs/superpowers/briefs/rules-first-red-team.md`, and
it is now the THIRD standing review beside the pre-build design red team and
the post-build code inspection.

**`/brainstorming` overrides this section, and usually should not.** That
skill mandates a committed spec document and then a task-by-task
implementation plan — the HEAVY path. For a list of concrete asks ("rename
this, sort that"), skip it: ask the questions, then build. Invoking it on a
15-item UI list on 10 Aug 26 cost ~15 minutes writing a spec the owner's own
default says not to write. Reach for it when the SHAPE is genuinely unsettled,
not when the ask is already a list.

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
- **Shipping — tell him when you are DONE, ship ONCE per session, NO AUTO-MERGE** (10 Aug – 2 Sep 26) — the live rules, with "done" now meaning live on Vercel (D143), are `../.claude/rules/shipping.md` (loaded in every chat); this Pages-era wording moved 24 Sep 26, whole, to `docs/archive/raptor-claude-md-2026-09-24.md`.
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
- **Always hand him the Vercel preview link** (24 Aug 26) — now in `../.claude/rules/shipping.md`; this wording, with its superseded auto-merge clause, moved 24 Sep 26, whole, to `docs/archive/raptor-claude-md-2026-09-24.md`.
- **Delegate frugally, by judgment.** The main session plans, reviews
  diffs and runs the gates first-hand. **SUPERSEDED for the claudex loop
  (owner, 17 Sep 26 — see §MODELS above): no haiku, no sonnet; a subagent
  inherits Opus and takes read-only sweeps only, and the implementation never
  leaves the main session.** The old split — exploration on haiku, mechanical
  code-writing on sonnet — stands only if he later reopens cheaper helpers.
  Whoever is delegated to is handed a precise spec (files, expected
  shape, which tests to run) so it never explores. Agents return diffs
  and conclusions, never file dumps. Small precise work stays inline —
  spawning an agent costs more than a one-file fix.
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

Distilled from the owner's product-standards brief; this section IS the
standard — the full brief is deliberately not kept. Autonomy is unchanged:
the confidence rule above still decides when to ask, and green gates ship on
his explicit "merge live" (2 Sep 26 — `../.claude/rules/shipping.md`) — never
unprompted.

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
- **Challenge a risky ask in a sentence or two**: the underlying user
  problem, any unnecessary complexity, a simpler alternative, a wrong
  assumption — then build what the owner decides, without relitigating.
- **The bar is production, not prototype.** Clear hierarchy and primary
  actions; spacing, type and colour consistent with scheduler.css's
  measured contracts; responsive at phone and desktop (both gated in e2e);
  accessible — labels, contrast, keyboard reach; real empty, loading, error
  and confirmation states on every new surface. No placeholder behaviour
  presented as working.
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
- **Verified vs assumed, always distinguished.** "Checked" means read or
  run first-hand this session; anything else is stated as an assumption.

**Scoping any new work weighs four axes** (owner, 7 Aug 26), each grounded
in what this repo actually has rather than a generic checklist:

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
- **User experience.** The bar above, plus the standing proof: the
  live-view pass in §Build & verify IS the UX check — drive the built
  bundle, screenshot, and look, before calling anything done.
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
- **Future development & DevOps.** Ship through the gated pipeline only —
  five gates in CI on every PR and push (the Tracker smoke is one of them),
  plus the two local-only gates for UI work; nothing deploys red. Write for the next session: comments say
  WHY, each fact goes to its one home in the same PR (`../.claude/rules/doc-structure.md`) —
  a decision that must not be relitigated to its area's rulings file (`../.claude/rules/decisions/`),
  the cross-cutting ones to §Stable decisions — and the deploy and gate traps (OIDC re-runs,
  dispatch-cancels-push, the old ten-minute Pages ceiling) are documented in
  `docs/gates-and-deploy.md` before they are ever debugged twice.

## Build & verify

Run from `raptor-port/`, not the repo root. All FIVE, after any change:

> **ENVIRONMENT (owner, 17 Sep 26): the WINDOWS DESKTOP is the only place work
> happens.** He remote-controls that same session from his phone — the phone is
> a remote control, not a second environment. The container paths below
> (`/home/user/Raptor`, `/opt/pw-browsers/chromium`, the agent proxy) are
> LEGACY, kept only for their measured traps; do not follow them literally here.

> **Background commands start at the REPO ROOT, not `raptor-port/`.** A
> foreground command inherits the session's `raptor-port/` cwd, but a
> `run_in_background` job launches a fresh shell at the repo root, where
> there is no `package.json` — so a bare `npm run test:e2e` (or any `npm`
> script) fails INSTANTLY with `ENOENT … package.json`, and the wrapper's own
> exit code can read 0, masking it. ALWAYS `cd` into `raptor-port/` inside a
> backgrounded gate. This bit twice (test:e2e, 30 Aug 26)
> and each miss wastes a full ~10-minute re-run. **Enforced since 26 Sep 26** ([BG-CWD-GUARD],
> D162): a hook, `../.claude/hooks/bg-cwd-guard.mjs`, refuses a backgrounded `npm`/`npx` that never
> moves into `raptor-port/` (`cd raptor-port &&`, `Set-Location raptor-port;` or `npm --prefix raptor-port`).


```
npm test                    # Vitest — must stay green
npm run build               # typecheck + build
node reference/tfin.js      # the original's assertions — must stay 728/0
npm run test:e2e            # geometry in a real browser — builds & serves itself
npm run smoke:tracker       # the Tracker tab's vendored 345-check browser suite — builds & serves itself
```

`test:e2e` is a gate of its own because jsdom has no layout engine: a puck that
had silently grown to 90px passes `npm test` all day. It runs in CI too.

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

UI-visible work also needs the wider browser path:
`probes/run.cjs <name> port`, `npm run probes:adapted` (the six adapted
probes), `npm run perf` (the DOM ceilings and two behavioural checks, with
the reference-vs-port timings printed alongside) — all against that same
preview.
A fresh checkout needs `npm ci` first.
**Stopping a stray preview server: kill by PORT, never by a command-line
pattern.** On WINDOWS: `Get-NetTCPConnection -LocalPort 4173` → `Stop-Process`
(`:4179` for the smoke suite's). The legacy container form was
`lsof -ti :4173 | xargs -r kill`. Never `pkill -f "vite preview"` /
`pgrep -f … | xargs kill` inside a compound command: it matches the CALLER's own
shell (its command line carries the pattern) and kills it — exit 144, the rest
of the line never runs. It happened three times in one day (9 Sep 26) despite
two logged warnings; the port form cannot express the mistake.
**A NEW Playwright script uses the repo's own fallback, NOT a hardcoded path**
(corrected 17 Sep 26 — the old rule said every script "must pass
`executablePath:'/opt/pw-browsers/chromium'`", which on the Windows desktop
fails with the very "Executable doesn't exist" error it warned about).
`playwright.config.ts` and `scripts/tracker/smoke.mjs` both do
`existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}` — copy that: the
container symlink when it is there, Playwright's own browser otherwise. IN THE
CONTAINER ONLY, never run `npx playwright install` — it re-downloads for
nothing. The probes in `reference/probes/` still hardcode the container path.
Login is `ad`/`a` (admin, signed in as Saber) or `us`/`us` (squadron member, signed in as Ranger — NOT view-only
since 5 Aug 26: a member edits their own Inputs and their own Quals row; the split is in `docs/engine-rules.md` §Auth /
roles). Since `[ACCOUNTS]` (26 Sep 26, D166) these are two SEEDED accounts among others on Admin → Users — every account
is one person — not hard-coded logins; an account the admin adds takes any password (the sign-in stands for the
defence mail's; the app keeps no password), a name on no list lands on "Request access". The account names changed from
a/a · user/user on 24 Aug 26 (owner ask, which also removed the credentials hint from the sign-in card — don't re-print
them there). The username is lowercased before matching; the two seeded passwords are compared
exactly, so `AD`/`a` works and `ad`/`A` is rejected.
Login is `#luser` / `#lpass` / `#loginForm button[type=submit]`, same
as `e2e/app.ts`, and `#vWeek .day` is the "week is up" signal. Watch console
errors, page errors and 4xx responses on the way through; screenshot the
element in question and LOOK at it. *(Copied 24 Sep 26 from the container-era
paragraph archived below, which carried them.)*

**The deployed-site check, the container-only launch recipe, Pages publishing and the two deploy channels** (7 Aug – 17 Sep 26) — overtaken by D59 (Pages gone), D89 (checks on his PC) and D143 ("done" = live on Vercel); moved 24 Sep 26, whole, to `docs/archive/raptor-claude-md-2026-09-24.md`. What is live now: `../.claude/rules/shipping.md` (loaded in every chat) and `docs/gates-and-deploy.md`.

## Architecture rules (apply to nearly every task)

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

**The store.** `notify()` bumps a version; components subscribe via
`useVersion()` (useSyncExternalStore) and re-read the singletons.
`state/view.ts` holds UI state the engine reads (CURPAGE, SBDAY, ARM,
selection) as module `let`s with same-module setters — ESM can't
reassign across modules. `WARN`/`REST`/`EVD` are reassigned by every
`validate()`: always re-read, never cache.

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

- Flying seat `di.gi.li.ai.seat` (no prefix) — day, wave, formation,
  aircraft, seat `p` (FCP) or `w` (RCP).
- Duty `d:di.dwi.ri` · Sim `s:di.kind.ri` · Ground `g:di.ri` ·
  Programme `a:di.ri` · `.+` appends · `.xN` is overflow `row.more[N]`.
- `iu:<iid>` — an Unavailable row's person-reassign arm/drop target. The
  input's own id, no day component (one input can cover several loaded
  days, and none is more "its" day than another); addresses `INPUTS`, not a
  schedule row, so it never runs through `slotVal`/`setSlotVal`/`fillSlot` —
  `reassignInput` (`ui/inputedit.tsx`) is its one write path.
- Text keys: `dn:` day note · scheduler notes `pn:` programme, `dtn:` duties,
  `sn:` sims, `gn:` ground · `ap:` programme · `wl:`
  wave label · `ff:` formation · `fr:` flight remarks · `it:` in-times ·
  `dl:/dr:` duty · `sr:` sim · `gr:` ground · `st:` stores ·
  `ar:/at:` area/area-time · `tr:` traffic.

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
any existing person by id OR callsign (the closed add back-door). Sim `who` is FREE TEXT only now — never resolved to a person.
Parity holds byte-for-byte: `data-person` and the printed name both derive from
the resolved id, so an id-form `who` renders identically to a callsign one.

**The mutation funnel — bypassing it is always a bug.** All schedule
writes go through `slotVal`/`setSlotVal`/`fillSlot`/`txtGet`/`txtSet` →
`noteChange(key)` → `afterSchedMutate()`. A write that skips it is
never re-validated, never persisted, wears no amendment mark and leaves no
edit-log entry. **CORRECTED 17 Sep 26:** it is NOT "absent from the next AL" —
since the amendment core, `publish.ts` derives eligibility, the panel counts and
the stored diff from the canonical `dayDelta`, "never from the accumulated
pending marks", so a funnel-bypassing write DOES surface in the next AL as an
unmarked, unexplained change. That is worse than being absent, not better. Deletes renumber the live key space first, then
call `markDeletion(di, kind)`: its inert `del:di.seq.kind` tombstone reaches
the AL without re-marking the address now occupied by a shifted row. On an
already-published day, compare the removed structure with the current issued
snapshot and its remapped draft-add identity first: add, reorder, then delete
before the AL is a net no-op, not a removal. The bare
`markEdit()` after it remains only the render/history epilogue.

**The persistence funnel — a write that ends anywhere else is LOST on reload**
(owner's 8 Sep 26 bug pass; moved here 17 Sep 26 from the §Where things live
Storage row, where nobody scanning for rules would find it). Every mutation of
`DAYS`/`SCHED`/`INPUTS`/`PEOPLE`/`PLAN` must end in **`HOOKS.histPush`** (never
the raw `histPush`), undo/redo, `loadWeek`, or an explicit `persistPeople()`.
Anything else is silently unsaved after a reload — no error, no clue, the edit
just isn't there next time. Leave War: whatever it owns about a person beyond
the projection goes in a persisted record laid back on by `setPeople`.

**WHAT ACTUALLY PERSISTS (verified 17 Sep 26 — read this before believing any
"session-only" sentence elsewhere in this file).** A BUILT SITE runs on the
Browser backend (`storage/boot.ts chooseBackend`), and across a reload it KEEPS:
`INPUTS`, `PEOPLE`, the `plan` layer (PLANPUCKS/DAYRMK), every stashed week AND
the live week (`persistAll`), the 14 durable settings keys (incl. `qualcols` and, since `[ACCOUNTS]`, `accounts`, `accessreqs`, `guestview`),
the whole Leave War world, the Tracker's `ocu:` data, and medical documents
(IndexedDB). MEMORY-ONLY is now just the `vite` dev server, `MODE==='test'`,
`?fresh=1`, or a browser whose storage cannot be touched. Genuinely still
session-only, by design: **undo/redo history, the edit log, and the view-state
registries (`LATEOFF`, the armed slot, selection)** — none is in `persistAll`.
Several August "session-only / a reload forgets" rules elsewhere in this file
were written before the 8 Sep 26 storage work and are marked superseded where
they sit; if you find another, it is stale — fix it, don't obey it.

**React owns chrome, strings own density.** The dense surfaces (week,
board, palette) are built by verbatim HTML-string builders and swapped via
innerHTML with string-diffing — that is what preserves scroll, carets and
the phone perf budget. Don't convert them to components.

**The Leave War tab is a SECOND app with a SECOND store** — its architecture (its own store and storage seam, what it persists, the one absence record, the four seams that cross the boundary and only four) moved 24 Sep 26, whole, to `../.claude/rules/decisions/leave-war.md` §Architecture, which loads with any Leave War file and with every file where it meets the rest of the app.

**The Tracker tab is a THIRD app with a THIRD store** — its architecture (its own store and storage doorway, the file is a format not a store, stable ids, the three seams, the same access for everyone — D121, the standalone export) moved 24 Sep 26, whole, to `../.claude/rules/decisions/tracker.md` §Architecture, which loads with any Tracker file and with every file where it meets the rest of the app.

## Coding conventions

- **`src/engine/` bodies are verbatim ports.** Compressed one-line style,
  semicolons, `:any` annotations — leave it alone. A diff there should be
  the behaviour change and nothing else; no tidying, no reformatting.
- **`src/ui/` and `src/state/` are ordinary TS/React**: 2-space indent, no
  semicolons, single quotes.
- **Comments explain WHY**, in prose, above the code — often the bug they
  fix. That density is the house style; match it.
- **`scheduler.css` carries measured contracts, not preferences.**
- **Every bug fix lands with a test that pins it**; new features get new
  tests. Never weaken a failing assertion — understand it.
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
- **Keep `docs/feature-impact.md` true in the same PR** (owner, 12 Aug 26 — the
  WALK itself is the 28 Aug standing order at the top of this file, which holds
  the surface list, the flows and the drift-seams): a feature that adds a
  surface, a flow, or a new drift-seam adds a line there.

## Stable decisions (do not relitigate)

Each entry is a tripwire: the decision is SETTLED — don't rebuild, re-propose or
re-litigate it. Where a reference doc holds the full story, the line keeps the
decision + a pointer. Owner + date establish authority; keep them.

### Pipeline & repo invariants
- **Push a BRANCH freely; ASK before `main`** (D60) and **never push while a PR's checks run** (D151) — moved 24 Sep 26 to `../.claude/rules/shipping.md`, loaded in every chat.
- **Do NOT watch PRs** (15 Aug 26) — moved 24 Sep 26 to `../.claude/rules/shipping.md` §Pull requests, loaded in every chat.
- `reference/` is **read-only** — the spec for existing behaviour. New features go
  beyond it but must not break it.
- The engine's original **generator is DELETED** (git history keeps it). Never
  recreate or rerun it — the engine is ordinary source now; regenerating clobbers
  real work.
- Keep `src/probe-bridge.ts` in sync when adding engine API.
- **Product invariants** (owner, 7 Aug 26 unless noted): no rule versioning (narrowed 26 Sep 26 by D186: a
  published day keeps the brief lead it printed, with it — one printed value, not a versioned rulebook) · no
  two-person approval · no "publish all days" · OIL is LL-equivalent · sim notes
  single-line · pucks never wrap · login page stays simple · the talon logo stays
  · a clicked warning lights its crew in the warning colours, never selection blue
  (blue is the puck-click selection only) · **no My Programme page** (built +
  removed the same day; don't re-propose — `git revert` restores it if he asks).
- **No Edit-mode toggle** (owner, 9 Aug 26 — removed after months). Being on Edit
  Schedule IS edit mode; View-only Sched is read-only. `HOOKS.editMode()` =
  `canEditSched() && CURPAGE==='editsched'` — don't add a third term.

### Standing UI / design rules
- **A click-open popup closes on a click outside it** (owner, 4 Sep 26). Any
  transient panel/menu/palette a tap OPENS must dismiss on an outside
  pointer-down (and, where sensible, right after the choice that finished it).
  `Sheet` does this via scrim+Escape; a smaller inline popup adds a capturing
  document `pointerdown` listener, treating a press on the popup or its toggle as
  "inside" (worked example: the ⚙ colour palette, `SettingsSheet.tsx`).
- **A control the user TAPS REPEATEDLY must not move under them** (owner, 2 Sep
  26). `RangePicker` pads EVERY month to a constant six rows so the ‹ › month
  arrows (and the bottom-anchored sheet) hold still. Raptor's TOP-anchored
  calendars (`InputsCal`, `WeekCal`) grow downward, arrows already fixed —
  unchanged (checked). General rule: keep a repeated-tap control's screen
  position invariant to the content it changes. Pin: `rangepicker.test.tsx`.
- **The highlight MENUS read apart from their CHIPS** (owner, 25 Aug 26). `.hl-gtab`
  is a solid RAISED control (`--ink`, bold caret); `.fchip` stays flatter/quieter
  (`--panel-2`/`--ink-2`), filling blue (`--accent`) only when picked; an open
  `.hl-grp.open` wraps tab+chips in one tray (scoped to `.filters`/`.ic-pick-cats`
  — don't restyle the bare `.hl-grp`, History reuses it). Don't flatten tabs back
  to the chip recipe. `scheduler.css`; strip is `ui/hlchips.tsx`.

### Moved to the area files (24 Sep 26, D140)
Each group below now loads BY ITSELF, with its area's files (`../.claude/rules/decisions/`); its old sub-heading name is
kept here so a pointer written before the move (a code comment, a spec) still lands. Planning in an area before
opening its code? Open its area file first — `../.claude/rules/doc-structure.md`.
- **Leave War roster & display** (owner, 3–4 Sep 26) — moved 24 Sep 26, whole, to `../.claude/rules/decisions/leave-war.md` §Settled before this list (loads with any Leave War file).
- **The late-input mark** (owner, 9 Aug 26 unless noted) — moved 24 Sep 26, whole, to `../.claude/rules/decisions/scheduler.md` §Settled before this list (loads with any scheduler, board, engine or storage file).
- **Board behaviour** — moved 24 Sep 26, whole, to `../.claude/rules/decisions/scheduler.md` §Settled before this list (loads with any scheduler, board, engine or storage file).
- **Waves & duties — templates and defaults** — moved 24 Sep 26, whole, to `../.claude/rules/decisions/scheduler.md` §Settled before this list (loads with any scheduler, board, engine or storage file).
- **Drag-reordering (sections, waves, dense rows)** — moved 24 Sep 26, whole, to `../.claude/rules/decisions/scheduler.md` §Settled before this list (loads with any scheduler, board, engine or storage file).
- **Time format** — moved 24 Sep 26, whole, to `../.claude/rules/decisions/scheduler.md` §Settled before this list (loads with any scheduler, board, engine or storage file).
- **Week navigation & cross-week continuity** — moved 24 Sep 26, whole, to `../.claude/rules/decisions/scheduler.md` §Settled before this list (loads with any scheduler, board, engine or storage file).
- **Inputs & Admin** — moved 24 Sep 26, whole, to `../.claude/rules/decisions/scheduler.md` §Settled before this list (loads with any scheduler, board, engine or storage file).
- **Leave War grid & scheduler render/drag performance** — moved 24 Sep 26, whole: the scheduler half to `../.claude/rules/decisions/scheduler.md` §Settled before this list, the Leave War half to `leave-war.md` (each loads with its files).

## Where things live

| Need | Go to |
|---|---|
| **The implementation-role policy** (approved-spec discipline, verification without self-approval, review integrity, the closing report) — auto-loads via `paths:` whenever `raptor-port/src`, `e2e`, `probes` or `scripts` are touched, so it is live during any build | `../.claude/rules/raptor-executor.md` |
| **The plain-language rules, in force EVERY session** (unscoped, so they load before any project file is read — this file's §How to work here stays the source of truth and the why) | `../.claude/rules/plain-language.md` |
| **EVERY RULING THE OWNER HAS MADE, and the file that carries each one** — one file per area, filed the moment he rules, before the work it implies; How we work loads every session, each other area when its files are read (D137) — and each area file carries that area's settled decisions and architecture too (D140) | `../DECISIONS.md` (the map) → `../.claude/rules/decisions/`, replaced ones `../DECISIONS-ARCHIVE.md`; the rule `../.claude/rules/record-decisions.md` |
| **HOW TO BUG-CHECK — the standing order** (the tiers, the roll-call, the walk, the evidence sheet, and which jobs to spend Fable/Codex on). Read before any bug check | `docs/bug-check-order.md`; the two proposals it was merged from are `docs/superpowers/briefs/2026-09-21-bugcheck-method-fable.md` and `…-codex.md` |
| Validation, VCONF, publishing/AL, auth, history | `docs/engine-rules.md` |
| **What is stored, every record's fields, the three storage seams** (read before the shared-database step) | `docs/data-schema.md` |
| **The designed data model for the database step** (entities, ids, Person ↔ Enrolment ↔ Attempt, migration recipe — the technical team's document) | `docs/data-model.md`; the scheduler's declared record types `src/engine/schema.ts` (pinned to the seeds by `schema.test.ts`) |
| **The Dataverse handover** — the technical expert designs the tables himself (owner, 10 Sep 26); this is what he reads, what we need from him, the non-negotiables, and what we do on our side (stable ids first, then ONE adapter to HIS tables — never pre-built) | `docs/handover-dataverse.md` |
| **The architecture direction** — modular apps on a common data source: what the recommendation means here (a modular monolith front end, ONE backend, ONE database, an API contract per module, feature flags), the target shape, the order of work, the practices to hold to (read before any backend / server / API work, and before proposing to split a module out) | `docs/architecture-direction.md` |
| **The command layer & undo contract** — the ONE front door for how the app records change: the change stream (envelopes, causal closures, revisions), the per-store `write()` seam, and the checklist a NEW module or a NEW undo feature must satisfy so it plugs into the one shared structure instead of a fourth store-pattern (read before designing any new module that writes data, or any new undo capability — per-person / whole-import / global undo, the database) | `docs/undo-contract.md` |
| **Storage: the whiteboard, postman, backends, boot gate** | `src/storage/` — the ONE route to a backend (whiteboard → postman → Memory/Browser backend); `src/state/persist.ts` hydrates/persists live scheduler state. **The persistence rule itself now lives in §Architecture rules ("The persistence funnel") — read it there.** **Medical documents (photos/PDFs) are too big for that text seam, so they get their OWN per-browser drawer** — IndexedDB `raptor-docs` (`src/storage/docstore.ts`), wired by `docBoot` from `main.tsx` on the browser backend only; `state/docs`' in-memory map is the sync read path, `docAdd` writes through, `docBoot` hydrates it at boot (8 Sep 26). What is stored: `docs/data-schema.md`. |
| Rendering, drag & drop, text editing, AL marks | `docs/ui-contracts.md` |
| **Which surfaces a feature touches + how one edit flows** | `docs/feature-impact.md` |
| **Where things stand and what is next — the ONE handoff** (a block per chat under `## Now`; a new chat reads it first). Since 24 Sep 26 (D140) it holds current state only | `../HANDOFF.md` |
| **Open work — the ONE backlog** (the priority list first; a finished item leaves for its archive by script) | `../OUTSTANDING.md` (finished: `../OUTSTANDING-ARCHIVE.md`, searched) |
| **Every source file and what it does** — edit it in the same change that adds, removes or renames a file | `docs/file-map.md` |
| **How the gates and the deploy mislead; the checks on his PC** — read before trusting or re-running a red check | `docs/gates-and-deploy.md` |
| **How a change ships** — the branch loop, "merge live", what "done" means (always loaded) | `../.claude/rules/shipping.md` |
| **Where each kind of new fact goes, and when it leaves** (always loaded; D140, D141) | `../.claude/rules/doc-structure.md`; the policy and tiers `docs/doc-budget.md` |
| The history — how each past thing was found, fixed and shipped | `../HANDOFF-ARCHIVE.md` (a FROZEN snapshot as of 4 Sep 26; search it, never read it whole, never append to it); finished documents and passages moved out since, each unchanged: `docs/archive/` (its `README.md` lists them); then `git log` |
| Probe → reference → port results | `docs/probe-sweep.md` |
| **Every typed remark that switches a rule on** — the seed of the user guide; keep it true as rules are added | `docs/remarks-vocabulary.md` |
| Skill-improvement observations captured during sessions (the ONE log, committed) | `../.claude/skill-observations/log.md` |
| What changed recently | `git log --oneline` (not duplicated here) |
| Last session's leftovers | the chat's own block under `## Now` in `../HANDOFF.md` (the old `docs/session-state.md` retired to `docs/archive/` on 24 Sep 26) |
| The rules engine | `src/engine/` — `validate.ts` is the heart |
| Store / UI state / undo | `src/state/` |
| Components + HTML builders | `src/ui/` |
| **The Leave War tab** (vendored app: engine, store, UI, tests) | `src/leavewar/` — its own store and `leavewar:` storage keys; role written only by `resetSession` (the admin's `toggleRole` is gone since `[ACCOUNTS]`, 26 Sep 26 — D166 (3)); stage-advance is admin-only (27 Aug 26, members still bid); a member bids only on their OWN row — the SIGNED-IN person (D166 (4); the "View as" person until `[ACCOUNTS]`), mirrored to `viewer` — while an admin edits any row (`canEditRow`, 27 Aug 26; enforced at the write path and the grid affordance alike); an admin decides bids at closed OR published (`canDecide`, 27 Aug 26 — since the 27 Aug overnight pass the STORE enforces it too: `setBidState`/`setBidStates` refuse anyone else, `shiftBid` carries `moveCells`' whole stage/window/war-day law, `moveProblem` is the one validation body the landing preview and the commit share, a chain of closed moves keeps the ORIGINAL `shiftedFrom`, and NO ONE writes a medical mark on the war — medical is MEMBER-FILED only since 13 Sep 26, reversing the 17 Aug "management's" rule: blocked at `setCell`/`setCellRange`/`setCells` for every role incl admin, the pickers removed; the war still DISPLAYS member-filed medical, read from the Inputs (step 4, 20 Sep 26)); a drag selects a block to batch fill/decide/move/delete and a plain click still opens the single-cell sheet (`select.ts`, capture taken in `arm()`); the dotted "moved" mark is recorded AND shown only for a move made once bidding is closed (`biddingClosed`, 27 Aug 26 — an open-bidding shuffle stores no `shiftedFrom`, so it never sprouts the stripe when the war later closes); the colour pop-out is "Legend"; at PUBLISHED a tap on an approved leave opens the remarks editor (`RemarksSheet` → `sync.ts:leaveInputAt` + `inputedit.ts:setLeaveRemarks`, member edits own / admin any); CSS scoped under `#page-leavewar`; gaps in `docs/leavewar/known-gaps.md`, future sync in `docs/superpowers/specs/leavewar-sync.md` |
| **The Tracker tab** (vendored OCU progress tracker: syllabus flow charts, marks, pace) | `src/tracker/` — plain JS/JSX, its own store (`app/core.js`) and storage doorway (`storage.js`, `ocu:` keys), CSS scoped under `#page-tracker`; no role — admin and member have the same access, File menu included (D121, 23 Sep 26); `role.js` carries only the login-session end from `resetSession` (the file is a format, not a store — 9 Sep 26); page seam `TrackerPage.tsx`, kept mounted once visited; its browser suite `scripts/tracker/smoke.mjs` (`npm run smoke:tracker`, a CI job); gaps `docs/tracker/known-gaps.md`; the design specs it was built from `docs/tracker/specs/` |
