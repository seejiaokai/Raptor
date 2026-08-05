# Porting plan — feed Claude Code ONE phase at a time

> **Historical. The port is finished — do not run these phases.** This file
> is kept because its decisions are still cited as the reason for things in
> the live build: `docs/probe-sweep.md` points here for why `perf2` and the
> `perf1` cache sections were dropped and why the adapted probes "keep their
> behavioural checks", and `probes/perf-port.cjs` points here for the
> original timing budgets. For how to work in this repo now, read
> `CLAUDE.md`; for what is still open, `../HANDOFF.md`.

Each phase below is a prompt to paste into Claude Code, in order. Do not
paste the next one until the current phase's exit gate is green and you have
committed. The phrasing is deliberate — especially the "list first, code
after I confirm" endings; keep them.

Before phase 1, decide the destination (it changes phase 4+ only):
- Plain web app → Vite + React + TS as written below.
- Power Apps PCF → scaffold a React *virtual* control with `pac pcf init
  -fw react` and check which React version your tenant's platform libraries
  supply before pinning anything. Phases 1–3 are identical either way —
  which is the point of engine-first.

---

## Phase 0 — repo + baseline (you, not Claude Code)

```bash
git init raptor && cd raptor
# copy this package's contents in
git add -A && git commit -m "B55 reference: single-file app, 728-assertion suite, 54 probes"
npm i -D jsdom
node -e "process.env.NODE_PATH='node_modules'" # or: NODE_PATH=node_modules node reference/tfin.js
```

Confirm the reference suite prints `RESULT 728 passed, 0 failed` on YOUR
machine before involving Claude Code. Note: `tfin.js` reads the app from
`/home/claude/scheduler.html` — either copy `reference/scheduler.html` there
or (better) first ask Claude Code to make that path a CLI argument, as its
warm-up task.

## Phase 1 — scaffold (small, mechanical)

> Scaffold a Vite + React + TypeScript app in this repo alongside
> `reference/` (which is read-only). Add Vitest and Playwright as dev
> dependencies. Strict TS. No components yet, no ported code — just a
> building skeleton where `npm test` and `npm run build` pass trivially.
> Also: modify nothing under `reference/` except this one change —
> parameterise the hard-coded `/home/claude/scheduler.html` path in
> `reference/tfin.js` and the probes to accept a path argument or env var,
> defaulting to `reference/scheduler.html`. Run the reference suite and show
> me it still passes 728/728 before you finish.

Commit.

## Phase 2 — the engine (the phase that matters most)

> Read CLAUDE.md fully first. This repo contains `reference/scheduler.html`
> — a working single-file flying-programme planner, the specification for
> this port — plus `reference/tfin.js` (728 jsdom assertions) and
> `reference/probes/` (54 Playwright probes). Do not modify anything under
> `reference/`.
>
> Task: extract the DOM-free logic into `src/engine/` as TypeScript. Nothing
> else — no React, no components, no UI, no CSS.
>
> Rules:
> - Port function bodies **verbatim**. Do not refactor, rename, simplify or
>   "improve" anything in this step. If something looks wrong, list it at
>   the end instead of fixing it.
> - Keep every comment. They document why the code is the way it is, and
>   several record bugs that were fixed.
> - Preserve the slot-key grammar exactly (see CLAUDE.md): `di.gi.li.ai.seat`
>   for flying, `d:` duty, `s:` sim, `g:` ground, `a:` all-hands, `.+`
>   append, `.xN` overflow, day index always first.
> - Where the original reads globals (`DAYS`, `INPUTS`, `SCHED`, `VCONF`,
>   `SHIFT_HARD`, `WARN`, `PEOPLE`), take them as explicit parameters or one
>   context object. That is the only structural change permitted.
> - Suggested module split: `keys.ts` (slot-key parse/shift), `events.ts`
>   (collectEvents), `validate.ts` (rules + WARN/REST), `rules.ts`
>   (VCONF/RULE_SPEC/parse/persist), `publish.ts` (SCHED/AL machinery),
>   `people.ts`, `time.ts` (parseHM/hhmm/overlap). Propose your own if the
>   code disagrees.
> - Port every `tfin.js` assertion that tests engine behaviour to Vitest.
>   Skip ones that assert on source text or DOM; produce a list of every
>   skipped assertion with one line of why.
>
> Done when: `npm test` passes with the ported assertions, `src/engine`
> imports nothing from `react` or `document`, and `node reference/tfin.js`
> still passes 728/728 untouched.
>
> Start by listing the functions you plan to move, grouped by proposed
> module, and ask me about any you are unsure of. Do not write code until I
> confirm the list.

Commit. This is the checkpoint that de-risks everything after it.

## Phase 3 — state store

> Build the state layer in `src/state/` around the engine from phase 2,
> honouring CLAUDE.md's "mutation funnel" section: exactly one write path
> (the equivalents of setSlotVal/fillSlot/txtSet), every write records its
> slot key via noteChange, then revalidates. Include undo/redo with the same
> semantics as `histSnap`/`histApply` (publishing is its own undo step; undo
> refused while an input has focus is a UI concern — leave a hook).
> Port the tfin assertions that cover pending/changes/AL issue/unpublish/
> shiftKeys renumbering against this store. Same verbatim-first rules.
> List your proposed store shape and get my confirmation before coding.

Commit.

## Phase 4 — UI, one surface at a time (repeat this prompt per surface)

Order: login → view week (read-only) → Inputs page → Logic tab (read-only,
then editable rules) → edit week (arm-and-plant before drag) → scheduler
board → drag-and-drop → publishing UI.

> Port the <SURFACE> from `reference/scheduler.html` into React components
> under `src/ui/`, using the phase-3 store. The reference rendering is the
> specification: same DOM structure and class names where practical, and the
> CSS for this surface ported **verbatim** into a module — do not modernise,
> rename variables, or swap the grid for flexbox. CLAUDE.md's "Layout
> contracts" and "Rendering contracts" sections are binding: puck 74×15
> ellipsised, overflow-wrap:anywhere + min-width:0 on free text, holes
> render nothing, scroll positions survive edits and Edit-mode toggles,
> React.memo per day.
> Then adapt the relevant probes from `reference/probes/` (start with the
> ones named in CLAUDE.md for this surface) to run against the dev server,
> and show me their output. Screenshot the reference and the port at 390px
> and 1500px and compare before declaring done.

Commit per surface.

## Phase 5 — full probe sweep + performance gate

> Adapt the remaining applicable probes in `reference/probes/` to the React
> build (drop probes that pin the string-diff mechanism itself — perf1
> sections E/H, perf2 — but keep their *behavioural* checks: scroll held,
> one-day isolation, drift-free commits). Run the sweep and the perf
> measurements from perf1/perf3 on a 4×-throttled phone profile. Budgets:
> one-day edit ≤ 200ms, board edit ≤ 120ms, and no probe regression.
> Produce a table: probe → reference result → port result.

## Standing instructions (put in every session if Claude Code seems to drift)

- `reference/` is read-only and is the spec.
- Never weaken or delete a failing assertion; explain it.
- Verbatim first, refactor later, in separate commits.
- Every bug fix lands with a test that pins it.
- One phase per session; commit before moving on.
