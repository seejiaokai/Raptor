# RAPTOR — 142 SQN Flying Programme (React app)

A flying-schedule planner for an F-15SG squadron: a week of flying waves,
duty crews, sims, ground events and personal inputs, with a validation
engine that flags crew-rest breaches, double bookings, missing briefs and
qualification problems, plus an amendment (AL) workflow for publishing
changes after a day is signed off. No server — per-browser localStorage.

This file is the INDEX. It holds the rules that apply to every task and
routes to where the detail lives; don't duplicate that detail back here.

## How to work here

**Reach 95% confidence before building.** If the request could reasonably
mean two different things, or a choice would materially change the result,
ask follow-up questions until it wouldn't. Small, unambiguous asks clear
that bar on their own — don't manufacture questions for them.

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
you are escalating, and why. And prefer BATCHES — most of the cost is
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
- **Tell him when you are DONE, with `PushNotification`** (owner, 10 Aug 26 —
  "give me a notification so that I know when to reply"). He steps away while
  a task runs, so send one when the work is genuinely finished — gates run,
  PR merged, nothing left in flight — and when you are BLOCKED and waiting on
  his answer. One line, plainly, what happened. Do NOT notify for progress
  updates, for a quick reply he is clearly sitting there watching, or twice
  for the same piece of work.
  **"Done" MEANS LIVE, and the notification is the one at the END of that
  chain** (owner, 12 Aug 26 — "ok let me know when it's live always and do
  these steps automatically next time till it's live"). A green gate is not
  done, a merged PR is not done, and neither is worth a notification of its
  own. Carry it the whole way without being asked and without checking in at
  each step: gates → PR → merge when green → wait for Pages → **load the real
  page and look at the thing you changed** (the 7 Aug standing instruction,
  §Build & verify) → then ONE notification saying it is live. The only reasons
  to come back sooner are a red gate you cannot fix, a genuine question, or a
  merge he has told you to hold. Waiting is not a reason: schedule a check-in
  (`send_later`) and let it fire, rather than reporting "still building".
- **Ship ONCE PER SESSION, at the end — not once per idea** (owner, 10 Aug
  26, after a session that shipped three times). Build and verify everything
  locally as you go, then make ONE PR carrying the lot. Still don't wait to be
  asked: when the work is done and green, ship it without a prompt (unless a
  gate is red, or the change was called an experiment, or the owner asks for
  a piece sooner — he sometimes wants one thing on his phone now).
  **Shipping is not how you test.** `npm run build && npx vite preview` is the
  same bundle that deploys, base path and all, so every check — including
  driving it in a browser and looking at it — happens before the PR. The
  deployed page only adds a DELIVERY check (a stale cache, a path wrong as
  served), which is real but rare.
  MEASURED, which is why this rule changed: each shipment costs ~3 min of CI
  plus 4–10 min of Pages rollout plus the live check — about 10 minutes of
  pure waiting, three times over in one session. Batching is worth more
  again on the build side: fifteen changes in one pass ran ~6 min each, where
  a single change shipped alone took an hour and a half.
- **Delegate frugally, by judgment.** The main session plans, reviews
  diffs and runs the gates first-hand. Scanning/exploration goes to
  Explore on **haiku**; multi-file or mechanical code-writing goes to
  general-purpose on **sonnet**, handed a precise spec (files, expected
  shape, which tests to run) so it never explores. Agents return diffs
  and conclusions, never file dumps. Small precise work stays inline —
  spawning an agent costs more than a one-file fix.
- **Token discipline.** Never let a tool dump raw output — pipe logs
  through `tail`/`grep`, ask GitHub MCP tools for `minimal_output: true`,
  paginate 5–10, and prefer a 2-line `curl | grep` over a full API object
  when checking one field. Never read `reference/` whole (6.6k lines) —
  `grep` it; same for any file over ~300 lines (Grep or offset/limit Reads).
  While iterating run only the affected test file
  (`npx vitest run <file>`); the full gate set ONCE, before the PR — not
  between the sub-changes of a batch. Four full passes is ~20 wasted minutes,
  and that is a real reading from 10 Aug 26, not a caution.
  Trust this index instead of re-exploring. Prefer a fresh
  session per task; a long conversation re-sends itself every turn.

**Task-observer activation (owner, 15 Aug 26).** At the start of any
task-oriented session — any interaction where you will use tools and produce
deliverables — invoke the `task-observer` skill before beginning work, so
skill-improvement opportunities are captured throughout the session. When
loading any skill, also check the observation log for OPEN observations tagged
to it and apply their insights even if the skill file has not been updated yet.
A vendored `SessionStart` hook (`.claude/hooks/task-observer-session-start.sh`,
wired in `.claude/settings.json`) is the enforceable half of this; this line is
the structural half that survives compaction. This repo's web sessions are
ephemeral, so the observation log does not persist on its own — use the skill's
handoff-doc mode, or commit the log into the repo if it should last. Provenance
and opt-out: `.claude/skills/TASK-OBSERVER-VENDORED.md`.

## Product bar & ideation (owner, 7 Aug 26)

Distilled from the owner's product-standards brief; this section IS the
standard — the full brief is deliberately not kept. Autonomy is unchanged:
the confidence rule above still decides when to ask, and green gates still
ship without waiting to be asked.

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
- **Scope is the ask.** Improvements noticed en route are REPORTED as
  options, never built unasked. A rejected or rolled-back idea is recorded
  in §Stable decisions and never reintroduced silently.
- **Verified vs assumed, always distinguished.** "Checked" means read or
  run first-hand this session; anything else is stated as an assumption.

**Scoping any new work weighs four axes** (owner, 7 Aug 26), each grounded
in what this repo actually has rather than a generic checklist:

- **Performance & scalability.** The perf gate's law is the DOM CEILINGS in
  `probes/perf-port.cjs`, re-measured, never quoted. A feature that grows
  the DOM raises its ceiling as a deliberate, argued edit in the same PR.
  The three per-node TIMING budgets are no longer assertions (owner, 10 Aug
  26 — they caught nothing in the life of the repo and went red on unchanged
  code); they are still measured and printed, so read them, but a wandering
  number is not a gate failure. Reasoning: `docs/probe-sweep.md`. Dense surfaces stay string-built (§Architecture).
  True scaling — shared data, real accounts — is server work (HANDOFF's
  first bullet); until then every write goes through the mutation funnel
  and storage through `HOOKS.storeBackend`, which is precisely what keeps
  that migration possible. Do not add state outside those two paths.
- **User experience.** The bar above, plus the standing proof: the
  live-view pass in §Build & verify IS the UX check — drive the built
  bundle, screenshot, and look, before calling anything done.
- **Security.** No secrets, tokens or credentials in the repo or its
  history — the deploy needs none. Every user-entered string is escaped at
  the builder (two unescaped sinks were found 6 Aug; assume more is
  possible). Role checks live at the PAGE and the write path, not the nav
  (`canEditSched`, `resetSession` — the 6 Aug lesson). And never present
  the prototype auth as security: the site is public, accounts are
  hard-coded, and anything genuinely sensitive stays out of the demo data.
- **Future development & DevOps.** Ship through the gated pipeline only —
  four gates in CI on every PR and push, plus the two local-only gates for
  UI work; nothing deploys red. Write for the next session: comments say
  WHY, `HANDOFF.md` stays true in the same PR, decisions that must not be
  relitigated go to §Stable decisions, and the deploy traps (OIDC re-runs,
  the ten-minute Pages ceiling, dispatch-cancels-push) are documented in
  HANDOFF before they are ever debugged twice.

## Build & verify

Run from `raptor-port/`, not the repo root. All four, after any change:

```
npm test                    # Vitest — must stay green
npm run build               # typecheck + build
node reference/tfin.js      # the original's assertions — must stay 728/0
npm run test:e2e            # geometry in a real browser — builds & serves itself
```

`test:e2e` is the fourth gate because jsdom has no layout engine: a puck that
had silently grown to 90px passes `npm test` all day. It runs in CI too.

**Stand up the live view for any UI-visible task, every session** (owner ask,
6 Aug 26 — a standing instruction, not a per-task one). Build, serve, and
drive the real thing in a real browser BEFORE saying it works:

```
npm run build && npx vite preview --port 4173     # the production bundle
```

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
A fresh container needs `npm ci` first — `node_modules/` is not in the image.
Any NEW Playwright script must pass `executablePath:'/opt/pw-browsers/chromium'`
(a stable symlink): the pinned Playwright looks for a browser build the image
doesn't ship, so a bare `chromium.launch()` dies with "Executable doesn't
exist … run npx playwright install" — do NOT run that, it re-downloads for
nothing. Every probe in `reference/probes/` already hardcodes the path.
Login is `a`/`a` (admin) or `user`/`user` (squadron member — NOT view-only
since 5 Aug 26: a member edits their own Inputs and ticks their own quals;
the split is in `docs/engine-rules.md` §Auth / roles). The username is
lowercased before matching, the PASSWORD is compared exactly, so `A`/`A` is
rejected.
**The deployed site is reachable now, and checking work against it is a
standing instruction (owner, 7 Aug 26).** The proxy used to answer 403 for
`github.io`; the owner opened it, and both the page and `githubstatus.com`
were driven end to end from the container on 7 Aug. **After every change that
ships, load the real page and look at it** — do not report a change as live
on the strength of a green workflow.

The two checks answer different questions and neither replaces the other: the
`vite preview` above is the bundle BEFORE it ships, and it is what you iterate
against; the deployed page is what the squadron actually gets, and it is the
only thing that can show a fault introduced between the build and the browser
— a stale CDN cache, a base path wrong as served, an asset that 404s only
under the `/Raptor/` sub-path. Sequence is: preview while building, gates,
merge, then the live page once Pages has rolled over.

Reachability, and the reason if it ever closes again:

```
curl -sS -o /dev/null -w '%{http_code}\n' https://seejiaokai.github.io/Raptor/
curl -sS "$HTTPS_PROXY/__agentproxy/status"      # logs each rejected host
```

`000` means blocked again — report the blocked host, never route around it,
and fall back to the preview plus the workflow's job conclusions.

**Driving it needs three launch settings Chromium does not take from the
environment** (7 Aug 26 — a bare `chromium.launch()` fails with
`ERR_CONNECTION_RESET`, which reads like the site is down and is not):

```js
chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  chromiumSandbox: false,                              // sandbox + proxy = instant exit
  proxy: { server: process.env.HTTPS_PROXY },          // NOT inherited from the env var
  args: ['--ssl-version-max=tls1.2'],                  // TLS 1.3 handshakes get reset
})
```

Those three are the whole recipe — `ignoreHTTPSErrors` is NOT needed despite
the proxy re-signing TLS (measured both ways, 7 Aug 26: the CA is already in
Chromium's NSS store). Do not add it reflexively; it would mask a genuine
certificate fault later.
The reset is worth recognising on sight: it is silent at the proxy (only
Chromium's own telemetry shows up in the failure log), it hits every host and
not just this one, and it is TLS, not policy — a 403 is policy, a reset is
this. Login is `#luser` / `#lpass` / `#loginForm button[type=submit]`, same
as `e2e/app.ts`, and `#vWeek .day` is the "week is up" signal. Watch console
errors, page errors and 4xx responses on the way through; screenshot the
element in question and LOOK at it.

Push to `main` → `.github/workflows/deploy.yml` reruns the gates and
publishes to **https://seejiaokai.github.io/Raptor/**. Nothing deploys red.

**Two deploy channels, different jobs** (owner, 15 Aug 26 — the GitHub round
trip felt like ~20 min per change and was unsustainable):

- **Vercel is the FAST per-branch preview** — `vercel.json` at the repo root
  builds `raptor-port` and every push to any branch/PR gets its own live URL
  in ~1 min, no test gate in the way. This is the channel the owner taps on
  his phone/laptop to review a change mid-session, and the one to point a
  browser drive at while iterating (same recipe as the deployed page — it is
  a real hosted build, base path and all). It is NOT gated, so a red preview
  is still just a preview; correctness still rides the four gates below.
- **GitHub Pages stays the OFFICIAL site** — the gated `deploy.yml`, published
  only on merge to `main`. Slower (gates + a Pages rollout of 2–10 min, the
  latter outside our control), so it is paid ONCE per session at the end, not
  per change. The "done means live" chain still ends here.

So the loop is: iterate against the local `vite preview` (instant, what you
drive), let the owner eyeball the Vercel preview when he wants to tap it
himself, and ship to Pages once at the end. The CI gate itself was sped up
15 Aug 26 (the browser download is cached and the geometry suite runs 3
workers with one CI retry — NOT all cores; '100%' starved the preview server
and flaked a carry-day test on its first main run, see playwright.config.ts —
deploy.yml + playwright.config.ts), so the checking wait is ~2–3 min, not ~5.
**Docs-only changes skip the gates entirely** (`paths-ignore` in deploy.yml:
`**.md` + `.claude/**` — verified nothing there reaches the bundle), so a
handoff PR has NO checks to wait for: push, merge at once, done. A PR mixing
code and docs still runs everything.

## Architecture rules (apply to nearly every task)

**The store.** `notify()` bumps a version; components subscribe via
`useVersion()` (useSyncExternalStore) and re-read the singletons.
`state/view.ts` holds UI state the engine reads (CURPAGE, SBDAY, ARM,
selection) as module `let`s with same-module setters — ESM can't
reassign across modules. `WARN`/`REST`/`EVD` are reassigned by every
`validate()`: always re-read, never cache.

**The slot-key grammar** — everything addresses through this, and the day
index is always first after the prefix (`keyDay()` depends on it):

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

**The mutation funnel — bypassing it is always a bug.** All schedule
writes go through `slotVal`/`setSlotVal`/`fillSlot`/`txtGet`/`txtSet` →
`noteChange(key)` → `afterSchedMutate()`. A write that skips it is
invisible to the amendment machinery: not marked pending, absent from the
next AL, never re-validated. Deletes renumber the live key space first, then
call `markDeletion(di, kind)`: its inert `del:di.seq.kind` tombstone reaches
the AL without re-marking the address now occupied by a shifted row. On an
already-published day, compare the removed structure with the current issued
snapshot and its remapped draft-add identity first: add, reorder, then delete
before the AL is a net no-op, not a removal. The bare
`markEdit()` after it remains only the render/history epilogue.

**React owns chrome, strings own density.** The dense surfaces (week,
board, palette) are built by verbatim HTML-string builders and swapped via
innerHTML with string-diffing — that is what preserves scroll, carets and
the phone perf budget. Don't convert them to components.

**The Leave War tab is a SECOND app with a SECOND store** (vendored 16 Aug
26, `src/leavewar/`). It keeps its own store/notify/useVersion, its own
`state/storage.ts` seam (NOT `HOOKS.storeBackend`), and its own vitest project
(fixed TZ + jsdom + 20s timeout — see vite.config.ts). **It is session-only
since 17 Aug 26** — `main.tsx` boots it on `memoryBackend()`, so a reload
forgets the war and returns to the seed, deliberately matching Raptor's own
session-only `INPUTS` (before this it persisted to `leavewar:`-prefixed
localStorage while Raptor did not, and a synced cell reverse-cleared or
reappeared across a reload; both forget in lockstep now). `localBackend` still
lives in the seam for reference/tests; the future shared database backend
replaces the seam. Four seams cross the boundary, and only
four: `main.tsx` boots it once (`lwInitStore` → `installDemoWorld` →
`wireLeaveWarSync` → a `histInit` re-baseline, in that order), `resetSession`
derives its role from the Raptor login (the ONE writer), `probe-bridge.ts`
exposes `w.lwSetRole` for its e2e suite, and **`src/leavewar/sync.ts`** — the
sync wires (17 Aug 26; this seam also mirrors Raptor's "View as" person into
the Leave War store's `viewer` on every Raptor notify — what lights the
viewer's row and personalises the counter picker — a rider on this seam, not
a fifth): Leave War's roster is a boot-time PROJECTION of
Raptor's PEOPLE, approved leave crosses both ways as DERIVED
RECONCILIATION (outbound skips Raptor-owned cells, inbound skips lw-tagged
inputs — that pairing is the loop-breaker), and a PUBLISHED weekend/holiday
duty credits OIL as a third derived pass (wire 4, `runOilPass` +
`engine/oil.ts` — the ownership partition is by cell vocabulary, FS/HS vs
leave codes; details in `docs/superpowers/specs/leavewar-sync.md`). Editing
or deleting an lw-tagged input on the Inputs page carries back INTO the war
(owner, 17 Aug 26 — full two-way): `commitInputEdit`/`removeInput` call
`sync.ts:retractLwRow`, a Raptor-side caller of this same seam, not a new
one. The roster is a LIVE projection since 18 Aug 26: `sync.ts:reprojectRoster`
re-projects Raptor's PEOPLE on every Raptor notify (change-guarded), so a body
added on the Quals page reaches Leave War without a reload — a rider on this
same seam. Its DISPLAY is categorised (`engine/people.ts:groupOf` — SXO / IP /
OPS P by CAT / IWSO / OPS W by CAT / OCU / Personnel, colours from Raptor's
`--q-*`), and ground crew ride it (`pers`, seat `gnd`) but are skipped by every
manning count (`countsFor`); `categoryOf` and the thresholds are untouched.
Don't add a fifth seam casually,
and never call its `initStore` from a component — it clears the store's
subscribers.

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
- **Keep `../HANDOFF.md` true in the same PR.** A change that resolves (or
  creates) a known issue edits its list; a change that adds, removes or
  renames a file edits its file map. Stale is worse than absent — the next
  session trusts it.
- **Walk every non-trivial change against `docs/feature-impact.md`** (owner,
  12 Aug 26). Before building, and again before calling it done, ask which of
  the surfaces there it touches — warnings, layout, history, the board, edit
  vs view-only, desktop vs mobile, quals, availability, publishing, export,
  roles — and whether the touch is wired or missing. That file also holds the
  generic FLOWS (how one edit travels from a keystroke to the screen) and the
  drift-seams where two copies of one rule fall out of step, which is where
  this app's recurring bugs come from. **Keep it true in the same PR**: a
  feature that adds a surface, a flow, or a new drift-seam adds a line there.

## Stable decisions (do not relitigate)

- **Do NOT watch PRs** (owner, 15 Aug 26). The harness auto-watches a PR you
  open and injects every GitHub update — CI, review comments, and the Vercel
  preview bot — as raw `<wake>`/`<event>` blocks, which cluttered the owner's
  phone. It earns little here: the gates are run and the live page is checked
  BEFORE the PR opens, and the owner leaves no review comments. So immediately
  after opening any PR, call `unsubscribe_pr_activity` for it, and never leave
  one under watch. This does NOT change the ship-to-live duty — carry the PR to
  merged and verified on the deployed page as always (§How to work here); just
  do it without the watch subscription. If the owner ever asks you to babysit a
  specific PR, that explicit ask overrides this for that PR only.
- `reference/` is **read-only** — the spec for existing behaviour. New
  features go beyond it but must not break it.
- The engine was historically generated from the original; that generator
  is **deleted** (git history keeps it). Never recreate or rerun it — the
  engine is ordinary source now and regenerating would clobber real work.
- Keep `src/probe-bridge.ts` in sync when adding engine API.
- Product: no rule versioning · no two-person approval · no "publish all
  days" · OIL is LL-equivalent · sim notes are single-line · pucks never
  wrap · login page stays simple · the talon logo stays · a clicked warning
  lights its crew in the warning colours, never selection blue (owner
  declined the blue, 7 Aug 26 — blue is the puck-click selection only) ·
  **no My Programme page** (owner, 7 Aug 26 — a personal week-as-cards view
  was built, shipped and removed the same day: "don't find a use for it for
  now"; do not re-propose it unless the owner raises it, and if he does,
  the removed implementation is one `git revert` away in history).
- **No Edit-mode toggle** (owner, 9 Aug 26 — removed after shipping for
  months). Being on Edit Schedule IS the edit mode; View-only Sched is the
  read-only mode, and a second switch for the same job only created states
  (a live board on a dead page, controls that looked live and did nothing)
  that had to be guarded one at a time. `HOOKS.editMode()` is
  `canEditSched() && CURPAGE==='editsched'` — don't add a third term.
- **The late-input mark is a MARK, not a warning** (owner, 9 Aug 26, asked and
  answered explicitly). It never enters the day's checks list, never closes a
  slot and is invisible to `validate()` — that list stays about flying
  conflicts. And it measures the input's **last change**, not its first
  submission (same conversation): an input raised early and amended after the
  deadline still reads late, because the deadline exists so the week can be
  planned against something that has stopped moving. **Downchits are exempt**
  (same conversation): going DNIF is not a decision made in advance, and
  badging the one type that is always last-minute is how a mark stops meaning
  anything — leave and overseas duty stay in scope, because those are applied
  for. Don't re-propose any of the three.
  **And it reads in the REMARKS cell, not beside the name or the type** (owner,
  9 Aug 26 — moved there the day after it shipped). Remarks is where a reader
  already goes for "why is this man down"; the name and type columns stay pure
  identity. Every surface that draws an input has a remarks cell, which is what
  keeps the mark in one column everywhere — bar the board's promoted ground
  row, whose remarks cell is a bare `<input>` with nowhere to nest a chip, so
  that one keeps its amber row edge.
  **The word stays a word — a compact dot was offered and declined** (owner,
  9 Aug 26, after he raised a day carrying 10+ inputs). Measured before asking,
  on a day loaded to eleven personal inputs: on DESKTOP the mark costs nothing
  at all (666px block with and without it — the remarks column has the room);
  on a PHONE it costs 33px over eleven rows (757 vs 724) and squeezes that
  narrow column enough to split two long remarks mid-word ("Medic al appt").
  A dot measured 724 — free — and a phone-only dot was the recommendation.
  Owner chose to keep the word and wear the cost. Don't re-propose the dot,
  and don't "fix" the mid-word splitting by shrinking the badge. Two other
  ideas were measured and are dead ends, so don't retry them either: the word
  at the END of the remark saved nothing (759), and turning off mid-word
  breaking saved nothing (757). The badge's WIDTH is the whole cost, not its
  position.
  Rules: `docs/engine-rules.md` §The late-input mark.
  Placement: `docs/ui-contracts.md` §The late-input mark on screen.
- **Nothing on the board re-orders itself** (owner, 10 Aug 26 — "prevent a
  situation when the scheduler types and the line jumps"). Typing a role into
  a blank duty cell used to reposition the whole block; that is gone. Auto
  sort and Sort all are the only things that reorder a duty block, and they
  order it by START TIME, not by role rank. Do not add an automatic sort back
  to any board list. (The Ground Programme's render-time time sort predates
  this and stays — it was a separate owner request and already avoids the
  problem, since time-less rows sink to where the model appends them.)
- **MAIN/SPARE on a standalone line is ghost text, and it disappears when a
  remark is typed** (owner, 10 Aug 26). It was a permanent chip; the owner was
  shown the trade-off — a line carrying a remark no longer says whether it is
  main or spare — and chose ghost text anyway. Don't "fix" the disappearance.
- **Duties are decoupled from waves** (owner, 13 Aug 26 — supersedes the 10 Aug
  "AVALON auto-creates its desk; SC does not"). No wave auto-creates a duty desk,
  AVALON included, and deleting a wave leaves any duty block alone. Every desk
  now comes from the `+ Block` template picker: it lists the saved templates
  (`engine/dutytpl.ts`, persisted like the stores list) and copies a chosen
  template's rows onto the day as a PLAIN block — no `sa`/`noconf` marker, so a
  template desk is conflict-checked like any other duty row (the AVALON/BB desk
  exemption went with the auto-create). The seed week carries no exempt desk, so
  reference parity is untouched. Editor: `ui/DutyTplModal.tsx`. **Do not re-add
  `SAWAVE.autoDuty` or the wave-delete → `saDutyIx` linkage** — both were removed
  deliberately; `waveDutyBlock`/`saDutyIx` remain in `waves.ts` only for any AL
  snapshot still holding an old-style desk.
- **A new flying line comes up blank** (owner, 10 Aug 26). `+ Line` used to
  copy the previous line's callsign, mission and times; a plausible wrong
  value reads as filled in when nobody filled it in.
- **The phone board's top bar is ONE row, and the day is STEPPED BY ARROWS on
  the day strip below it** (owner, 11 Aug 26 — comp approved before build; the
  day was SWIPED until 12 Aug 26, see the amendment at the end of this entry).
  The seven Mon–Sun chips are dots
  now, `+ Line` is gone from the bar (every wave header already has one),
  undo/redo are on it, and every label is icon-only under 820px. Do not add
  a control back to this bar's FIRST LINE without taking one off: the whole point
  was getting it from 166px to 70px on a 780px screen, and the geometry gate
  counts ROWS, not just overflow. Desktop is unchanged.
  **AMENDED 11 Aug 26, once, with a measurement.** History added an eighth
  button and took nothing off, and the bar still measures 70px — but only
  because the same change fixed `.sb-title` to shrink instead of wrap
  (`flex:0 1 auto` → `flex:1 1 0`; an auto basis made the title's base size
  its full text width, so `.sb-top` wrapped it onto its own line and the bar
  went to 92px). The rule STANDS: that was the last free 33px, the day name
  is down to ~107px of a 390px screen, and the next control genuinely has to
  displace one. The changes LIST is the worked example of the alternative —
  it wanted a ninth button and went to the day's checks panel instead
  (`docs/ui-contracts.md` §History on the board).
  **The dots are also a scrub bar** (owner, same day) — press and slide to
  run through the week. Every dot keeps the same footprint whatever is
  selected; do not make the current one grow, it shifts the strip under a
  tracking finger.
  **THE DAY IS STEPPED BY TWO ARROWS, AND THE SWIPE IS GONE** (owner, 12 Aug 26
  — "remove the swipe for the mobile scheduler board too. Just put arrows at the
  edges of the bar at the top to navigate left and right between days"). Do not
  rebuild the swipe. It was itself an owner ask on 11 Aug and it ran through
  three shapes in a day and a half — a jump on a distance threshold, a carousel
  tracking the finger behind a preview pane, then that carousel with its
  hit-testing, settle and animation reworked and a phone-only gate — each round
  paying back what the last one cost. `#sbPrevDay`/`#sbNextDay` call
  `boardDayStep(±1)` and are DISABLED at the week's ends (a gesture cannot show
  that it is refusing; a button can). They flank the DAY STRIP rather than the
  bar's first line, which has 6px of slack and would have had to give up the day
  name; the bar went 70px → 75px and nothing came off line one. Above 820px they
  are not drawn — a desktop bar already carries all seven days as chips, which is
  why it never needed either control. The dots stay, still a scrub bar: they are
  the only thing that says WHICH day is open. Gone with the swipe: the
  `.sb-pane` preview and `.sb-main`'s own `touch-action`, so the scroller is the
  browser's default again.
  **THE DAY NAME ON THAT BAR IS THREE LETTERS ON A PHONE** (owner, 12 Aug 26 —
  "Seems like the Wednesday blocked off the date"). The title box ellipses, so
  the long day names were eating the date beside them. The word is SPLIT — `Wed`
  plus a `.bl` tail — not shortened, so desktop still reads `Wednesday` off one
  markup path, and three letters is what the dots and `dowShort` already use.
  Don't "restore" the full word on the phone, and don't shorten the desktop one.
  `boardTab` is view-only: it must not validate, and its board-only notification
  lane must not wake the mounted EditWeek or EditRoster. Real mutations still use
  the global lane and repaint both.
  Contract: `docs/ui-contracts.md` §The board on a phone is ONE window.
- **No drag-to-section** (owner, Aug 26 — dropped after the buttons shipped).
  Moving an `Other` row to Ground or Unavailable is the `→ Ground` /
  `→ Unavail` buttons in `html.ts`, on both the week and the board. Don't add
  drop targets to `drag.ts` for it; that machine stays scoped to pucks.
- **No ⋯ collapse of the phone row control strips** (owner, 16 Aug 26 — built,
  shipped and rolled back the same day). Every flying/duty/sim/ground row's
  `▲▼/CX/■/✕` strip was tucked behind one ⋯ (a `CTLOPEN` view state, one row
  open at a time); the owner asked to undo it. The full implementation is one
  `git revert` away (the "collapse each row's control strip behind a ⋯" commit),
  so don't rebuild it from scratch or re-propose it unprompted. The row strips
  stay always-visible on a phone. The four sibling touches from that batch —
  the aircrew-tab gutter, board 4-digit input times, plural warnings, and the
  week's faded `Remarks` placeholder — STAND; only the ⋯ collapse was undone.

## Where things live

| Need | Go to |
|---|---|
| Validation, VCONF, publishing/AL, auth, history | `docs/engine-rules.md` |
| Rendering, drag & drop, text editing, AL marks | `docs/ui-contracts.md` |
| **Which surfaces a feature touches + how one edit flows** | `docs/feature-impact.md` |
| Open work, known gaps, the deploy traps, full file map | `../HANDOFF.md` |
| Probe → reference → port results | `docs/probe-sweep.md` |
| What changed recently | `git log --oneline` (not duplicated here) |
| Last session's leftovers, **if any** | `docs/session-state.md` (absent = nothing was pending) |
| The rules engine | `src/engine/` — `validate.ts` is the heart |
| Store / UI state / undo | `src/state/` |
| Components + HTML builders | `src/ui/` |
| **The Leave War tab** (vendored app: engine, store, UI, tests) | `src/leavewar/` — its own store and `leavewar:` storage keys; role written ONLY by `resetSession`; CSS scoped under `#page-leavewar`; gaps in `docs/leavewar/known-gaps.md`, future sync in `docs/superpowers/specs/leavewar-sync.md` |
