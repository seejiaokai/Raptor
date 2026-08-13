# Scheduler board redesign — design

**Date:** 2026-08-13
**Status:** Design, awaiting review
**Surface:** The full-screen scheduler board (`src/ui/board.ts`, `board-html.ts`,
`SchedBoard.tsx`), the week view (`html.ts`), the AMT/OFT sim engine
(`engine/events.ts`, `validate.ts`, `rules.ts`) and the Rules tab
(`ui/logic-html.ts`, `LogicPage.tsx`).

## Goal

Reduce clutter on the board and make its text read as *data*, not decoration:
strip the faded example timings, tidy the notes, and rework the two places
where the interaction model is confusing — duties (today gated behind waves)
and adding a wave (today a top-bar button). One contained engine change makes
the AMT sim block carry its brief/box/debrief times as real fields instead of
label-matched rows.

## Scope split

The work divides into two passes with independent value. Each gets its own
implementation plan.

- **Pass 1 — board cleanup, AMT block, wave relocation.** Self-contained edits
  to existing surfaces plus one bounded engine change.
- **Pass 2 — duty-template system.** A net-new, persisted, user-editable
  template library with its own editor and picker; decouples duties from waves.

## Non-goals

- No server or cross-device sync. Templates persist per-device via
  `storeBackend`, exactly as the Stores config does; the schedule stays
  session-only. (The standing "No shared data" limitation is unchanged.)
- No rework of OFT beyond confirming its existing Remarks column is reachable.
- No change to flying-line, ground, or programme *semantics* — only their
  placeholder text (Pass 1.1–1.2) and, for waves, where the add control lives.

---

## Pass 1

### 1.1 Remove all faded example timings (board + week view)

**Current.** Time cells carry ghost example values painted by the global
`input::placeholder{opacity:.55}` rule (`scheduler.css`) and, on the week's
contenteditable cells, by `[data-ph]:empty::before`. Example timings today:
Common Programme `0800`/`0900`, Sim/AMT/OFT `0900`/`1100`, Ground
`1400`/`1500` (board via `sbTxt`/`board-html.ts`), and the week-view programme
str/end via `ted()` (`html.ts`).

**Change.** Emit **no placeholder** on any *time* field, on the board and on
the week view (both View Schedule and Edit Schedule). The board's `sbTxt`
helper already emits no attribute when `ph` is empty, so this is passing `''`
at each time-field call site; the week view drops the `data-ph` on its time
cells.

**Keep — genuine defaults.** Text that reports the field's *actual value when
blank* is not a guide and stays: the input-row `all day` marker. Additionally,
that default must render in **View Schedule** too, not only in Edit (see 1.8).

**Not touched.** Duty rows and flying-line times already carry no placeholder.
Non-time example placeholders on the board are handled per-field below (1.2
programme item; 1.3 day notes) and are otherwise left alone.

### 1.2 Remove the "item" placeholder on Common Programme

**Current.** The programme item field shows the ghost `MASS BRIEF`
(`board-html.ts`, `sbProgPanel`). The week equivalent is in `html.ts`.

**Change.** Emit no placeholder on the programme item field, board and week.

### 1.3 Day ("Overall") notes — example text

**Current.** `sbNotesPanel` renders each day note with placeholder
`e.g. EP OF THE WEEK — ENGINE FIRE ON GROUND` (`board-html.ts`).

**Change.** Replace with `e.g. EP, ORDERS, NO FLY, SQN OFF`. Placeholder only;
this is a guide (not a default value), so it does **not** render in view mode.

### 1.4 Scheduler-notes box — smaller, auto-grows

**Current.** `.sb-nbox` textarea has `min-height:58px; resize:vertical`
(`scheduler.css`), appended at the foot of the Programme, Duty, Sim and Ground
panels.

**Change.** Lower the min-height to roughly one line and grow the box to fit
its content as text is added. Preferred mechanism: CSS `field-sizing:content`
with a JS fallback (a small `input` handler that sets height to `scrollHeight`)
because this container's Chromium may not support `field-sizing`; the fallback
also covers iOS Safari. Manual `resize:vertical` is retained as an override.
The amber empty/`--ink` focus colours are unchanged.

### 1.5 AMT block — brief / box / debrief as structured fields *(engine-touching)*

**Current.** An AMT sim is modelled as **separate rows** — `{label:'BRIEF'…}`,
`{label:'BOX'…}`, `{label:'DEBRIEF'…}` in `data.ts`. The validator infers
windows from those labels: `engine/events.ts` (`collectEvents`) splits AMT rows
with `/^\s*BRIEF/i` and `/DEBRIEF/i`, anchors the brief window on the BRIEF
row's own time, and computes debrief as `debriefStart + VCONF.amtDebrief`.

**Change — data model.** An AMT entry becomes one structured block:

```
{ brief: "HHMM",            // single time
  box:     { str, end },     // time range — THIS is the kept row (people + rmks)
  debrief: { str, end },     // time range
  who|p/w|pax, rmks }
```

The **Box** is the row that stays (carries People and the existing Remarks
column). Brief is a single time; Box and Debrief are ranges. OFT is unchanged.

**Change — engine read.** `collectEvents`' AMT branch reads the three windows
directly from the fields instead of label regexes:
- brief window `[brief, box.str]` (crew engaged from brief until the box opens),
- box occupancy `[box.str, box.end]`,
- debrief window `[debrief.str, debrief.end]` — explicit, no computed length.

`SIM_BRIEF`/`SIM_DEBRIEF` codes and their consumption in `validate.ts` are
unchanged; only the window *source* changes.

**Change — Rules tab.** With debrief now an explicit range, `VCONF.amtDebrief`
(the computed debrief length) is no longer read for AMT. OFT still uses
`epBrief`/`simDebrief`. Options for `amtDebrief`: leave the knob in place but
unused, or remove its AMT rule row from `lgRules` (`logic-html.ts`). Decision:
**remove the AMT-debrief-length row from the Rules tab** and drop `amtDebrief`
from `RULE_SPEC`, since nothing reads it after this change; keep `epBrief` and
`simDebrief` for OFT. (Flagged as a plan task with its test updates.)

**Reference-parity impact (must be handled in the plan).** The read-only
`reference/` build still models AMT as label rows and is one of the four gates
(`tfin.js` + the jsdom parity suite via `src/testing/refwin.ts`). Restructuring
AMT will diverge the port's AMT windows from the reference's unless the
reference is fed equivalent data. Approach: add a `refwin.ts` patch (in the
family of `reinput`/`rebrief`) that reconstructs the reference's BRIEF/BOX/
DEBRIEF rows from the port's structured fields so both engines compute the same
windows — preserving the parity gate. Document the patch beside the rule in
`docs/engine-rules.md`, as the existing patches are. If a clean equivalence is
not achievable, the fallback is to mark AMT-window parity as a port-only
assertion (like `audit2 #8`) and pin the new behaviour in
`engine/validate.test.ts` — but the `refwin` patch is preferred and tried
first.

**Seed data.** The AMT entries in `data.ts` are migrated to the structured
shape. Ground-truth times are preserved so the demo week reads identically.

### 1.6 OFT / AMT remarks — confirm reachable

The Remarks column already exists for both AMT and OFT rows
(`sr:${di}.${kind}.${ri}.rmks`, rendered by `sbRmk`). It is hidden on phone
when empty (`.rmkin.empty{display:none}`). No new field is needed. The plan
verifies the column is present and editable on both AMT and OFT after the 1.5
restructure (the AMT Box row keeps it), and that is the whole of this item.

### 1.7 Relocate "Add wave" to an inline board control

**Current.** Three add-wave entry points call `waveMenu`: the board top bar
`#sbAddGo` (`SchedBoard.tsx`, desktop + phone), the desktop Edit-Week page
`#addGo` (`Shell.tsx`), and per-wave `+ Line` (unrelated — adds a formation,
kept). "No flying waves yet — use \"+ Wave\"." is the board empty state
(`board.ts`).

**Change.**
- Remove `#sbAddGo` from the board top bar (both widths).
- Remove `#addGo` from the desktop Edit-Week page.
- Add a single inline **Add wave** control on the board, rendered as an ordinary
  section add-button (the same idiom as `+ Block` / `+ Row` / `+ Item`),
  positioned **between Common Programme and the flying-waves block** (the seam
  in `boardHTML` where the `fly` loop is emitted). It calls `waveMenu(el, SBDAY)`
  and opens the same kind picker (Flying wave / SC / AVALON / BB).
- Update the empty state text to point at the new inline control instead of
  "+ Wave".

Adding a wave is a board-only action after this change; the board is reachable
on desktop, so no desktop-page control is needed (confirmed with owner).

### 1.8 Blank-value defaults render in View Schedule

**Current.** The `all day` default marker is shown where a timed input is
blank. Confirm it renders in **View Schedule** (read-only week) as well as Edit
Schedule and the board, since it is a real default, not a guide. Where View
currently suppresses it, render it (styled as the resolved value, not as a faded
placeholder).

---

## Pass 2 — duty-template system

### 2.1 Data model & persistence

A **duty template** is a named, ordered list of rows:

```
DutyTemplate = { id, title, rows: [ { role, str, end } ] }
```

`rows` captures the "default presentation" and the row count. Templates live in
a mutable library `DUTYTPL_CFG` with a frozen seed `DUTYTPL_STD`, mirroring
`stores.ts` exactly: `dutyTplKey`, `addTpl`/`delTpl`/`renameTpl`/`moveTpl`/
`updateTpl`, and `dutyTplSave`/`dutyTplLoad`/`dutyTplReset` against a new
`dutytpl` storage key through `HOOKS.storeBackend`. Persisted state, so it lives
in the engine layer beside `stores.ts`. Nothing in `validate.ts` reads a
template — a template only *produces* a duty block, which is then ordinary data.

**Seed.** `DUTYTPL_STD` is built from today's shapes so nothing is lost:
- **Standard** — `DUTY_STD` (`SDO`, `SXO`, `OPS O`).
- **SC shift** — the SC cross-product (`SXO AM`, `OPS O AM`, `SXO PM`,
  `OPS O PM`).
- **AVALON** — `SXO`, `OPS O`, `RUNNER`, `LOG CELL` (with AVALON's shift times
  as the default presentation).
- **BB** — its current shape.

The role vocabulary stays `DUTY_PICK`.

### 2.2 "+ Block" opens the template picker (waves decoupled)

**Current.** `blockMenu` (`board.ts`) lists the *day's waves* plus an
`Empty block`; picking a wave mints `waveDutyBlock(wave)`. AVALON additionally
auto-creates its block at wave-add time via `SAWAVE.autoDuty`.

**Change.**
- `blockMenu` lists **every template** in `DUTYTPL_CFG` (title per row), plus
  `Empty block` (one blank row, unchanged), plus a **pencil** affordance in the
  popup's top-right that opens the template editor (2.3).
- Picking a template **copies** its rows onto the day (`d.dutywaves.push`), so
  later edits to the placed block never touch the library, and vice-versa.
- **Decouple duties from waves (owner: full decouple):**
  - Remove `SAWAVE.autoDuty` so no wave — AVALON included — auto-creates a duty
    block. Duties are added only through `+ Block`.
  - Remove the wave→duty ownership link used by wave-delete
    (`saDutyIx`/`waveDutyBlock`, `board.ts` wave-delete path). Deleting a wave
    no longer deletes any duty block.
  - Template-produced blocks are **ordinary conflict-checked blocks**: they
    carry no `sa`/`noconf` marker, so the "standalone wave's duty desk skips
    clash-checking" behaviour goes away. This is a deliberate validation change
    — a duty role that clashes now warns like any other. Pinned by new tests and
    noted in `docs/engine-rules.md`.

**Migration.** No persisted schedules exist (session-only), so no data
migration is required; the seed week's duty blocks are re-expressed as plain
blocks in `data.ts` where they were wave-owned.

### 2.3 Template editor (pencil, top-right)

A modal in the ordinary `.modal` idiom (sibling to the Stores config picker and
Manage-users), opened from the pencil in the `+ Block` popup. It manages the
**library**, not a placed block. Capabilities:

- **List** every template; **add** a new one; **delete**; **rename** (title).
- **Edit rows** of the selected template: change a row's role (via the
  `DUTY_PICK` list) and its default start/end; **add row**, **remove row**,
  **rearrange** rows (reuse the existing row-reorder affordance/idiom).
- **Row count** is simply the number of rows — adding/removing rows sets it.
- **Save** persists the library (`dutyTplSave`); **reset** restores
  `DUTYTPL_STD`.

Every field inside a template is editable. Edits are library-level and take
effect the next time the template is placed (existing placed blocks are
independent copies and are untouched).

---

## Testing

- **Pass 1.1–1.4, 1.7, 1.8** are markup/CSS/interaction changes. jsdom pins the
  emitted classes/attributes (no placeholder attribute on time fields; the new
  inline Add-wave button present and top-bar/desktop buttons absent; `all day`
  present in View). Geometry that jsdom cannot measure (the auto-grow note box,
  the relocated control's layout) is pinned in `e2e/geometry.spec.ts`. Existing
  `boardnav.test.tsx` assertions about the top bar are updated.
- **Pass 1.5** — new `engine`-level tests assert the three AMT windows are read
  from the structured fields and that `SIM_BRIEF`/`SIM_DEBRIEF` fire correctly;
  the `refwin.ts` patch is exercised by the parity suite; `tfin.js` stays green.
  Rules-tab test updated for the removed `amtDebrief` row.
- **Pass 2** — `dutytpl.test.ts` mirrors `stores`' persistence tests
  (add/rename/delete/move/save/load/reset, seed integrity). UI tests: `+ Block`
  lists templates and no longer requires a wave; placing a template copies it;
  editing the library does not mutate a placed block; deleting a wave leaves
  duty blocks intact; a clashing duty role now warns (the decouple change).

All six gates (`npm test`, `node reference/tfin.js`, `npm run build`,
`npm run test:e2e`, `probes:adapted`, `perf`) must be green first-hand before
each pass ships, and each shipped change is checked on the deployed page per the
standing instruction.

## Docs to keep true (same PRs)

- `docs/ui-contracts.md` — the board's Add-wave location; the `+ Block` template
  picker; the AMT block's three-field shape; the auto-grow note box; `all day`
  in View.
- `docs/engine-rules.md` — AMT windows now read from fields; the `refwin` AMT
  patch; duties decoupled from waves and now conflict-checked; `amtDebrief`
  retired for AMT.
- `docs/feature-impact.md` — duties no longer a wave drift-seam; templates as a
  new persisted-config surface beside stores.
- `HANDOFF.md` — retire the "SC creates no duty block; AVALON does" decision and
  the wave→duty coupling notes; record the template library as open persisted
  state (per-device, like stores).

## Risks / open items

- **AMT reference parity** is the main risk (1.5). The `refwin` patch is the
  intended fix; the port-only-assertion fallback is the escape hatch. The plan
  starts by proving the equivalence on the seed week before touching the model.
- **The decouple removes a validation exemption** (2.2): standalone duty desks
  that were silent (`noconf`) now clash-check. This is intended per the owner's
  "full decouple," but it is a behaviour change to call out in the PR.
- **`field-sizing` support** (1.4) is unverified in this container's Chromium;
  the JS fallback is why it is not relied on alone.
