# RAPTOR — 142 SQN Flying Programme (React port)

RAPTOR is a flying-schedule planner for an F-15SG squadron: a week of flying
waves, duty crews, sims, ground events and personal inputs, with a validation
engine that flags crew-rest breaches, double bookings, missing briefs and
qualification problems, and an amendment (AL) workflow for publishing changes
after a day has been signed off.

The working application is `reference/scheduler.html` — one self-contained
file (~6,600 lines: 1,545 CSS, 326 markup, 4,722 JS), build 29JUL·B55. It is
**the specification for this port**. When the port and the reference disagree,
the reference is right. Never modify anything under `reference/`.

`reference/tfin.js` is a jsdom regression suite with 728 assertions.
`reference/probes/` is 54 Playwright probes (geometry, drag-and-drop,
publishing flows, performance). Chromium for probes lives at
`/opt/pw-browsers/chromium` in the original environment — locally, use your
own Playwright install; never run `playwright install` if a browser is
already provisioned.

## Port strategy (do not deviate)

1. Engine first: extract the ~181 DOM-free functions into `src/engine/` as
   TypeScript, bodies **verbatim**, tests ported to Vitest. No React in this
   phase.
2. UI second, page by page, against the reference open in a browser.
3. CSS is ported verbatim before it is ever "modernised". The stylesheet
   carries measured contracts (below), not preferences.
4. Every phase ends with the ported tests green AND the reference suite still
   green (`node reference/tfin.js` with NODE_PATH set to a dir containing
   jsdom).

Port function bodies without refactoring, renaming, or simplifying. Keep every
comment — many document bugs that were found and fixed; deleting the comment
is the first step to reintroducing the bug. If something looks wrong, report
it; do not fix it silently.

## The slot-key grammar (load-bearing — everything addresses through this)

Every fillable position and editable text in the schedule has a string key.
The **day index is always first** after the prefix; `keyDay(key)` depends on it.

- Flying seat:   `di.gi.li.ai.seat` — day, wave (go), formation (line),
  aircraft, seat `p` (FCP/pilot) or `w` (RCP/WSO). No prefix.
- Duty:          `d:di.dwi.ri` · Sim: `s:kind.di.ri` (kind = amt|oft) ·
  Ground: `g:di.ri` · All-hands/programme: `a:di.ri`
- `.+` suffix = append to the row's crew; `.xN` = overflow slot `row.more[N]`.
- Text keys: `dn:` day note · `sn:` sim notes · `ap:` programme fields ·
  `wl:` wave label · `ff:` formation fields · `fr:` flight remarks ·
  `it:` in-times · `dl:/dr:` duty label/remarks · `sr:` sim remarks ·
  `gr:` ground remarks · `st:` stores · `ar:/at:` area/area-time ·
  `tr:` traffic.

`shiftKeys(head,pos,ix)` renumbers keys when a row is deleted: keys before the
cut stay, the deleted index's keys vanish, later ones decrement. It must run
over `SCHED.pending`, `SCHED.changes` and every AL's live `keys`.
`shiftAircraft` / `shiftFormation` / `shiftWave` compose it. Deleting a
standalone wave must also remove its duty block (`d:`/`dr:`/`dl:` keys).

## The mutation funnel (bypassing it is always a bug)

All schedule writes go through `slotVal` / `setSlotVal` / `fillSlot` /
`txtGet` / `txtSet` → `noteChange(key)` → `afterSchedMutate()`. A write that
skips the funnel is invisible to the amendment machinery: it will not be
marked pending, will not appear on the next AL, and will not trigger
re-validation. In React terms: whatever state store you use, there must be
exactly one mutation path and it must record the touched key.

`afterSchedMutate()` also: drops a selection whose person count fell
(`SELID`/`SELSEEN`), disarms an armed slot whose target no longer exists
(`armTargetExists`), then `validate()` and repaint.

Deletes call `markEdit()` with **no key** — a delete must never re-mark the
address it just removed (that key now points at a different row, or nothing).

## The engine

`collectEvents()` builds per-day events from DAYS + INPUTS; `validate()`
produces `WARN {all, byDay, sev, chip}` and publishes `REST[di][id]` (when
crew rest expires today) and `EVD[di][id]`. Severity tiers: `hard` (Warning),
`adv` (Advisory), `note`. `overlap(a1,a2,b1,b2)` is **half-open** — abutting
windows do not overlap; a stand-down ending 09:00 does not clash with a 09:00
brief.

Key rules, as shipped (the Logic tab documents all of them and the suite
fails if any VCONF setting, event kind or WCODE code is undocumented):

- A sortie occupies step (T/O − VCONF.step) to dekit (land + VCONF.dekit).
- Brief window = T/O − VCONF.briefLead to T/O, **always pinned to T/O**; a
  published in-time moves the report time and crew rest, never the brief.
- Crew rest (VCONF.crewRest) runs off the last REST-BEARING commitment
  (sortie or shift), not a late desk duty. Report = published in-time, else
  T/O − reportLead. Breach = hard CR; nominal-inside-rest = adv TT
  (tight turning).
- Tight turn between sorties: needs `max(VCONF.tightTurn, dekit + step)` —
  the threshold and the mechanics are edited independently, so take the
  larger.
- Double turn: **two or more** sorties in a day → one hard DT_SUM line naming
  everyone; individual pucks stay amber. No span test.
- "Available fly" / "Available duty" / "Fly" inputs are OFFERS: they never
  clash with anything (`isOffer`), including the brief/debrief windows of the
  sortie the person was given.
- Leave taxonomy: LL (local leave), OL (overseas), OIL (off in lieu, CO-
  granted, unofficial). `isLocalLeave` = LL, OIL. LL/OIL may still stand an
  **SC SPARE**; OL and Downchit may not — that specific case raises hard
  DNIF_FLY/LEAVE_FLY even though spares are otherwise exempt from every
  cross-check (`saExempt`). SC SPARE carries no crew rest in either
  direction. SC currency (day/night qual) is checked for MAIN **and** SPARE.
- SC NIGHT qual ⊂ SC DAY. Standalone waves: SC (spares uncrosschecked),
  AVALON / BB (nothing cross-checked, `noconf`).
- Chip ranking `RANK` (highest wins on a puck):
  LD < DT < TT < A < SD < SB < DB < NB < CR < C < Q.
  Chip glyphs print short (`CHIP_TEXT`): CR→R, NB/SB→B, DB/SD→D, LD→L.
  `A` (amber) = advisory: on shift AND down for a ground event/programme.
- Warning labels may embed `{crewRest}`-style tokens; `wlbl()` interpolates
  the **live** VCONF value so an edited threshold never leaves a stale "12h"
  in a tooltip.

## Editable rules

`VCONF` (16 numeric settings) + `SHIFT_HARD` (6 clash gradings) are edited on
the Logic tab, admin-only. `RULE_STD` is the frozen standard;
`RULE_SPEC[k]={t,u,lo,hi}` gives label/unit/bounds. `ruleParse` accepts
"12h", "2h20", "90", "90 min", "0700". Persistence stores **only the diff**
from standard in `localStorage['sqn142_rules']`; `rulesLoad` treats storage
as untrusted — a value must be `typeof number`, finite and inside its bounds
(`isFinite("840")` is true; a string here once poisoned the crew-rest maths
via concatenation). "Reset to standard" restores everything. Edit mode
(`LGEDIT`) must ask the role at render time and reset on login/logout.
Deliberately absent, by owner decision: rule versioning, two-person approval.

## Publishing and amendments

`SCHED = {al, pending, changes, als, dayOK, sign}`. Per-day flow:

1. Four sign-offs per day (`SIGN_ROLES`), then "Publish day" →
   `setDayApproved(di,true)` — this **clears that day's pending** and spends
   its signatures.
2. Later edits on a published day become pending; "Publish AL n" →
   `publishALDay(di)` / `alIssue(n,keys)` marks `changes[k]=n`, records
   `{n, keys, sign, days, n0}`, spends signatures again.
3. An issued AL is **history**: `days` and `n0` (item count) are stamped at
   issue time and never recalculated, so deleting rows afterwards cannot
   shrink a printed amendment to "0 items". Live `keys` still move with
   `shiftKeys` for on-screen marks.
4. `unpublishAL(n)` returns its changes to pending. "Reopen all" resets
   everything to draft.

There is **no "publish all days"** button — removed by owner decision;
publishing is per-day.

## Auth / roles

`ACCOUNTS`: `a/a` = admin, `user/user` = member (view-only). `canEditSched()`
= session AND admin. Members: no edit page, no Inputs add/delete, no rule
editing, read-only Logic tab. Right-click-to-clear obeys the Edit-mode
toggle, not just the page. Logout must close the scheduler board overlay
(it is a sibling of the shell, not a child) and reset `LGEDIT`.

## Rendering contracts (port the behaviour, not the mechanism)

The reference diffs per-day markup strings and swaps only changed
`<section class="day">` nodes (B54) — React's reconciler replaces this
mechanism, but the **guarantees** it bought must survive:

- An edit on one day must not visibly disturb the other days.
- The week keeps its horizontal scroll through any edit AND through an
  Edit-mode toggle; the aircrew palette keeps its scroll; a day's wave
  blocks keep their swipe offset (phone).
- A no-op state change repaints nothing (React.memo per day, keyed by day).
- Budget, measured on a 4×-throttled phone: one-day edit ≈ 170 ms,
  board edit ≈ 100 ms. The port must not regress past these.
- Contenteditable drift (stray `<br>` from Enter, pasted styled spans) was
  healed in place from the model — in React, controlled inputs make this
  moot, but blur-commit semantics must match: Enter commits (everywhere,
  including sim notes), Escape restores the model value, `txtSet` collapses
  whitespace and normalises times via `parseHM`/`hhmm`.

## Layout contracts (measured, suite-enforced — keep the CSS verbatim first)

- Puck: exactly **74×15 px**, name on one line, ellipsis, never wraps.
  The grids derive their tracks from `--puck-w`; change nothing here.
- Free text (`.ntx`, `.itxt`, row names, notes, remarks): `overflow-wrap:
  anywhere` AND `min-width:0` on the cell — both, or long unbroken tokens
  paint over the START/END columns (B55; the probe measures ink via a Range,
  not the cell box, at 390/430/820/1500 px).
- A hole in a programme row renders **no element at all** — an empty flex
  item still eats the 4px gap and walks later pucks 16px out of line (B49).
- Ink probe: text below a puck sits at −3px overlap, 9px/9px font/line.
- Week pan: one arrow click = exactly one day box (pitch 564 at reference
  width); proxy scrollbar maps linearly and is inert only while dragging.
- Phone (≤820px): day column scrolls sideways; wave blocks in a day mirror
  each other's scroll; drawer stays fixed during a drag.

## Drag / arm-and-plant (B49 hard-won; test these on touch)

- Toast is `pointer-events:none` — it must never take the hit test.
- Touch drag: 8px slop restarts the hold timer, >26px cancels; hold 180ms.
- A drop anywhere on a list row resolves to that row, not just the cell.
- The click-eater after a drag dies on the next pointerdown, not a timer.
- Dropping a puck on its own seat says "Already in that seat" — never silent.
- Arm-and-plant: tapping an empty slot arms it; a palette tap plants.
  Darkened palette names do not plant (the reason toasts). Changing board
  day or deleting the armed target disarms.

## History

`histSnap()` serialises `{DAYS, INPUTS, changes, pending, als, al, dayOK,
sign}`; undo/redo restores wholesale and re-renders. Publishing is its own
undo step. Undo is refused while focus is in an input/contenteditable.

## Verification discipline (applies to the port too)

Three gates, in order, after every change: (1) syntax/typecheck, (2) unit
suite, (3) behaviour probes for anything UI-visible. When you fix a bug, add
an assertion that pins it — the reference suite grew from 0 to 728 this way,
and several of its assertions are deliberately inverted ("a delete does NOT
re-mark…") because they once pinned the buggy behaviour. Never weaken an
assertion to make it pass; understand why it failed.

## Product decisions already made (do not relitigate)

- No rule versioning; no two-person rule approval; no "publish all days".
- OIL exists in the picker but needs no extra behaviour beyond LL-equivalence.
- Sim notes are single-line; Enter commits.
- Pucks never wrap. Login page stays simple, one centred column, changelog
  behind `<details>`. The talon logo (option 13) stays.
