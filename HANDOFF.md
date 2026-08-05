# RAPTOR — project state

Companion to `raptor-port/CLAUDE.md` (the index and working rules) and
`raptor-port/docs/` (engine rules, UI contracts). This file holds what
those two don't: **what is still open**, and **where each file lives**.

The port from the original single-file app is complete; that history is in
`git log`. This is the live application now, under active development.

## Known issues / open work

- **No shared data.** localStorage only — two devices never see each
  other's edits. The obvious next enhancement (needs a server or a sync
  backend; touches `engine/hooks.ts:storeBackend` and the mutation funnel).
- **Prototype auth.** Hard-coded accounts; the deployed site is public.
  Manage-users edits the in-memory list only. Real accounts = server work.
- **One dataset.** The schedule is the demo week (Mon 13 – Sun 19 Jul 26, a
  full Monday-to-Sunday week; the weekend is non-flying, duty crew only). Week chips
  re-label but every week shows the same data (the original behaved the
  same way). "Throw pucks (auto)" is a stub, as in the original.
- **jsdom still cannot measure layout, but the geometry contracts are gated
  now.** `e2e/geometry.spec.ts` (`npm run test:e2e`) measures them in a real
  browser against a preview of the production build — puck exactly 74×15,
  free text wrapping rather than overflowing, one day box per pan click, the
  proxy scrollbar, scroll held across an edit, a programme hole rendering no
  element, descender ink inside the puck. It builds and serves itself, and it
  is the **fourth CI gate** in `deploy.yml`. Vitest still cannot see any of
  this: every rect it reports is 0×0. Wider visual work still wants the probe
  path (`npx vite preview --port 4173` + `probes/`).
- **The probe sweep has no leftovers** (`docs/probe-sweep.md`). The four that
  used to stop partway — `aar`, `audit`, `sa`, `sc2` — now run end to end as
  `probes/adapted/*-async.cjs`, six adapted files in all, run together by
  `npm run probes:adapted` and each exiting non-zero on a failed assertion.
  Two of them assert MORE than their originals did: `aar`'s ladder check was
  vacuous on the reference (it never enabled qtbl editing, so every click was
  swallowed), and `sa`'s "no new warnings" step failed on the reference too,
  because its blind seat-stuffing eventually put a downchit man on an SC
  SPARE. One probe (`zdup`) still fails identically on both builds —
  environment-bound, not a port defect.
- **`sbWide` / board-grip state** is module-local and resets on reload
  (matches the original's session-scoped behaviour).
- **AL versioning is ROLLBACK semantics (owner decision, Aug 26).** "Restore
  this version" makes that version live immediately, discards the day's
  pending edits, needs no sign-off; new edits publish as `nextAL()`. Details:
  `docs/engine-rules.md` §Version snapshots / restore. Known limitation:
  previews freeze schedule content but personal-INPUTS and day-info read live
  data; snapshots are session-only.
- **Personal inputs need accepting (Aug 26).** Three day blocks (`Ground
  Programme`, scheduler-only `Personal Inputs`, `Unavailable`); a personal
  input reaches the issued programme only when a scheduler **accepts** it, and
  the validator only sees actioned inputs (`inputFlags` gate). Full rules:
  `docs/engine-rules.md` §Accepting a personal input and §validation.
- **`Fly` semantics changed from the original** (blocks once actioned; an
  actioned Fly is AWAY — off the crew strip, faded, barred whole-day). Rules
  in `docs/engine-rules.md`. Reference probes `audit2 #8` and `audit` (item 3)
  pin OLD rules and fail on the port by design — `docs/probe-sweep.md`.
- **Ground rows accepted before the Aug-26 callsign fix** keep the person-ID
  form in `who` and stay unresolved where id ≠ lowercased callsign (Hao Wen,
  X-Ray) — same visible behaviour as before, no migration.
- **Scheduler notes are edit/board only** — four boxes (`pn:` programme,
  `dtn:` duties, `sn:` sims, `gn:` ground). They never render on the view page,
  even when populated, and like every other edit here they do not survive a
  reload (only `rules` is persisted).
- **`probes/perf-port.cjs` is no longer flaky — and now reports a real
  question for the owner.** It used to trip a no-regression assertion in about
  2 runs in 5 (3 in 5 when re-measured), at the same rate on unchanged code:
  the estimator was the problem, not the app. It now warms up, takes the
  minimum of per-trial medians, and — the part that mattered — keeps BOTH
  builds open and measures them round for round instead of measuring all of one
  and then all of the other ~15 s later. Per-trial ratios cluster within ±0.05
  inside a run. Self-check: `PORT_URL="file://$PWD/reference/scheduler.html"
  npm run perf` measures the reference against itself and reads 0.91–1.01×.
  **Still red, deliberately: `board edit 1.19×` against a 1.15 budget.** That
  is not a rendering regression — the port's board carries **1.78× the nodes**
  of the reference's (699 vs 393; the stores chips, the personal-inputs group,
  the day-version selects), so it paints 1.78× the DOM in 1.19× the time,
  and the two no-op metrics come in at 0.62× / 0.66×. A `port ≤ reference ×
  1.15` gate has outlived its usefulness for the board now that the two boards
  are different boards. **Re-baselining it is an owner call** — the threshold
  was left untouched rather than tuned green. Numbers and reasoning:
  `docs/probe-sweep.md` §The performance gate. Still not in CI (too slow, and
  it needs the reference); judge it with `npm run perf`.
- **NO_BRIEF, SIM_BRIEF and DT_SUM are amber (adv), not red** (owner, 4 Aug
  26); DOUBLE_BOOK stays red. Parity tests stay byte-exact via `retier()` in
  `src/testing/refwin.ts` (re-tiers the in-memory reference before boot; the
  reference file on disk is untouched).
- Other owner decisions of 4 Aug 26 (all-day Fly gate, `acceptInput` refusing
  Unavailable-typed inputs, unavailable guarding all tasking) are documented
  in `docs/engine-rules.md` §validation — this file no longer duplicates them.
- **Deploy**: GitHub Pages must stay enabled (Settings → Pages → Source:
  GitHub Actions). The workflow refuses to publish on any red test.

## File map

### `raptor-port/src/engine/` — the rules engine (DOM-free)
| file | what it does |
|---|---|
| `data.ts` | The demo week: DAYS with waves/formations/aircraft, duties, sims, ground, programme rows. |
| `people.ts` | PEOPLE roster (quals, seat, categories), qual ladder, `isScheduler`/`isLead`/`isInstr`/`isOcu`, `scShiftKind`, `sanStatus`, `aarNeed`. |
| `inputs.ts` | INPUTS list + taxonomy: `isLeave`, `isLocalLeave`, `isDownchit`, `isDetach`, **`isPersonal`/`isUnavail`** (the two day blocks), INPUT_TYPES, DATES. |
| `time.ts` | `parseHM`/`hhmm`/`minus`/`overlap` (half-open — abutting windows do not clash). |
| `events.ts` | `collectEvents()` — the per-day event build the validator consumes. |
| `validate.ts` | `validate()`, WARN/REST/EVD, WCODE/CHIP_LABEL/RANK, `wlbl`, `chipOf`. **The conflict engine.** |
| `avail.ts` | `slotRules`/`slotBar` eligibility, `dayOff`/`dayEngaged`, free-count ranking. |
| `slots.ts` | The mutation funnel: `slotVal`/`setSlotVal`/`fillSlot`/`txtGet`/`txtSet`, `whoArr`/`rowCrew`/`acRef`, `rollCx`, **`acceptInput`/`unacceptInput`/`inpKey`**. |
| `keys.ts` | `keyDay`, `shiftKeys` + `shiftAircraft`/`shiftFormation`/`shiftWave` renumbering. |
| `waves.ts` | WEEKS/CURWEEK, standalone waves (SC/AVALON/BB): `isStandalone`, `makeStandalone`, `saExempt`. |
| `publish.ts` | SCHED, sign-offs (SIGN_ROLES), `setDayApproved`, `publishALDay`/`alIssue`/`unpublishAL`, `markEdit`, AL colours, per-day version snapshots (`daySnap`/`daySnapOf`/`dayVersions`), `dayCurVer` (the day-head chip). |
| `restore.ts` | `dayKeys` walker + `restoreDayVersion` — ROLL a day back to a published version (it becomes live at once). |
| `rules.ts` | VCONF/SHIFT_HARD editing, `ruleParse`/`ruleFmt`, `rulesSave`/`rulesLoad`/`rulesReset`. |
| `insights.ts` | `computeInsights()` for the Insights modal. |
| `hooks.ts` | HOOKS — injectable callbacks (toast, repaints, histPush, storage) so verbatim bodies stay DOM-free headless. |

### `raptor-port/src/state/` — the store
| file | what it does |
|---|---|
| `store.ts` | `notify()`/subscribe/version; `wireStore()` maps HOOKS→notify; write helpers; `initStore()` boot (wires, **rulesLoad**, validate, history baseline). |
| `view.ts` | UI state the engine reads: CURPAGE, SBDAY, EDITON, ROSDAY, ARM, selection (SELID/WFOCUS/PFOCUS/DWOPEN/HLSET/SEARCH — clicking a puck lights every copy of that person), `afterSchedMutate()`, `focusWarn`, setters. |
| `history.ts` | HIST snapshots, `histPush`/`histApply`, undo/redo bodies. |
| `auth.ts` | SESSION, `setSession` (resets LGEDIT), `canEditSched`, ME/`setMe`. |
| `users.ts` | The Manage-users prototype list. |

### `raptor-port/src/ui/` — components and builders
| file | what it does |
|---|---|
| `App.tsx` | Login vs Shell + board overlay (the board is a SIBLING of the shell so logout unmounts it). |
| `Shell.tsx` | Topbar, nav, both schedule pages' chrome, global listeners (click/change/contextmenu/focusout/keydown, drag, pan), banner, memoized sections. |
| `ViewWeek.tsx` / `EditWeek.tsx` | The week surfaces: build `dayHTML` per day, diff strings, swap only changed days, hold scroll; `EditRoster` palette. CURPAGE-gated. |
| `SchedBoard.tsx` | The full-screen day board: panels with per-panel string diff; grip resize; CxDialog (cancel-with-reason). |
| `board.ts` | Board HTML assembly + delegated handlers: line/wave and duty/sim/ground row add/delete (with key renumbering), CX flow, red-box flag, `waveMenu`, `openScheduler`/`closeScheduler`. |
| `html.ts` | THE builder library: `dayHTML`, `puck`, `slotCell`, `signoffHTML`, day warnings, day-info panel, legend, cx/flag tags. |
| `board-html.ts` / `palette-html.ts` / `logic-html.ts` | Board panels (inputs bands, notes, programme, duties, sim rows, ground, personal-inputs group, sim notes), the aircrew palette, the Logic tab's rule text. |
| `interactions.ts` | `routeClick` — the delegated click router: select/arm/plant, publish/AL/sign-clear, day-info, warning boxes, week chips, stores remove + the `+` config picker (`openStoresMenu`). |
| `drag.ts` | Mouse HTML5 DnD + the touch pointer machine; `applyDrop()` is the single drop path; `barDrop` qualification warning. |
| `pan.ts` | Week arrows (`panDays`), proxy scrollbar (`hsSet`/`hsSync`, echo-guarded), shift+wheel, palette day-follow, phone day dots. |
| `textedit.ts` | Inline text editing: Enter commits / Escape restores, heal-in-place, deferred commit, `editingText()`, plus the four fields outside the `data-txt` grammar. |
| `highlights.ts` | Post-render decoration: selection/search/warning-focus classes on every puck, `paintArm`, `scrollToWarnFocus`. |
| `Modals.tsx` | DayPop (read-only day details), Insights, Manage-users, Airspace/traffic popup. |
| `InputsPage.tsx` / `QualsPage.tsx` / `LogicPage.tsx` | The three secondary pages (inputs CRUD + CSV, quals grid, rules doc + admin editing). |
| `ALPanel.tsx` / `Drawer.tsx` / `Login.tsx` | Amendment panel, phone drawer, login. |
| `pops.ts` / `toast.ts` / `useStore.ts` / `export.ts` | Popup flags, the toast, the store hook, CSV export (`schedRows`). |
| `scheduler.css` | The ported stylesheet — it carries MEASURED contracts, not preferences. |
| `../probe-bridge.ts` | Window bridge for the browser probes. Keep in sync when adding engine API. |

### Tooling
| file | what it does |
|---|---|
| `probes/run.cjs` | Runs any reference probe against the reference build or the port. |
| `probes/perf-port.cjs` | The perf gate (`npm run perf`) — measures BOTH builds at once, round for round, and asserts no regression. |
| `probes/adapted/` | Six probes re-expressed for this build (`wrap` `drop` `aar` `audit` `sa` `sc2`); `run-all.cjs` runs the set as `npm run probes:adapted`. |
| `src/testing/refwin.ts` | Boots the reference in jsdom for the parity tests and pushes the port's seed INPUTS into it, so both engines compute from identical data. NOT a test file. |
| `docs/probe-sweep.md` | The full probe → reference → port results table. |
| `reference/` | The original single-file app + its 728-assertion suite. **Read-only** — the spec for existing behaviour, and one of the four gates. |
| `e2e/` | The geometry gate (`npm run test:e2e`): `geometry.spec.ts` measures the layout contracts in a real browser, `app.ts` holds login/nav/scroll-settle helpers. `playwright.config.ts` builds and serves the port itself. |
| `.github/workflows/deploy.yml` | Test-gated GitHub Pages deploy on push to main; four gates, geometry included. |
