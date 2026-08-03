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
- **Delegate frugally, by judgment.** Push exploration-heavy, plannable or
  mechanical work to cheaper agents (Explore / Plan / general-purpose on
  haiku or sonnet); do small precise work inline, since spawning an agent
  costs more than a one-file fix. Keep final review and the gates
  first-hand. The owner does not want to micro-manage this.
- **Token discipline.** Never let a tool dump raw output — pipe logs
  through `tail`/`grep`, ask GitHub MCP tools for `minimal_output: true`,
  paginate 5–10, and prefer a 2-line `curl | grep` over a full API object
  when checking one field. Never read `reference/` whole (6.6k lines) —
  `grep` it. Trust this index instead of re-exploring. Prefer a fresh
  session per task; a long conversation re-sends itself every turn.

## Build & verify

Run from `raptor-port/`, not the repo root. All three, after any change:

```
npm test                    # Vitest — must stay green
npm run build               # typecheck + build
node reference/tfin.js      # the original's assertions — must stay 728/0
```

UI-visible work also needs the browser path (jsdom can't measure layout):
`npx vite preview --port 4173`, then `probes/run.cjs <name> port`,
`probes/perf-port.cjs` (perf no-regression), `probes/adapted/*.cjs`.

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
- Duty `d:di.dwi.ri` · Sim `s:kind.di.ri` · Ground `g:di.ri` ·
  Programme `a:di.ri` · `.+` appends · `.xN` is overflow `row.more[N]`.
- Text keys: `dn:` day note · `sn:` sim notes · `ap:` programme · `wl:`
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
