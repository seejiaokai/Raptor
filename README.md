# RAPTOR

A flying-programme scheduler for a fighter squadron: a week of flying waves,
duty crews, simulator slots, ground events and personal inputs, with a
validation engine that flags crew-rest breaches, double bookings, missing
briefs and qualification problems, plus an amendment (AL) workflow for
publishing changes after a day has been signed off.

**Live:** https://seejiaokai.github.io/Raptor/ — sign in with `a` / `a`
(admin) or `user` / `user` (view-only).

Demo data only. There is no server — the schedule lives in each browser's
own localStorage, and the login is a prototype gate, not security.

## Running it

```
cd raptor-port
npm install
npm run dev
```

## Checks

All three must pass before anything merges; the deploy workflow reruns them
and refuses to publish on a red result.

```
npm test                # unit + component suite
npm run build           # typecheck + production build
node reference/tfin.js  # the original app's 728 assertions
```

## Layout

- `raptor-port/` — the React + TypeScript + Vite application.
- `raptor-port/reference/` — the original single-file app and its test
  suite, kept **read-only** as the behavioural spec for existing features.
- `raptor-port/CLAUDE.md` — working rules and an index to the detail docs.
- `HANDOFF.md` — current state, known gaps, and the full file map.
