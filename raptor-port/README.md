# RAPTOR → React port package

Everything Claude Code needs to port the single-file RAPTOR scheduler to
React without losing five weeks of accumulated correctness.

```
CLAUDE.md               ← invariants, rules, contracts (Claude Code reads this automatically)
PORTING.md              ← the phase-by-phase prompts YOU paste, one at a time
reference/
  scheduler.html        ← build 29JUL·B55 — the working app, THE SPEC (read-only)
  tfin.js               ← 728-assertion jsdom regression suite
  probes/               ← 54 Playwright behaviour/geometry/perf probes
.gitignore
```

## Quick start

1. `git init` here and commit everything as-is (that commit is your
   reference baseline forever).
2. `npm i -D jsdom`, then `NODE_PATH=node_modules node reference/tfin.js`
   after copying `reference/scheduler.html` to the path it expects (or do
   PORTING.md phase 1 first, which makes the path configurable).
   Expect: `RESULT 728 passed, 0 failed`.
3. Open PORTING.md and run the phases in order. Do not skip phase 2
   (engine extraction) — it is the whole risk-management strategy.

## The one rule

`reference/` is the specification. It never changes, everything is verified
against it, and any port/reference disagreement means the port is wrong.
