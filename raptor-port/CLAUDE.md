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
  locally as you go, then make ONE PR carrying the lot. **Since 2 Sep 26 the
  merge itself waits for his "merge live"** (§Vercel rule below): push each
  change to the branch and hand him the preview link, but never merge to main
  unprompted — the one PR stays open and accumulates until he says so.
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
- **SUPERSEDED 2 Sep 26 — NO AUTO-MERGE. Stack changes on the branch, hand
  him the Vercel link after EACH one, and merge to main ONLY when he says
  "merge live"** (owner: "dont automatically push to live next time. Intent to
  work with multiple changes with vercel links then i will manually say merge
  live then it will go to github with all the changes made"). So the loop is
  now: change → gates green locally → commit + push to the session branch (one
  open PR accumulates the lot) → reply with the Vercel preview link the moment
  it is Ready (~1 min after the push — do NOT go quiet waiting on CI) → take the
  next change. The "Done MEANS LIVE" chain (merge on green → Pages → live-verify
  → one notification) runs ONLY on his explicit "merge live"; a green PR
  sitting open is the intended resting state, not a thing to finish. The 24 Aug
  rule below is kept for its mechanics (where the link is, SSO, no PR-watching);
  its "auto-merge is the default" clause no longer applies.
- **Always hand him the Vercel preview link; auto-merge WAS the default until
  2 Sep 26 (see above)** (owner, 24 Aug 26 — "always let me know once vercel
  is ready to be tested so i can test it" → "u can auto merge unless u feel
  like it is very critical and needs me to test it before merging" → "always
  give me the preview link in vercel so that i can give u immediate feedback
  and u can use it too. since its way faster than github. then in the meantime
  i can still hand u more work"). So on EVERY change, once the branch's Vercel
  preview is Ready (the `vercel[bot]` PR comment carries the `…vercel.app`
  Preview URL — it is stable per branch), send him that link. It is his fast
  feedback surface — Vercel is up in ~1–2 min where a Pages rollout is 12–15.
  Giving the link does NOT gate the merge: for the ordinary change keep running
  the "Done MEANS LIVE" chain unprompted (merge on green → Pages → live-verify
  → one notification), and his feedback can land after merge — cheap to re-cut.
  Only when you judge a change critical/risky (a large or subtle UI change,
  anything touching the rules engine's output, anything a green gate does not
  prove) do you STOP before merging and wait for his go-ahead on the preview.
  While a preview or deploy cooks he will hand you more work — take it; do not
  idle waiting on a rollout. Note the preview sits behind Vercel SSO, so HE can
  open it but your headless browser cannot (it 302s to `vercel.com/sso-api`) —
  your own fast surface stays `npm run build && vite preview` driven locally,
  the same bundle Vercel serves. "Do NOT watch PRs" still holds: unsubscribe
  after opening; reading the preview URL off the PR once is not watching.
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
  The perf gate's law is the DOM CEILINGS in
  `probes/perf-port.cjs`, re-measured, never quoted. A feature that grows
  the DOM raises its ceiling as a deliberate, argued edit in the same PR.
  The three per-node TIMING budgets are no longer assertions (owner, 10 Aug
  26 — they caught nothing in the life of the repo and went red on unchanged
  code); they are still measured and printed, so read them, but a wandering
  number is not a gate failure. Reasoning: `docs/probe-sweep.md`. Dense surfaces stay string-built (§Architecture).
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

> **Background commands start at the REPO ROOT, not `raptor-port/`.** A
> foreground command inherits the session's `raptor-port/` cwd, but a
> `run_in_background` job launches a fresh shell at `/home/user/Raptor`, where
> there is no `package.json` — so a bare `npm run test:e2e` (or any `npm`
> script) fails INSTANTLY with `ENOENT … package.json`, and the wrapper's own
> exit code can read 0, masking it. ALWAYS prefix a backgrounded gate with
> `cd /home/user/Raptor/raptor-port && …`. This bit twice (test:e2e, 30 Aug 26)
> and each miss wastes a full ~10-minute re-run.


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
A fresh container needs `npm ci` first — `node_modules/` is not in the image.
Any NEW Playwright script must pass `executablePath:'/opt/pw-browsers/chromium'`
(a stable symlink): the pinned Playwright looks for a browser build the image
doesn't ship, so a bare `chromium.launch()` dies with "Executable doesn't
exist … run npx playwright install" — do NOT run that, it re-downloads for
nothing. Every probe in `reference/probes/` already hardcodes the path.
Login is `ad`/`a` (admin) or `us`/`us` (squadron member — NOT view-only
since 5 Aug 26: a member edits their own Inputs and ticks their own quals;
the split is in `docs/engine-rules.md` §Auth / roles). The account names
changed from a/a · user/user on 24 Aug 26 (owner ask, which also removed
the credentials hint from the sign-in card — don't re-print them there).
The username is lowercased before matching, the PASSWORD is compared
exactly, so `AD`/`a` works and `ad`/`A` is rejected.
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
  proxy: { server: process.env.HTTPS_PROXY,            // NOT inherited from the env var
           bypass: 'localhost,127.0.0.1' },            // see note below — local drives only
  args: ['--ssl-version-max=tls1.2'],                  // TLS 1.3 handshakes get reset
})
```

**When you drive the LOCAL `vite preview` (localhost:4173), add the
`bypass: 'localhost,127.0.0.1'` shown above** (2 Sep 26). Without it Chromium
routes the plain-HTTP localhost request through the agent proxy, which only
accepts HTTPS CONNECT tunnels, so the page loads the relay's "this proxy only
accepts HTTPS CONNECT" body (a 405) instead of the app — `#luser` never appears
and the drive times out looking like the app is broken. The proxy itself is
still needed for the DEPLOYED github.io page (external host); the bypass just
keeps localhost direct. Simplest alternative for a local-only drive: omit the
`proxy` key entirely.

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
Since 3 Sep 26 the gates run as PARALLEL jobs (build+parity, unit ×2 by
vitest project, geometry ×3 by Playwright project) and `deploy` waits on all
of them, so merge-to-live is bounded by the slowest leg (Leave War units,
~5 min), not the sum (~17 min). Numbers and the why: HANDOFF §Deploy.

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
  only on merge to `main`. Slower (the gates, then a Pages rollout that has
  ranged from 5 s to 10 min and is outside our control), so it is paid ONCE
  per session at the end, not per change — and since 2 Sep 26 only on the
  owner's explicit "merge live". The "done means live" chain still ends here.

So the loop is: iterate against the local `vite preview` (instant, what you
drive), let the owner eyeball the Vercel preview when he wants to tap it
himself, and ship to Pages once at the end. The CI gate itself was sped up
15 Aug 26 (the browser download is cached and the geometry suite runs 3
workers with one CI retry — NOT all cores; '100%' starved the preview server
and flaked a carry-day test on its first main run, see playwright.config.ts —
deploy.yml + playwright.config.ts) and again 3 Sep 26 (the suites had grown
to a 17-min serial run; they now run as parallel jobs, ~5–6 min end to end).
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
derives its role from the Raptor login (`store.ts:toggleRole` — the admin's
view-as-member flip, 27 Aug 26 — is the only other production writer, riding
this same seam so the war always reads the session's EFFECTIVE role; on the
Leave War itself, moving the cycle stage forward became admin-only the same
day — members still bid), `probe-bridge.ts`
exposes `w.lwSetRole` for its e2e suite, and **`src/leavewar/sync.ts`** — the
sync wires (17 Aug 26; this seam also mirrors Raptor's "View as" person into
the Leave War store's `viewer` on every Raptor notify — what lights the
viewer's row and personalises the counter picker — a rider on this seam, not
a fifth): Leave War's roster is a boot-time PROJECTION of
Raptor's PEOPLE, approved leave crosses both ways as DERIVED
RECONCILIATION (outbound skips Raptor-owned cells, inbound skips lw-tagged
inputs — that pairing is the loop-breaker), and weekend/holiday WORK — the
PUBLISHED schedule plus acknowledged Duty-&-commitments input claims
(`row.oil`, the OilConfirm ask-flow, 28 Aug 26) — credits OIL as a third
derived pass (wire 4, `runOilPass` +
`engine/oil.ts`, one ≤6h/>6h test on the day's start-to-finish ENVELOPE
since 29 Aug 26 — gaps between events count, and the schedule half reads
every visited week via the session stash, not just the loaded one — the
ownership partition is by cell vocabulary, FO/HO vs
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
The PUBLISHED remarks editor (27 Aug 26) rides this same seam in the war→Raptor
direction: `sync.ts:leaveInputAt` finds the Raptor input a war cell derives
from, and `RemarksSheet` saves through Raptor's own `setLeaveRemarks →
commitInputEdit` — a remarks-only edit, so `rowSig` is unchanged and the war
cells never move. Don't add a fifth seam casually,
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
- **Keep `../HANDOFF.md` true in the same PR — and SHORT.** A change that
  resolves a known issue REMOVES it from the open list (its contract goes to
  the structured doc, its story to the commit message — never a "RESOLVED"
  narrative left in the file); a change that creates one adds a 1–3 line
  entry; a change that adds, removes or renames a file edits its file map.
  `HANDOFF.md` was cut from 3,882 to ~550 lines on 4 Sep 26 because it is
  read at the start of most sessions and every line costs every session; the
  history is frozen in `../HANDOFF-ARCHIVE.md` (search it, never append to
  it). Stale is worse than absent — the next session trusts it.
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

Each entry is a tripwire: the decision is SETTLED — don't rebuild, re-propose or
re-litigate it. Where a reference doc holds the full story, the line keeps the
decision + a pointer. Owner + date establish authority; keep them.

### Pipeline & repo invariants
- **Do NOT watch PRs** (owner, 15 Aug 26). The harness auto-watches an opened PR
  and floods the owner's phone with CI/review/Vercel `<wake>` blocks for little
  gain (gates + live page are checked before the PR opens; he leaves no review
  comments). Call `unsubscribe_pr_activity` immediately after opening any PR;
  never leave one watched. Doesn't change the ship-to-live duty. An explicit
  "babysit this PR" ask overrides, for that PR only.
- `reference/` is **read-only** — the spec for existing behaviour. New features go
  beyond it but must not break it.
- The engine's original **generator is DELETED** (git history keeps it). Never
  recreate or rerun it — the engine is ordinary source now; regenerating clobbers
  real work.
- Keep `src/probe-bridge.ts` in sync when adding engine API.
- **Product invariants** (owner, 7 Aug 26 unless noted): no rule versioning · no
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

### Leave War roster & display (owner, 3–4 Sep 26)
- **Admin controls live in ONE ⚙ Settings; rearranging is on the grid.** Matrix top
  row is now ONE line (owner, 5 Sep 26 — "all in 1 row to minimise row height
  space"): Manning · ⚙ · Rearrange for an admin, then the OIL tracker RIGHT AFTER
  the last control (no spring to the far edge); a member sees just Manning · OIL.
  The old "JAN – DEC 26 · 365 days · 50 people" line was dropped (the war NAME
  still lives in the Period picker in the page chrome). "OIL tracker" shortens to
  "OIL" on a phone (`.rtlbl`) so the four hold one line. ⚙ opens `SettingsSheet`
  (CONFIG: + Counter, +/− Event row, Show SANS, Reset counters + the roster GROUPS
  editor folded in; old `⚙ Groups` button + `GroupSheet.tsx` deleted). REARRANGING
  is STILL hands-on-grid (person rows AND category headings drag, slim
  `.lw-rearrange-bar` for Auto-sort/Done), but its TOGGLE moved from the ⠿ grid
  corner INTO the top row (5 Sep 26) — the corner cell is empty now. Don't move
  config onto the grid or rearrange into a sheet (a Sheet's scrim swallows the
  drag's taps), and don't push OIL back to the far edge.
- **Who-wins follows the page order by default** (reversal of 28 Aug "two separate
  orders"). Group higher on the page wins a tie; dragging a category reorders
  who-wins with it (`groupPriorityIds` until `groupPriorityCustom`). A hand edit of
  the ⚙ "Who wins" list switches to CUSTOM; "Match the page order"
  (`clearGroupPriority`) clears it. **Standard categories OVERLAP** — a category is
  a FIT check (`people.ts fitsCategory`), so an SXO IP fits both and IP-above-SXO
  draws them under IP; `groupOf` = first fit down `GROUP_ORDER` (untouched page
  unchanged). Two fits stay exclusive by design: ground crew fit only Personnel;
  OCU fits OCU but never OPS P/W. `sxo`/`san` are never offered as qual groups (they
  ARE the SXO cat / SANS group; a stored one is pruned). Auto-sort buckets by live
  grouping (`liveAutoOrder`).
- **A chip shows only the CAT; hover/tap reveals DISPLAYED quals in group colours.**
  Chip stays CAT-coloured (`catClass` off `groupOf`), never encodes a qual. The
  popover (`qualpop`, screen-fixed so the frozen column can't clip it) lists ONLY
  the qual GROUPS on the page the person matches, each pill its group colour, + SXO
  gold when present. Undisplayed quals not listed; an empty chip is inert (no
  `.has-quals`). Click swallowed (doesn't open figures sheet); dismissed by
  pointer-leave, outside pointer-down, scroll, Escape, or a second tap — no scrim.
- **A qual group's colour is the admin's PICK.** `groupColors` (persisted
  `groupcolors`, admin-gated, `q:` ids + `#rrggbb`, dropped with the group, cleared
  by reset); `groupColorOf` falls back to a deterministic palette (`qualSwatch`) so
  an unpicked group is never black. ⚙ list opens a 12-dot palette (`PALETTE`);
  built-ins/SANS keep their CSS-class CAT colours, no button. Pill text by luminance
  (`inkFor`). Palette closes on pick / outside click / Escape (per the popup rule).
  **NOT pruned at boot** — pruning is at read (`groupsInOrder`) and when the
  catalogue arrives (`setQualCatalog`); a boot prune once threw away every saved
  TF/NVG/custom group before Raptor's real column list landed (bug hunt, 4 Sep).
- **The ⚙ groups list drags too.** Rows carry `data-grow` + a `⠿` grip wired to the
  same `GROUP_DRAG` → `moveGroupTo` as the grid heading, so the two never disagree
  (SANS has no grip, auto-placed at the foot). "Drop after row X" resolves from the
  hovered row's OWN container, never a document-wide query. Every draggable list
  shows the bar on the hovered row's bottom edge for a lower-half hover.
- **Pilots above WSOs inside every block, ALWAYS.** `rankCompare` sorts seat before
  `CAT_RANK`; `displayRoster` partitions each block by seat around the hand-order —
  a drag can't carry a WSO above the pilots (single-seat blocks untouched). The
  callsign wears a FULL-WIDTH seat-colour bar across the frozen column (pilot olive,
  WSO green; `.cs.seat-*`, `flex:1` to the CAT chip). LW bars are DARKER than
  Raptor's pucks — explicit deep-olive/deep-green hex in `matrix.css`, NOT
  `var(--fcp/--rcp)` (never darken the flight line via scheduler.css); ground crew
  keep a light bar off pure white. Phone (≤430px): bar side-padding tightens to 4px.
- **The qual catalogue is Raptor's LoX column list, not the holders.** Column list
  lives in `engine/qualcols.ts`; `qualCatalogue` takes keys+headings from it,
  appending any key someone still holds after a removed column (ticks survive).
  Known gap (not fixed): like the ticks, the column list isn't saved across reload.
- **Show SANS = SANS as their own counted group at the foot.** Injects `SANS_GROUP`
  (auto-managed, never stored) LAST on the page / FIRST in who-wins, so shown SANS
  draw together; they still count in manning by seat+band (a group never moves a
  count — `groups.ts` invariant).

### The late-input mark (owner, 9 Aug 26 unless noted)
Rules: `docs/engine-rules.md` §The late-input mark. Placement: `docs/ui-contracts.md`
§The late-input mark on screen, §The LATE marks can be dropped per input.
- **It is a MARK, not a warning** — never in the checks list, never closes a slot,
  invisible to `validate()`. Measures the input's **last change**, not first
  submission (an early input amended after the deadline reads late).
- **Downchits are EXEMPT** (going DNIF isn't planned); leave and overseas duty stay
  in scope (they're applied for). Don't re-propose either.
- **It reads in the REMARKS cell**, not beside name/type (moved there the day after
  it shipped) — except the board's promoted ground row (bare `<input>`, no room to
  nest a chip) which keeps its amber row edge.
- **The word stays a word — a compact dot was OFFERED and DECLINED.** Measured on an
  11-input day: desktop costs nothing (666px w/ and w/o); phone costs 33px over 11
  rows (757 vs 724) and splits long remarks mid-word ("Medic al appt"); a dot
  measured 724 (free). Owner kept the word and the cost. Dead ends, don't retry:
  word at END of remark saved nothing (759); turning off mid-word breaking saved
  nothing (757). Don't "fix" the split by shrinking the badge — its WIDTH is the
  whole cost. (These measurements live only here.)
- **It CAN be dropped per input** (owner, 21 Aug 26; REPLACED the 20 Aug global
  "Hide LATE marks" button, now removed). A session-only forgiven registry
  (`LATEOFF` in `state/view.ts`) with the way back = tapping the same chip again.
  Three fixed parts: the board's LIVE rows (Personal Inputs + Unavailable) always
  draw a clickable `latechip` (solid shown, dim ghost dropped); the GATE is at the
  passive printers (`ui/html.ts lateShown`, `isLateInput` still answers); the Inputs
  page KEEPS printing it (paperwork record). Admin-only at the write path, cleared
  on login/logout. Don't move the gate into the engine, don't bring back the global
  button, don't silence the Inputs page.

### Board behaviour
- **No warning / advisory / note counts in the top bar** (owner, 20 Aug 26). The
  three `pillbtn` counts are gone (each day leads with its own "N issues · N
  warning · tap to review"). `openWarns` KEPT with no caller (reference behaviour /
  future "expand everything"). Pinned in `app.test.tsx` — don't put the sum back.
- **Nothing on the board re-orders itself** (owner, 10 Aug 26 — "prevent … the line
  jumps"). Auto sort / Sort all are the only reorderers, by START TIME not role
  rank. Don't add an automatic sort to any board list. (The Ground Programme's
  render-time time sort predates this and stays — time-less rows sink to append.)
- **MAIN/SPARE on a standalone line is a clickable BADGE in the remarks cell; a click
  flips the line** (owner, 24 Aug 26; supersedes the 10 Aug ghost-text). `saRoleHTML`
  draws it week+board (button in edit mode, chip read-only); placeholder is plain
  `Remarks`. The flip is ENGINE-VISIBLE: `a.spare`+`a.role` flip together,
  `scSpare`/`saExempt`/shift count follow, marks the `st:` key pending (rides next
  AL). Next-week peek keeps role as fallback text (`saRoleText`). Don't restore the
  placeholder or make the flip label-only. Pins: `sarole.test.tsx`.
- **On SC, the B box is an IN-TIME; its sortie furniture is gone** (owner, 24 Aug 26,
  SC only; AVALON/BB untouched). Board drops the SC header "in-time · N ac" note; SC
  lines lose the blue suggested-brief ghost but KEEP the empty B box; the engine
  reads a typed SC `f.br` as the crew's in-time (`events.ts` → `intime`,
  `insOf` anchors crew rest on the earlier of it and shift start). Blank = byte-
  identical to before. Extended same day: an early B on a MAIN starts the long-day/
  duty-hours span (`workSpan` = `min(report,start)`), and anything cutting into the
  B→start window raises the amber `SC_INTIME` advisory (already-overlapping events
  stay with the hard-clash loop). SPARE rows have no event stream (both MAIN-only).
  Known seam (documented, don't silently "fix"): the SC in-time shows on the board
  only — the desktop week renders SC as SHIFT/START/END with no B, so a board value
  isn't mirrored to the week. Owner said it'll be rare; raise mirroring only if he
  asks. Pins: `scintime.test.ts`, `scboard.test.tsx`. Rules: `engine-rules.md`;
  placement: `ui-contracts.md` §The B box.
- **Amendment marks are a PUBLISHED-day thing — a draft day shows none** (owner,
  25 Aug 26). `alAttr` emits `data-alp`/`data-aln` only when `dayApproved`; a draft
  edit emits nothing but is still tracked in `SCHED.pending` (count/publish/History
  unchanged — History finds cells by key+edit log). Don't re-add a draft-day mark.
  Pinned in `publish.test.ts`/`interact.test.tsx`; `ui-contracts.md` §Amendment marks.
- **A new flying line comes up blank** (owner, 10 Aug 26) — `+ Line` no longer copies
  the previous callsign/mission/times. **`+ Wave` follows the same rule** (owner,
  25 Aug 26): a plain flying wave's first line is blank (`cs/msn/to/ld` empty),
  byte-identical to a `+ Line` add — no more `NEW / 12:00 / 13:00` seed and its green
  suggested-brief. Standalone waves (`makeStandalone`) keep their kind-specific
  structure (the `!kind` branch only). Pinned in `board.test.tsx`.

### Waves & duties — templates and defaults
- **Duties are decoupled from waves** (owner, 13 Aug 26; supersedes 10 Aug "AVALON
  auto-creates its desk"). No wave auto-creates a duty desk (AVALON included);
  deleting a wave leaves duty blocks alone. Every desk comes from the `+ Block`
  template picker (`engine/dutytpl.ts`, persisted): a chosen template copies onto the
  day as a PLAIN block (no `sa`/`noconf` marker → conflict-checked like any duty row;
  the AVALON/BB desk exemption went with auto-create). Seed week carries no exempt
  desk, parity untouched. Editor `ui/DutyTplModal.tsx`. Do NOT re-add
  `SAWAVE.autoDuty` or the wave-delete → `saDutyIx` linkage (`waveDutyBlock`/
  `saDutyIx` remain in `waves.ts` only for old AL snapshots).
- **Flying-wave templates + a + Wave show/hide list** (owner, 25 Aug 26). Sibling of
  duty templates one level up: `engine/wavetpl.ts` library, `ui/WaveTplModal.tsx`
  editor (from the + Wave pencil, `WAVEEDIT`), `+ Wave` lists templates beside its 4
  built-in kinds. Template `{id,title,kind,lines}`: **one rule-set per template** —
  exactly one of `fly`/`sc`/`avalon`/`bb`. Placing one mints an ordinary wave
  (`waveFromTpl`) whose OWN kind flags drive checking — `validate.ts` never reads a
  template, parity untouched. **A STANDBY-kind template mints the built-in's SHAPE**
  (owner, 26 Aug 26): consecutive same-shift lines become ONE formation with a crew
  row per line (like `makeStandalone`); a fly line stays one formation per line —
  don't return the standby mint to 1:1. Times store raw, normalise on blur/mint/load
  (`waveTime`, colon form `07:00`). Show/hide via a `WAVEHIDE` set (default all-shown,
  deleted template drops its flag), persisted (`wavetpl`+`wavehide`), boot-loaded,
  untrusted storage clamped. Don't seed built-in templates (library starts empty),
  don't make `validate` read a template, don't move the gate off `WAVEHIDE`. Pins:
  `wavetpl.test.ts`, `WaveTplModal.test.tsx`, `wavepicker.test.tsx`.
  - **Manage + edit are ONE sheet, ONE gear** (owner, 30 Aug 26; folds in the 29 Aug
    "remove it from Admin"). The + Wave menu carries a single ⚙ (`data-wvedit`) +
    "N hidden · Manage", both opening the unified `WaveTplModal.tsx` (edits templates
    AND shows/hides/deletes: a "Wave types" list with an EYE per built-in kind,
    `setWaveHidden`; per template an EYE + footer Delete; built-ins hide but never
    delete). Old `WaveManageSheet.tsx`/`WAVEMANAGE` DELETED — don't re-add it or a
    second button. Admin's `WaveVisibility` stays REMOVED; Admin keeps only the
    template-editor button (same sheet). Don't strand a hidden wave — the "N hidden"
    line + eyes are the way back.
  - **Kind-picker rule notes have ONE source, on the picker AND the Logic page**
    (owner, 30 Aug 26). `wavetpl.kindNote(k)` is the single count-free summary of
    each kind's checking rule, verified against `validate.ts`/`events.ts`; the editor
    and the Logic "Wave types at a glance" group render the SAME strings. Deliberately
    NOT `SAWAVE.note` (keeps its "2 MAIN + 2 SPARE" count for the built-in popup where
    the count is real). When a kind's rule changes, update rule + `kindNote` + the
    Logic "standby lines" row together (`logic.test.tsx` pins it).
  - **The leave/absence "what each type costs" sentence has ONE source too** (owner,
    30 Aug 26), shared by the Inputs "?" legend and the Logic type matrix.
    `inputs.ts inputRuleText(t)`, derived from the enforced flags; both `InputsPage`
    and `logic-html.ts` read it (they'd drifted). `inputs.test.tsx`/`logic.test.tsx`
    guard it. Deliberately still separate, don't "helpfully" merge: `SAWAVE.note`,
    the `satag` caption, the OIL-confirm prose (different jobs/voices).
- **The DEFAULT arrangement is admin-set; the wave half is "new schedules only"**
  (owner, 29 Aug 26 pt.2). Admin → Squadron config → **Default arrangement** panel,
  two ▲▼ lists persisted on the `wavehide` footing: **section order**
  (`engine/order.ts SEC_DEFAULT`, `secdefault`) is display-only fallback `secOrder`
  uses for un-arranged sections (hand-arranged day still wins, canonical baseline
  keeps 728/0); **wave order** (`engine/reorder.ts WAVE_DEFAULT`, `wavedefault`,
  default OFF) applies ONLY at wave-add on a not-signed-off day. DON'T make the wave
  default reorder existing/published days, and DON'T give it a display-only layer (it
  would fight `sortWaves`). Unset = append. Pins: `arrdefaults.test.ts`,
  `wavedefault-add.test.tsx`, `admin.test.tsx`.

### Drag-reordering (sections, waves, dense rows)
Contract: `docs/ui-contracts.md` §Dragging sections and waves, §Dense row reorder.
- **Sections and waves re-order by IN-PLACE DRAG, not a sheet** (owner, 30 Aug 26;
  the 29 Aug `⇅ Arrange` sheet is DELETED). One machine `ui/rowdrag.ts` (board wrap +
  edit-week root) tells section/wave/row apart by the grip pressed and validates via
  `applyMove`'s same-container rule. Grips draggable at EVERY width. The SECTION grip
  is the SAME dotted `⠿` (owner, 31 Aug 26, reversing the 30 Aug drawn-rail),
  placed INLINE at the panel header (not an overlay rail); headers set
  `user-select:none`. Don't turn it back into a rail or drop the no-select. Don't add
  arrows back to any of them.
  - **Overall Notes and Common Programme are two SEPARATE draggable board sections**
    (owner, 31 Aug 26). On the EDIT WEEK day notes still print inside the Common
    Programme block, so the week keeps 'notes' EMPTY/skipped (keeps view week ==
    reference byte-identical). The week's Flying-waves `.wv-sech` header stays (its
    grip needs a header; stripped in the reference compare).
  - **The four CREW WORKING-AID panels join the SAME draggable list** (owner, 31 Aug
    26): Personal Inputs, Available crew, SANS availability, Unavailable are ordinary
    section keys, each a `.sb-sec` card. **They drag on the EDIT SCHEDULER too** —
    `dayHTML` in EDIT mode emits all ten sections through the SAME `secOrder` loop, so
    a drag on either surface drives the ONE per-day order. The VIEW week is UNTOUCHED
    and parity-locked (four not draggable, only Unavailable prints in its fixed tail;
    whole change gated on `ed`, 728/0). This is a scheduler WORKSPACE arrangement, not
    a published property. A SECTION drag is display-only (`moveSectionTo` →
    `reorderSectionTo`, histPush, no markEdit) then offers the "Set default order?"
    snackbar (`SecDefaultSnackbar.tsx`, promotes via the SAME `setSecDefault` as
    Admin). A WAVE drag is a real amendment (`applyMove('mv:w…')` → `moveWave`). A held
    drag AUTO-SCROLLS at screen edges (`pointermove` on the DOCUMENT — don't move it
    back onto the container). Don't fold the crew panels into a fixed tail or let
    their order reach the VIEW week. The old one-week "Apply to all days" is GONE.
    Pins: `rowdrag.test.tsx`, `SecDefaultSnackbar.test.tsx`, `board.test.tsx`,
    `html.test.ts`.
- **Dense ROW reorder is by DRAG too — the ▲▼ nudge is GONE** (owner, 31 Aug 26;
  reverses the 8 Aug "phone hides grip, shows ▲▼"). Every dense row shows its dotted
  `⠿` at ALL widths; `sbNudge` returns '' (also ~2 nodes/row off the board budget);
  phone grid gains a leading marker track, first box shortens by it, each box stays
  under its heading. A same-week follow-up widened the lane 13→20px (glyph
  left-aligned, handle clear of the first box) and shifted puck containers to span
  track 1 (`.sb-line .sb-seatpair 1/4`, `.sb-arow.c6r>.ppl 1/3`) so crew pucks go
  flush-left and a two-wide box's second puck clears the remarks. No puck resized.
  **ALIGNMENT is a HARD RULE**: every grip's centre measured to delta-0 against the
  box beside it (flying-line grip bottom-aligns `align-self:end;height:24px`; c6r/
  notes centre naturally). Don't re-add ▲▼, don't hide the row grip on a phone, don't
  move a grip without re-measuring delta-0. `boardMbtn mv:up/dn` stays as inert guard.
  Pins: `rowdrag.test.tsx`, `board.test.tsx`.
- **No ⋯ collapse of the phone row control strips** (owner, 16 Aug 26 — built +
  rolled back same day). Row `▲▼/CX/■/✕` strips stay always-visible on a phone; the
  `CTLOPEN` implementation is one `git revert` away — don't rebuild or re-propose.
  Sibling touches from that batch (aircrew-tab gutter, plural warnings, week's faded
  `Remarks` placeholder) STAND; only the ⋯ collapse was undone (and the batch's
  4-digit board input times were later reversed by the 30 Aug hh:mm decision).

### Time format
- **EVERY time in the app reads `08:00` — colon, 24-hour, everywhere** (owner, 30 Aug
  26, reversing their own 29 Aug "just 0800"). hh:mm is native and the reference gate
  PINS it (`tfin.js`). Three layers: **Display** wraps every stored time in
  `engine/time.ts fmtHM` (the ONE display fold; board renderers, week already folds
  via `fmtT`); **Minting** `dutytpl.tplTime`/`DUTYTPL_STD`/`waveDutyBlock`/"+ In time"
  now mint `07:00` (old templates refold on load); **Typing** every box accepts
  `800`/`0800`/`8:00`/`08:00` (`parseHM`), shows hh:mm after commit (user never types
  the colon). Engine untouched (readers go through `parseHM`), parity **728/0**. ONE
  deliberate 4-digit survivor: the AREA window token (`0800-0900`, `atimeText`) — the
  reference pins it compact; changing it needs owner sign-off. Don't add a second
  display formatter — `fmtHM` is the one. `ui-contracts.md` §Every time reads hh:mm.

### Week navigation & cross-week continuity
- **The phone board's top bar is ONE row; the day is STEPPED BY ARROWS** (owner,
  11–12 Aug 26). Getting the bar from 166→70px was the whole point — don't add a
  control to its FIRST LINE without taking one off (the geometry gate counts ROWS).
  History added an 8th button and stayed at 70px only because the same change fixed
  `.sb-title` to shrink (`flex:1 1 0`) — that was the last free 33px; the next control
  must displace one (the changes list is the worked alternative — it went to the
  checks panel). `+ Line` is off the bar (every wave header has one); labels icon-only
  under 820px. **The swipe is GONE (12 Aug); do not rebuild it** — `#sbPrevDay`/
  `#sbNextDay` call `boardDayStep(±1)`, CONTINUOUS across weeks since 22 Aug
  (`loadWeek`+`boardTab`; don't re-add the end-of-week `disabled`). `#sbCal` opens the
  week picker in 'board' context. Arrows flank the DAY STRIP (bar 70→75px). Above
  820px they aren't drawn (desktop has 7 day chips). The Mon–Sun chips became dots
  then LEFT the phone bar on 23 Aug (freed row carries `#searchB`+`#sbHl`), removal is
  CSS `display:none` so `dayTabsHTML`/`wireDayDots`/jsdom tests untouched. **Day name
  is THREE letters on a phone** (12 Aug — split `Wed`+`.bl` tail, desktop still reads
  `Wednesday` off one path; don't restore/ shorten). The DESKTOP scrub survives
  (Mon–Sun chips): every chip keeps its footprint whatever is selected — don't grow
  the current one. `boardTab` is view-only (must not validate; its board lane must not
  wake EditWeek/EditRoster). `ui-contracts.md` §The board on a phone is ONE window.
- **Week navigation is a rolling window + a calendar, and it is CONTINUOUS** (owner,
  22–25 Aug 26). The fixed 5-chip `WEEKS` strip is gone; `weekWindow(CURWEEK)`
  (`ui/weeknav.ts`) draws four `data-wk` buttons (prev·current·+1·+2, re-centring).
  `WeekCal` (single-date, whole-week highlight) jumps to any day's week; it's a DAY
  picker (loads that week AND lands that exact day) — don't turn it back into a
  week-row picker. All week/Monday math lives in `weeknav.ts` (one drift seam). The
  big `#vTitle`/`#vSub` were removed as clutter (cards carry dates) — don't re-add
  them, the fixed chips, or the end-of-week clamp. `WEEKS` kept for probe-bridge/
  reference only. Pinned mechanics:
  - **Phone**: view/edit stepped day-to-day by SWIPE, continuous across weeks
    (`pan.ts` edge-overswipe + `WEEKJUMP`). A wave-dense day no longer traps it
    (owner, 23 Aug) — the `.go` block's ownership is decided at touch-END (a wave
    already at its edge lets the gesture fall through); don't restore the touch-start
    `.go` bail. The cross GLIDES (owner, 23 Aug, `ui/weekglide.ts:beginGlide`,
    phone-only ≤820px, reduced-motion-aware, no-ops without layout). It slides TWO
    FROZEN CLONES (owner, 24 Aug) — outgoing frozen on the finger's day, incoming
    frozen on its landing day, both `overflow:hidden` so neither scrolls/flings, real
    week painted but COVERED behind them (`pointer-events:none`, never
    `visibility:hidden` — 5 Sep 26, a hidden week came back unpainted). Load-bearing
    details: landing day derives from cross DIRECTION (`fwd?0:weekScrollMax`), NOT
    live `scrollLeft`; the clone box is as TALL as the taller of the two weeks,
    measured on both sides of the swap (5 Sep 26 — sized from the leaving week it
    clipped a tall arriving Monday at a short week's height: the "split" / "lower
    half black"); each clone is ONE opaque day card (`snapshot()`), inserted
    ON-SCREEN under the leaving one and left two frames to paint before it slides;
    real week covered so its fling/snap never shows. Clones at `z-index` 40/41,
    BELOW the sticky `.topbar` (60) — keep them under the chrome. Don't slide the
    live week, use a single clone, size a clone from one week, clone the whole
    week, or start a clone off-screen.
    Swipe NOT locked to one day (owner kept this) — no `scroll-snap-stop`; within-week
    swipes never glide, desktop instant.
  - **Desktop arrows are continuous across weeks** (owner, 23 Aug), landings instant.
    They **walk EVERY live day incl Sat/Sun to the FRONT before crossing** —
    `weekScrollMax` = "last live day at the front" (`(liveDays−1)×dayStep` clamped),
    the next-week peek's real columns are the runway; the JS-sized trailing spacer
    stays (`.week::after`/`--week-tail`, desktop only). Don't reintroduce a fixed
    `calc()` spacer or the flush-right ceiling. **One press = one day even mid-glide,
    both directions** — `panDays` counts from the COMMANDED target (`panTgt`) via a
    BURST CORRIDOR anchored at the burst start (`panAnchor`→`panTgt` = `panBase`); a
    manual pan or new week drops it. Don't narrow the corridor back to the last step.
    **A park NEAR a boundary counts as ON it, and a plain horizontal wheel drops the
    corridor** (owner, 24 Aug) — `PARK_TOL` 0.35-of-a-day decides step counting and
    edge-cross; `onWheel` drops `panWk` on any plain horizontal tick. Don't shrink
    `PARK_TOL` to a hairline or remove the deltaX invalidation. **The glide OWNS the
    week while in flight** (owner, 24–25 Aug) — the proxy scrollbar and any repaint
    are pure FOLLOWERS: `panDays` arms a short `glideEnd`/`GLIDE_MS` window (cleared on
    land or manual pan) during which `onTrackScroll` never drives the week, and a
    mid-glide repaint holds the glide's TARGET (`panHold` in EditWeek/ViewWeek), not
    the captured mid-glide position; `mirrorToTrack` records `trkEcho`. Don't remove
    the `glideEnd` guard, revert `panHold` to pinning live `sl`, or let `onTrackScroll`
    write unconditionally. Pinned `pan.test.tsx`; `ui-contracts.md` §desktop arrow
    glide + §spacer; `performance.md` §Single-writer during a glide.
  - **The desktop scheduler BOARD now has week navigation** (owner, 23 Aug) — `‹ ›`
    week-jump chips inside `#sbDays` (`data-sbweek`, `boardWeekStep`, one press = a
    week keeping the open day); `#sbDays` is `display:none` on a phone so the phone
    board keeps its edge arrows. The `.crew-hint` edge hint stays RETIRED.
- **Personal INPUTS are GLOBAL, not week-scoped** (owner, 22 Aug 26). `loadWeek` swaps
  DAYS/DATES but NOT `INPUTS`; every authored week's inputs merge into one `INPUTS`
  at boot (idempotent, boot-only → parity 728/0). Each week's schedule shows only its
  own (builders match by DATE). Gotcha kept in `loadWeek`: it clears every input's
  `acc` so `autoAcceptSeedInputs` re-lands date-matching rows on the fresh days. Don't
  re-add the `INPUTS` swap or move the `acc` clear. Flow: `feature-impact.md` §Flow E.
- **The flagging engine reads across week boundaries** (owner, 23 Aug 26). Two rules
  fixed to look past the loaded week: `DAYS_RUN` (`VCONF.maxRun`) walks in seeded days
  before Monday; Monday's `CREW_REST`/`CREW_TIGHT` runs against the previous week's
  Sunday (so `REST[0]` is real). Bounded to those lookbacks + one lookahead day (the
  midnight-tail sliver past Sunday + the forward crew-rest trace); nothing else looks
  further — don't widen either window without a named case. **A flag still lands on the
  day it BREAKS**: next Monday's breach only becomes clickable when next week is
  loaded. **The forward "Breaks Monday" trace** (owner asked from the deployed site,
  23 Aug, reversing this entry's old "don't build a same-page hint") — a loaded week's
  Sunday whose late finish busts next Monday draws the same trace box, off
  `nextMondaySeed` + a phantom pass of the real `crewRestDay` (one body, two callers,
  can't drift); it carries `di:null` (no jump target) and writes no second warning.
  `CREW_TIGHT` never traces. Session edits ARE read now via the stash
  (`weekctx.ts:bundle()` checks it before the pure seed); `SCHED`/publish state still
  isn't read by these seed functions. Rules: `engine-rules.md` §validation/crew rest;
  screen: `ui-contracts.md` §Three crew-rest rings; `feature-impact.md` Flow F.
- **Weeks remember their edits — the per-week stash** (owner, 23 Aug 26).
  `engine/weekstash.ts` remembers, per week-start key, the last snapshot `loadWeek`
  handed it on the way OUT — decided parts:
  - **Session memory only — a reload forgets**, in lockstep with `INPUTS` and Leave
    War's own session-only decision. A localStorage envelope was built and removed the
    same day; don't re-add a browser-local one for just this piece — real persistence
    is the future shared server, for all this state at once.
  - **Pristine weeks are deliberately NOT stashed** (a persisted byte-copy of the seed
    would outrank a later demo-week update forever). Stashed on the way out only if
    changed since load or already carrying an entry. Don't re-add the unconditional
    stash.
  - **Publish state rides the restore** — the stash shares its SCHED field list with
    `history.ts:schedFields` (the two serializers can't drift).
  - **Seeds read the stash first** — cross-week reads go through `weekctx.ts:bundle()`,
    stash ahead of the pure seed.
  - **The "Sync" chip stays decorative** — per-browser, no server; don't present the
    stash as shared/multi-device or move storage off `HOOKS.storeBackend`.
  - Undo still re-baselines per week; the edit log stays session-only — the stash is
    additive to both. Flow: `feature-impact.md` Flow E.

### Inputs & Admin
- **Manage users lives on the Admin tab** (owner, 23 Aug 26). Topbar `#manageUsers`
  and `#userModal` gone; same fields/list/mutations on `ui/AdminPage.tsx` (7th nav
  tab, ALWAYS LAST, admin-hidden like Edit — but the PAGE is the gate, `#admDeny`).
  Don't put the button back on the topbar or add a tab after Admin.
- **No repeat-weeks on inputs** (owner, 22 Aug 26). The "Repeat wks" field, Recurring
  column and `recur` write are deleted — the feature never actually repeated (one
  span stored, `recur` a label nothing expanded). A truly repeating input is a real
  future feature (build only if he asks); a member files the same absence per week.
  Pinned in `inputs.test.tsx`. (`reference/` keeps its own Repeat field — test-only.)
  Moving an `Other` row to Ground/Unavailable is the `→ Ground`/`→ Unavail` buttons
  in `html.ts` (week + board); don't add drop targets to `drag.ts` (pucks only).
- **The calendar day popover — five owner asks** (23 Aug 26, all in `InputsCal.tsx`/
  `scheduler.css`; `ui-contracts.md` §The Inputs month calendar):
  - A SANS input reads its F/O/A letters on the popover row too (`isSansAvail ?
    (sansLetters||'F/O/A') : inpLabel`) — don't put "SANS Availability" back.
  - The day TITLE matches the date number's size (15px/700) — don't drop the explicit
    size (without it the input takes the 16px UA default).
  - A cell NOTE is plain text, no box (the dashed accent border is gone); on a phone a
    muted `--edge-2` bar so it stays visible — don't re-add the dashed border.
  - The cell mini-pucks (`.ic-pk`) are standard-olive (`--fcp`), CAT a right-edge line
    (`--pk-cat` via `::after`), a SANS person a purple LEFT line — pseudo-elements not
    inline box-shadows. Not the old full CAT-tint fill.
  - `+ Pucks` opens the MULTI-SELECT picker (`.ic-pick`): category buttons
    (`personMatchesCat` — the SAME predicate as the highlight chips, one body) light a
    category, ✓ Add batches the ticks (`addPuckRow`/`addPuckPeople`, dedupe). A seated
    puck removes 3 ways (✕, right-click, drag off its row). Don't restore the
    per-person `<select>`; keep `personMatchesCat` the one predicate.

### Leave War grid & scheduler render/drag performance
Full detail for this whole group: `docs/performance.md` (Part 1 invariants + Part 2
ledger). Read it before any layout/render/drag-touching change.
- **The board DOM ceiling of 1150 is settled** (owner, 28 Aug 26). Raised 960→1150 in
  PR #333 (board ~1051 nodes; timings held at 0.57× reference). Lives at
  `DOM_CEILING` in `perf-port.cjs`. Don't re-litigate the raise or trim the board to
  the old ceiling. (`performance.md`.)
- **The open-bidding dates wear a glowing dark-green border on the LW grid** (owner,
  1 Sep 26). One overlay `.lw-bidbox` (`Matrix.tsx measureBidBox`) around
  `bidFrom..bidTo`, shown only while `stage==='open'`. Colour `rgba(74,140,100,.80)`
  + low-opacity halo (the lighter of two faded greens he compared; deeper
  `rgba(56,104,76,.78)` was the other) — don't brighten or swap to `--ok` without
  asking. OUTLINE ONLY — he declined the faint-green wash (built, one-line add if he
  asks; don't re-pitch). `ui-contracts.md` §The open-bidding box; pin
  `e2e/leavewar.spec.ts`.
- **The Leave War year grid: one draw-toward-a-target window engine** (owner, 3–5 Sep
  26). Whole months at real widths over year-wide PLACEHOLDER cells (one empty cell
  per side per row, as wide as the months it stands for), drawn IN PLACE while the
  scroll is still moving. One loop `colwindow.ts stepToward` toward a per-mode TARGET:
  phone = rolling window a few months ahead (prune at rest); desktop on-screen = whole
  year (scrollbar slides); desktop off-screen = capped `HIDDEN_MONTHS`, drawn only
  while idle (`state/idle.ts`). Shrinks on leave (dropped months → measured-width
  placeholders, scroll kept), rebuilds on return; pre-warmed hidden after login
  (`Shell.tsx`, idle-gated). Load-bearing invariants (don't undo): a drawn month keeps
  its MEASURED width in the placeholder (`monthPxRef`); never draw/prune an
  estimated-width month left of the view mid-scroll; placeholder widths are INLINE
  styles, never a CSS custom property on `.mx-outer` or ANY grid ancestor (restyles
  ~7k nodes; `--lwx-max` lives on the frozen bar's own box); EVERY row incl header
  carries identical cells (the owner's iPhone/WebKit is the gate); on-screen signal is
  `screen.ts` (a listener set, NOT the store — never repaint the grid on tab show);
  `PersonRow` day cells stay one memoised `PersonMonth`/month; keep `.mx tbody tr
  {position:relative}`. This reverses the 3 Sep "never fixed-width spacers" and the
  4 Sep "desktop keeps whole year / never prune" — the reveal cost is why.
  `ui-contracts.md` §The Leave War grid draws a window of months; HANDOFF-ARCHIVE.md
  (the 5 Sep 26 entry); pins `colwindow.test.ts` + e2e.
- **A dragged puck's ghost rides its own compositor layer, moved by ONE transform;
  cell hover highlights are off in flight** (6 Sep 26). `.dragimg`/`.tdghost` carry
  `will-change:transform` with left/top pinned at 0; `drag.ts ghostXf` writes
  `translate(x,y)…` — no page paint (left/top moves relaid the whole page, ~170ms/
  move). The three cell-hover rules are scoped `body:not(.tdrag)` (`.dragover` is the
  drag's feedback). Don't move the ghost by left/top or re-enable hover under a drag.
  Measured-and-done dead ends (don't chase): toggling ghost `pointer-events`,
  any cursor rule on body, every re-layering ghost variant (the cost is the page's
  ~230 compositor layers, not the ghost); the `translateZ(0)` "fix" was a broken-
  experiment artefact, retracted. Nothing here touches native drag. `performance.md`
  §Drag; `ui-contracts.md` §the mouse rides the pointer machine.
- **A changed day rewrites only its changed BLOCKS, and a drop hit-tests before it
  takes the ghost down** (6 Sep 26). `ui/dayswap.ts` parses the new day into a
  `<template>` and replaces only the top-level/`.day-body` blocks whose CANONICAL
  markup (freshly parsed, never the live decorated node) differs from the last write;
  any shape mismatch falls back to whole-day replace (the old `outerHTML=`). Both
  weeks use it (keep `prev.chunks`). `drag.ts onPointerUp` hit-tests with the ghost
  still up, removes it after, leaves `body.tdrag/.mdrag` to `tdClear()`. Drop long
  task ~600→400–490ms at 4×. Dead ends (don't retry): every paint-isolation variant on
  the week (equal/worse — the ~60–100ms repaint records the two visible days); a
  "quiet path" in `refreshHighlights` (2× slower). Don't swap by live `outerHTML`
  comparison, match blocks by index across a count mismatch, or take the ghost down
  before the hit-test. Pins `ui/dayswap.test.ts` (`drag.test.tsx` unchanged).
  `performance.md`; `ui-contracts.md` §Rendering (per-block swap).

## Where things live

| Need | Go to |
|---|---|
| Validation, VCONF, publishing/AL, auth, history | `docs/engine-rules.md` |
| Rendering, drag & drop, text editing, AL marks | `docs/ui-contracts.md` |
| **Which surfaces a feature touches + how one edit flows** | `docs/feature-impact.md` |
| Open work, known gaps, the deploy traps, full file map | `../HANDOFF.md` (a short current-state doc — keep it that way) |
| The history — how each past thing was found, fixed and shipped | `../HANDOFF-ARCHIVE.md` (a FROZEN snapshot as of 4 Sep 26; search it, never read it whole, never append to it) then `git log` |
| Probe → reference → port results | `docs/probe-sweep.md` |
| What changed recently | `git log --oneline` (not duplicated here) |
| Last session's leftovers, **if any** | `docs/session-state.md` (absent = nothing was pending) |
| The rules engine | `src/engine/` — `validate.ts` is the heart |
| Store / UI state / undo | `src/state/` |
| Components + HTML builders | `src/ui/` |
| **The Leave War tab** (vendored app: engine, store, UI, tests) | `src/leavewar/` — its own store and `leavewar:` storage keys; role written only by `resetSession` + the admin's `toggleRole`; stage-advance is admin-only (27 Aug 26, members still bid); a member bids only on their OWN row — the "View as" person, mirrored to `viewer` — while an admin edits any row (`canEditRow`, 27 Aug 26; enforced at the write path and the grid affordance alike); an admin decides bids at closed OR published (`canDecide`, 27 Aug 26 — since the 27 Aug overnight pass the STORE enforces it too: `setBidState`/`setBidStates` refuse anyone else, `shiftBid` carries `moveCells`' whole stage/window/war-day law, `moveProblem` is the one validation body the landing preview and the commit share, a chain of closed moves keeps the ORIGINAL `shiftedFrom`, and a member cannot write a medical mark); a drag selects a block to batch fill/decide/move/delete and a plain click still opens the single-cell sheet (`select.ts`, capture taken in `arm()`); the dotted "moved" mark is recorded AND shown only for a move made once bidding is closed (`biddingClosed`, 27 Aug 26 — an open-bidding shuffle stores no `shiftedFrom`, so it never sprouts the stripe when the war later closes); the colour pop-out is "Legend"; at PUBLISHED a tap on an approved leave opens the remarks editor (`RemarksSheet` → `sync.ts:leaveInputAt` + `inputedit.ts:setLeaveRemarks`, member edits own / admin any); CSS scoped under `#page-leavewar`; gaps in `docs/leavewar/known-gaps.md`, future sync in `docs/superpowers/specs/leavewar-sync.md` |
