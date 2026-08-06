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

- **The owner is non-technical.** Explanations to him are plain-language
  and complete; terseness applies to tool use and internal work, never to
  what he reads.
- **Ship it.** Once the gates are green, open a PR to `main` and merge so
  it deploys — don't wait to be asked (unless a gate is red or the change
  was called an experiment).
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
  (`npx vitest run <file>`); the full four gates once, before the PR.
  Trust this index instead of re-exploring. Prefer a fresh
  session per task; a long conversation re-sends itself every turn.

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
probes), `npm run perf` (the reference-vs-port no-regression gate) — all
against that same preview.
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
The deployed Pages URL has NOT been reachable from the container (the agent
proxy answers 403 to CONNECT for `github.io`, and to `githubstatus.com`).
**Re-test it once per session rather than assuming** — the owner asked for
both to be allowed (6 Aug 26), the policy is fixed when a session starts, so
a change only ever reaches a LATER session than the one that asked:

```
curl -sS -o /dev/null -w '%{http_code}\n' https://seejiaokai.github.io/Raptor/
```

`000` means still blocked; check the reason with
`curl -sS "$HTTPS_PROXY/__agentproxy/status"`, which logs each rejected host.
Do not route around a 403 — report the blocked host. While it is blocked,
confirm a deploy from the workflow run's job conclusions and verify rendering
against the `vite preview` above; when it opens up, the deployed page can be
driven directly and is the only way to catch a CDN-level fault (a stale
cache, a bad base path as served) that a local preview cannot show.

Push to `main` → `.github/workflows/deploy.yml` reruns the gates and
publishes to **https://seejiaokai.github.io/Raptor/**. Nothing deploys red.

## Architecture rules (apply to nearly every task)

**The store.** `notify()` bumps a version; components subscribe via
`useVersion()` (useSyncExternalStore) and re-read the singletons.
`state/view.ts` holds UI state the engine reads (CURPAGE, SBDAY, ARM,
selection, EDITON) as module `let`s with same-module setters — ESM can't
reassign across modules. `WARN`/`REST`/`EVD` are reassigned by every
`validate()`: always re-read, never cache.

**The slot-key grammar** — everything addresses through this, and the day
index is always first after the prefix (`keyDay()` depends on it):

- Flying seat `di.gi.li.ai.seat` (no prefix) — day, wave, formation,
  aircraft, seat `p` (FCP) or `w` (RCP).
- Duty `d:di.dwi.ri` · Sim `s:di.kind.ri` · Ground `g:di.ri` ·
  Programme `a:di.ri` · `.+` appends · `.xN` is overflow `row.more[N]`.
- Text keys: `dn:` day note · scheduler notes `pn:` programme, `dtn:` duties,
  `sn:` sims, `gn:` ground · `ap:` programme · `wl:`
  wave label · `ff:` formation · `fr:` flight remarks · `it:` in-times ·
  `dl:/dr:` duty · `sr:` sim · `gr:` ground · `st:` stores ·
  `ar:/at:` area/area-time · `tr:` traffic.

**The mutation funnel — bypassing it is always a bug.** All schedule
writes go through `slotVal`/`setSlotVal`/`fillSlot`/`txtGet`/`txtSet` →
`noteChange(key)` → `afterSchedMutate()`. A write that skips it is
invisible to the amendment machinery: not marked pending, absent from the
next AL, never re-validated. Deletes call `markEdit()` with **no key** — a
delete must not re-mark the address it just removed.

**React owns chrome, strings own density.** The dense surfaces (week,
board, palette) are built by verbatim HTML-string builders and swapped via
innerHTML with string-diffing — that is what preserves scroll, carets and
the phone perf budget. Don't convert them to components.

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

## Stable decisions (do not relitigate)

- `reference/` is **read-only** — the spec for existing behaviour. New
  features go beyond it but must not break it.
- The engine was historically generated from the original; that generator
  is **deleted** (git history keeps it). Never recreate or rerun it — the
  engine is ordinary source now and regenerating would clobber real work.
- Keep `src/probe-bridge.ts` in sync when adding engine API.
- Product: no rule versioning · no two-person approval · no "publish all
  days" · OIL is LL-equivalent · sim notes are single-line · pucks never
  wrap · login page stays simple · the talon logo stays.
- **No drag-to-section** (owner, Aug 26 — dropped after the buttons shipped).
  Moving an `Other` row to Ground or Unavailable is the `→ Ground` /
  `→ Unavail` buttons in `html.ts`, on both the week and the board. Don't add
  drop targets to `drag.ts` for it; that machine stays scoped to pucks.

## Where things live

| Need | Go to |
|---|---|
| Validation, VCONF, publishing/AL, auth, history | `docs/engine-rules.md` |
| Rendering, drag & drop, text editing, AL marks | `docs/ui-contracts.md` |
| Current state, known gaps, TODOs, full file map | `../HANDOFF.md` |
| Probe → reference → port results | `docs/probe-sweep.md` |
| What changed recently | `git log --oneline` (not duplicated here) |
| Last session's leftovers, **if any** | `docs/session-state.md` (absent = nothing was pending) |
| The rules engine | `src/engine/` — `validate.ts` is the heart |
| Store / UI state / undo | `src/state/` |
| Components + HTML builders | `src/ui/` |
