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

## STILL TO WALK — job 1's last mile (22 Sep 26)

Everything in job 1 is proved through its own production function with a test that was red first,
and the new wording is proved live on the built board (`docs/img/handpass/2026-09-21-oil/job1-wording.png`).
**What is NOT yet walked** is the last step of the money story through the real dialog: opening a
landed request, changing who it belongs to, and watching the OIL question come up for the new man.

Steps 1–4 of that story DO drive cleanly and were re-confirmed on this branch — publish the
Saturday, refuse the requester in the mode, publish the amendment, and his cell goes blank while
the other man keeps his.

**The blocker, so the next session does not rediscover it:** the request's own edit button
(`data-inpedit`, drawn by `inpEditLabel` in `ui/html.ts`) is NOT in the DOM on the board the
driver opens — `document.querySelectorAll('[data-inpedit="<iid>"]')` returns nothing, and
`HOOKS.editMode()` reads false there. `lib.mjs`'s `board()` does go to `editsched` first, so the
cause is something else — most likely the panel that carries the button is not the one the landed
request is drawn on. Find that door once and every remaining scenario that edits a request gets
easier.
