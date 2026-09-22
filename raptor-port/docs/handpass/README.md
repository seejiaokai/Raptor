# The OIL hand pass, 21 Sep 26 — start here

`2026-09-21-oil.md` is the evidence sheet: the tier, the roll-call, the gates, the e2e answer,
what the host reproduced, **the ordered fix list (§6)**, and what was not walked.

`parts/` holds the four workers' own sheets, one per block, each with its table and its findings.

`state-sat.json` is a saved world with the everything-Saturday already built and unpublished. Load
it and a scenario starts in two seconds instead of seventy:

```js
import { open } from '../../scripts/handpass/lib.mjs'
const { browser, page } = await open({ state: 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json' })
```

`../../scripts/handpass/` holds the driver (`lib.mjs`), the fixture builder (`fixture.mjs`, which
builds the whole day through the app's own controls in ~70s) and every scenario script. They are
committed on purpose: the next session re-runs a finding instead of rediscovering it.

**THE TRAP THAT COSTS A FALSE PASS — the saved world is tied to its PORT.** `state-sat.json` was
captured on `http://localhost:4173`, and browser storage is per-origin, so loading it against any
other port restores NOTHING. The app then draws a perfectly valid EMPTY day, which reads exactly
like a real "nobody earns here" result — a scenario script would PASS while asserting against an
empty world. `lib.mjs` now REFUSES this with a plain message rather than trusting anyone to
remember it. To drive on another port, re-save the state against that port. Serve with
`npx vite preview --port 4173` from `raptor-port/`.

**The traps that cost an hour, so nobody pays for them twice** — the board is rendered twice in the
DOM, so every board selector is scoped `#schedBoard … :visible`; the board's crew palette is
`#sbRoster`, the week's is `#eRoster`; the desktop OIL button is `#sbOil` and the phone one is
`[data-oilmode="<day>"]`; the warning list is inside `#sbSide` before the text "PLACEHOLDERS"; the
request dialog is `#inpEditPop` with `#inpEditSave`, and pressing Add raises the OIL question
`[data-testid="oilconf"]` ON TOP of the form, which must be answered or nothing is filed.

## THE DOOR IS FOUND, AND THE WALK IS DONE (22 Sep 26)

The blocker this section used to carry — "the request's own edit button is NOT in the DOM on the
board the driver opens" — was never a missing button. **The board's PERSONAL INPUTS panel folds to a
one-line summary by default** ("3 inputs · 3 on programme · show ⌄"), and folded it renders **no rows
at all**, so the button is ABSENT rather than hidden. The header itself is the toggle (`data-pitog`).
Pressing it: 0 → 3 edit buttons.

`lib.mjs` now has `openInputs(page, di)`. Call it before reaching for any request row on the board.
Two traps are baked into it:

- **`data-pitog` rides the header in BOTH states**, so its presence says nothing about which way the
  panel is folded — a naive "is it shut?" check closes an open one. Read the ROWS.
- **the fold is `!readOnly`**, which is why the rows DO appear once the OIL mode is on — and why the
  edit button there is correctly swapped for the OIL cell (fix 5).

With that open, every job on the branch has been driven. The walk's own sheet is
`2026-09-22-oil-walk.md`; it carries the `Walk:` line, three defects the walk found and fixed, and
what was deliberately not walked.

**Two more traps this walk paid for, so nobody pays again:**

- **the Leave War's PERIOD SELECTOR, not its grid.** The grid draws only the SELECTED period's cells
  — 353 of them, all 2026 — which reads exactly like "the war stops at 2026". The selector carries
  TWO periods, Jan–Dec 26 and Jan–Dec 27, so the first uncovered year is **2028**. Reading the grid
  nearly produced a false defect report against a check that was behaving correctly.
- **"Publish day" is drawn five times** (desktop and phone board twins plus the week), so a bare
  `:visible` + `.first()` presses a copy nobody can see and nothing happens. Go through `tap()`. And
  a publish is REFUSED while the day carries hard conflicts — Mon–Thu all do in the demo, so
  **Friday is the only clean weekday** to build a publish fixture on.
