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

**The traps that cost an hour, so nobody pays for them twice** — the board is rendered twice in the
DOM, so every board selector is scoped `#schedBoard … :visible`; the board's crew palette is
`#sbRoster`, the week's is `#eRoster`; the desktop OIL button is `#sbOil` and the phone one is
`[data-oilmode="<day>"]`; the warning list is inside `#sbSide` before the text "PLACEHOLDERS"; the
request dialog is `#inpEditPop` with `#inpEditSave`, and pressing Add raises the OIL question
`[data-testid="oilconf"]` ON TOP of the form, which must be answered or nothing is filed.
