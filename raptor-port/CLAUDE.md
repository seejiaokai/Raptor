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
- **Leave War admin controls live in ONE ⚙ Settings; rearranging is on the grid**
  (owner, 3 Sep 26). The matrix's top row carries only Manning · ⚙ · OIL tracker.
  ⚙ opens `SettingsSheet` holding CONFIG — + Counter, +/− Event row, Show SANS,
  Reset counters — then the roster GROUPS editor folded in (the old `⚙ Groups`
  corner button is gone, the word "Groups" dropped; `GroupSheet.tsx` deleted).
  REARRANGING the roster is a hands-on-the-grid action, started from the ⠿ toggle
  in the grid corner above the callsigns: person rows AND category headings drag on
  the grid, with a slim on-grid bar (`.lw-rearrange-bar`) for Auto-sort and Done.
  Do not move config onto the grid, or rearrange into a sheet (a Sheet's scrim
  swallows the grid taps the drag needs).
- **Who-wins follows the page order by default** (owner, 3 Sep 26 — a deliberate
  reversal of the 28 Aug "two fully separate orders" rule). The group higher on the
  page wins a tie, so dragging a category on the grid reorders who-wins with it
  (`groupPriorityIds` returns the display order until `groupPriorityCustom`). A hand
  edit of the ⚙ "Who wins" list switches to a CUSTOM order, independent of the page;
  "Match the page order" (`clearGroupPriority`) clears it. **The standard categories
  OVERLAP and follow the same rule** (owner, 3 Sep 26 — "whatever that is at the top
  priority will supersede and put those people who are that cat or qualification in
  that order"): a category is a FIT check (`people.ts fitsCategory`), so an SXO IP
  fits SXO and IP, and IP dragged above SXO draws them under IP. `groupOf` is the
  first fit down `GROUP_ORDER`, so the untouched page is unchanged. Two fits stay
  exclusive by design: ground crew fit only Personnel, and OCU fits OCU but never
  OPS P / OPS W (else the default order would pull trainees into OPS P). The `sxo`
  and `san` qualifications are never offered as qualification groups (they ARE the
  SXO category / the SANS group) and a stored one is pruned. Auto-sort buckets by
  the live grouping (`liveAutoOrder`), so a re-homed person ranks among their new
  block.
- **A chip shows only the CAT; a hover/tap reveals the DISPLAYED quals, in their
  group colours** (owner, 3 Sep 26 — "hover the mouse over the person to see the
  qualifications they hold" / "having a colour on the chip doesnt make sense … just
  the original colour of the pucks for their CAT" / later "only the qualifications
  that were added to display will be shown when i hover … in the colour code that i
  selected for the group"). The chip stays CAT-coloured (`catClass`, off `groupOf` —
  an SXO keeps gold wherever they sit); it never encodes a qualification. The
  popover (`qualpop`, Matrix state, fixed to screen coords so the frozen column
  cannot clip it) lists ONLY the qualification GROUPS on the page the person
  matches (`Matrix.tsx shownQuals`: `groupsInOrder` × `matchesGroup`), each pill in
  that group's colour, plus SXO in gold when the SXO group is on the page. A held
  but undisplayed qual is not listed, and a chip with nothing displayable is inert
  (no `.has-quals`). The click is swallowed so it never also opens the figures
  sheet; dismissed by pointer-leave, an outside pointer-down, scroll, Escape, or a
  second tap on the same chip (the phone's toggle) — no full-screen scrim (which
  would swallow the opening click and block the grid).
- **A qualification group's colour is the admin's PICK** (owner, 3 Sep 26 — first
  "do we even need a colour?", then, having seen it, "allow me to pick the colour i
  want"). `groupColors` (store, persisted `groupcolors`, admin-gated, `q:` ids and
  `#rrggbb` only, dropped with the group, cleared by reset) holds the pick;
  `ui/groupColor.ts groupColorOf` returns it, falling back to a deterministic
  palette colour (`qualSwatch`) so an unpicked group is never a black square. The
  ⚙ list opens a 12-dot palette (`PALETTE`) under the row the moment a qualification
  group is added, and again from the row's swatch button; built-ins/SANS keep their
  CSS-class CAT colours and have no button. Pill text colour is by luminance
  (`inkFor`). The palette CLOSES the moment a dot is picked, on a click outside
  it (owner, 4 Sep 26) — per the standing popup rule below — and on Escape (which
  peels the palette only; the sheet closes on the next press). The stored list is
  NOT pruned at boot (bug hunt, 4 Sep 26): the boot catalogue is the seed's three
  keys, so a boot-time prune threw away every saved TF / NVG / custom group and its
  colour before Raptor's real column list landed. Pruning happens at read
  (`groupsInOrder`) and when the catalogue arrives (`setQualCatalog`, which also
  drops the pruned groups' colours and persists).
- **A click-open popup closes on a click outside it — standing UI rule** (owner,
  4 Sep 26 — "build pop up windows to have auto close feature if i click outside of
  it"). Any transient panel/menu/palette a tap OPENS must dismiss on an outside
  pointer-down (and, where it makes sense, right after the choice that finished it).
  The full-screen `Sheet` already does this (its scrim + Escape, `Sheet.tsx`); a
  smaller inline popup adds a capturing `pointerdown` document listener while it is
  open, treating a press on the popup itself — or on the control that toggles it —
  as "inside" so the toggle isn't fought (the ⚙ colour palette is the worked
  example, `SettingsSheet.tsx`). The quals popover already followed this (dismissed
  by pointer-leave / outside pointer-down / scroll).
- **The ⚙ groups list drags too** (owner, 3 Sep 26 — "allow me to drag and drop to
  rearrange the groups"): its rows carry `data-grow` and a `⠿` grip wired to the
  same `GROUP_DRAG` → `moveGroupTo` as the grid's heading grip, so the two never
  disagree; SANS has no grip (auto-placed at the foot). The drag machine resolves
  "drop after row X" from the hovered row's OWN container (`dragOverRef.el`'s
  parent), never a document-wide query — the ⚙ list and the grid headings share the
  `data-grow` vocabulary, and a mixed list could land a drop in the wrong place (bug
  hunt, 4 Sep 26). Every draggable list shows the bar on the hovered row's BOTTOM
  edge for a lower-half hover (`.dragover.after`), on the grid headings and both ⚙
  lists alike.
- **Pilots above WSOs inside every block, ALWAYS** (owner, 3 Sep 26 — "arrange all
  pilots at the top always and wso at the bottom of the same section. But within
  pilot and wso we arrange them in accordance to the cat category of seniority").
  `people.ts rankCompare` sorts seat (`seatRank`: pilot, wso, gnd) before `CAT_RANK`;
  `displayRoster` partitions each block by seat around the hand-order, so a drag
  can never carry a WSO above the pilots. Single-seat blocks are untouched. The
  callsign wears the seat colour as a FULL-WIDTH bar across the frozen column
  (`.cs.seat-pilot/.seat-wso/.seat-gnd`, `flex:1` up to the CAT chip — owner, 4 Sep
  26: "make the entire bar of the cs/name to be filled … not only based on how long
  the name is"), a pilot olive and a WSO green so it reads the same in both apps.
  The Leave War bars are DARKER than Raptor's flight-line pucks (owner, 4 Sep 26 —
  "make the colour darker … still able to see the pilot or wso colour"): explicit
  deep-olive/deep-green hex in `matrix.css`, NOT `var(--fcp/--rcp)`, so the flight
  line keeps its own tone (never darken it via scheduler.css); ground crew keep a
  light bar, softened off pure white so a full-width run doesn't glare. On a phone
  (≤430px) the bar's side padding tightens to 4px so the 76px column keeps more of
  the callsign.
- **Leave War's qualification catalogue is Raptor's LoX column list, not the
  holders** (owner, 3 Sep 26 — "when i add a new qualification, i cant see that new
  qualification added in the settings page of leave war"). The Quals page's column
  list lives in `src/engine/qualcols.ts` (`qualCols` / `setQualCols`; the page
  mirrors its `cols` state there and fires `notify` only on a real change);
  `raptorRoster.ts qualCatalogue` takes keys AND headings from it, appending any key
  someone still holds after a column was removed (so ticks survive and a pinned
  group is not pruned). Known gap, not fixed: like the ticks, the column list is not
  saved across a reload.
- **Show SANS = SANS as their own counted group at the foot** (owner, 3 Sep 26).
  The switch injects a SANS group (`SANS_GROUP`, auto-managed, never stored) LAST on
  the page and FIRST in who-wins, so shown SANS draw together at the foot rather than
  scattering into their CATs; they still count in manning by seat+band like any
  aircrew (a group never moves a count — the `groups.ts` invariant holds).
- **The `npm run perf` board DOM ceiling of 1150 is settled** (owner,
  28 Aug 26 — "the scheduler board I know it's heavy, u raised the limit,
  it's ok"). Raised 960 → 1150 in PR #333 (the board sits at ~1051 nodes;
  timings and per-node cost held at 0.57× the reference throughout). The
  measurement lives at the `DOM_CEILING` literal in `perf-port.cjs`. Do not
  re-litigate the raise or trim the board to fit the old ceiling.
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
  **It CAN be dropped per input now, and that is a display switch, not a rule**
  (owner, 21 Aug 26 — "show a late tag beside the applicable inputs … when I
  click on the late orange icon beside the line, it will remove the late icon,
  if I click the same area again it will show"). This REPLACED the 20 Aug global
  "Hide LATE marks" header button, which the owner asked to remove. The 20 Aug
  entry argued AGAINST a per-badge delete because clearing marks one at a time
  needs a forgiven-input registry and a way back; the owner then asked for
  exactly that, with the way back built in — so the registry exists (`LATEOFF`
  in `state/view.ts`, a session-only Set of input ids) and the way back IS
  tapping the same chip again. Three parts of the shape stay decided: the
  board's LIVE input rows (Personal Inputs AND Unavailable) always draw a
  clickable `latechip` on a late row — solid while shown, a dim ghost once
  dropped — so a dropped mark stays reachable; the gate is at the passive
  printers in `ui/html.ts` (`lateShown`), so `isLateInput` goes on answering and
  the mark stays a mark; and the **Inputs page keeps printing it**, because that
  page is the paperwork record and quieting a busy board is not the same as
  erasing when an input was filed. Admin-only at the write path, cleared on
  every login/logout. Don't move the gate into the engine, don't bring back the
  global header button, and don't "finish the job" by silencing the Inputs page.
  Rules: `docs/engine-rules.md` §The late-input mark.
  Placement: `docs/ui-contracts.md` §The late-input mark on screen, §The LATE
  marks can be dropped per input.
- **No warning / advisory / note counts in the top bar** (owner, 20 Aug 26 —
  "what's the point of having warning, advisory and note at the top. Just
  remove it"). The three `pillbtn` counts are gone. Every day already leads
  with its own "N issues · N warning · tap to review", which is the number a
  reader can act on and it sits beside the day it belongs to; the pills
  restated the week's sum on the phone's tightest bar. `openWarns`
  (`state/view.ts`) is KEPT with no caller on purpose — probe-bridge mirrors
  it, it is reference behaviour, and it is what any future "expand everything"
  control would call. Their absence is pinned in `app.test.tsx`: do not put the
  sum back as part of a "the top bar looks empty" pass.
- **Nothing on the board re-orders itself** (owner, 10 Aug 26 — "prevent a
  situation when the scheduler types and the line jumps"). Typing a role into
  a blank duty cell used to reposition the whole block; that is gone. Auto
  sort and Sort all are the only things that reorder a duty block, and they
  order it by START TIME, not by role rank. Do not add an automatic sort back
  to any board list. (The Ground Programme's render-time time sort predates
  this and stays — it was a separate owner request and already avoids the
  problem, since time-less rows sink to where the model appends them.)
- **MAIN/SPARE on a standalone line is a clickable BADGE in the remarks cell,
  and clicking it flips the line** (owner, 24 Aug 26 — "can I have the option
  to change the line to SPARE from MAIN, vice versa … rather than a default
  main or spare faded in the remarks"; supersedes the 10 Aug ghost-text
  decision, which had exactly the trade-off the owner came back about: a line
  carrying a remark stopped saying whether it was main or spare, and the role
  could never be changed at all). `html.ts:saRoleHTML` draws it on the week
  and the board alike — a button in edit mode, the same chip read-only
  elsewhere — and the remarks box placeholder is plain `Remarks` like every
  other line. The flip is ENGINE-VISIBLE, not a rename: `a.spare` + `a.role`
  flip together, `scSpare`/`saExempt`/the shift count all follow, and the
  handler (`interactions.ts`, `data-sarole`) marks the line's `st:` key
  pending the way CX does, so the change rides the next AL. The next-week
  peek keeps the role as compact fallback TEXT (`saRoleText`, the one label
  body). Don't bring back the placeholder, and don't make the flip a
  label-only rename. Pins: `sarole.test.tsx`.
- **On SC, the B box is an IN-TIME, and its sortie furniture is gone** (owner,
  24 Aug 26 — "remove the intime and 8ac note on the top right of SC … don't
  suggest a brief time in blue. Only if the brief time is filled in then u will
  use that as the in time for the warnings and advisories. But we will hardly
  have a brief time"). Three parts, SC only (`w.kind==='sc'`), AVALON/BB
  untouched: the board drops the SC wave header's "in-time · N ac" note; SC
  lines lose the blue click-to-accept suggested-brief ghost but KEEP the empty B
  box; and the engine reads a typed SC `f.br` as the crew's in-time —
  `events.ts` feeds it to `intime`, `validate.ts:insOf` anchors the shift's crew
  rest on the earlier of it and the shift start. Blank (the normal case) is
  byte-identical to before (SC stays on its shift start). Don't restore the
  header note or the blue suggestion on SC, and don't turn the B back into a
  brief. Extended later the same day (owner): an early B on a MAIN also starts
  the long-day / duty-hours span (`workSpan` takes `min(report, start)` for
  shifts), and anything cutting into or ending inside the B→start window —
  another event, or a timed `restsInput` personal input — raises the amber
  `SC_INTIME` advisory (events already overlapping the shift stay with the hard
  clash loop instead). SPARE rows have no event stream, so both are MAIN-only
  by construction; conflict/double-book windows themselves still run off the
  shift times, not the B. One known seam left open (documented, not a bug to "fix" silently): the
  SC in-time is entered/shown on the board only — the desktop week renders SC as
  SHIFT / START / END with no B — so a value typed on the board isn't surfaced on
  the week. Owner said it will be rare; raise mirroring it to the week only if he
  asks. Pins: `scintime.test.ts`, `scboard.test.tsx`; rules
  `docs/engine-rules.md`, placement `docs/ui-contracts.md` §The B box.
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
- **Amendment marks are a PUBLISHED-day thing — a draft day shows none** (owner,
  25 Aug 26 — "if I have not published the schedule yet, don't show all the orange
  dotted lines … only once published does an AL-coloured mark make sense"). `alAttr`
  emits a pending mark (`data-alp`/`data-aln`) only when the day is `dayApproved`;
  a pending edit on a still-draft day emits nothing. The edit is still tracked in
  `SCHED.pending` (the "N pending" count, the publish flow and History are
  unchanged — History finds cells by key + the edit log, not by `data-alp`); only
  the misleading visual is gone. Don't re-add a draft-day mark. Pinned in
  `publish.test.ts` / `interact.test.tsx`; contract in `docs/ui-contracts.md`
  §Amendment marks on screen.
- **Flying-wave templates + the + Wave show/hide list** (owner, 25 Aug 26 — "create
  a function similar to how duty templates functions … for + Wave … choose which set
  of rules it follows … create, save, edit, delete, arrange … the admin page should
  update as well so the waves or templates can be toggled to hide or open by
  default"). The sibling of duty templates, one level up: `engine/wavetpl.ts` holds
  the library, `ui/WaveTplModal.tsx` is the editor (opened from the + Wave pencil,
  `WAVEEDIT`), and `+ Wave` (`board.ts:waveMenu`) lists saved templates beside its
  four built-in kinds. A template is `{id,title,kind,lines}`: **one rule-set per
  template** (owner's choice), exactly one of the four the app already checks waves
  by — `fly` / `sc` / `avalon` / `bb` — and each line is a flying line with a
  MAIN/SPARE flag that matters only on a standby kind. Placing one mints an ordinary
  wave (`waveFromTpl` → `addWaveFromTpl`) whose OWN kind flags (`standalone`/`noconf`/
  `night`) drive its checking, so nothing in `validate.ts` reads a template and
  reference parity is untouched. **A STANDBY-kind template mints the built-in's
  SHAPE** (owner, 26 Aug 26 — closing the "structurally lighter" seam):
  consecutive lines naming the same shift (cs + msn + times) become ONE
  formation with a crew row per line, exactly like `makeStandalone`, so the
  day badge and every per-formation reader treat a template SC like
  + Wave → SC; a fly line stays one formation per line. Don't return the
  standby mint to 1:1. Times store raw in the editor and normalise on blur
  / mint / load (`waveTime`, colon form `07:00` — the one difference from duty
  `tplTime`'s `0700`). Show/hide: a `WAVEHIDE` set (built-in key or template id),
  default all-shown; a deleted template drops
  its flag. Persisted like the stores/duty lists (`wavetpl` + `wavehide`), boot-loaded
  in `initStore`, untrusted storage clamped. Don't seed built-in templates (the four
  kinds are the baseline; the library starts empty), don't make `validate` read a
  template, and don't move the show/hide gate off `WAVEHIDE`. Pinned in
  `wavetpl.test.ts`, `WaveTplModal.test.tsx`, `wavepicker.test.tsx`.
  **The manage + edit surfaces are ONE sheet, opened by ONE gear** (owner, 30 Aug 26 —
  "quite an ugly design to have the settings and edit buttons separate … combine them
  through 1 button"; folds in the 29 Aug pt.3 ask to take show/hide/delete off Admin —
  "make flying wave templates more intuitive … remove it in admin"). The "+ Wave" menu
  (`board.ts waveMenu`) carries a SINGLE ⚙ (`data-wvedit`, title "Manage flying waves")
  plus a "N hidden · Manage" line, both opening `ui/WaveTplModal.tsx` — the unified
  "Flying waves" sheet that BOTH edits templates AND shows/hides/deletes what the picker
  offers: a "Wave types" list with an EYE per built-in kind (`setWaveHidden`), and per
  template an EYE beside its name plus the footer Delete (built-ins can be hidden but
  never deleted). The old separate ⚙-Manage sheet (`WaveManageSheet.tsx`, the `WAVEMANAGE`
  flag) is DELETED and folded in — don't re-add it or the second button. The Admin
  `WaveVisibility` list stays REMOVED (owner: keep Admin clean); Admin keeps only the
  wave-template editor button, which opens the same sheet. Same admin-only gate
  (`canEditSched` === admin), no permission widened. Don't leave a wave hidden with no way
  back — the "N hidden" line and the sheet's eyes are the way back. Pinned in
  `WaveTplModal.test.tsx`, `wavepicker.test.tsx`.
  **The kind-picker's one-line rule notes have ONE source, shown on the picker AND the
  Logic page** (owner, 30 Aug 26 — "make sure these word summaries are updated when I
  change the rules concerning them … and the logic page should be updated as well").
  `engine/wavetpl.ts kindNote(k)` is the single, count-free summary of each kind's
  CHECKING rule (fly/sc/avalon/bb), verified against `validate.ts` / `events.ts`: the
  template editor prints it under the kind picker, and the Logic page's "Wave types at a
  glance" group (`ui/logic-html.ts`) renders the SAME strings, so the two can't drift.
  It deliberately no longer reuses `SAWAVE.note` — that keeps its "2 MAIN + 2 SPARE" count
  for the built-in + Wave popup, where the count is real (`makeStandalone` mints exactly
  that); a template's line count is the owner's, so a count read as a limit there. When a
  kind's checking rule changes, update the rule, `kindNote`, and the detailed "standby
  lines" row on the Logic page together — `logic.test.tsx` pins that every kind's
  `kindNote` shows on the page, so a dropped wire fails a gate.
- **The leave/absence "what each type costs" sentence has ONE source too, shared by the
  Inputs "?" legend AND the Logic page's type matrix** (owner, 30 Aug 26 — "can u make
  sure these word summaries are updated when change the rules … the logic page should be
  updated as well"). `engine/inputs.ts inputRuleText(t)` is that single sentence, derived
  from the same flags the engine enforces (`canSpare` / `shiftHardInput` / `grp` / `work`
  / `local`). `InputsPage.tsx typeRule` and `logic-html.ts` `leaves()` both read it — they
  used to hand-write their own copies and had drifted (the Inputs gloss missed the SC-MAIN
  Warning nuance; the Logic matrix had no SANS / Upchit line). `inputs.test.tsx` and
  `logic.test.tsx` each guard that every `INPUT_TYPES` entry's `inputRuleText` shows on its
  surface, so a dropped wire fails a gate. When a type's rule changes, edit `inputRuleText`
  once. DELIBERATELY still separate, and NOT to be "helpfully" merged into this: `SAWAVE.note`
  (keeps its 2+2 count for the built-in popup), the `satag` caption in `html.ts`, and the
  OIL confirm sheet's prose (it walks a decision; the Logic page states the rule) — different
  jobs, different voices.
- **The DEFAULT arrangement is admin-set, and the wave half is "new schedules
  only"** (owner, 29 Aug 26 pt.2 — "allow the default arrangement of a schedule to
  be configured in admin … even to the arrangement of the waves under display").
  Admin → Squadron config carries a **Default arrangement** panel
  (`ui/AdminPage.tsx ArrangeDefaults`) with two ▲▼ lists persisted on the `wavehide`
  footing: **section order** (`engine/order.ts SEC_DEFAULT`, key `secdefault`,
  default canonical) is the fallback `secOrder(d)` uses for un-arranged sections —
  display-only, so a hand-arranged day still wins and the canonical baseline keeps
  parity 728/0; **wave order** (`engine/reorder.ts WAVE_DEFAULT`, key `wavedefault`,
  default OFF) orders the built-in kinds and is applied ONLY at wave-add time on a
  not-signed-off day (`board.ts placeAddedWave` in `addWave`/`addWaveFromTpl` →
  `waveInsertSlot` → the tested `moveWave`). The owner chose new-schedules-only over
  re-shuffling every day, because a wave move is a real amendment: DON'T make the
  wave default re-order existing or published days, and DON'T give the wave default a
  "display-only" layer (it would fight `sortWaves`). Unset wave order = append as
  before. Pinned: `engine/arrdefaults.test.ts`, `ui/wavedefault-add.test.tsx`,
  `ui/admin.test.tsx`.
- **Sections and waves are re-ordered by IN-PLACE DRAG, not a sheet** (owner, 30 Aug
  26 — replacing the 29 Aug `⇅ Arrange` sheet, which is DELETED). A grip on each
  section (`.sb-sec[data-secmove]` on the board, `.dsec` on the edit
  week — edit-mode only) and in each wave header (`.wvgrip` + `data-move="mv:w…"` on
  the block) drags the whole panel / wave into a new place, on both surfaces. One
  machine, `ui/rowdrag.ts` (wired on the board wrap AND the edit-week root), tells the
  three draggables apart by the grip pressed and validates the drop with `applyMove`'s
  own same-container rule. These grips stay draggable at EVERY width — a section/wave
  is a big target — and since 31 Aug 26 the dense ROW grip is too (the ▲▼ row nudge
  was removed and each row's first box shortened to seat the grip; see the row-grip
  entry below). Don't add arrows back to any of them (the owner's "drag, no arrows"). The
  SECTION grip is the SAME dotted `⠿` the row/wave grips carry (owner, 31 Aug 26 —
  reversing the 30 Aug drawn-rail: "the drag markers should all follow the old design
  in which it's dotted"), placed INLINE at the head of the panel's own header (board
  `.sb-ph`, week `.ah-h`/`.sub-h`/`.wv-sech`) — NOT as an overlay rail in the gutter.
  Inline, it aligns with the wave grip's column (the owner's "align with GO 1"), pushes
  its title clear of itself, and centres on the title line (`align-items:center`); the
  board header's gap is tightened to 6px so the added grip borrows from the header's own
  spacing, not from the sub-text / buttons on the right (owner — "make sure the text or
  buttons on the right aren't squeezed"; measured 16px clearance). The headers set
  `user-select:none` so a thumb holding the grip never paints the title blue. Don't
  turn the section grip back into a rail/overlay, and don't drop the no-select.
  **Overall Notes and Common Programme are two SEPARATE draggable sections on the
  board** (owner, 31 Aug 26 — "split them apart"; `SECTIONS=['notes','prog',…]`, each
  its own `.sb-sec[data-secmove]` card). On the EDIT WEEK the day notes still print as
  lines inside the Common Programme block (they never had a card of their own there), so
  the week keeps them in the 'prog' slice and its 'notes' slice is EMPTY and skipped —
  which is exactly what keeps the view week and the reference byte-identical (the empty
  slice adds nothing). The week's Flying-waves section still gets its edit-only
  `.wv-sech` "Flying waves" header (stripped in `html.test.ts`'s reference compare) so
  its inline grip has a header to sit in; don't drop it.
  **The four CREW WORKING-AID panels join the SAME draggable list on the board**
  (owner, 31 Aug 26 — "one list, drag anywhere"): Personal Inputs, Available crew,
  SANS availability and Unavailable are ordinary section keys now
  (`SECTIONS=[…,'inputs','avail','sans','unav']`), each wrapped in its own
  `.sb-sec[data-secmove]` card with the same dotted grip, so any card can be dragged to
  any position (Available crew up next to the flying waves, say). **Since 31 Aug 26 they
  drag on the EDIT SCHEDULER too** (owner — "drag markers on edit scheduler … follow the
  same formatting as the rest of the sections"): `ui/html.ts dayHTML` in EDIT mode emits
  all ten sections — the crew four included — through the SAME `secOrder` loop as the
  board, each in a `.dsec[data-secmove]` with a grip, so a drag on either surface drives
  the ONE per-day order (no second copy to drift). The VIEW week is UNTOUCHED and
  parity-locked: there the four are not draggable and only Unavailable prints, appended in
  its fixed tail exactly as before, so `dayHTML(view)` and the reference stay
  byte-identical (728/0 — the whole change is gated on `ed`). This is a scheduler
  WORKSPACE arrangement, not a published property; the squadron's view week is
  untouched. Being ordinary section keys they ride the per-day order, the admin house
  default (Admin's Default-arrangement list shows all ten now, with a note that the
  crew four are scheduler-workspace only — board + edit week, never the view week) and
  the "Set default?" snackbar for free. The grip is
  injected by a loose `sb-ph`|`ap-h` header match in `board.ts wrapSec` (Available
  crew's header is `.ap-h`, re-laid to flex-start so the grip rides with its title);
  Personal Inputs' foldable header is centred for the grip (`.sb-sec .sb-ph.pl-fold`,
  it was baseline — the 7px "grip too high" the owner flagged), and a grip-tap on the
  two foldable headers is guarded in `interactions.ts` so it starts a drag, not a fold.
  On the EDIT WEEK the same grip is injected by a first-header regex
  (`ah-h`|`sub-h`|`ap-h`) in `dayHTML`'s `gripIn`, and Available crew's `.ap-h` gets the
  same flex-start re-lay (`.dsec .ap-h`). Don't fold the crew panels back into a fixed
  tail, and don't let their order reach the VIEW week (the edit week now shares the
  board's order, gated strictly on `ed`, so parity holds). A
  SECTION drag is display-only (`store.moveSectionTo` → `engine/order.ts
  reorderSectionTo`, histPush, no markEdit) and then offers the **"Set default
  order?"** snackbar (`ui/SecDefaultSnackbar.tsx`, `SECDEFOFFER`) that promotes it to
  the house default via the SAME `setSecDefault`/`secDefaultSave` the Admin panel uses.
  A WAVE drag is unchanged — a real amendment via `applyMove('mv:w…')` → `moveWave`.
  A held drag AUTO-SCROLLS at the top/bottom screen edges (owner, 31 Aug 26): a day is
  taller than a phone and the grips are `touch-action:none`, so `rowdrag.ts` scrolls
  the nearest overflowing surface (board's `.sb-board`/`.sb-main`, or the window on the
  week) via rAF while the finger holds an edge, re-reading the drop target under the
  still finger each step. `pointermove` is on the DOCUMENT, not the surface (like
  `pointerup`), so the finger tracks to the very edge and over the app header without
  the velocity freezing; don't move it back onto the container.
  The old one-week "Apply to all days" is GONE (the henceforth default supersedes it);
  don't re-add it, the Arrange sheet, or a phone nudge for sections/waves. Edit-only
  grips keep the view week byte-identical (parity 728/0). Pinned: `ui/rowdrag.test.tsx`,
  `ui/SecDefaultSnackbar.test.tsx`, `ui/board.test.tsx`, `ui/html.test.ts`. Contract:
  `docs/ui-contracts.md` §Dragging sections and waves.
- **Dense ROW reorder is by DRAG too — the ▲▼ nudge is GONE** (owner, 31 Aug 26 —
  "remove up and down arrow and add a drag marker to those lines … align it vertically
  with the rest of the text boxes … make sure all the alignment is considered for all
  drag markers"). This REVERSES the 8 Aug "phone hides `.sb-grip`, shows ▲▼" split:
  every dense row (flying line, duty, sim, ground, Common Programme, Overall-note) now
  shows its dotted `⠿` grip at ALL widths and reorders by dragging it. `sbNudge` returns
  '' (no ▲▼ renders — also ~2 nodes/row off the board DOM budget); the phone grid
  templates gain a LEADING MARKER TRACK, the header's leading placeholder is
  un-hidden so the column titles shift with it (each box stays UNDER its own heading),
  and the first box shortens by the track. The right-hand tracks are untouched, so the
  remarks box stays 154px right-anchored and still lines up with the flying line's.
  **A same-week follow-up widened the lane 13px → 20px and shifted the pucks flush-left**
  (owner — "the text box just starts right of the drag marker … not inside the text box";
  "the pucks can shift it back to the left so that it holds 2 pucks not blocked … make
  sure the rest are placed back to the same area"): the glyph is left-aligned in the wider
  lane so the handle sits clear of the first box (measured gap 8px → 17px), and the puck
  containers span from track 1 (`.sb-line .sb-seatpair` `1/4`, `.sb-arow.c6r>.ppl` `1/3`)
  to reclaim the marker lane on their OWN line (the grip bottom-aligns to the first line,
  so that lane is empty there) — every crew puck goes flush-left (measured delta 0, the
  old layout's spot) and a two-wide box's second puck clears the remarks instead of
  clipping under it. No puck resized (the AMT droppable-hole spec holds); marker width
  doesn't affect puck fit, so widening the lane was free. Don't return the puck spans to
  track 2 or the glyph to centre. ui-contracts §Dense row reorder carries the measurements.
  ALIGNMENT is a HARD RULE now (owner — "I don't want to keep repeating this"): every
  grip's centre is MEASURED against the box beside it to delta 0 — the flying line's grip
  bottom-aligns (`.sb-line>.sb-grip{align-self:end;height:24px}`) because its first-row
  boxes bottom-align under the tall B cell; the c6r/notes rows sit in a box-height first
  row so their grip centres naturally; the section/wave/crew grips were already
  box-centred. Don't re-add the ▲▼, don't hide the row grip on a phone, and don't move a
  grip's placement without re-measuring delta-0 against its neighbour box. The boardMbtn
  mv:up/dn branch stays as an inert guard for a stale element. Pinned:
  `ui/rowdrag.test.tsx` (drag machine), `ui/board.test.tsx` (grip present, no ▲▼).
  Contract: `docs/ui-contracts.md` §Dense row reorder.
- **The highlight MENUS must read apart from their CHIPS** (owner, 25 Aug 26 —
  the CAT / Type / Quals tabs looked so like the chips inside them that, with one
  menu open, the next shut menu read as another selectable chip). A `.hl-gtab` is
  a solid RAISED control in the brighter `--ink` with a bold caret — plainly a
  menu that opens; a `.fchip` stays a flatter, quieter `--panel-2`/`--ink-2` tag
  that only fills blue (`--accent`) once picked; and an open `.hl-grp.open` wraps
  its tab and chips in one hairline tray (scoped to `.filters` / `.ic-pick-cats`,
  since `.hl-grp` is a class the History accordion also uses — don't restyle the
  bare `.hl-grp`). Don't flatten the tabs back to the chip recipe in a filter-bar
  polish pass. All in `scheduler.css`; the strip is `ui/hlchips.tsx`.
- **A new flying line comes up blank** (owner, 10 Aug 26). `+ Line` used to
  copy the previous line's callsign, mission and times; a plausible wrong
  value reads as filled in when nobody filled it in. **`+ Wave` follows the
  same rule** (owner, 25 Aug 26 — "keep the data clean … nothing filled"): an
  ordinary flying wave's first line used to seed `NEW / 12:00 / 13:00`, which
  read as filled-in and painted a green suggested-brief in-time off the 12:00;
  it now comes up blank (`cs/msn/to/ld` empty), byte-identical to a `+ Line`
  add. Standalone waves (SC/AVALON/BB/SPARE via `makeStandalone`) keep their
  own kind-specific structure — this is the `!kind` branch only. Pinned in
  `board.test.tsx`. Don't re-seed the plain wave's first line.
- **The phone board's top bar is ONE row, and the day is STEPPED BY ARROWS on
  the day strip below it** (owner, 11 Aug 26 — comp approved before build; the
  day was SWIPED until 12 Aug 26, see the amendment at the end of this entry).
  The seven Mon–Sun chips became dots
  then LEFT the phone bar entirely on 23 Aug 26 (see the amendment below);
  `+ Line` is gone from the bar (every wave header already has one),
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
  **The dots were also a scrub bar** (owner, same day) — press and slide to
  run through the week. On 23 Aug 26 the dots (and the blue current-day
  square) were REMOVED from the phone bar (owner) to free the day row for
  search + highlight; the scrub survives on DESKTOP, where the Mon–Sun chips
  still draw, and there the old rule stands: every chip keeps the same
  footprint whatever is selected — do not make the current one grow, it
  shifts the strip under a tracking finger.
  **THE DAY IS STEPPED BY TWO ARROWS, AND THE SWIPE IS GONE** (owner, 12 Aug 26
  — "remove the swipe for the mobile scheduler board too. Just put arrows at the
  edges of the bar at the top to navigate left and right between days"). Do not
  rebuild the swipe. It was itself an owner ask on 11 Aug and it ran through
  three shapes in a day and a half — a jump on a distance threshold, a carousel
  tracking the finger behind a preview pane, then that carousel with its
  hit-testing, settle and animation reworked and a phone-only gate — each round
  paying back what the last one cost. `#sbPrevDay`/`#sbNextDay` call
  `boardDayStep(±1)`. They USED to be disabled at the week's ends; since 22 Aug 26
  they are CONTINUOUS ACROSS WEEKS instead (owner — "in scheduler board it's
  continuous arrow between weeks"): stepping off Monday loads the previous week's
  Sunday, off Sunday the next week's Monday (`boardDayStep` calls `loadWeek` then
  `boardTab`). The swipe stays gone — only the arrows changed. Do not re-add the
  end-of-week `disabled`. A top-left calendar icon (`#sbCal`) opens the week
  picker in 'board' context, where a pick loads that week and opens the tapped
  day. They flank the DAY STRIP rather than the
  bar's first line, which has 6px of slack and would have had to give up the day
  name; the bar went 70px → 75px and nothing came off line one. Above 820px they
  are not drawn — a desktop bar already carries all seven days as chips, which is
  why it never needed either control. The dots sat between the arrows until
  23 Aug 26, when the owner removed them from the phone bar: the freed middle
  of the day row carries `#searchB` + `#sbHl` (search + the highlight fold)
  and the arrows plus the bar's day title carry "which day" — desktop chips
  unchanged, the one-row rule unchanged, and the removal is `display:none` in
  CSS so `dayTabsHTML`/`wireDayDots` and the jsdom tests are untouched. Gone
  with the swipe (which STAYS gone): the `.sb-pane` preview and `.sb-main`'s
  own `touch-action`, so the scroller is the browser's default again.
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
- **Week navigation is a rolling window + a calendar, and it is CONTINUOUS**
  (owner, 22 Aug 26). The fixed 5-chip `WEEKS` strip is gone from the segs;
  `weekWindow(CURWEEK)` (`src/ui/weeknav.ts`) draws four `data-wk` buttons —
  prev · current · +1 · +2 — that re-centre on whatever week is loaded, the
  loaded one `.on` and the today-week dotted. A calendar icon opens `WeekCal`
  (`src/ui/WeekCal.tsx`, the app's own `.rc-*` picker, single-date with a
  whole-week highlight); tapping any day loads that day's week (`loadWeek` +
  `mondayOf`). On a phone the seg is hidden and a lone calendar icon stands where
  the removed title was; the view/edit week is stepped day-to-day by SWIPE, which
  is CONTINUOUS across weeks (swipe off Sunday → next week's Monday, off Monday →
  previous week's Sunday — `pan.ts` edge-overswipe + `WEEKJUMP` landing the
  scroll in the same repaint). **A wave-dense day no longer traps that swipe**
  (owner, 23 Aug 26 — "stuck to swipe back from Jul 20"): a flying day is almost
  all `.go` wave blocks (each its own sideways scroller with
  `overscroll-behavior-x:contain`), and the handler used to cede the whole
  gesture to a `.go` the instant a touch began inside one — so on a busy Monday
  the back-swipe had nowhere to begin and stuck, while a bare-ground Sunday
  crossed fine. Now the block and its scrollLeft are recorded at touch-start and
  the decision is made at touch-END: if the wave actually scrolled it owned the
  swipe, but a wave already at its own edge (it never moved) lets the gesture
  fall through to the week cross. Don't restore the touch-start `.go` bail.
  The DESKTOP `‹ ›` arrows are continuous across
  weeks too (owner, 23 Aug 26 — completing this decision): stepping past the
  week's last day loads the adjacent week and lands on its near edge, instead
  of the arrows going dead at the ends. DESKTOP landings are instant — no settle
  animation on an arrow cross. **The desktop arrows walk EVERY live day — including Saturday and Sunday —
  to the FRONT before they cross** (owner, 23 Aug 26 — "Friday not aligned on
  the far left … Saturday and Sunday out of selection of the placeholders … 2
  right arrows to get to next week"). A wide screen shows three columns, and the
  ceiling used to be "Sunday jammed flush RIGHT" (`weekScrollMax` = last day's
  right edge − clientWidth), which left FRIDAY at the front: the weekend never
  reached the front to be crewed, and the final press only nudged the sliver
  before crossing. `weekScrollMax` is now "the last live day at the FRONT" =
  `(liveDays − 1) × dayStep` clamped to the scroll range — the next-week
  preview's real columns (`ui/peek.ts`) are the runway that makes
  Sunday-at-the-front a whole view rather than a void — so `panDays` steps Mon
  → … → Sun, each to the front, and crosses only on the press PAST Sunday. The
  `sun` cross-back landing is Sunday-at-the-front too, symmetric with `mon`
  landing Monday there. The JS-sized trailing spacer stays
  (`pan.ts:setWeekTail` → `.week::after` / `--week-tail`, desktop only) so a FREE
  scroll fully right still stops on a whole column; don't reintroduce a fixed
  `calc()` spacer, and don't restore the flush-right ceiling. **One arrow press
  = one day even mid-glide, in BOTH directions** (owner, 23 Aug 26 — "twice on
  Tuesday to get to Wednesday", and its mirror "twice back from Thursday … then
  the next click jumps to Tuesday"): an arrow scroll is a ~350 ms smooth glide
  that each fresh press restarts, and rapid taps OUTRUN it — by the second or
  third press the live `scrollLeft` is still most of a day behind the column the
  presses have already commanded, so counting the next step from it made every
  other press cancel the last. `panDays` counts from the position the last press
  COMMANDED (`panTgt`) while the glide is still in flight toward it, judged by a
  BURST CORRIDOR from where the burst started (`panAnchor`, the live scrollLeft
  the first press counted from) to `panTgt` (`panBase`) — a manual wheel-pan or
  a new week drops the target. The corridor is anchored at the burst start, not
  the last step: the first cut used the previous step's start (`panPrev`), a
  one-day window a fast backlog overshoots, which left the back-direction bug
  alive. Don't narrow it back to the last step. **A park NEAR a day boundary
  counts as ON it, and a plain horizontal wheel drops the corridor** (owner,
  24 Aug 26 — "when the left most day on the screen is Saturday, I require 2
  right arrow clicks to go to Sunday instead of 1"). A free scroll — the proxy
  scrollbar, a trackpad — rests the strip wherever the pointer stopped,
  routinely a few dozen px shy of the column visibly at the front; the old
  hairline 0.02 tolerance read that as "still on Friday", so the first press
  nudged the invisible gap and only the second moved a day — and the 1px
  edge tests made the week-cross need the same nudge-press first.
  `pan.ts:PARK_TOL` (0.35 of a day) now decides both the step counting and
  the edge-cross guards; a genuinely mid-day park still steps from the day
  being left. The same session's second find: a NO-SHIFT horizontal
  wheel/trackpad pan scrolls the week natively, invisible to `onWheel`, so
  the corridor survived it — arrow to Sunday, trackpad back to Saturday, and
  the next › counted from the stale Sunday target and jumped a whole week.
  `onWheel` now drops `panWk` on any plain horizontal tick over a `.week`
  (booleans-only on the common vertical path — the Edge no-JIT contract
  holds). Don't shrink PARK_TOL back to a hairline, and don't remove the
  deltaX invalidation. **The proxy scrollbar must never write the week back
  mid-glide** (owner, 24 Aug 26 — desktop `‹ ›` arrows "don't go day by day …
  stuck halfway then zoom past a few days"). `panDays` fires a
  `scroll-behavior:smooth` glide; every frame of it mirrors the week to the
  pinned `#hsTrack` proxy, and the track's own echoed `scroll` used to run
  `onTrackScroll`, which wrote the week straight back with `behavior:'instant'`
  — and an instant scroll CANCELS an in-flight smooth scroll. The mirror lags a
  frame, so its back-write landed a few px behind where the glide had reached,
  killing the animation and freezing the strip mid-day (or, when a frame slipped
  through, scrubbing it fast — exactly the report). The B33 self-terminating
  two-way sync is sound for two STATIC positions, but the week is not static
  mid-glide, so the loop is now broken by ORIGIN, not position: `mirrorToTrack`
  records the exact scrollLeft it puts on the track (`trkEcho`), and an
  `onTrackScroll` that finds the track still sitting there is that echo — it
  updates the label and leaves the week alone. Only a real drag of the native
  scrollbar thumb (the track somewhere ELSE) drives the week, and that path also
  drops `panWk` — the native scrollbar doesn't reliably fire the `pointerdown`
  that `onTrackGrab` listens for, so the corridor is invalidated here instead.
  Don't route the week→track mirror around `mirrorToTrack`, and don't let
  `onTrackScroll` write the week unconditionally again. **`trkEcho` alone was
  not enough — the glide now OWNS the week while it is in flight** (owner, 25 Aug
  26 — "make sure it's not just an easy fix", after a test flake led back to this
  seam). Position bookkeeping cannot survive a `scroll` event the browser
  coalesces or defers under load: the deferred echo arrives after a newer frame
  has moved `trkEcho` on, clears `HS_EPS`, and is mistaken for a drag — so
  measured on the built app the arrows still swallowed ~1 press in 7 under load.
  `panDays` now arms a short window (`glideEnd`, `GLIDE_MS`) on every press, and
  during it `onTrackScroll` is a pure follower regardless of position; the window
  clears the instant the glide lands (`onDocScroll`) or on any manual pan /
  scrollbar grab, so a real drag right after a step still drives the week. A
  SECOND writer was cancelling the same glide: a within-week repaint (the
  debounced palette-follow `notify` from `rosDayFollow`) re-pinned the week's
  scrollLeft to the mid-glide position; `panHold` (`EditWeek`/`ViewWeek`) now
  holds the glide's TARGET during the window instead, so a mid-glide repaint
  lands on the intended day, not between two. Together these took the day-skip to
  0/50 at human pace with the real animation. Pinned in `pan.test.tsx`; don't
  remove the `glideEnd` guard or revert `panHold` to pinning the live `sl`.
  **The DESKTOP
  scheduler board now has week navigation** (owner, 23 Aug 26 — "in scheduler
  board i cant go between weeks except through the calendar"): `‹ ›` week-jump
  chips flank the seven day chips inside `#sbDays` (`board.ts:dayTabsHTML`,
  `data-sbweek`, not `data-sbtab`), one press jumps a whole week and keeps the
  open weekday (`boardWeekStep`); they ride inside `#sbDays`, which is
  `display:none` on a phone, so the phone board keeps stepping days with its own
  edge arrows and every `[data-sbtab]` scrub/test is untouched. The `.crew-hint`
  edge hint stays RETIRED — the weekend now genuinely reaches the front, so the
  limitation it apologised for is gone; don't reintroduce it. **The PHONE
  swipe cross GLIDES, though** (owner,
  23 Aug 26 — "go with glide … glide between weeks"): a boundary cross slides
  instead of reload-flashing. It is `src/ui/weekglide.ts` (`beginGlide`), called
  from the WEEKJUMP branch of ViewWeek/EditWeek, phone-only (≤820px) and
  reduced-motion-aware, and it no-ops without layout so the gates are untouched.
  **It slides TWO FROZEN CLONES, and hides the real week behind them** (owner,
  24 Aug 26 — "I can see it scrolling through the week in a fast motion … don't
  even show me that"). The first cut slid the LIVE incoming week, which still
  carried the flick's leftover FLING, so the browser scrubbed it through Tue/Wed…
  behind the panel — the exact "scrolling through the week" the owner rejected.
  Now BOTH the outgoing week (frozen on the finger's day) and the incoming week
  (frozen on its landing day) are `overflow:hidden` clones — which cannot scroll
  or fling — and they tile the viewport while the real week is `visibility:hidden`,
  revealed and re-landed only when the clones come off. Three load-bearing
  details, don't drop them: the incoming clone's landing day is derived from the
  cross DIRECTION (`fwd ? 0 : weekScrollMax`), NOT the live `scrollLeft` (the
  phone snap doesn't reliably hold the far Sunday edge the instant it's written,
  so reading it froze the clone on the wrong day); `void c.offsetWidth` forces
  each clone's layout before its `scrollLeft` is set, or a fresh clone clamps to
  0; and the real week is hidden so its own fling / flaky snap is never on
  screen. Don't go back to sliding the live week, or to a single clone. The clone
  sits at `z-index:40`, BELOW the sticky `.topbar`
  (`z-index:60`) — it used to tie the bar at 60 and, being a `position:fixed`
  clone anchored at the week's `rect.top` (which is above the bar once the page
  is scrolled down) appended last to `<body>`, it painted the sliding week OVER
  the bar for the length of the slide (owner, 23 Aug 26 — "bleeding at the top
  bar when swiping"). The slide is page content; keep it under the chrome — any
  value below 60. The swipe is NOT locked to one day — a firmer flick still crosses
  several days within a week, which the owner explicitly kept (23 Aug 26 — "don't
  lock the swipe to a day. I actually like how it is currently"); do not add
  `scroll-snap-stop`. Within-week day-to-day swipes never glide (only a Monday/
  Sunday landing does), and desktop stays instant. `WEEKS` (`engine/waves.ts`) is kept for
  probe-bridge/reference but is no longer the seg render source. The engine
  already builds any week (`weekBundle`/`emptyWeek`), so nothing bounds this.
  The big `Jul 13 – Jul 19` title (`#vTitle`) and the `142 · week of… · all times
  local` sub (`#vSub`) were REMOVED as redundant clutter — the day cards carry
  the dates. Don't re-add the fixed chips, the title/sub, or the end-of-week
  clamp. All week label/Monday math lives in `weeknav.ts` (one drift seam).
  The DATE PICKER is a DAY picker (owner — "the week will be transparent to the
  user … as the user scrolls it will feel like a continuous flow"): tapping a day
  loads that day's week and lands the view on that exact day (`WEEKJUMP` carries a
  day index; the board opens it). Don't turn it back into a week-row picker.
- **Personal INPUTS are GLOBAL, not week-scoped** (owner, 22 Aug 26 — "show all
  inputs regardless of which week I am selected on"). `loadWeek` swaps DAYS/DATES
  but NOT `INPUTS`; every authored week's inputs are merged into the one `INPUTS`
  array at boot (`initStore` + `weeks-data.ts:otherWeekInputs`, idempotent, and
  boot-only so parity stays 728/0). Each week's SCHEDULE still shows only its own
  because the day builders and auto-land match by DATE (`inputCoversDate` /
  `DATES.indexOf`). The one gotcha, kept in `loadWeek`: it clears every input's
  `acc` so `autoAcceptSeedInputs` re-lands the date-matching rows onto the fresh
  (ground-row-less) days — without it an input stays marked accepted with nothing
  on the day. Don't re-add the `INPUTS` swap, and don't move the `acc` clear.
  Flow: `docs/feature-impact.md` §Flow E.
- **Manage users lives on the Admin tab** (owner, 23 Aug 26). The topbar
  `#manageUsers` button and the `#userModal` are gone; the same fields, list
  and mutations sit on the Admin page (`ui/AdminPage.tsx`), the seventh nav
  tab, ALWAYS LAST in both navs and admin-hidden like the Edit tab — but the
  PAGE is the gate (`#admDeny`), per the standing role doctrine. Don't put
  the button back on the topbar, and don't add a tab after Admin.
- **No repeat-weeks on inputs** (owner, 22 Aug 26 — "remove repeated weeks
  everywhere"). The Inputs form's "Repeat wks" field, the table's Recurring
  column and the record's `recur` write are all deleted. The feature never
  actually repeated anything — the record stored ONE span and `recur` was a
  label nothing expanded, which surfaced when the month calendar could only
  chip the first span — so the choice put to the owner was "draw every
  repetition (a real feature) or live with the mismatch", and he chose
  neither: remove it. A truly repeating input would be that real feature,
  built only if he asks; do not re-add the label-only field, and a member
  needing the same absence weekly files it per week. Its absence is pinned
  in `inputs.test.tsx`. (The read-only `reference/` keeps its own Repeat
  field — test-only, never served, same as the callsign scrub.)
  Moving an `Other` row to Ground or Unavailable is the `→ Ground` /
  `→ Unavail` buttons in `html.ts`, on both the week and the board. Don't add
  drop targets to `drag.ts` for it; that machine stays scoped to pucks.
- **The calendar day popover — five owner asks, 23 Aug 26** (all in
  `InputsCal.tsx` / `scheduler.css`, verified live before shipping;
  `docs/ui-contracts.md` §The Inputs month calendar carries the detail):
  - **A SANS input reads its F/O/A letters on the popover row too**, not just
    the cell chip — the row label is `isSansAvail ? (sansLetters||'F/O/A') :
    inpLabel`. Don't put "SANS Availability" back on the row.
  - **The day TITLE matches the date number's size** (15px/700). Without an
    explicit size the input took the UA default — 16px on a phone, larger than
    the date. `.ic-pop .ic-pop-head .ic-title-edit` outspecifies the shared
    `.ic-pop input` font. Don't drop the explicit size.
  - **A cell NOTE is plain text, no box** (the old `.ic-chip.plan` dashed
    accent border is gone); on the phone, where its text can't fit, it's a
    muted `--edge-2` bar so it stays visible. Don't re-add the dashed border.
  - **The cell mini-pucks (`.ic-pk`) are standard-olive** (`--fcp`), the
    CATEGORY a right-edge line (`--pk-cat`, drawn by `::after`), a SANS person
    a purple LEFT line (`.ic-pk.sans::before`). NOT the old full CAT-tint fill.
    The stripes are pseudo-elements (not inline box-shadows) so the phone thins
    them; the cat colour rides in as `--pk-cat`.
  - **`+ Pucks` opens the MULTI-SELECT picker** (`.ic-pick`), not a one-at-a
    -time `<select>`: category highlight buttons (`HL_CATS` + `personMatchesCat`
    — the SAME predicate as the highlight chips, one body in `state/view.ts`)
    light a whole category, and **✓ Add** batches the ticks
    (`addPuckRow(iso,ids)` for a new row, `addPuckPeople` to top one up — both
    dedupe). A seated puck is removed THREE ways: its ✕, a right-click
    (desktop), or a **drag off its row** (`startPkDrag`, phone + desktop —
    released outside its `[data-secpucks]` drops it). Don't restore the
    per-person `<select>`, and keep `personMatchesCat` the one category
    predicate — a second copy is the drift seam.
- **No ⋯ collapse of the phone row control strips** (owner, 16 Aug 26 — built,
  shipped and rolled back the same day). Every flying/duty/sim/ground row's
  `▲▼/CX/■/✕` strip was tucked behind one ⋯ (a `CTLOPEN` view state, one row
  open at a time); the owner asked to undo it. The full implementation is one
  `git revert` away (the "collapse each row's control strip behind a ⋯" commit),
  so don't rebuild it from scratch or re-propose it unprompted. The row strips
  stay always-visible on a phone. The sibling touches from that batch — the
  aircrew-tab gutter, plural warnings, and the week's faded `Remarks`
  placeholder — STAND; only the ⋯ collapse was undone (and the batch's board
  4-digit input times were later reversed by the 30 Aug hh:mm decision below).
- **EVERY time in the app reads `08:00` — colon, 24-hour, everywhere** (owner,
  30 Aug 26, REVERSING their own 29 Aug "no colon, just 0800" ask: "I saw
  wrongly … most of the timing format is 08:00. Change it back and make sure
  everything follows that format consistently"). hh:mm is the app's native
  form — the read-only reference gate PINS it (`reference/tfin.js`:
  `fmtT('0745')==='07:45'`, `hhmm(760)==='12:40'`, `fmtTxt('0930')===fmtT('0930')`),
  `txtSet` commits through `hhmm`, and the week/warnings/CSV never left it.
  What broke ranks was compact-minted legacy data (duty templates minted
  `0700`). The fix, three layers:
  · **Display**: board renderers wrap every stored time string in
    `engine/time.ts fmtHM` (the ONE display fold — compact or colon in, hh:mm
    out, non-time → blank): flying br/to/ld + brief ghost (`board.ts`),
    duty/sim/ground/programme str-end + ap rows + input rows (`board-html.ts`,
    the `boxHTML` atm/tm chokepoint). The week already folds via `fmtT` (`ted`).
  · **Minting**: `dutytpl.tplTime`, `DUTYTPL_STD`, `waveDutyBlock` and the
    "+ In time" line now mint `07:00` (they were the compact minters);
    `waveTime` always did. Old stored templates refold on load.
  · **Typing**: every time box accepts `800`/`0800`/`8:00`/`08:00` (parseHM)
    and shows hh:mm after commit — the user never types the colon. Hand-typed
    IN TIME prose folds only the tokens `intimeTime`'s grammar recognises
    (`events.ts intimeFold`, commit-time only — never at render, so the seed
    week's model text stays byte-identical for parity).
  The rules engine is untouched by construction: every reader goes through
  `parseHM`, which takes both forms. Parity stays **728/0**. The ONE deliberate
  4-digit survivor is the AREA window token (`0800-0900`, `atimeText`) — the
  reference app prints it compact and `tfin.js` pins that; changing it means
  editing the safety-net, owner sign-off required. Don't add a second display
  formatter — `fmtHM` is the one. Placement: `docs/ui-contracts.md` §Every
  time reads hh:mm.
- **The flagging engine reads across week boundaries** (owner, 23 Aug 26 —
  "It is a continuous reading of the flagging engine. It doesn't just stay
  within a week"). Two rules used to compute strictly inside the loaded
  Mon–Sun week and are fixed: the consecutive-days run (`DAYS_RUN`,
  `VCONF.maxRun`) now walks in seeded up to `maxRun` days before Monday, and
  Monday's crew-rest check (`CREW_REST`/`CREW_TIGHT`, `VCONF.crewRest`) now
  runs against the previous week's Sunday instead of being switched off —
  `REST[0]`, the crew picker's Monday rest-clear times, is real for the
  first time. The midnight input tails at the week's two edges read the
  adjacent week's dates the same way. Bounded to those two lookback windows
  plus exactly one lookahead day — the pre-existing midnight-tail sliver
  past Sunday night, and, since 23 Aug 26, the forward crew-rest trace
  below; nothing else looks forward or further back than that. Don't
  re-propose widening either window without a named case — the sizes were
  chosen to be exactly what the named rules need.
  **A flag still always lands on the day it BREAKS, never earlier**: next
  Monday's own crew-rest breach still only becomes a real, clickable warning
  when next week is loaded and viewed — the trace mechanism addresses by
  in-week day index, so it still cannot write a second warning onto the
  loaded week's own Monday; that half of the old ruling stands unchanged.
  **What is superseded is this entry's old "don't build a same-page hint
  without the owner asking" — he then asked for exactly that**, from the
  deployed site, the same day (23 Aug 26 — "If I plan someone who bust crew
  rest the day prior it should also flag out just like what u see for
  outlaw"): a
  loaded week's Sunday whose late finish busts NEXT week's Monday now draws
  the same "Breaks Monday" trace box a within-week breach draws, built off
  `weekctx.ts:nextMondaySeed` and a phantom pass of `validate.ts`'s own
  `crewRestDay` (one body, two callers — the forward trace cannot drift from
  the real rule). It carries no in-week day to jump to (`di:null`, `html.ts`
  renders it with no click target) and writes no second warning — only the
  pointer. `CREW_TIGHT` still never traces, forward or otherwise; only a
  full `CREW_REST` breach does. Default demo weeks draw no forward trace
  (verified). Rules: `docs/engine-rules.md` §validation, crew rest; on
  screen: `docs/ui-contracts.md` §Three crew-rest rings.
  **Session edits ARE now read where they used to be invisible** — the
  seed's INPUTS getting richer, not the windows changing size (see the
  per-week stash entry right below): `weekctx.ts:bundle()` checks the stash
  before the pure seed on every cross-week read, so a scheduler's own edit
  to an adjacent week now feeds `DAYS_RUN`, `CREW_REST` and the forward
  trace exactly the way an authored seed always did. `SCHED` (publish state)
  is still deliberately not read by these seed functions — the rules judge
  the programme, not its publication state — and an unauthored, unedited
  adjacent week still seeds nothing. `engine/weekctx.ts`'s header carries
  the full window semantics; `docs/engine-rules.md` and
  `docs/feature-impact.md` Flow F carry the detail.
- **Weeks remember their edits — the per-week stash** (owner, 23 Aug 26,
  from a reported bug: a duty planned on the Sunday of an unauthored week
  vanished after scrolling to 13 Jul and back, and no crew-rest flag raised
  for Ranger the way it should have). What's decided:
  - **Session memory only, deliberately — a reload still forgets** (owner,
    23 Aug 26 — "It's ok that u don't remember once I exit the session.
    Just like the rest. Just that when I go between sun and mon it can't be
    that it disappears"). `engine/weekstash.ts` remembers, per week-start
    key, the last snapshot `state/store.ts:loadWeek` handed it on the way
    OUT of a week — in memory only, in lockstep with `INPUTS` and the Leave
    War's own 17 Aug 26 session-only decision: a schedule that survived a
    reload while the inputs that fed it did not would be exactly the
    mixed-memory confusion that lockstep exists to prevent. A localStorage
    envelope was built and then removed the same day on the owner's word —
    don't re-add a browser-local one for just this piece; real persistence
    is the future shared-server step, for all of this state at once.
  - **Pristine weeks are deliberately NOT stashed.** Stashing every week
    unconditionally would persist a byte-copy of the pure seed for weeks
    nobody touched — and a persisted pristine copy is a trap: the day a
    deploy updates the built-in demo weeks, every browser that ever
    scrolled past one would go on seeing the OLD content forever, because a
    stash outranks the seed by design. A week is stashed on the way out
    only when it changed since load, or when it already carries a stash
    entry to keep current. **Don't re-add the unconditional stash of
    untouched weeks.**
  - **Publish state rides the restore.** The stash shares its SCHED field
    list with `state/history.ts:schedFields` (the undo snapshot) so the two
    serializers cannot drift — a week's approvals, AL and pending marks come
    back exactly as left, not reset to the seed.
  - **Seeds read the stash first.** The cross-week flag reads — `DAYS_RUN`
    run-in, Monday's crew rest, the midnight tails, and now the forward
    crew-rest trace — all go through `weekctx.ts:bundle()`, which checks
    the stash ahead of the pure seed on every call (see the entry above).
  - **The fake "Sync" chip stays decorative.** This is still a per-browser
    fix, not shared/multi-device data — there is no server behind it. True
    shared, persistent multi-week scheduling across devices and accounts is
    still the future server step (`HANDOFF.md`); don't present this stash
    as that, and don't move storage off the `HOOKS.storeBackend` seam —
    that is precisely where the future shared-database backend hooks in.
  - **Undo still re-baselines per week, and the edit log stays
    session-only** — this stash is additive to both, not a replacement for
    either.
  Flow: `docs/feature-impact.md` Flow E. File map: `HANDOFF.md`.
- **The open-bidding dates wear a glowing dark-green border on the Leave War
  grid** (owner, 1 Sep 26 — "make the border of the dates open for bidding
  green … the exterior box of the entire period", then "a bit darker and more
  faded", picking the deeper of two comps). One overlay (`.lw-bidbox`,
  `Matrix.tsx measureBidBox`) around the `bidFrom..bidTo` columns, shown ONLY
  while `stage === 'open'`. The colour is `rgba(74,140,100,.80)` with a
  low-opacity halo — the lighter of two faded greens the owner compared live
  (deeper `rgba(56,104,76,.78)` was the other), still darker/more desaturated
  than `--ok`; don't brighten it or swap it to `--ok` without asking. It is OUTLINE ONLY — the
  owner declined the faint-green wash, so a long window shows nothing mid-scroll
  until an edge; the wash was built and shown and is a one-line add if he asks,
  so don't re-pitch it unprompted. Placement + layering (z-index 1, under the
  frozen columns): `docs/ui-contracts.md` §The open-bidding box. Pin:
  `e2e/leavewar.spec.ts`.
- **A control the user TAPS REPEATEDLY must not move under them — standing
  design rule** (owner, 2 Sep 26 — "as I toggle left and right on the calendar,
  because the number of days change between months, the left and right arrow
  keeps jumping up and down … design it such that the arrows remain at the same
  spot so I don't need to keep chasing it. Remember this for design interface
  and fix the rest that you saw the same"). A month spans 4–6 week-rows, so a
  calendar whose height tracks the month shifts everything anchored to its far
  edge as you page it. The Leave War new-period / bid / bidding-window
  calendars sit in a BOTTOM-anchored sheet, so a short month let the whole
  sheet (its ‹ › month arrows included) drop and a tall one pushed it up.
  `RangePicker` now pads EVERY month to a constant six rows (trailing `.rblank`
  cells), so the grid is one fixed height and the arrows — and the sheet — hold
  still. The Raptor page/popover calendars (`InputsCal`, `WeekCal`) are
  TOP-anchored — their grid grows DOWNWARD from a fixed top, so their own
  arrows never move; they pad to whole rows only and were left unchanged
  (checked, not assumed). The general rule for any repeated-tap control (a
  calendar pager, a stepper, a reveal toggle, a segmented control that grows
  a panel): keep the CONTROL's own screen position invariant to the content it
  changes — reserve the space, or anchor the growth away from the control.
  Pin: `rangepicker.test.tsx` (constant row count across months).
- **The Leave War year grid: one draw-toward-a-target engine — desktop fills the
  year WHILE VIEWED and shrinks when left; the phone rolls a window ahead of the
  finger; both pre-warm after login** (owner, 3–5 Sep 26, a run of asks: "make it
  linear" (the year-wide scrollbar) → "the scroll freezes … make it smooth" ("fill
  in the background") → "load the next months as I approach the edge" → then, once
  measurement showed the browser spends ~1.4s RE-STYLING the full-year grid every
  time it is revealed, "shrink when I leave, rebuild on return" and pre-warm after
  login). The grid draws WHOLE MONTHS at real widths, never fixed-width spacers (a
  census found 22 distinct day-column widths, so an estimate would hop content
  under the finger). One idle loop drives every "draw more / draw less a beat at a
  time" path — `colwindow.ts stepToward` toward a per-mode TARGET, one month per
  `requestIdleCallback` beat, gated so a draw never lands under a moving scroll:
  · **phone** → a ROLLING window a few months AHEAD of the visible ones
    (`rollingTarget`, before 1 / after 3), trailing months pruned so the DOM stays
    light — so a flick meets drawn columns, never the stuck edge (the old
    grow-2-at-rest lump is gone; `growAtRest` stays only as an at-rest backstop);
  · **desktop, tab ON screen** → the WHOLE year, so scrolling runs end to end and
    the bottom scrollbar SLIDES (see onHbarScroll);
  · **desktop, tab OFF screen** (a pre-warm mount, or just left) → capped at a few
    months (`HIDDEN_MONTHS`), drawn only while the user is IDLE (`state/idle.ts
    msSinceInput`) so it never lands under a keystroke or a puck drag.
  On leave the desktop grid SHRINKS to a few months around the last view (so the
  next reveal wakes a small grid, ~0.4s not ~1.9s), and REBUILDS the year on
  return (the fill's left-anchor keeps the reader's month in place as the earlier
  months fill in behind them). This REVERSES the 4 Sep "desktop keeps the whole
  year / never prune" rule — the reveal cost is why. The on-screen signal is
  `leavewar/state/screen.ts`, a listener set NOT the store, so flipping it never
  re-renders the ~25k-node grid. Pre-warm: `Shell.tsx` mounts the tab HIDDEN once
  the user pauses after login (desktop only), so the chunk downloads and the first
  months draw off the critical path and the first open is instant; it is
  idle-gated, so it never slows login-to-week. Do NOT put the on-screen flag on the
  store (it would repaint the grid on every tab show), do NOT drop the idle gate on
  the hidden draw, and do NOT make the phone keep the whole year. The bottom
  scrollbar is a YEAR-WIDE scrubber whose spacer is the war at an estimated average
  day-width (`avgDayWRef`, cached by war+zoom) so the thumb holds still as months
  draw; it JUMPS while the year is still filling and SLIDES once it is whole.
  Detail: `docs/ui-contracts.md` §The Leave War grid draws a window of months;
  HANDOFF item (d). Pins: `colwindow.test.ts` (`stepToward`/`rollingTarget`), e2e
  "the grid draws a window of months …", "a year-wide scrubber …", and
  "the Leave War screen is a separate chunk, pre-warmed after login".

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
| **The Leave War tab** (vendored app: engine, store, UI, tests) | `src/leavewar/` — its own store and `leavewar:` storage keys; role written only by `resetSession` + the admin's `toggleRole`; stage-advance is admin-only (27 Aug 26, members still bid); a member bids only on their OWN row — the "View as" person, mirrored to `viewer` — while an admin edits any row (`canEditRow`, 27 Aug 26; enforced at the write path and the grid affordance alike); an admin decides bids at closed OR published (`canDecide`, 27 Aug 26 — since the 27 Aug overnight pass the STORE enforces it too: `setBidState`/`setBidStates` refuse anyone else, `shiftBid` carries `moveCells`' whole stage/window/war-day law, `moveProblem` is the one validation body the landing preview and the commit share, a chain of closed moves keeps the ORIGINAL `shiftedFrom`, and a member cannot write a medical mark); a drag selects a block to batch fill/decide/move/delete and a plain click still opens the single-cell sheet (`select.ts`, capture taken in `arm()`); the dotted "moved" mark is recorded AND shown only for a move made once bidding is closed (`biddingClosed`, 27 Aug 26 — an open-bidding shuffle stores no `shiftedFrom`, so it never sprouts the stripe when the war later closes); the colour pop-out is "Legend"; at PUBLISHED a tap on an approved leave opens the remarks editor (`RemarksSheet` → `sync.ts:leaveInputAt` + `inputedit.ts:setLeaveRemarks`, member edits own / admin any); CSS scoped under `#page-leavewar`; gaps in `docs/leavewar/known-gaps.md`, future sync in `docs/superpowers/specs/leavewar-sync.md` |
