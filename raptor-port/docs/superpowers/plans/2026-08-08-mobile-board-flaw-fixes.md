# Mobile Board Flaw Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the four flaws the 8 Aug critique found in the phone scheduler
board: the tap-stealing AIRCREW tab (→ centred grab-handle on board AND edit
week), the invisible tap extension over input ends (→ deleted), no visible
result after a fill (→ drawer parks itself), and the nested-scrolling Live
checks strip (→ folds to one line).

**Architecture:** CSS-first — the handle is pure CSS geometry in the two
existing 820px blocks; park-after-fill is two one-line hooks on the existing
plant/drop success paths; the fold is one module flag in `board.ts`, read by
`boardWarnHTML` and toggled through the delegated click router. No engine
changes, no markup contract changes beyond a wrapper div and a data
attribute inside `#sbWarn`.

**Tech Stack:** React 18 + string builders, Vitest + jsdom, Playwright
(`executablePath:'/opt/pw-browsers/chromium'`), run everything from
`raptor-port/`.

## Global Constraints

- Phone only (`@media (max-width:820px)`): desktop (>820px) and
  `.schedboard.sb-wide` must render exactly as today — restate overrides in
  the `.sb-wide` block per house pattern, never `:not()` chains alone.
- `src/engine/` untouched; byte-exact reference parity untouched (nothing
  here renders on the view/edit WEEK's day markup).
- Spec: `docs/superpowers/specs/2026-08-08-mobile-board-flaws-design.md` —
  handle `height:clamp(180px,55vh,440px)`, visible width 30px, no invisible
  hit extension.
- Every fix lands with a test that pins it; gates before shipping:
  `npm test` · `npm run build` · `node reference/tfin.js` ·
  `npm run test:e2e` · `npm run probes:adapted` + `npm run perf` (both need
  `npx vite preview --port 4173` running; perf reds are re-run before being
  believed — HANDOFF documents the swing).
- Keep `../HANDOFF.md` and `docs/ui-contracts.md` true in the same PR.
- Commits on branch `claude/read-handoff-eafhts`; owner-facing reporting in
  plain language.

---

### Task 1: The centred AIRCREW grab-handle (board + week)

**Files:**
- Modify: `src/ui/scheduler.css` — the `.eroster .ros-tab` base rules
  (~line 332), the week's 820px drawer block (~lines 345–356), the board's
  820px drawer block (the `.schedboard .sb-ros` rules, ~line 1930s)
- Test: `e2e/geometry.spec.ts` (new test + two assertions updated in "the
  phone board is one window")

**Interfaces:**
- Consumes: existing classes `.sb-ros`, `.eroster`, `.ros-tab`, body class
  `ros-open`.
- Produces: parked drawers that are centred bands
  (`top:50%; height:clamp(180px,55vh,440px)`; visible sliver 30px); open
  drawers full height. No `::before` hit extension exists anywhere.

- [ ] **Step 1: Write the failing e2e test** — append to
  `e2e/geometry.spec.ts` (after the "droppable hole" test):

```ts
/* THE PARKED TAB STOLE TAPS (owner critique, 8 Aug 26). The drawer aside
   spanned top:0-bottom:0, so its parked sliver covered the header's right
   edge — elementFromPoint at the centre of ✕ Close and of the Sun 19 chip
   returned .ros-tab, and both taps opened the drawer. The invisible 14px
   ::before extension likewise sat over the last ~13px of every full-width
   input. The drawer is a centred grab-handle now, and nothing invisible
   extends past it. */
test('board at 390px: taps near the right edge land where they aim', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 })
  await login(page); await go(page, 'editsched')
  await page.click('.sb-open')
  const hits = await page.evaluate(() => {
    const at = (sel: string) => {
      const r = document.querySelector(sel)!.getBoundingClientRect()
      const el = document.elementFromPoint(Math.min(386, r.right - 4), r.top + r.height / 2)!
      return ((el as HTMLElement).id || el.className || el.tagName).toString()
    }
    return { close: at('#sbClose'), sun: at('#sbDays [data-sbtab="6"]'), rmk: at('#sbBoard .sb-line .nts') }
  })
  expect(hits.close, 'the Close button owns its own pixels').toBe('sbClose')
  expect(hits.sun, 'the Sunday chip owns its pixels').toContain('sbday')
  expect(hits.rmk, 'a remarks input owns its right end').toContain('nts')
  const band = await page.locator('#schedBoard .sb-ros').boundingBox()
  expect(band!.height, 'a handle, not a full-height wall').toBeLessThan(500)
  expect(band!.y, 'clear of the header above it').toBeGreaterThan(100)
})
```

- [ ] **Step 2: Run it to verify it fails** —
  `npx playwright test -g "land where they aim"` — expect FAIL: `hits.close`
  is `ros-tab` against the current build (build first: `npm run build`).

- [ ] **Step 3: CSS — base tab rules.** In `scheduler.css` ~line 332,
  change the tab's width `flex:0 0 26px` → `flex:0 0 30px`, and DELETE the
  two hit-extension rules added 8 Aug (`.eroster .ros-tab{position:relative}`
  and `.eroster .ros-tab::before{…}`) together with their comment.

- [ ] **Step 4: CSS — the week's parked drawer.** In the week's 820px block
  (`.edit-board .eroster`, ~line 346) replace `top:0;bottom:0` and the
  transform so the whole rule reads:

```css
  .edit-board .eroster{position:fixed;right:0;top:50%;bottom:auto;
    height:clamp(180px,55vh,440px);z-index:190;
    width:max-content;max-width:78vw;max-height:none;align-self:auto;margin:0;
    padding:8px 8px 12px 0;border:1px solid var(--edge);border-right:none;border-radius:12px 0 0 12px;
    background:rgba(11,13,16,.965);backdrop-filter:blur(8px);box-shadow:-14px 0 34px -18px rgba(0,0,0,.95);
    overflow:visible;transform:translate(calc(100% - 30px),-50%);transition:transform .2s ease;
    display:flex;align-items:stretch}
  body.ros-open .edit-board .eroster{top:0;bottom:0;height:auto;transform:translateX(0)}
```

  (Keep the comment above the block; extend it: parked = a centred
  grab-handle, `clamp` per the 8 Aug spec, open = full height. The open rule
  REPLACES the existing `body.ros-open .edit-board .eroster{transform:translateX(0)}` line.)

- [ ] **Step 5: CSS — the board's parked drawer.** In the board's 820px
  block, change `.schedboard .sb-ros` the same way: `top:0;bottom:0` →
  `top:50%;bottom:auto;height:clamp(180px,55vh,440px)`; transform
  `translateX(calc(100% - 26px))` → `translate(calc(100% - 30px),-50%)`; and
  the open rule → `body.ros-open .schedboard .sb-ros{top:0;bottom:0;height:auto;transform:translateX(0)}`.
  Update the comment: the parked aside IS the handle, so nothing (visible or
  invisible) covers ✕ Close, the day chips, or an input's right end.

- [ ] **Step 6: Update the existing one-window e2e test** — in "the phone
  board is one window": the parked-x assertion
  `expect(parked!.x, …).toBeGreaterThan(390 - 30)` becomes
  `toBeGreaterThanOrEqual(358)` (visible sliver is 30px now, so x is exactly
  360), and reword its message to "only the 30px handle on screen".

- [ ] **Step 7: Build + run the board e2e tests** — `npm run build &&
  npx playwright test -g "land where they aim|one window|eight-pax|droppable hole|seats sit clear"` —
  expect all PASS.

- [ ] **Step 8: Look at it** — serve `npx vite preview --port 4173`,
  screenshot the board parked/open and the edit week parked/open at 390×844
  (login `a`/`a`; Playwright needs `executablePath:'/opt/pw-browsers/chromium'`),
  and LOOK: handle centred both surfaces, open drawer full height, nothing
  covering Close/Sun.

- [ ] **Step 9: Commit** —
  `git add -A && git commit -m "Phone drawers: centred AIRCREW grab-handle — the parked tab stole taps from Close, the Sunday chip and input ends"`

### Task 2: The drawer parks after a successful fill

**Files:**
- Modify: `src/state/view.ts` (`placeArmed`, ~line 232), `src/ui/drag.ts`
  (`done` inside `applyDrop`, ~line 128)
- Test: `src/ui/board.test.tsx` (new case at the end of the describe)

**Interfaces:**
- Consumes: `placeArmed`'s success path; `applyDrop`'s `done()`; module-local
  `ROS_REOPEN` latch in drag.ts; `view.ts`'s local `isPhone()` (line 20).
- Produces: after a successful tap-plant or drawer-drag fill on a phone,
  `body.ros-open` is absent. Failed/aborted gestures leave it untouched.

- [ ] **Step 1: Write the failing test** — append to `board.test.tsx`'s
  describe (after the pax-hole test; it reuses that test's imports —
  `openScheduler`, `boardArmClick`, `setSlotVal`, `afterSchedMutate`,
  `view`, `$`, `$$`, `act`, `notify`):

```tsx
  /* The point of planting is seeing the puck land, and the auto-opened
     drawer covered it (owner critique, 8 Aug 26): a successful fill now
     parks the drawer. Only success parks — an aborted gesture leaves it. */
  it('planting from the drawer parks it — a refused plant does not', async () => {
    const { HOOKS } = await import('../engine/hooks')
    const orig = HOOKS.isPhone; HOOKS.isPhone = () => true
    try {
      await act(async () => { openScheduler(0) })
      await act(async () => { setSlotVal('s:0.amt.1.pax.1', ''); afterSchedMutate() })
      const hole = $('#sbBoard .sb-slot.empty.pax')
      boardArmClick({ target: hole, stopPropagation() {} } as any)
      expect(document.body.classList.contains('ros-open'), 'arming opened the drawer').toBe(true)
      let ok: any
      await act(async () => { ok = view.placeArmed('drill') })
      expect(ok, 'the plant landed').toBe(true)
      expect(document.body.classList.contains('ros-open'), 'a successful fill parks the drawer').toBe(false)
    } finally {
      HOOKS.isPhone = orig
      await act(async () => { const { closeScheduler } = await import('./board'); closeScheduler(); notify() })
    }
  })
```

- [ ] **Step 2: Run it to verify it fails** —
  `npx vitest run src/ui/board.test.tsx` — expect FAIL on "a successful fill
  parks the drawer" (class still present).

- [ ] **Step 3: The tap path.** In `view.ts`'s `placeArmed`, directly after
  `armDrop();`:

```ts
  armDrop();
  /* a successful fill PARKS the drawer (owner, 8 Aug 26): the point of
     planting is seeing the puck land, and the open drawer covers it.
     Refusals return above, so an aborted pick keeps the drawer out. */
  if(isPhone())document.body.classList.remove('ros-open');
```

- [ ] **Step 4: The drag path.** In `drag.ts`'s `done` helper (inside
  `applyDrop`), before `dndOff()`:

```ts
  const done = (served?: any) => {
    if (served && view.armedKey() === served) view.disarmSlot()
    /* a drop that LANDED parks the drawer (owner, 8 Aug 26) — clear the
       reopen latch before dndOff() re-adds ros-open. Failed drops never
       reach done(), so an aborted drag still gets its drawer back. */
    ROS_REOPEN = false
    DRAG = null; dndOff(); view.afterSchedMutate(); notify(); return true
  }
```

- [ ] **Step 5: Run the test file** — `npx vitest run src/ui/board.test.tsx
  src/ui/odds.test.tsx src/ui/drag.test.tsx` — expect all PASS (drag.test
  pins the reopen-on-abort behaviour; if it pinned reopen-after-DROP, read
  the failing assertion and update it to the new contract, stating the owner
  decision in its comment).

- [ ] **Step 6: Commit** —
  `git add -A && git commit -m "Phone drawers: a successful fill parks the drawer so the puck is seen landing"`

### Task 3: Live checks folds to one line (phone board)

**Files:**
- Modify: `src/ui/board.ts` (`SBWOPEN` flag + `toggleSbwarn` +
  `openScheduler` reset + `boardWarnHTML` wrapper/header),
  `src/ui/interactions.ts` (toggle branch in `routeClick`),
  `src/ui/scheduler.css` (phone `.sb-warn` rules + `.sb-wide` restates)
- Test: `src/ui/board.test.tsx` (fold toggle), `e2e/geometry.spec.ts`
  (fold + park, one test)

**Interfaces:**
- Consumes: `boardWarnHTML(di)` (string builder), `routeClick` delegation,
  `HOOKS.isPhone()`.
- Produces: `#sbWarn` markup wrapped in `<div class="sbwrap[ open]">`, the
  header carrying `data-sbwtog`; exported `SBWOPEN: boolean` and
  `toggleSbwarn(): void` from `board.ts`.

- [ ] **Step 1: Write the failing jsdom test** — append to
  `board.test.tsx`'s describe:

```tsx
  /* The phone board's Live checks fold (owner, 8 Aug 26): collapsed to the
     header line each visit; the header toggles. Desktop keeps the always-
     open side list — the flag only has CSS effect under 820px, so jsdom
     pins the class/state machine and e2e measures the visibility. */
  it('Live checks opens collapsed and the header toggles it', async () => {
    const { HOOKS } = await import('../engine/hooks')
    const orig = HOOKS.isPhone; HOOKS.isPhone = () => true
    try {
      await act(async () => { openScheduler(0) })
      expect($('#sbWarn .sbwrap'), 'the strip is wrapped for the fold').toBeTruthy()
      expect($('#sbWarn .sbwrap').classList.contains('open'), 'collapsed by default').toBe(false)
      await click($('#sbWarn [data-sbwtog]'))
      expect($('#sbWarn .sbwrap').classList.contains('open'), 'the header opens it').toBe(true)
      await click($('#sbWarn [data-sbwtog]'))
      expect($('#sbWarn .sbwrap').classList.contains('open'), 'and folds it back').toBe(false)
    } finally {
      HOOKS.isPhone = orig
      await act(async () => { const { closeScheduler } = await import('./board'); closeScheduler(); notify() })
    }
  })
```

- [ ] **Step 2: Run it to verify it fails** —
  `npx vitest run src/ui/board.test.tsx` — expect FAIL ("the strip is
  wrapped" — no `.sbwrap` yet).

- [ ] **Step 3: The flag in `board.ts`.** Next to `SBWIDE`'s definitions:

```ts
/* the phone board's Live checks fold (owner, 8 Aug 26): module state like
   SBWIDE, collapsed afresh on every openScheduler — a board visit starts
   with the day, not the list; the flag survives day-tab switches. Desktop
   ignores it (the fold is CSS under 820px only). */
export let SBWOPEN = false
export function toggleSbwarn() { SBWOPEN = !SBWOPEN }
```

  and in `openScheduler`: `export function openScheduler(di: number) { SBWOPEN = false; view.setBoardDay(di); validate(); notify() }`.

- [ ] **Step 4: The builder.** In `boardWarnHTML`, wrap the whole return in
  the fold wrapper and make the header the toggle:

```ts
export function boardWarnHTML(di: number) {
  const d = DAYS[di]
  const dw = (WARN.byDay[di] && WARN.byDay[di].warns) || []
  /* data-sbwtog + .sbw-car exist for the PHONE fold; desktop hides the
     caret and the toggle branch is isPhone()-gated, so the header stays
     inert there. The ⚠ only prints when there is something to warn about. */
  let wh = `<div class="sbwrap${SBWOPEN ? ' open' : ''}">`
    + `<div class="wh" data-sbwtog title="Show / hide the day's checks">`
    + `<span class="sbw-car">${SBWOPEN ? '▾' : '▸'}</span>`
    + `${dw.length ? '⚠ ' : ''}Live checks · ${dw.length} for ${esc(d.dow)}</div>`
  if (dw.length) {
    /* (existing comment and forEach body unchanged) */
    dw.forEach((w: any, ix: number) => { /* …exactly as today… */ })
  } else wh += `<div class="wln ok">No conflicts flagged for this day ✓</div>`
  return wh + `</div>`
}
```

  (Only the first and last lines and the header change; the `forEach` body
  is byte-identical to today's.)

- [ ] **Step 5: The toggle branch.** In `interactions.ts`'s `routeClick`,
  next to the board issue-list branch, and add `toggleSbwarn` to the
  existing `./board` import:

```ts
  /* the phone board's Live checks header folds/unfolds its list — phone
     only: on desktop the side panel is always open and the header is inert */
  if (t.closest('[data-sbwtog]') && HOOKS.isPhone()) { toggleSbwarn(); notify(); e.stopPropagation(); return }
```

- [ ] **Step 6: The CSS.** In the board's 820px block, replace the
  `.sb-warn` rule's cap (`max-height:23vh;overflow:auto`) with
  `max-height:none;overflow:visible` (the one board scroller does the work
  now — the scroll-within-a-scroll was the flaw), and add:

```css
  .sb-warn .wh[data-sbwtog]{cursor:pointer}
  .sb-warn .sbwrap:not(.open) .wln{display:none}
  .sb-warn .sbwrap:not(.open) .wln.ok{display:block}   /* a quiet day still says ✓ */
```

  Base rules (outside any media query, near the other `.sb-warn` rules):
  `.sbw-car{display:none;margin-right:4px;color:var(--ink-3)}` and inside
  the 820px block `.sb-warn .sbw-car{display:inline}`. In the `.sb-wide`
  restate block: `.schedboard.sb-wide .sb-warn .sbwrap .wln{display:block}`
  and `.schedboard.sb-wide .sb-warn .sbw-car{display:none}` (the desktop
  layout keeps the always-open list at any viewport).

- [ ] **Step 7: Run the jsdom tests** — `npx vitest run src/ui/board.test.tsx` —
  expect PASS.

- [ ] **Step 8: Write the failing e2e test** — append to
  `e2e/geometry.spec.ts`:

```ts
/* THE FOLD AND THE PARK, MEASURED (owner, 8 Aug 26). jsdom pins the class
   machine; only a browser can show the rows actually hidden, the list
   actually expanding, and the planted puck actually visible once the
   drawer parks itself. */
test('board at 390px: Live checks folds to one line, and a fill parks the drawer', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 })
  await login(page); await go(page, 'editsched')
  await page.click('.sb-open')
  const rowVisible = () => page.locator('#sbWarn .wln[data-wdi]').first().isVisible()
  expect(await rowVisible(), 'collapsed by default — one line, no list').toBe(false)
  await page.click('#sbWarn [data-sbwtog]')
  expect(await rowVisible(), 'the header opens the full list').toBe(true)
  await page.click('#sbWarn [data-sbwtog]')
  expect(await rowVisible(), 'and folds it away again').toBe(false)
  await page.evaluate(() => { (window as any).setSlotVal('s:0.amt.1.pax.1', ''); (window as any).afterSchedMutate() })
  const hole = page.locator('#sbBoard .sb-slot.empty.pax').first()
  await hole.scrollIntoViewIfNeeded(); await hole.click({ position: { x: 20, y: 5 } })
  await page.waitForTimeout(300)
  await page.locator('#schedBoard .sb-roster .rpuck', { hasText: 'Drill' }).first().click()
  await page.waitForTimeout(350)
  const after = await page.evaluate(() => {
    const s = document.querySelector('#sbBoard .seat[data-slot="s:0.amt.1.pax.1"]')
    const r = s && s.getBoundingClientRect()
    return { parked: !document.body.classList.contains('ros-open'),
             seatVisible: !!r && r.left >= 0 && r.right <= 390 && r.top > 0 && r.bottom < 780 }
  })
  expect(after.parked, 'the drawer parked itself on the fill').toBe(true)
  expect(after.seatVisible, 'and the planted puck is on screen').toBe(true)
})
```

- [ ] **Step 9: Build + run it** — `npm run build && npx playwright test -g
  "folds to one line"` — expect PASS (Tasks 2–3 both landed).

- [ ] **Step 10: Commit** —
  `git add -A && git commit -m "Phone board: Live checks folds to one tappable line — the strip scrolled inside the scroller"`

### Task 4: Gates, docs, ship, verify live

**Files:**
- Modify: `docs/ui-contracts.md` (§The board on a phone is ONE window),
  `../HANDOFF.md` (gate counts, the one-window bullet)

**Interfaces:**
- Consumes: everything above, finished and committed.
- Produces: a merged PR, the live page verified serving it.

- [ ] **Step 1: Docs.** In `ui-contracts.md` §The board on a phone is ONE
  window: the drawer bullet now describes the centred grab-handle
  (`clamp(180px,55vh,440px)`, 30px sliver, no hidden hit area — the 14px
  extension is gone), park-after-fill, and the Live checks fold (collapsed
  each visit, header toggles, no inner scroll, desktop/sb-wide always open).
  In `HANDOFF.md`: vitest count 688→690, e2e 38→40, and extend the
  one-window bullet's "second wave" with a third: the critique session's
  fixes (tab tap-stealing, extension over inputs, park-after-fill, fold),
  pointing at the spec file.

- [ ] **Step 2: Full gates** — from `raptor-port/`: `npm test` (expect
  690/43) · `npm run build` · `node reference/tfin.js` (728/0) ·
  `npm run test:e2e` (40/40) · then with `npx vite preview --port 4173`
  running: `npm run probes:adapted` (6/6) and `npm run perf` (9/0 —
  re-run singles reds before believing them).

- [ ] **Step 3: Live-view pass** — drive the preview at 390×844: park/open
  both drawers, fold/unfold Live checks, fill a seat and watch the drawer
  park, screenshot each and LOOK.

- [ ] **Step 4: Commit docs, push, PR, merge** — commit
  (`"Docs + HANDOFF: the mobile board critique fixes"`), push with
  `git push -u origin claude/read-handoff-eafhts`, open the PR to `main`
  through the GitHub tooling (never curl — the token traps in HANDOFF),
  merge it, and do NOT dispatch a deploy (the merge push triggers one; a
  dispatch would cancel it).

- [ ] **Step 5: Verify the deployed page** — poll
  `https://seejiaokai.github.io/Raptor/` for the new bundle hash (rollover
  is typically 90s–3.5min), then drive the LIVE page with the three proxy
  launch settings (`chromiumSandbox:false`, `proxy` from `HTTPS_PROXY`,
  `--ssl-version-max=tls1.2`): tap-landing on Close/Sunday, the fold, and a
  park-after-fill, plus screenshots. Report to the owner in plain language.
