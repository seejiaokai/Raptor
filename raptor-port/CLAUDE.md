# RAPTOR — 142 SQN Flying Programme (React app)

RAPTOR is a flying-schedule planner for an F-15SG squadron: a week of flying
waves, duty crews, sims, ground events and personal inputs, with a validation
engine that flags crew-rest breaches, double bookings, missing briefs and
qualification problems, and an amendment (AL) workflow for publishing changes
after a day has been signed off.

**The port from the original single-file app is COMPLETE** (16 PRs, phases
1–5 of the old PORTING.md). This codebase is now the primary application and
the subject of ongoing enhancement. The user is non-technical — explain
changes in plain language, no jargon.

## Codebase map

- `src/engine/` — the DOM-free rules engine (validation, slots, publishing,
  people, waves, rules, history helpers). **Historically generated** from the
  original by `tools/extract-engine.cjs` — DO NOT rerun that generator any
  more: the engine is now ordinary source, and regenerating would clobber any
  enhancement. Treat the generator + `docs/tfin-assertions.md` +
  `tools/tfin-port-map.cjs` as port-era archaeology.
- `src/state/` — the store: `notify()` bumps a version, components subscribe
  via `useVersion()` (useSyncExternalStore). `view.ts` holds UI state the
  engine reads (CURPAGE, SBDAY, ARM, selection, EDITON). `auth.ts` session.
  `history.ts` undo/redo snapshots. ONE mutation path: writes go through the
  engine funnel (below) and end in `afterSchedMutate()`.
- `src/ui/` — React components (Shell, ViewWeek, EditWeek, SchedBoard,
  Drawer, Modals, pages) plus verbatim HTML-string builders (`html.ts`,
  `board-html.ts`, `palette-html.ts`, `logic-html.ts`) rendered via innerHTML
  with string-diffing (only changed sections are rewritten — this preserves
  scroll/caret and the phone perf budget). `drag.ts` (mouse+touch DnD),
  `pan.ts` (week panning + proxy scrollbar), `interactions.ts` (delegated
  click routing), `textedit.ts` (Enter commits / Escape restores),
  `highlights.ts` (post-render decoration pass). `scheduler.css` is the
  ported stylesheet — it carries MEASURED contracts, not preferences.
- `src/probe-bridge.ts` — republishes app internals on `window` so the
  browser probes can drive the built app. Keep it in sync when adding
  engine API that probes/tests might need.
- `reference/` — the original single-file app + its 728-assertion suite
  (`tfin.js`) + Playwright probes. **Read-only.** It remains the spec for
  EXISTING behaviour; new features go beyond it, but must not break it.

## Verification gates (run all three after any change)

```
npm test                    # Vitest suite (320+ tests) — must stay green
npm run build               # typecheck + build
node reference/tfin.js      # the original's 728 assertions — must stay 728/0
```
For UI-visible work: `npx vite preview --port 4173` then
`node probes/run.cjs <name> port`, `probes/perf-port.cjs` (no-regression perf
gate vs the reference), `probes/adapted/*.cjs`. Full table:
`docs/probe-sweep.md`.

**Discipline:** never weaken a failing assertion — understand it. Every bug
fix lands with a test that pins it. New features get new tests.

## Deployment

Push to `main` → `.github/workflows/deploy.yml` runs the Vitest suite AND
tfin.js, builds, and publishes to GitHub Pages:
**https://seejiaokai.github.io/Raptor/**. Nothing deploys unless green.
Data is per-browser localStorage — there is no server; each device has its
own copy.

## The slot-key grammar (load-bearing — everything addresses through this)

Every fillable position and editable text has a string key. The **day index
is always first** after the prefix; `keyDay(key)` depends on it.

- Flying seat: `di.gi.li.ai.seat` — day, wave (go), formation (line),
  aircraft, seat `p` (FCP/pilot) or `w` (RCP/WSO). No prefix.
- Duty `d:di.dwi.ri` · Sim `s:kind.di.ri` (amt|oft) · Ground `g:di.ri` ·
  Programme `a:di.ri`
- `.+` = append to the row's crew; `.xN` = overflow slot `row.more[N]`.
- Text keys: `dn:` day note · `sn:` sim notes · `ap:` programme · `wl:` wave
  label · `ff:` formation fields · `fr:` flight remarks · `it:` in-times ·
  `dl:/dr:` duty label/remarks · `sr:` sim remarks · `gr:` ground remarks ·
  `st:` stores · `ar:/at:` area/area-time · `tr:` traffic.

`shiftKeys(head,pos,ix)` renumbers keys when a row is deleted, over
`SCHED.pending`, `SCHED.changes` and every AL's live `keys`.
`shiftAircraft`/`shiftFormation`/`shiftWave` compose it. Deleting a
standalone wave also removes its duty block (`d:`/`dr:`/`dl:` keys).

## The mutation funnel (bypassing it is always a bug)

All schedule writes go through `slotVal`/`setSlotVal`/`fillSlot`/`txtGet`/
`txtSet` → `noteChange(key)` → `afterSchedMutate()`. A write that skips the
funnel is invisible to the amendment machinery: not marked pending, absent
from the next AL, no re-validation. `afterSchedMutate()` also drops a
selection whose person count fell, disarms an armed slot whose target
vanished, then `validate()` and repaint (via the render hooks → `notify()`).

Deletes call `markEdit()` with **no key** — a delete must never re-mark the
address it just removed.

## The engine rules, as shipped

`collectEvents()` builds per-day events from DAYS + INPUTS; `validate()`
produces `WARN {all, byDay, sev, chip}` and publishes `REST`/`EVD` (all three
are REASSIGNED per validate — read them fresh). Severities: `hard`, `adv`,
`note`. `overlap()` is **half-open** — abutting windows do not clash.

- A sortie occupies step (T/O − VCONF.step) to dekit (land + VCONF.dekit).
- Brief window = T/O − briefLead to T/O, **always pinned to T/O**; a
  published in-time moves report time and crew rest, never the brief.
- Crew rest (VCONF.crewRest) runs off the last REST-BEARING commitment
  (sortie or shift). Breach = hard CR; nominal-inside-rest = adv TT.
- Tight turn needs `max(VCONF.tightTurn, dekit + step)`.
- Double turn: two+ sorties in a day → ONE hard DT_SUM line naming everyone;
  pucks stay amber. No span test.
- "Available fly/duty"/"Fly" inputs are OFFERS (`isOffer`): never clash with
  anything, including their own sortie's brief/debrief.
- Leave: LL, OL, OIL (`isLocalLeave` = LL+OIL). LL/OIL may stand an SC SPARE;
  OL and Downchit may not (hard DNIF_FLY/LEAVE_FLY) even though spares are
  otherwise `saExempt`. SC SPARE carries no crew rest either way. SC currency
  is checked for MAIN and SPARE. SC NIGHT ⊂ SC DAY.
- Standalone waves: SC (spares uncrosschecked), AVALON/BB (`noconf`).
- Chip ranking `RANK` (highest wins): LD<DT<TT<A<SD<SB<DB<NB<CR<C<Q.
  Glyphs shorten: CR→R, NB/SB→B, DB/SD→D, LD→L. `A` = on shift AND down for
  a ground event/programme.
- Warning labels embed `{crewRest}`-style tokens; `wlbl()` interpolates the
  LIVE VCONF value.

## Editable rules

`VCONF` (16 numbers) + `SHIFT_HARD` (6 gradings), Logic tab, admin-only.
`RULE_STD` frozen standard; `RULE_SPEC[k]={t,u,lo,hi}`. `ruleParse` accepts
"12h", "2h20", "90", "0700". Storage keeps ONLY the diff in
`localStorage['sqn142_rules']`; `rulesLoad` (called by `initStore` at boot —
do not remove) treats storage as untrusted: number, finite, in bounds.
By owner decision: no rule versioning, no two-person approval.

## Publishing / amendments

`SCHED = {al, pending, changes, als, dayOK, sign}`. Four sign-offs per day
(`SIGN_ROLES`) → "Publish day" clears that day's pending and spends its
signatures. Later edits become pending; "Publish AL n" stamps `{n, keys,
sign, days, n0}` — `days`/`n0` are stamped at issue time and NEVER
recalculated. `unpublishAL(n)` returns changes to pending. Publishing is
per-day; there is deliberately no "publish all days".

## Auth / roles

`a/a` = admin, `user/user` = member (view-only). `canEditSched()` = session
AND admin. Members: no edit page, no Inputs add/delete, read-only Logic.
Logout closes the scheduler board (a sibling of the shell) and resets LGEDIT.
The login is a prototype gate, not security — the deployed app is public.

## Rendering contracts (guarantees to preserve in any enhancement)

- An edit on one day must not visibly disturb the other days (per-day string
  diff in ViewWeek/EditWeek; per-panel diff in SchedBoard).
- The week keeps its scroll through any edit and through an Edit-mode
  toggle; the palette keeps its scroll; wave blocks keep swipe offset.
- Only the page on screen re-renders (CURPAGE gates in the week effects);
  Shell chrome is memoized; no validate() during render — mutation paths
  validate. Perf gate: `probes/perf-port.cjs` (port ≤ reference × 1.15 on a
  4×-throttled phone).
- Never repaint under the caret: `editingText()` guard + deferred txtCommit.
  Enter commits (everywhere, including sim notes), Escape restores.
- Layout is measured, suite-enforced: puck exactly 74×15px (grids derive
  from `--puck-w`); free text needs `overflow-wrap:anywhere` AND
  `min-width:0`; a hole in a programme row renders NO element; week pan =
  one day box per click; proxy scrollbar maps linearly (HS_EPS echo guard,
  `behavior:'instant'` writes).

## Drag / arm-and-plant (hard-won — test on touch)

Toast is `pointer-events:none`. Touch drag: 8px slop restarts the 180ms
hold, >26px cancels; ghost follows finger; click-eater dies on next
pointerdown. A PALETTE drop anywhere on a list row resolves to that row;
a SEAT puck only lands on a seat (swap) or a crew cell (move) — dropped
anywhere else (row title/timings/remarks, jet-row dead space, blank
space, roster, chrome) it comes off the seat (post-port enhancement; the
reference only unassigned on the roster panel). A drop outside the window
never deletes. Self-drop says "Already in that seat". Arm-and-plant: empty slot arms, palette tap
plants, darkened names refuse with a toast, changing board day disarms.
`applyDrop()` is the ONE drop path for mouse and touch.

## History

`histSnap()` serialises `{DAYS, INPUTS, changes, pending, als, al, dayOK,
sign}`; undo/redo restores wholesale. Publishing is its own undo step. Undo
is refused while focus is in an editable field.

## Product decisions already made (do not relitigate)

No rule versioning · no two-person approval · no "publish all days" · OIL is
LL-equivalent, nothing more · sim notes are single-line · pucks never wrap ·
login page stays simple · the talon logo stays.
