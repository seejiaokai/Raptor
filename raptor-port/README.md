# RAPTOR — the application

The React + TypeScript + Vite app. The port from the original single-file
scheduler is complete; this is the live application, and `reference/` is now
the read-only spec it is measured against rather than a thing to copy from.

## Where to look

| file | what it is |
|---|---|
| `CLAUDE.md` | **The index** — working rules, and the routes to every detail doc. Start here. |
| `../HANDOFF.md` | What is still open, and where each file lives (the full file map). |
| `docs/engine-rules.md` | The validation rules, roles, and the seat/qualification matrices. |
| `docs/ui-contracts.md` | The UI contracts — what each page must do, and why. |
| `docs/probe-sweep.md` | The probe → reference → port results table. |
| `docs/session-state.md` | The last session's leftovers — present **only** while something is pending, so its absence means nothing is. |
| `PORTING.md` | Historical: the phase plan the port was built from. Kept because the probe docs still cite its decisions, not because anything is left to run. |

## Running it

```
npm ci        # node_modules/ is not in the container image
npm run dev
```

## The gates

All four, from this directory, after any change:

```
npm test                # Vitest — unit + component suite
npm run build           # typecheck + production build
node reference/tfin.js  # the original app's 728 assertions
npm run test:e2e        # geometry in a real browser — builds and serves itself
```

`test:e2e` is a gate of its own because jsdom has no layout engine: a puck
that had silently grown to 90px passes `npm test` all day. All four run in CI,
on pushes to `main` and on pull requests into it.

UI-visible work also wants the browser path, which is **not** in CI —
`npx vite preview --port 4173`, then `npm run probes:adapted` (the six adapted
probes) and `npm run perf` (the reference-vs-port no-regression gate).

## The one rule

`reference/` is the specification. It never changes, everything is verified
against it, and any port/reference disagreement means the port is wrong —
unless the owner has since changed the rule, in which case `docs/` records
the decision and `src/testing/refwin.ts` patches the reference in memory so
both engines still compute from identical data.
