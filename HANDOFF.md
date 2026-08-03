# RAPTOR — Handoff

_Written at the close of the porting project (Aug 2026). The companion file
`raptor-port/CLAUDE.md` is the living project memory that loads in every
session; this document is the fuller narrative handoff._

## 1 · What this codebase is

RAPTOR is a flying-programme scheduler for an F-15SG squadron (142 SQN): a
week of flying waves, duty crews, simulator slots, ground events and
personal inputs, with a validation engine that flags crew-rest breaches,
double bookings, missing briefs and qualification problems, plus an
amendment (AL) workflow for publishing changes after a day is signed off.

The repository holds two implementations:

- **`raptor-port/`** — the React + TypeScript + Vite app. This is the
  primary, deployed application (GitHub Pages via
  `.github/workflows/deploy.yml` → https://seejiaokai.github.io/Raptor/).
- **`raptor-port/reference/`** — the original single-file app
  (`scheduler.html`, ~6,600 lines, build 29JUL·B55), its 728-assertion jsdom
  suite (`tfin.js`) and 54 Playwright probes. **Read-only.** It remains the
  behavioural spec for everything that existed before the port; new features
  go beyond it but must not break it.

Data model: everything lives in memory (module singletons) and persists to
the browser's localStorage (rule overrides under `sqn142_rules`, view-as
under `sqn142_me`). There is **no server** — each browser has its own copy
of the schedule. Login is a prototype gate (`a`/`a` admin, `user`/`user`
member), not security.

### Architecture in one paragraph

The **engine** (`src/engine/`) is DOM-free TypeScript holding the data
singletons (DAYS, PEOPLE, INPUTS, SCHED, VCONF) and all scheduling logic;
its function bodies are byte-faithful copies of the original's. The
**state layer** (`src/state/`) wraps the engine in a tiny store: `notify()`
bumps a version counter; React components subscribe with `useVersion()`
(useSyncExternalStore) and re-read the singletons on every tick. UI state
the engine reads (current page, open board day, armed slot, selection) lives
in `src/state/view.ts` as module `let`s with same-module setters (ESM can't
reassign across modules). The **UI** (`src/ui/`) is React for the chrome
(topbar, pages, modals, drawer) while the dense schedule surfaces — week
days, board panels, palette — are rendered by the original's verbatim
HTML-string builders through `innerHTML`, with string-diffing so only
changed sections are rewritten (this is what preserves scroll positions,
carets and the phone performance budget). Mutations flow through exactly
one funnel: `setSlotVal`/`fillSlot`/`txtSet` → `noteChange(key)` →
`afterSchedMutate()` → validate + repaint. History snapshots the whole
model for undo/redo.

## 2 · What the conversion did (and its decisions)

The port ran in five phases across 17 PRs, each gated on: Vitest suite
green + `npm run build` green + the untouched reference suite still
reporting **728 passed, 0 failed**.

1. **Scaffold** — Vite/React/TS + Vitest/Playwright, reference suite made
   path-configurable.
2. **Engine extraction** — ~181 DOM-free functions copied verbatim into
   `src/engine/` by a generator (`tools/extract-engine.cjs`) that added only
   `export` keywords and `:any` annotations. DOM touches inside verbatim
   bodies route through `src/engine/hooks.ts` (no-ops headless; mapped to
   the store in the browser).
3. **State store** — one write path, subscribe + version counter,
   history wiring.
4. **UI, surface by surface** — view week, edit week (sign-off/publish/
   arm-and-plant), text editing, scheduler board, drag-and-drop, week
   panning, drawer/users/export/airspace odds.
5. **Verification** — all 54 reference probes run against BOTH builds on
   the same machine (`probes/run.cjs`), plus a no-regression perf gate
   (`probes/perf-port.cjs`). Results table: `raptor-port/docs/probe-sweep.md`.

**Structural decisions worth knowing:**

- **Verbatim-first.** Engine and HTML-builder bodies are copies, comments
  included (many document old bugs). The generator that produced them must
  **never be rerun** — the engine is ordinary source now; regenerating
  would clobber post-port work.
- **React owns chrome, strings own density.** Rewriting ~500 pucks as
  components would have missed the perf budget; the original's
  string-diff-and-swap mechanism was kept for the week/board/palette,
  wrapped in React effects.
- **ESM live-binding pattern.** The original reassigned globals freely
  (`ARM=null`). Modules can't do that across files, so every reassignable
  global has a same-module setter (`armDrop()`, `setBoardDay()`,
  `setCurWeek()`…). `WARN`/`REST`/`EVD` are **reassigned by every
  `validate()`** — always re-read them, never cache the object.
- **`src/probe-bridge.ts`** republishes the app's internals on `window` so
  the reference's Playwright probes can drive the built app. Keep it in
  sync when adding engine API.
- **Perf gotchas fixed late** (keep them fixed): only the on-screen page
  rebuilds (CURPAGE gates in the week effects); board panels diff their
  strings before writing; Shell chrome is memoized; **no `validate()`
  during render** — mutation paths validate.
- **Three bugs the probe sweep caught** (all pinned by tests): rule
  overrides weren't reloaded at boot (`rulesLoad()` in `initStore` — don't
  remove); the RULES MODIFIED stamp rode only on the Logic page (now on the
  banner path in Shell); the stores toggle (2TK/TPOD/NAV chips) had been
  missed entirely.

## 3 · The conflict-flagging logic (where it lives)

The heart of the app. All in `src/engine/`, DOM-free, fully unit-tested:

- **`events.ts` — `collectEvents()`**: turns DAYS + INPUTS into per-person,
  per-day event lists (sorties with step/brief/dekit windows, duty shifts,
  sims, ground events, leave/downchit, offers). `overlap()` (in `time.ts`)
  is **half-open** — abutting windows do not clash.
- **`validate.ts` — `validate()`**: the sweep. Produces
  `WARN = {all, byDay, sev, chip}` (every warning, grouped per day, worst
  severity, per-puck chip), and publishes `REST[di][id]` (when crew rest
  expires) and `EVD[di][id]` (event digests). Warning codes and labels:
  `WCODE`, `CHIP_LABEL`; severity tiers hard/adv/note; per-puck chip
  ranking `RANK` with short glyphs `CHIP_TEXT`. `wlbl()` interpolates live
  VCONF values into labels ("{crewRest}" → "12h"). `restClear`, `chipOf`,
  `sevOf`, `dayEvents` are the query helpers.
- **`avail.ts`** — eligibility rather than conflict: `slotRules(key)`
  (what a slot demands), `slotBar(id, key)` (why a person may NOT stand it —
  drives palette darkening and the after-drop warning), `dayOff`,
  `dayEngaged`.
- **`rules.ts`** — the editable thresholds `VCONF` (16 numbers) +
  `SHIFT_HARD` clash gradings, bounds-checked parsing (`ruleParse`),
  diff-only persistence (`rulesSave`/`rulesLoad`), `RULE_STD` standard.
- Key rule subtleties are listed in `raptor-port/CLAUDE.md` ("The engine
  rules, as shipped") — offers never clash, the SC SPARE leave matrix,
  double-turn is one summary line, tight turn takes
  `max(threshold, dekit+step)`, etc.

Where flags reach the screen: `ui/html.ts` builders read `WARN`/`chipOf`
while building day markup; `ui/highlights.ts` decorates pucks after every
render; the board's live-checks panel is `boardWarnHTML` in `ui/board.ts`;
warning-box interaction (expand day, focus one warning, snap to puck) is
`ui/interactions.ts` + `state/view.ts` (`DWOPEN`, `WFOCUS`, `focusWarn`).

## 4 · Unresolved / known issues / TODOs

- **No shared data.** localStorage only — two devices never see each
  other's edits. The obvious next enhancement (needs a server or a
  sync backend; touches `engine/hooks.ts:storeBackend` and the funnel).
- **Prototype auth.** Hard-coded accounts; the deployed site is public.
  Manage-users edits the in-memory list only. Real accounts = server work.
- **The schedule dataset is the demo week** (13–17 Jul 26). Week chips
  re-label but all weeks show the same data (original behaved the same).
  "Throw pucks (auto)" is a stub, as in the original.
- **jsdom vs browser**: unit tests can't measure layout; geometry contracts
  live in the probes. Anything visual needs the probe path
  (`npx vite preview --port 4173` + `probes/`), not just Vitest.
- **Probe-sweep leftovers** (documented in `docs/probe-sweep.md`): 4 probes
  stop partway on the port because they read the DOM synchronously after a
  mutation (React commits async) — their contracts are pinned in Vitest;
  adapted versions of the important ones live in `probes/adapted/`. One
  probe (`zdup`) fails identically on both builds (environment-bound).
- **`sbWide`/board-grip state** is module-local and resets on reload
  (matches the original's session-scoped behaviour).
- **Deploy note**: GitHub Pages must stay enabled (Settings → Pages →
  Source: GitHub Actions). The workflow refuses to publish on any red test.

## 5 · File-by-file (key files; sizes are lines)

### `src/engine/` — the rules engine (verbatim bodies, DOM-free)
| file | what it does |
|---|---|
| `data.ts` (112) | The demo week: DAYS with waves/formations/aircraft, duties, sims, ground, programme rows. |
| `people.ts` (219) | PEOPLE roster (quals, seat, categories), qual ladder, `isScheduler`/`isLead`/`isInstr`/`isOcu`, `scShiftKind`, `sanStatus`, `aarNeed`. |
| `inputs.ts` (47) | INPUTS list + taxonomy: `isLeave`, `isLocalLeave`, `isDownchit`, `isOffer`, INPUT_TYPES, DATES. |
| `time.ts` (26) | `parseHM`/`hhmm`/`minus`/`overlap` (half-open) and friends. |
| `events.ts` (147) | `collectEvents()` — the per-day event build the validator consumes. |
| `validate.ts` (362) | `validate()`, WARN/REST/EVD, WCODE/CHIP_LABEL/RANK, `wlbl`, `chipOf`. **The conflict engine.** |
| `avail.ts` (185) | `slotRules`/`slotBar` eligibility, `dayOff`/`dayEngaged`, free-count ranking. |
| `slots.ts` (217) | The mutation funnel: `slotVal`/`setSlotVal`/`fillSlot`/`txtGet`/`txtSet`, `whoArr`/`rowCrew`/`acRef`, `rollCx`. |
| `keys.ts` (53) | `keyDay`, `shiftKeys` + `shiftAircraft`/`shiftFormation`/`shiftWave` renumbering. |
| `waves.ts` (70) | WEEKS/CURWEEK, standalone waves (SC/AVALON/BB): `isStandalone`, `makeStandalone`, `saExempt`, `dayCount`. |
| `publish.ts` (157) | SCHED, sign-offs (SIGN_ROLES, `signOf`, `signMissing`), `setDayApproved`, `publishALDay`/`alIssue`/`unpublishAL`, `markEdit`, AL colours/labels. |
| `rules.ts` (107) | VCONF/SHIFT_HARD editing, `ruleParse`/`ruleFmt`, `rulesSave`/`rulesLoad`/`rulesReset`. |
| `insights.ts` (20) | `computeInsights()` for the Insights modal. |
| `hooks.ts` (50) | HOOKS — injectable callbacks (toast, repaints, histPush, editMode, localStorage backend) so verbatim bodies stay DOM-free headless. |

### `src/state/` — the store
| file | what it does |
|---|---|
| `store.ts` (106) | `notify()`/subscribe/version; `wireStore()` maps HOOKS→notify; write helpers (`writeSlot` etc.); `initStore()` boot (wires, **rulesLoad**, validate, history baseline). |
| `view.ts` (221) | UI state the engine reads: CURPAGE, SBDAY, EDITON, ROSDAY, ARM (arm-and-plant), selection (SELID/WFOCUS/PFOCUS/DWOPEN/HLSET/SEARCH), `afterSchedMutate()`, `selectPerson`, `focusWarn`, setters. |
| `history.ts` (48) | HIST snapshots, `histPush`/`histApply`, undo/redo bodies. |
| `auth.ts` (14) | SESSION, `setSession` (resets LGEDIT), `canEditSched`, ME/`setMe`. |
| `users.ts` (9) | The Manage-users prototype list. |

### `src/ui/` — components and builders
| file | what it does |
|---|---|
| `App.tsx` (12) | Login vs Shell + board overlay (board is a SIBLING of the shell so logout unmounts it). |
| `Shell.tsx` (279) | Topbar, nav, both schedule pages' chrome, global listeners (click/change/contextmenu/focusout/keydown, drag, pan), banner, memoized sections, RULES-MODIFIED stamp. |
| `ViewWeek.tsx` (46) / `EditWeek.tsx` (64) | The week surfaces: build `dayHTML` per day, diff strings, swap only changed `<section class="day">`, hold scroll; `EditRoster` palette. CURPAGE-gated; `editingText()` guard. |
| `SchedBoard.tsx` (177) | The full-screen day board: panels filled from builders with per-panel string diff; grip resize (SBSIDE); CxDialog (cancel-with-reason). |
| `board.ts` (277) | Board HTML assembly + delegated handlers: line/wave add/delete (with key renumbering), CX flow, red-box flag, wave-title select, `waveMenu`, `openScheduler`/`closeScheduler`. |
| `html.ts` (539) | THE verbatim builder library: `dayHTML`, `puck`, `slotCell`, sign-off/`signoffHTML`, day warnings, day-info panel, legend, cx/flag tags. |
| `board-html.ts` (106) / `palette-html.ts` (88) / `logic-html.ts` (175) | Board panels (inputs bands, notes, programme, sim), the aircrew palette (`paletteHTML`/`paletteDay`), the Logic tab's rule text (`lgRules`). |
| `interactions.ts` (150) | `routeClick` — the delegated click router: select/arm/plant, publish/AL/sign-clear, day-info, warning boxes, week chips, airspace open, board open, stores toggle, blank-space clear. |
| `drag.ts` (309) | Mouse HTML5 DnD + the touch pointer machine; `applyDrop()` is the single drop path; `barDrop` qualification warning. |
| `pan.ts` (202) | Week arrows (`panDays`), proxy scrollbar (`hsSet`/`hsSync`, echo-guarded), shift+wheel, palette day-follow, phone day dots. |
| `textedit.ts` (77) | Inline text editing: Enter commits/Escape restores, heal-in-place, deferred commit, `editingText()`. |
| `highlights.ts` (57) | Post-render decoration: selection/search/warning-focus classes on every puck, `paintArm`, `scrollToWarnFocus`. |
| `Modals.tsx` (161) | DayPop (read-only day details), Insights, Manage-users, Airspace/traffic popup (tr: funnel). |
| `InputsPage.tsx` (122) / `QualsPage.tsx` (164) / `LogicPage.tsx` (168) | The three secondary pages (inputs CRUD + CSV, quals grid with appointment editing, rules doc + admin editing). |
| `ALPanel.tsx` (49) / `Drawer.tsx` (48) / `Login.tsx` (56) | Amendment panel, phone drawer, login. |
| `pops.ts` (15) / `toast.ts` (21) / `useStore.ts` (7) / `export.ts` (21) | Popup flags, the toast, the store hook, CSV export (`schedRows`). |
| `../probe-bridge.ts` | Window bridge for the browser probes. |

### Tooling & docs
| file | what it does |
|---|---|
| `probes/run.cjs` | Runs any reference probe against reference or port. |
| `probes/perf-port.cjs` | The perf gate — measures BOTH builds, asserts no regression. |
| `probes/adapted/` | Async-repaint adaptations of `wrap` (B55) and `drop` (B49). |
| `docs/probe-sweep.md` | The full probe → reference → port results table. |
| `docs/tfin-assertions.md` + `tools/` | Port-era archaeology (assertion map, generator). **Do not rerun the generator.** |
| `.github/workflows/deploy.yml` | Test-gated GitHub Pages deploy on push to main. |

## The three gates (after every change, always)

```
cd raptor-port
npm test                    # 320+ Vitest tests
npm run build               # typecheck + build
node reference/tfin.js      # the original's 728 assertions — 728/0, always
```
