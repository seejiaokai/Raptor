# RAPTOR

A flying-programme scheduler for a fighter squadron: a week of flying waves,
duty crews, simulator slots, ground events and personal inputs, with a
validation engine that flags crew-rest breaches, double bookings, missing
briefs and qualification problems, plus an amendment (AL) workflow for
publishing changes after a day has been signed off.

**Live:** https://seejiaokai.github.io/Raptor/ — sign in with `a` / `a`
(admin) or `user` / `user` (squadron member).

A member is not view-only: they add, edit and delete their own personal
inputs and tick the qualifications they hold. Building the programme —
accepting an input into it, the Edit Schedule page, editing quals and
the rules — stays admin.

Demo data only. There is no server — the schedule lives in each browser's
own localStorage, and the login is a prototype gate, not security.

## Running it

```
cd raptor-port
npm install
npm run dev
```

## Checks

All four must pass before anything merges. The deploy workflow runs them on
every pull request into `main` and again on the push that merges it, and
refuses to publish on a red result.

```
npm test                # unit + component suite
npm run build           # typecheck + production build
node reference/tfin.js  # the original app's 728 assertions
npm run test:e2e        # geometry in a real browser — builds and serves itself
```

The fourth is separate because jsdom has no layout engine: a puck that had
silently grown to 90px passes `npm test` all day. Two more — `npm run
probes:adapted` and `npm run perf` — are run by hand for UI-visible work;
they need a `vite preview` and are too slow for CI.

## Layout

- `raptor-port/` — the React + TypeScript + Vite application.
- `raptor-port/reference/` — the original single-file app and its test
  suite, kept **read-only** as the behavioural spec for existing features.
- `raptor-port/CLAUDE.md` — working rules and an index to the detail docs.
- `raptor-port/docs/` — engine rules, UI contracts, and the probe sweep.
- `HANDOFF.md` — open work, the deploy traps, and the full file map.
