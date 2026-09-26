/* Five-flags batch — walker W2: [LW-RESET-ORDER] (D160), "Reset order" in the Leave War's ⚙ Settings (26 Sep 26).
   Fable's F10, F11, F12, F18 and roll-call §2.2 (raptor-port/docs/superpowers/specs/2026-09-26-five-flags-scenarios-fable.md),
   walked in the REAL production bundle served at http://localhost:4176 (commit ca5d04e3). Every check is an assertion of
   the RIGHT behaviour — a PASS means correct, so re-running this IS the re-walk. Every world is a fresh browser context
   (a fresh demo world) and every fixture is made through the app's own controls: the ⇅ Rearrange toggle and the row /
   heading grips on the grid, the ⚙ Settings sheet, the counter builder, the Quals page's CAT select and + Add person, the
   Period picker, the Leave War's own Undo / Redo, Logout and the sign-in. window.* is READ only (for the table).

   Usage (from raptor-port/):  node scripts/handpass/ff-w2.mjs [desktop|phone|all] [F10|F11|F12|F18|G|M|P]
     desktop: F10, F11, F12, F18, G (grouping is not order; Back to the standard groups), M (member + world-level order)
     phone:   P (the whole door at 390: reachable, greyed, finger drag, arm, fire, Undo, disarm on close) + member picture */
const WIDTH = process.argv[2] || 'all'
const ONLY = (process.argv[3] || '').toUpperCase()
process.env.HP_URL = 'http://localhost:4176'
process.env.HP_SHOTS = process.env.FF_SHOTS || 'C:/Users/User/projects/Raptor/.claude/worktrees/five-flags-batch-build-ef7d85/raptor-port/docs/img/handpass/2026-09-26-five-flags/w2'
const L = await import('./lib.mjs')
const { existsSync, mkdirSync } = await import('node:fs')
const { chromium } = await import('@playwright/test')
const SHOTS = process.env.HP_SHOTS
mkdirSync(SHOTS, { recursive: true })

/* ------------------------------------------------------------------ bookkeeping */
const RESULTS = []
const ALL_ERRORS = []
function check(id, ok, detail = '') {
  RESULTS.push({ id, ok: !!ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}${detail ? '  — ' + detail : ''}`)
  return !!ok
}
function note(id, detail) { RESULTS.push({ id, ok: null, detail }); console.log(`NOTE  ${id}  — ${detail}`) }
const norm = s => String(s || '').replace(/\s+/g, ' ').trim()
const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i])

/* ------------------------------------------------------------------ a fresh world */
async function world({ phone = false, who = 'a' } = {}) {
  const CH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
  const browser = await chromium.launch({ headless: true, ...(existsSync(CH) ? { executablePath: CH } : {}) })
  const ctx = await browser.newContext(phone
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
    : { viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()) })
  await page.goto(L.BASE + '/')
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await L.login(page, who)
  await toastSpy(page)
  const w = { browser, ctx, page, errors, phone }
  w.close = async (tag) => { if (errors.length) ALL_ERRORS.push(`${tag}: ${errors.join(' | ')}`); check(`${tag}-ERR`, !errors.length, errors.length ? errors.join(' | ') : 'no console error, page error or 4xx in this world'); await browser.close() }
  return w
}
async function toastSpy(page) {
  await page.evaluate(() => {
    if (window.__w2t) return
    window.__w2t = []
    new MutationObserver(ms => { for (const m of ms) {
      if (m.target && m.target.id === 'toastEl') for (const n of m.addedNodes || []) if (n.nodeType === 3) window.__w2t.push(n.data)
    } }).observe(document.body, { childList: true, subtree: true })
  })
}
const toasts = page => page.evaluate(() => { const a = window.__w2t || []; window.__w2t = []; return a.filter(Boolean).filter((t, i, x) => i === 0 || t !== x[i - 1]) })

/* ------------------------------------------------------------------ the Leave War, read the way a person reads it */
async function lw(page) {
  if (await page.evaluate(() => window.CURPAGE) !== 'leavewar') await L.go(page, 'leavewar')
  await page.waitForSelector('.mx [data-testid^="row-"]', { state: 'attached' })
  await page.waitForTimeout(250)
}
/* the grid's rows, top to bottom, as the frozen NAME column draws them (the real grid's rows) */
const order = page => page.evaluate(() => [...document.querySelectorAll('.mx tbody.mxbody tr[data-testid^="row-"]')].map(e => e.getAttribute('data-testid').slice(4)))
/* group headings and people interleaved */
const seq = page => page.evaluate(() => [...document.querySelectorAll('.mx tbody.mxbody tr[data-testid^="row-"], .mx tbody.mxbody tr[data-testid^="group-"]')].map(e => e.getAttribute('data-testid')))
const groups = page => page.evaluate(() => [...document.querySelectorAll('.mx tbody.mxbody tr[data-testid^="group-"]')].map(e => e.getAttribute('data-testid').slice(6)))
/* the figures drawer's person rows (desktop opens it open) — a second surface that draws the roster */
const drawerOrder = page => page.evaluate(() => [...document.querySelectorAll('[data-testid="figdrawer"] tbody.mxbody tr[data-drawer-key^="row-"]')].map(e => e.getAttribute('data-drawer-key').slice(4)))
const cs = (page, ids) => page.evaluate(ids => ids.map(id => (window.PEOPLE[id] || {}).cs || id), ids)
const before = (o, a, b) => o.indexOf(a) >= 0 && o.indexOf(b) >= 0 && o.indexOf(a) < o.indexOf(b)
/* INDEPENDENT reading of "the default order": inside every group block, pilots above WSOs above ground crew, then the CAT
   ladder (FI, IR, IP, IW, A, B, C, D, OCU), then callsign — read off the drawn page, not off the app's own sort */
async function rankedViolations(page) {
  return page.evaluate(() => {
    const CAT = { FI: 0, IR: 1, IP: 2, IW: 3, A: 4, B: 5, C: 6, D: 7, OCU: 8 }
    const SEAT = { FCP: 0, RCP: 1, GND: 2 }
    const rows = [...document.querySelectorAll('.mx tbody.mxbody tr[data-testid^="row-"], .mx tbody.mxbody tr[data-testid^="group-"]')].map(e => e.getAttribute('data-testid'))
    const bad = []; let block = [], g = ''
    const flush = () => {
      for (let i = 1; i < block.length; i++) {
        const a = window.PEOPLE[block[i - 1]] || {}, b = window.PEOPLE[block[i]] || {}
        const ka = [SEAT[a.seat] ?? 3, CAT[String(a.q || '').toUpperCase()] ?? 9], kb = [SEAT[b.seat] ?? 3, CAT[String(b.q || '').toUpperCase()] ?? 9]
        const c = ka[0] - kb[0] || ka[1] - kb[1] || String(a.cs).localeCompare(String(b.cs))
        if (c > 0) bad.push(`${g}: ${a.cs} above ${b.cs}`)
      }
      block = []
    }
    for (const t of rows) { if (t.startsWith('group-')) { flush(); g = t.slice(6) } else block.push(t.slice(4)) }
    flush()
    return bad
  })
}

/* ------------------------------------------------------------------ taps and drags, the way a person makes them */
async function press(w, sel) {
  const loc = w.page.locator(sel).first()
  await loc.waitFor({ state: 'visible', timeout: 6000 })
  await loc.scrollIntoViewIfNeeded().catch(() => {})
  await w.page.waitForTimeout(80)
  if (w.phone) await loc.tap({ timeout: 4000 }); else await loc.click({ timeout: 4000 })
  await w.page.waitForTimeout(350)
}
async function arrange(w, on) {
  const cur = await w.page.locator('[data-testid="roster-arrange"]').getAttribute('aria-pressed')
  if ((cur === 'true') !== on) await press(w, '[data-testid="roster-arrange"]')
  await w.page.waitForTimeout(250)
}
/* drag person `id` by its ⠿ grip to sit before / after `target` (Rearrange must be on). Desktop: a mouse. Phone: a real
   CDP touch sequence (the machine arms on pointerdown — e2e leavewar.spec.ts "a picked-up row wears one frame"). */
async function dragRow(w, id, target, where = 'after', grip = 'drag') {
  const { page } = w
  const tSel = where === 'group' ? `[data-testid="group-${target}"]` : `[data-testid="row-${target}"]`
  await page.locator(tSel).first().evaluate(e => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(200)
  const h = await page.locator(`[data-testid="${grip}-${id}"]`).first().boundingBox()
  const t = await page.locator(tSel).first().boundingBox()
  if (!h || !t) return `no grip (${!!h}) or target (${!!t})`
  const x = h.x + h.width / 2, y0 = h.y + h.height / 2
  const y1 = where === 'before' || where === 'group' ? t.y + 5 : t.y + t.height - 5
  if (w.phone) {
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] })
    await page.waitForTimeout(80)
    for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + 30, y: y0 + (y1 - y0) * i / 8 }] }); await page.waitForTimeout(25) }
    await page.waitForTimeout(120)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await cdp.detach()
  } else {
    await page.mouse.move(x, y0); await page.mouse.down()
    await page.mouse.move(x, y0 + (y1 > y0 ? 20 : -20), { steps: 3 })
    await page.mouse.move(x + 40, y1, { steps: 8 })
    await page.waitForTimeout(150)
    await page.mouse.up()
  }
  await page.waitForTimeout(900)   // the landing flash
  return null
}

/* ------------------------------------------------------------------ the ⚙ Settings sheet */
async function openSettings(w) {
  if (!(await w.page.locator('[data-testid="settings-sheet"]').count())) await press(w, '[data-testid="settings-open"]')
  await w.page.waitForSelector('[data-testid="settings-sheet"]')
  await w.page.locator('[data-testid="roster-reset-order"]').scrollIntoViewIfNeeded()
  await w.page.waitForTimeout(200)
}
async function closeSettings(w) {
  if (await w.page.locator('[data-testid="settings-sheet"]').count()) await press(w, '[data-testid="settings-close"]')
  await w.page.waitForTimeout(250)
}
const lineState = page => page.evaluate(() => {
  const b = document.querySelector('[data-testid="roster-reset-order"]'), h = document.querySelector('[data-testid="roster-order-hint"]')
  const c = document.querySelector('[data-testid="counter-reset-all"]')
  if (!b) return null
  const r = b.getBoundingClientRect(), cx = r.x + r.width / 2, cy = r.y + r.height / 2
  const hit = document.elementFromPoint(cx, cy)
  return { text: b.textContent.trim(), disabled: b.disabled, armed: b.classList.contains('arm'), title: b.title, hint: (h && h.textContent.trim()) || '',
    counter: c ? c.textContent.trim() : null, counterArmed: c ? c.classList.contains('arm') : null,
    box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, vw: innerWidth, vh: innerHeight,
    onTop: hit === b || b.contains(hit), opacity: getComputedStyle(b).opacity, cursor: getComputedStyle(b).cursor }
})
const GREY_HINT = /^In the default order/
const HAND_HINT = /^Arranged by hand/
const PROTO = /prototype|demo|session-only|no server|placeholder|TODO/i
async function shotSheet(w, name) {
  const { page } = w
  await page.locator('[data-testid="roster-reset-order"]').scrollIntoViewIfNeeded().catch(() => {})
  await page.waitForTimeout(150)
  /* the roster line with the counters tray above it and the groups heading below: the three neighbours it must not disturb */
  const r = await page.evaluate(() => {
    const els = ['[data-testid="counter-reset-all"]', '[data-testid="roster-reset-order"]', '[data-testid="roster-order-hint"]'].map(s => document.querySelector(s)).filter(Boolean)
    const sheet = document.querySelector('[data-testid="settings-sheet"]')
    const bs = els.map(e => e.getBoundingClientRect()), sb = sheet.getBoundingClientRect()
    return { x: sb.left, y: Math.min(...bs.map(b => b.top)) - 60, x1: sb.right, y1: Math.max(...bs.map(b => b.bottom)) + 70, vw: innerWidth, vh: innerHeight }
  })
  const x = Math.max(0, r.x), y = Math.max(0, r.y)
  await page.screenshot({ path: `${SHOTS}/${name}.png`, clip: { x, y, width: Math.min(r.vw - x, r.x1 - x), height: Math.min(r.vh - y, r.y1 - y) } })
}
async function shotView(w, name) { await w.page.screenshot({ path: `${SHOTS}/${name}.png` }) }
/* the frozen name column around a block of rows (the first and last testid given), cropped to the window */
async function shotRows(w, name, first, last, centre = null) {
  const { page } = w
  await page.locator(`[data-testid="${centre || first}"]`).first().evaluate(e => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(250)
  const r = await page.evaluate(([a, b]) => {
    const A = document.querySelector(`.mx [data-testid="${a}"]`), B = document.querySelector(`.mx [data-testid="${b}"]`)
    if (!A || !B) return null
    const ra = A.getBoundingClientRect(), rb = B.getBoundingClientRect()
    const who = A.querySelector('.who, td') || A
    return { y0: ra.top, y1: rb.bottom, x1: Math.min(innerWidth, who.getBoundingClientRect().right + 260), vw: innerWidth, vh: innerHeight }
  }, [first, last])
  if (!r) return shotView(w, name)
  const y = Math.max(0, r.y0 - 8)
  await page.screenshot({ path: `${SHOTS}/${name}.png`, clip: { x: 0, y, width: r.x1, height: Math.max(20, Math.min(r.vh - y, r.y1 - y + 8)) } })
}
async function relog(w, who) {
  const { page } = w
  const lo = page.getByRole('button', { name: /Log ?out/i }).first()
  if (await lo.isVisible().catch(() => false)) await lo.click()
  else { await page.locator('#logout').first().click({ force: true }) }
  await page.waitForTimeout(600)
  await L.login(page, who)
  await toastSpy(page)
}
async function reload(w) {
  const { page } = w
  await page.reload()
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.waitForSelector('#luser, #vWeek .day', { state: 'attached' })
  if (await page.locator('#luser').isVisible().catch(() => false)) await L.login(page, 'a')
  await toastSpy(page)
  await lw(page)
}
/* the War's own Undo / Redo (Chrome.tsx — the pair on the Leave War page; the top bar's #undoBtn is not drawn on this page) */
const undoTitle = page => page.evaluate(() => ({ u: document.querySelector('[data-testid="lw-undo"]')?.title, ud: document.querySelector('[data-testid="lw-undo"]')?.disabled, r: document.querySelector('[data-testid="lw-redo"]')?.title }))

/* =========================================================================================================== F10 */
async function F10() {
  const w = await world(); const { page } = w
  await lw(page)
  const base = await order(page)
  const baseDrawer = await drawerOrder(page)
  const v0 = await rankedViolations(page)
  check('F10-0a', !v0.length, `the fresh world draws the ranked default in every group (${base.length} people) — ${v0.length ? 'OUT OF ORDER: ' + v0.join('; ') : 'pilots above WSOs, then CAT, then callsign'}`)
  check('F10-0b', same(baseDrawer, base), `the figures drawer lists the same people in the same order as the name column (${baseDrawer.length} rows)`)
  await openSettings(w)
  let s = await lineState(page)
  check('F10-0c', s && s.disabled && GREY_HINT.test(s.hint) && s.text === '↺ Reset order', `fresh world: Reset order greyed, hint "${s && s.hint}", title "${s && s.title}"`)
  check('F10-0d', s && !PROTO.test(s.hint + ' ' + s.title), 'the hint and the button title read production copy (no prototype / demo words)')
  await shotSheet(w, 'd-F10-0-fresh-greyed'); await closeSettings(w)
  /* drag Ranger (bane) below the next pilot in his block (Saber, stiff) — then back to exactly where he was */
  await arrange(w, true)
  const e1 = await dragRow(w, 'bane', 'stiff', 'after')
  const o1 = await order(page)
  check('F10-1a', !e1 && before(o1, 'stiff', 'bane') && o1.indexOf('bane') === base.indexOf('bane') + 1, `drag Ranger below Saber: ${(await cs(page, o1.slice(3, 7))).join(', ')} ${e1 || ''}`)
  await shotRows(w, 'd-F10-1-ranger-below-saber-arranging', 'group-SXO', 'row-freak', 'row-slipway')
  const e2 = await dragRow(w, 'bane', 'pump', 'after')
  const o2 = await order(page)
  check('F10-1b', !e2 && same(o2, base), `drag him back above Saber: the grid draws exactly the default again (${(await cs(page, o2.slice(3, 7))).join(', ')}) ${e2 || ''}`)
  await arrange(w, false)
  const ut = await undoTitle(page)
  await openSettings(w)
  s = await lineState(page)
  check('F10-1c', s && s.disabled && GREY_HINT.test(s.hint), `after away-and-back Reset order is GREYED (it would change nothing on screen): disabled=${s && s.disabled}, hint "${s && s.hint}"`)
  await shotSheet(w, 'd-F10-2-away-and-back-greyed')
  /* a press on the greyed line writes nothing: force a click on it and read the Undo label before / after */
  await page.locator('[data-testid="roster-reset-order"]').click({ force: true, timeout: 2000 }).catch(() => {})
  await page.waitForTimeout(300)
  const ut2 = await undoTitle(page)
  s = await lineState(page)
  check('F10-1d', ut2.u === ut.u && s.text === '↺ Reset order' && !s.armed, `a press on the greyed line neither arms nor writes — Undo still reads "${ut2.u}"`)
  await closeSettings(w)
  /* …and it left no empty Undo step: the FIRST Undo now visibly undoes the drag back (Ranger below Saber again) */
  await press(w, '[data-testid="lw-undo"]')
  const oU1 = await order(page)
  check('F10-1e', before(oU1, 'stiff', 'bane'), `the first Undo after that press takes back the last DRAG (Ranger below Saber again) — no invisible reset step in between`)
  await press(w, '[data-testid="lw-redo"]')
  check('F10-1f', same(await order(page), base), 'Redo puts him back (the default drawn again)')
  /* reverse: drag a WSO (Echo, freak — the second WSO of SXO) UP among the pilots, above Reaper at the top */
  await arrange(w, true)
  const e3 = await dragRow(w, 'freak', 'dice', 'before')
  const o3 = await order(page)
  const sxo = o3.slice(0, 12)
  check('F10-2a', !e3 && sxo.indexOf('freak') === 10 && before(o3, 'freak', 'glass') && before(o3, 'mamba', 'freak'), `a WSO dragged up among the pilots lands at the TOP OF THE WSOs, not among the pilots: SXO now ${(await cs(page, sxo)).join(', ')} ${e3 || ''}`)
  await shotRows(w, 'd-F10-3-wso-dragged-up-lands-top-of-wsos', 'group-SXO', 'row-freak', 'row-slipway')
  await arrange(w, false)
  /* the other surfaces draw the HAND order too (so the after-reset reads below mean something) */
  check('F10-2d', same(await drawerOrder(page), o3), 'with the hand order, the figures drawer draws it too (Echo above Basher)')
  const oilOf = () => page.evaluate(() => [...document.querySelectorAll('[data-testid^="oil-row-"]')].map(e => e.getAttribute('data-testid').slice(8)))
  await press(w, '[data-testid="oil-tracker"]'); await page.waitForTimeout(400)
  const oilH = await oilOf()
  check('F10-2e', before(oilH, 'freak', 'glass') && same(oilH, o3.filter(id => oilH.includes(id))), 'with the hand order, the OIL tracker lists Echo above Basher (the roster order)')
  await press(w, '[data-testid="oil-close"]')
  /* the grid's drag-select reads the drawn order: a drag from Ridge's box down to Echo's box, one day */
  const selWho = async () => {
    const tog = page.locator('[data-testid="figures-toggle"]')
    if ((await tog.getAttribute('aria-expanded').catch(() => null)) === 'true') { await tog.click(); await page.waitForTimeout(300) }
    const D = '2026-01-06'
    const a = page.locator(`[data-testid="cell-razer-${D}"]`), b = page.locator(`[data-testid="cell-freak-${D}"]`)
    await a.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(200)
    const ra = await a.boundingBox(), rb = await b.boundingBox()
    await page.mouse.move(ra.x + ra.width / 2, ra.y + ra.height / 2); await page.mouse.down()
    await page.mouse.move(ra.x + ra.width / 2, ra.y + ra.height / 2 + 12, { steps: 3 })
    await page.mouse.move(rb.x + rb.width / 2, rb.y + rb.height / 2, { steps: 8 }); await page.mouse.up()
    await page.waitForTimeout(400)
    const t = norm(await page.locator('[data-testid="sel-who"]').first().textContent({ timeout: 3000 }).catch(() => '(no selection sheet)'))
    if (await page.locator('[data-testid="sel-cancel"]').count()) await press(w, '[data-testid="sel-cancel"]')
    if ((await tog.getAttribute('aria-expanded').catch(() => null)) === 'false') { await tog.click(); await page.waitForTimeout(300) }
    return t
  }
  const selH = await selWho()
  check('F10-2f', selH === 'Ridge, Echo', `with the hand order, a drag-select from Ridge down to Echo takes "${selH}" (Echo sits right under Ridge)`)
  await openSettings(w)
  s = await lineState(page)
  check('F10-2b', s && !s.disabled && HAND_HINT.test(s.hint), `a real change (Echo above Basher): Reset order ENABLED, hint "${s && s.hint}"`)
  check('F10-2c', s && !PROTO.test(s.hint + ' ' + s.title), `the enabled hint and title read production copy — title "${s && s.title}"`)
  await shotSheet(w, 'd-F10-4-real-change-enabled')
  /* arm, then fire */
  await press(w, '[data-testid="roster-reset-order"]')
  s = await lineState(page)
  check('F10-3a', s && s.text === 'Really reset?' && s.armed && s.counter === '↺ Reset counters' && !s.counterArmed, `one tap ARMS Reset order only ("${s && s.text}"), Reset counters untouched ("${s && s.counter}")`)
  const oArmed = await order(page)
  check('F10-3b', same(oArmed, o3), 'arming changes nothing on the grid')
  await shotSheet(w, 'd-F10-5-armed-really-reset')
  await press(w, '[data-testid="roster-reset-order"]')
  s = await lineState(page)
  const o4 = await order(page)
  check('F10-3c', same(o4, base), `the second tap resets: the grid is the default again (SXO ${(await cs(page, o4.slice(0, 12))).join(', ')})`)
  check('F10-3d', s && s.disabled && !s.armed && s.text === '↺ Reset order' && GREY_HINT.test(s.hint), `the sheet repaints at once: greyed, "${s && s.text}", hint "${s && s.hint}"`)
  const v4 = await rankedViolations(page)
  check('F10-3e', !v4.length, `after the reset every group is ranked (independent reading) ${v4.join('; ')}`)
  await shotSheet(w, 'd-F10-6-after-reset-greyed-again')
  await closeSettings(w)
  check('F10-3f', same(await drawerOrder(page), base), 'the figures drawer follows the reset too (same order as the name column)')
  await shotRows(w, 'd-F10-7-grid-after-reset', 'group-SXO', 'row-freak', 'row-slipway')
  const selR = await selWho()
  check('F10-3g', selR === 'Ridge, Basher, Echo', `after the reset the same drag-select takes "${selR}" (the drawn order, Basher back between them)`)
  /* the other surfaces that draw the roster: the OIL tracker's list, and the grid's drag-select (reads the drawn order) */
  await press(w, '[data-testid="oil-tracker"]')
  await page.waitForTimeout(400)
  const oil = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="oil-row-"]')].map(e => e.getAttribute('data-testid').slice(8)))
  check('F10-4a', oil.length > 0 && same(oil, base.filter(id => oil.includes(id))), `the OIL tracker lists people in the roster's order after the reset (${oil.length} rows; first ${(await cs(page, oil.slice(0, 6))).join(', ')})`)
  await shotView(w, 'd-F10-8-oil-tracker-after-reset')
  await press(w, '[data-testid="oil-close"]')
  w.base = base
  await w.close('F10')
  return base
}

/* =========================================================================================================== F11 */
async function config(page) {
  return page.evaluate(() => ({
    counters: [...document.querySelectorAll('[data-testid^="manning-info-"]')].map(e => e.getAttribute('data-testid').slice(13)),
    eventLines: [...new Set([...document.querySelectorAll('[data-testid^="event-"]')].map(e => (/^event-(\d+)-\d{4}-/.exec(e.getAttribute('data-testid')) || [])[1]).filter(Boolean))].length,
    groups: [...document.querySelectorAll('.mx tbody.mxbody tr[data-testid^="group-"]')].map(e => e.getAttribute('data-testid').slice(6)),
    groupColours: [...document.querySelectorAll('.mx tbody.mxbody tr[data-testid^="group-"]')].map(e => { const d = e.querySelector('.gdot, .gsw, [class*="dot"], [class*="sw"]'); return d ? getComputedStyle(d).backgroundColor : '' }),
  }))
}
async function sheetConfig(page) {
  return page.evaluate(() => ({
    sans: document.querySelector('[data-testid="sans-toggle"]')?.getAttribute('aria-pressed'),
    chosen: [...document.querySelectorAll('[data-testid^="grow-"]')].map(e => e.getAttribute('data-testid').slice(5)),
    swatches: [...document.querySelectorAll('[data-testid="group-chosen"] .set-sw')].map(e => getComputedStyle(e).backgroundColor),
    /* the caret (▸ folded / ▾ open) is view state, not the setting — dropped */
    who: document.querySelector('[data-testid="who-wins-toggle"]')?.textContent.replace(/[▸▾]/g, '').replace(/\s+/g, ' ').trim(),
  }))
}
async function F11() {
  const w = await world(); const { page } = w
  await lw(page)
  const base = await order(page)
  /* the fixture: a custom counter (＋ Counter → the builder), a third event row, Show SANS on, a qualification group with a
     picked colour — all through the sheet's own controls */
  await openSettings(w)
  await press(w, '[data-testid="counter-add"]')
  await page.waitForSelector('[data-testid="counter-form"]')
  await page.locator('[data-testid="cform-name"]').fill('W2 CREW')
  await press(w, '[data-testid="cf-qual-sxo"]')
  await press(w, '[data-testid="cform-save"]')
  await page.waitForTimeout(400)
  check('F11-0a', await page.locator('[data-testid="count-w2-crew"]').count() === 1, 'fixture: a custom counter "W2 CREW" built in the counter builder and drawn on the grid')
  await openSettings(w)
  await press(w, '[data-testid="event-add"]')
  await press(w, '[data-testid="sans-toggle"]')
  const nvg = page.locator('[data-testid^="gadd-"]', { hasText: /NVG/ }).first()
  const nvgId = ((await nvg.getAttribute('data-testid')) || '').slice(5)
  await press(w, `[data-testid="gadd-${nvgId}"]`)
  await page.waitForTimeout(300)
  const dot = page.locator(`[data-testid^="gdot-${nvgId}-"]`).nth(3)
  if (await dot.count()) { await dot.click(); await page.waitForTimeout(300) }
  /* a CUSTOM who-wins order: open the tucked-away list and drag its second entry above the first */
  await press(w, '[data-testid="who-wins-toggle"]')
  const prio0 = await page.evaluate(() => [...document.querySelectorAll('[data-gprio]')].map(e => e.getAttribute('data-gprio')))
  if (prio0.length > 2) {
    const g = page.locator(`[data-testid="gpdrag-${prio0[2]}"]`), t = page.locator(`[data-testid="gprio-${prio0[1]}"]`)
    await t.scrollIntoViewIfNeeded(); await page.waitForTimeout(150)
    const gb = await g.boundingBox(), tb = await t.boundingBox()
    await page.mouse.move(gb.x + gb.width / 2, gb.y + gb.height / 2); await page.mouse.down()
    await page.mouse.move(gb.x + gb.width / 2, gb.y - 10, { steps: 3 }); await page.mouse.move(gb.x + 20, tb.y + 4, { steps: 8 })
    await page.waitForTimeout(120); await page.mouse.up(); await page.waitForTimeout(600)
  }
  const prio1 = await page.evaluate(() => [...document.querySelectorAll('[data-gprio]')].map(e => e.getAttribute('data-gprio')))
  const custom0 = await page.locator('[data-testid="who-wins-reset"]').count()
  check('F11-0d', custom0 === 1 && !same(prio0, prio1), `fixture: a custom who-wins order (${prio1.slice(0, 4).join(', ')}…, "Match the page order" offered)`)
  await shotView(w, 'd-F11-0-fixture-sheet-custom-whowins')
  const sc0 = await sheetConfig(page)
  await closeSettings(w)
  const c0 = await config(page)
  note('F11-0b', `fixture config: counters ${c0.counters.join(',')} · event lines ${c0.eventLines} · groups ${c0.groups.join(',')} · SANS ${sc0.sans} · sheet groups ${sc0.chosen.join(',')} · who-wins "${sc0.who}"`)
  /* the hand order */
  await arrange(w, true)
  await dragRow(w, 'bane', 'stiff', 'after')
  await arrange(w, false)
  const hand = await order(page)
  check('F11-0c', before(hand, 'stiff', 'bane'), `fixture: a hand order (Ranger below Saber)`)
  /* one tap on Reset order */
  await openSettings(w)
  await press(w, '[data-testid="roster-reset-order"]')
  let s = await lineState(page)
  check('F11-1a', s.armed && s.text === 'Really reset?' && !s.counterArmed && s.counter === '↺ Reset counters', `one tap on Reset order arms ONLY it — order "${s.text}", counters "${s.counter}"`)
  await shotSheet(w, 'd-F11-1-order-armed-counters-not')
  /* one tap on Reset counters */
  await press(w, '[data-testid="counter-reset-all"]')
  s = await lineState(page)
  check('F11-1b', s.counterArmed && s.counter === 'Really reset?', `one tap on Reset counters arms it ("${s.counter}") and fires nothing`)
  note('F11-1c', `after arming Reset counters, Reset order reads "${s.text}" (armed=${s.armed}) — both questions stand side by side`)
  check('F11-1d', await page.locator('[data-testid="count-w2-crew"]').count() === 1 && same(await order(page), hand), 'two single taps fired neither reset: the custom counter and the hand order both still stand')
  await shotSheet(w, 'd-F11-2-both-armed')
  /* fire Reset order */
  const wasArmed = s.armed
  await press(w, '[data-testid="roster-reset-order"]')
  if (!wasArmed) { note('F11-2x', 'Reset order had been disarmed by the counters tap — pressing again to fire'); await press(w, '[data-testid="roster-reset-order"]') }
  s = await lineState(page)
  const o2 = await order(page)
  const sc2 = await sheetConfig(page)
  if (!(await page.locator('[data-gprio]').count())) await press(w, '[data-testid="who-wins-toggle"]')
  const prio2 = await page.evaluate(() => [...document.querySelectorAll('[data-gprio]')].map(e => e.getAttribute('data-gprio')))
  check('F11-2g', same(prio2, prio1) && await page.locator('[data-testid="who-wins-reset"]').count() === 1, `the roster reset left the CUSTOM who-wins order as it was (${prio2.slice(0, 4).join(', ')}…)`)
  check('F11-2a', !before(o2, 'stiff', 'bane') && s.disabled, `"Really reset?" on Reset order fires it: Ranger above Saber again, the line greyed`)
  check('F11-2b', await page.locator('[data-testid="count-w2-crew"]').count() === 1, 'the roster reset left the custom counter W2 CREW')
  check('F11-2c', sc2.sans === sc0.sans && same(sc2.chosen, sc0.chosen) && same(sc2.swatches, sc0.swatches) && sc2.who === sc0.who, `the roster reset left Show SANS (${sc2.sans}), the groups (${sc2.chosen.join(',')}), their colours and who-wins ("${sc2.who}") exactly as they were`)
  note('F11-2d', `after firing Reset order, Reset counters reads "${s.counter}" (armed=${s.counterArmed})`)
  await shotSheet(w, 'd-F11-3-order-fired-counter-kept')
  await closeSettings(w)
  const c2 = await config(page)
  check('F11-2e', same(c2.counters, c0.counters) && c2.eventLines === c0.eventLines && same(c2.groups, c0.groups), `the grid after the roster reset: counters ${c2.counters.length} (was ${c0.counters.length}), event lines ${c2.eventLines} (was ${c0.eventLines}), group headings unchanged`)
  await openSettings(w)
  s = await lineState(page)
  check('F11-2f', !s.armed && !s.counterArmed && s.counter === '↺ Reset counters' && s.text === '↺ Reset order', `closed and reopened: both lines unarmed ("${s.text}" · "${s.counter}")`)
  await closeSettings(w)
  /* disarm on close — every way the sheet closes: ✕, Escape, a press outside it */
  await arrange(w, true); await dragRow(w, 'bane', 'stiff', 'after'); await arrange(w, false)
  for (const how of ['x', 'escape', 'outside']) {
    await openSettings(w)
    await press(w, '[data-testid="roster-reset-order"]')
    const armed = (await lineState(page)).armed
    if (how === 'x') await press(w, '[data-testid="settings-close"]')
    else if (how === 'escape') { await page.keyboard.press('Escape'); await page.waitForTimeout(300) }
    else { await page.mouse.click(1420, 880); await page.waitForTimeout(400) }
    const closed = !(await page.locator('[data-testid="settings-sheet"]').count())
    await openSettings(w)
    s = await lineState(page)
    await shotSheet(w, `d-F11-3-reopened-unarmed-after-${how}`)
    check(`F11-3-${how}`, armed && closed && !s.armed && s.text === '↺ Reset order' && before(await order(page), 'stiff', 'bane'), `armed, then closed by ${how} (closed=${closed}) → reopened unarmed and nothing reset`)
    await closeSettings(w)
  }
  /* armed, then the admin walks to another page and back without closing the sheet (the war stays mounted) */
  await openSettings(w)
  await press(w, '[data-testid="roster-reset-order"]')
  await L.go(page, 'quals'); await L.go(page, 'leavewar'); await page.waitForTimeout(300)
  const still = await page.locator('[data-testid="settings-sheet"]').count()
  s = still ? await lineState(page) : null
  note('F11-3-page', still ? `armed, then Quals and back: the sheet is still open and Reset order reads "${s.text}" (the same as Reset counters' own arm, which also clears only when the sheet closes)` : 'armed, then Quals and back: the sheet had closed')
  await shotView(w, 'd-F11-3b-armed-after-page-switch')
  await closeSettings(w)
  /* the reverse: Reset counters fired leaves the order */
  await openSettings(w)
  await press(w, '[data-testid="counter-reset-all"]')
  s = await lineState(page)
  check('F11-4a', s.counterArmed && !s.armed, 'one tap on Reset counters arms only it (Reset order not armed)')
  await press(w, '[data-testid="counter-reset-all"]')
  s = await lineState(page)
  await closeSettings(w)
  const o4 = await order(page)
  check('F11-4b', await page.locator('[data-testid="count-w2-crew"]').count() === 0, 'Reset counters fired: the custom counter W2 CREW is gone')
  await page.evaluate(() => window.scrollTo(0, 0)); await shotView(w, 'd-F11-4b-counters-reset-w2crew-gone')
  check('F11-4c', before(o4, 'stiff', 'bane') && !s.disabled && HAND_HINT.test(s.hint), `…and the hand order stands (Ranger still below Saber), Reset order still enabled`)
  await shotRows(w, 'd-F11-4-counters-reset-order-kept', 'group-SXO', 'row-freak', 'row-slipway')
  /* "Back to the standard groups" never resets the order */
  await openSettings(w)
  await press(w, '[data-testid="group-reset"]')
  s = await lineState(page)
  const sc5 = await sheetConfig(page)
  await closeSettings(w)
  const o5 = await order(page)
  check('F11-5a', !sc5.chosen.includes(nvgId) && before(o5, 'stiff', 'bane') && !s.disabled, `"Back to the standard groups": groups back (${sc5.chosen.join(',')}), the hand order kept (Ranger below Saber), Reset order still enabled`)
  await shotView(w, 'd-F11-5-standard-groups-order-kept')
  await w.close('F11')
}

/* =========================================================================================================== F12 */
async function quals(w) { await L.go(w.page, 'quals'); await w.page.waitForTimeout(300) }
async function setCat(w, id, cat) {
  const { page } = w
  await quals(w)
  if (await page.locator('#qEdit').isVisible().catch(() => false)) await press(w, '#qEdit')
  const sel = page.locator(`select[data-lvl="${id}"]`).first()
  await sel.scrollIntoViewIfNeeded()
  await sel.selectOption(cat)
  await page.waitForTimeout(400)
  return page.evaluate(id => window.PEOPLE[id].q, id)
}
async function addPerson(w, callsign, initials, seat, cat) {
  const { page } = w
  await quals(w)
  if (!(await page.locator('#qCS').isVisible().catch(() => false))) await press(w, '#qAddToggle')
  await page.fill('#qCS', callsign); await page.fill('#qInitials', initials); await page.fill('#qFlight', 'A')
  await page.selectOption('#qSeat', seat); await page.waitForTimeout(100)
  await page.selectOption('#qLevel', cat)
  await press(w, '#qAddPerson')
  await page.waitForTimeout(400)
  return page.evaluate(cs => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === cs) || null, callsign)
}
async function F12() {
  /* A: the promise — after a reset the roster FOLLOWS the default (a CAT change and a newcomer land ranked, no second reset) */
  {
    const w = await world(); const { page } = w
    await lw(page)
    await arrange(w, true); await dragRow(w, 'bane', 'stiff', 'after'); await arrange(w, false)
    await openSettings(w); await press(w, '[data-testid="roster-reset-order"]'); await press(w, '[data-testid="roster-reset-order"]'); await closeSettings(w)
    const o0 = await order(page)
    check('F12-A0', !before(o0, 'stiff', 'bane'), 'fixture: a hand order, then Reset order fired')
    /* Outlaw (casper) OPS P CAT C → A on Quals */
    const q = await setCat(w, 'casper', 'A')
    await shotView(w, 'd-F12-A1-quals-outlaw-cat-a')
    await lw(page)
    const o1 = await order(page), v1 = await rankedViolations(page)
    const opsp = o1.filter(id => ['dj', 'salsa', 'bruise', 'pike', 'casper', 'ignite', 'fantom', 'vegas'].includes(id))
    check('F12-A1', q === 'A' && !v1.length && before(o1, 'dj', 'casper') && before(o1, 'casper', 'salsa'), `CAT C → A on Quals: Outlaw moves to his ranked place (OPS P now ${(await cs(page, opsp)).join(', ')}) — ${v1.length ? v1.join('; ') : 'every group ranked'}`)
    await shotRows(w, 'd-F12-A2-outlaw-ranked-under-cat-a', 'group-OPSP', 'row-vegas', 'row-salsa')
    await openSettings(w)
    let s = await lineState(page)
    check('F12-A3', s.disabled && GREY_HINT.test(s.hint), `…with no second reset: the ⚙ line stays greyed ("${s.hint}")`)
    await shotSheet(w, 'd-F12-A3-after-cat-change-line-greyed')
    await closeSettings(w)
    /* a newcomer through Quals' + Add person: a pilot CAT C whose callsign sorts FIRST in OPS P CAT C */
    const nid = await addPerson(w, 'Aardvark', 'AA', 'FCP', 'C')
    await shotView(w, 'd-F12-A4-quals-add-aardvark')
    await lw(page)
    const o2 = await order(page), v2 = await rankedViolations(page)
    check('F12-A4', !!nid && o2.includes(nid) && !v2.length && before(o2, nid, 'bruise') && before(o2, 'salsa', nid), `a newcomer lands in his RANKED place (first of OPS P CAT C, before Gambit), not at the foot: ${nid ? (await cs(page, o2.slice(o2.indexOf(nid) - 2, o2.indexOf(nid) + 3))).join(', ') : 'NOT ADDED'} ${v2.join('; ')}`)
    if (nid) await shotRows(w, 'd-F12-A5-aardvark-ranked-in-ops-p', 'group-OPSP', 'row-vegas', `row-${nid}`)
    await openSettings(w)
    s = await lineState(page)
    check('F12-A6', s.disabled, `…and the ⚙ line still greyed (the roster still follows the default)`)
    await closeSettings(w)
    /* after a reload the cleared order is still CLEARED (not frozen at boot): a second CAT change still re-ranks */
    await reload(w)
    const o3 = await order(page)
    check('F12-A7', nid && same(o3, o2), 'a reload keeps the newcomer and Outlaw in their ranked places')
    await shotRows(w, 'd-F12-A7-after-reload-ranked', 'group-OPSP', 'row-vegas', 'row-salsa')
    const q2 = await setCat(w, nid, 'B')
    await lw(page)
    const o4 = await order(page), v4 = await rankedViolations(page)
    check('F12-A8', q2 === 'B' && !v4.length && before(o4, nid, 'salsa') && before(o4, 'casper', nid), `after the reload a second CAT change (Aardvark C → B) still re-ranks him (first of CAT B, before Saint) ${v4.join('; ')}`)
    await shotRows(w, 'd-F12-A8-after-reload-aardvark-cat-b', 'group-OPSP', 'row-vegas', 'row-salsa')
    await w.close('F12A')
  }
  /* B: the contrast that shows why the reset CLEARS — a saved order that draws the default (away and back) greys the line;
     a newcomer then sinks to the end of his seat, the line lights, and Reset order puts him in his ranked place */
  {
    const w = await world(); const { page } = w
    await lw(page)
    await arrange(w, true); await dragRow(w, 'bane', 'stiff', 'after'); await dragRow(w, 'bane', 'pump', 'after'); await arrange(w, false)
    await openSettings(w)
    let s = await lineState(page)
    check('F12-B0', s.disabled, 'fixture: a saved order that draws the default (away and back) — the line greyed')
    await closeSettings(w)
    const nid = await addPerson(w, 'Aardvark', 'AA', 'FCP', 'C')
    await lw(page)
    const o1 = await order(page)
    const sunk = nid && before(o1, 'vegas', nid)
    note('F12-B1', `with a saved order, the newcomer is drawn ${sunk ? 'at the END of his seat in OPS P (after Vapor) — the saved-order rule' : 'at ' + o1.indexOf(nid)}`)
    if (nid) await shotRows(w, 'd-F12-B1-saved-order-newcomer-sank-to-foot', 'group-OPSP', `row-${nid}`, 'row-casper')
    await openSettings(w)
    s = await lineState(page)
    check('F12-B2', !s.disabled && HAND_HINT.test(s.hint), `the moment the drawn order leaves the default, the line LIGHTS ("${s.hint.slice(0, 40)}…")`)
    await shotSheet(w, 'd-F12-B2-newcomer-sank-line-lit')
    await press(w, '[data-testid="roster-reset-order"]'); await press(w, '[data-testid="roster-reset-order"]')
    await closeSettings(w)
    const o2 = await order(page)
    check('F12-B3', nid && before(o2, nid, 'bruise') && !(await rankedViolations(page)).length, 'Reset order puts the newcomer in his ranked place (first of OPS P CAT C)')
    await shotRows(w, 'd-F12-B3-after-reset-aardvark-ranked', 'group-OPSP', 'row-vegas', `row-${nid}`)
    await w.close('F12B')
  }
}

/* =========================================================================================================== F18 */
async function F18() {
  const w = await world(); const { page } = w
  await lw(page)
  const base = await order(page)
  await arrange(w, true); await dragRow(w, 'bane', 'stiff', 'after'); await arrange(w, false)
  const hand = await order(page)
  check('F18-0', before(hand, 'stiff', 'bane'), 'fixture: hand order (Ranger below Saber)')
  /* the hand order is world-level: the other war draws it too */
  await page.selectOption('[data-testid="war-picker"]', { label: 'JAN - DEC 27' }); await page.waitForTimeout(600)
  const h27 = await order(page)
  check('F18-0b', before(h27, 'stiff', 'bane'), `the other war (JAN - DEC 27) draws the same hand order (world-level)`)
  await shotRows(w, 'd-F18-0b-war-27-hand-order', 'group-SXO', 'row-freak', 'row-slipway')
  await page.selectOption('[data-testid="war-picker"]', { label: 'JAN - DEC 26' }); await page.waitForTimeout(600)
  /* control: a reload keeps a hand order (so the reload check below means something) */
  await reload(w)
  check('F18-0c', same(await order(page), hand), 'control: a reload keeps the hand order')
  await shotRows(w, 'd-F18-0c-reload-keeps-hand-order', 'group-SXO', 'row-freak', 'row-slipway')
  /* Reset, then Undo / Redo — the Leave War's own pair, the one a person on this page sees */
  await openSettings(w); await press(w, '[data-testid="roster-reset-order"]'); await press(w, '[data-testid="roster-reset-order"]'); await closeSettings(w)
  await toasts(page)
  const o1 = await order(page)
  const u1 = await undoTitle(page)
  check('F18-1a', same(o1, base), 'Reset order fired: the default')
  note('F18-1b', `the Undo button after the reset reads "${u1.u}"`)
  await shotView(w, 'd-F18-1-after-reset-undo-label')
  await press(w, '[data-testid="lw-undo"]')
  const t2 = await toasts(page)
  const o2 = await order(page)
  check('F18-2a', same(o2, hand), `Undo brings the hand order back (Ranger below Saber)`)
  note('F18-2b', `Undo's words on screen: ${t2.length ? t2.map(t => '"' + t + '"').join(', ') : '(no toast)'} · Redo reads "${(await undoTitle(page)).r}"`)
  await openSettings(w)
  let s = await lineState(page)
  check('F18-2c', !s.disabled && HAND_HINT.test(s.hint), 'after Undo the ⚙ line is enabled again (the hand order is back)')
  await closeSettings(w)
  await shotRows(w, 'd-F18-2-after-undo-hand-order-back', 'group-SXO', 'row-freak', 'row-slipway')
  await press(w, '[data-testid="lw-redo"]')
  const t3 = await toasts(page)
  const o3 = await order(page)
  check('F18-3a', same(o3, base), `Redo resets again (the default)`)
  await shotRows(w, 'd-F18-3a-after-redo-default', 'group-SXO', 'row-freak', 'row-slipway')
  note('F18-3b', `Redo's words on screen: ${t3.length ? t3.map(t => '"' + t + '"').join(', ') : '(no toast)'}`)
  /* the ONE timeline: the top bar's Undo on Edit Schedule reaches the same reset */
  await L.go(page, 'editsched')
  const ub = await page.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? { t: b.title, d: b.disabled, vis: !!(b.offsetWidth || b.offsetHeight) } : null })
  await page.screenshot({ path: `${SHOTS}/d-F18-3c-edit-schedule-top-bar-undo.png`, clip: { x: 0, y: 0, width: 1440, height: 140 } })
  if (ub && ub.vis && !ub.d) { await page.click('#undoBtn'); await page.waitForTimeout(500) }
  const tU = await toasts(page)
  await lw(page)
  const oU = await order(page)
  check('F18-3c', ub && !ub.d && same(oU, hand), `the top bar's Undo on Edit Schedule ("${ub && ub.t}") undoes the Leave War's reset — one timeline (words: ${tU.join(', ') || 'none'})`)
  await press(w, '[data-testid="lw-redo"]'); await toasts(page)
  check('F18-3d', same(await order(page), base), 'Redo on the war puts the reset back')
  /* reload keeps the default — an empty saved order is NOT read as "nothing stored" */
  await reload(w)
  const o4 = await order(page)
  await openSettings(w); s = await lineState(page); await closeSettings(w)
  check('F18-4a', same(o4, base) && s.disabled, `reload after the reset: still the default, the ⚙ line greyed`)
  await shotRows(w, 'd-F18-4-after-reload-default', 'group-SXO', 'row-freak', 'row-slipway')
  /* the war switch: the same default in the other war, and back */
  await page.selectOption('[data-testid="war-picker"]', { label: 'JAN - DEC 27' }); await page.waitForTimeout(600)
  const o5 = await order(page)
  await openSettings(w); s = await lineState(page); await closeSettings(w)
  check('F18-5a', same(o5, base.filter(id => o5.includes(id))) && !(await rankedViolations(page)).length && s.disabled, `JAN - DEC 27 draws the default too (${o5.length} rows), line greyed there`)
  await shotView(w, 'd-F18-5-war-27-default')
  await page.selectOption('[data-testid="war-picker"]', { label: 'JAN - DEC 26' }); await page.waitForTimeout(600)
  check('F18-5b', same(await order(page), base), 'back to JAN - DEC 26: the default')
  /* Reset while Rearrange is ON and Show SANS is on */
  await arrange(w, true); await dragRow(w, 'bane', 'stiff', 'after')
  await openSettings(w); await press(w, '[data-testid="sans-toggle"]'); await closeSettings(w)
  const gs = await groups(page)
  const handS = await order(page)
  const sansOf = () => page.evaluate(() => { const out = []; let on = false
    for (const e of document.querySelectorAll('.mx tbody.mxbody tr[data-testid^="row-"], .mx tbody.mxbody tr[data-testid^="group-"]')) { const t = e.getAttribute('data-testid'); if (t.startsWith('group-')) on = t === 'group-SANS'; else if (on) out.push(t.slice(4)) } return out })
  note('F18-6x', `under the hand order (saved before SANS was shown) the SANS group reads ${(await cs(page, await sansOf())).join(', ')} — ranked violations: ${(await rankedViolations(page)).join('; ') || 'none'}`)
  const whoW0 = await page.evaluate(() => { const e = document.querySelector('.mx tbody.mxbody tr[data-testid^="row-"] .who'); return e ? e.getBoundingClientRect().width : 0 })
  check('F18-6a', gs[gs.length - 1] === 'SANS' && before(handS, 'stiff', 'bane'), `fixture: Rearrange on, Show SANS on (SANS the last group: ${gs.join(', ')}), hand order`)
  await shotRows(w, 'd-F18-6-arranging-sans-hand', 'group-SXO', 'row-freak', 'row-slipway')
  await openSettings(w)
  s = await lineState(page)
  check('F18-6b', !s.disabled, 'the ⚙ opens while Rearrange is on, and Reset order is enabled')
  await press(w, '[data-testid="roster-reset-order"]'); await press(w, '[data-testid="roster-reset-order"]')
  await closeSettings(w)
  const o6 = await order(page), v6 = await rankedViolations(page)
  const geo = await page.evaluate(() => ({
    arranging: !!document.querySelector('.mx-outer.mx-arranging'),
    grips: document.querySelectorAll('.mx [data-testid^="drag-"]').length,
    rows: document.querySelectorAll('.mx tbody.mxbody tr[data-testid^="row-"]').length,
    whoW: (() => { const e = document.querySelector('.mx tbody.mxbody tr[data-testid^="row-"] .who'); return e ? e.getBoundingClientRect().width : 0 })(),
    pressed: document.querySelector('[data-testid="roster-arrange"]')?.getAttribute('aria-pressed'),
  }))
  const gs6 = await groups(page)
  const sansIds = await page.evaluate(() => { const out = []; let on = false
    for (const e of document.querySelectorAll('.mx tbody.mxbody tr[data-testid^="row-"], .mx tbody.mxbody tr[data-testid^="group-"]')) { const t = e.getAttribute('data-testid'); if (t.startsWith('group-')) on = t === 'group-SANS'; else if (on) out.push(t.slice(4)) } return out })
  check('F18-6c', !v6.length && !before(o6, 'stiff', 'bane') && gs6[gs6.length - 1] === 'SANS', `reset under Rearrange + SANS: every group ranked incl. SANS at the foot (${(await cs(page, sansIds)).join(', ')}) ${v6.join('; ')}`)
  check('F18-6d', geo.arranging && geo.pressed === 'true' && geo.grips >= geo.rows - 1 && Math.abs(geo.whoW - whoW0) < 1, `Rearrange still on after the reset: ⠿ grips ${geo.grips} for ${geo.rows} rows, the widened name column kept (${Math.round(geo.whoW)}px, was ${Math.round(whoW0)}px)`)
  await shotRows(w, 'd-F18-6b-arranging-sans-after-reset', 'group-SXO', 'row-freak', 'row-slipway')
  const sansLast = sansIds[sansIds.length - 1]
  if (sansLast) await shotRows(w, 'd-F18-6c-sans-group-ranked-at-foot', 'group-SANS', `row-${sansLast}`)
  /* the first drag after the reset picks up the LIVE default: Warden (nact) dropped before Anvil (shaft) */
  await dragRow(w, 'nact', 'shaft', 'before')
  const o7 = await order(page)
  const exp = o6.filter(id => id !== 'nact'); exp.splice(exp.indexOf('shaft'), 0, 'nact')
  await shotRows(w, 'd-F18-7-first-drag-after-reset', 'group-SXO', 'row-freak', 'row-slipway')
  check('F18-7', same(o7, exp), `the first drag after the reset moves ONE row off the live default (Warden above Anvil; nothing else moved)`)
  await arrange(w, false)
  await w.close('F18')
}

/* =========================================================================================================== G: grouping is not order */
async function G() {
  const w = await world(); const { page } = w
  await lw(page)
  const base = await order(page)
  const g0 = await groups(page)
  /* drag the IP heading above SXO with the roster at its default */
  await arrange(w, true)
  const e = await dragRow(w, 'IP', 'SXO', 'group', 'gdrag')
  await arrange(w, false)
  const g1 = await groups(page), o1 = await order(page)
  check('G-1a', !e && g1[0] === 'IP', `fixture: the IP heading dragged above SXO (${g1.join(', ')}) ${e || ''}`)
  await openSettings(w)
  let s = await lineState(page)
  check('G-1b', s.disabled && GREY_HINT.test(s.hint) && !(await rankedViolations(page)).length, `a GROUP move is not a hand order: Reset order stays greyed, every block still ranked`)
  await shotSheet(w, 'd-G-1-group-moved-line-greyed')
  await closeSettings(w)
  await shotView(w, 'd-G-1b-ip-above-sxo')
  /* a hand order on top, then Reset order: the group move survives */
  await arrange(w, true)
  const blk = o1.slice(0, 3)
  await dragRow(w, blk[0], blk[1], 'after')
  await arrange(w, false)
  const o2 = await order(page)
  check('G-2a', !same(o2, o1), `fixture: a hand order inside the IP block (${(await cs(page, o2.slice(0, 3))).join(', ')})`)
  await openSettings(w); await press(w, '[data-testid="roster-reset-order"]'); await press(w, '[data-testid="roster-reset-order"]'); await closeSettings(w)
  const g3 = await groups(page), o3 = await order(page)
  check('G-2b', same(g3, g1) && same(o3, o1), `Reset order never moves a group: IP still above SXO (${g3.slice(0, 3).join(', ')}), rows back to the ranked default under that grouping`)
  await shotView(w, 'd-G-2-reset-keeps-group-order')
  /* the sheet's own groups list still drags with the new Roster order tray above it: OPS P dragged above SXO */
  await openSettings(w)
  const gg = page.locator('[data-testid="gsdrag-OPSP"]'), gt = page.locator('[data-testid="grow-SXO"]')
  await gt.scrollIntoViewIfNeeded(); await page.waitForTimeout(150)
  const gb = await gg.boundingBox(), tb = await gt.boundingBox()
  await page.mouse.move(gb.x + gb.width / 2, gb.y + gb.height / 2); await page.mouse.down()
  await page.mouse.move(gb.x + gb.width / 2, gb.y - 10, { steps: 3 }); await page.mouse.move(gb.x + 20, tb.y + 4, { steps: 8 })
  await page.waitForTimeout(120); await page.mouse.up(); await page.waitForTimeout(700)
  s = await lineState(page)
  const chosen = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="grow-"]')].map(e => e.getAttribute('data-testid').slice(5)))
  await shotView(w, 'd-G-3-sheet-group-drag-with-new-tray')
  await closeSettings(w)
  const g4 = await groups(page)
  check('G-3', chosen.indexOf('OPSP') < chosen.indexOf('SXO') && g4.indexOf('OPSP') < g4.indexOf('SXO') && s.disabled && !(await rankedViolations(page)).length, `the sheet's groups list still drags beside the new line (list ${chosen.slice(0, 4).join(', ')}…; grid ${g4.slice(0, 4).join(', ')}…), and a group move leaves Reset order greyed`)
  await w.close('G')
  void base; void g0
}

/* =========================================================================================================== M: the member */
async function M() {
  const w = await world(); const { page } = w
  await lw(page)
  await arrange(w, true); await dragRow(w, 'bane', 'stiff', 'after'); await arrange(w, false)
  const hand = await order(page)
  await relog(w, 'us')
  await lw(page)
  const m = await page.evaluate(() => ({
    gear: document.querySelectorAll('[data-testid="settings-open"]').length,
    arrange: document.querySelectorAll('[data-testid="roster-arrange"]').length,
    reset: document.querySelectorAll('[data-testid="roster-reset-order"]').length,
    row: [...document.querySelectorAll('.card-hd .rtbtn')].map(b => b.textContent.replace(/\s+/g, ' ').trim()),
  }))
  check('M-1', m.gear === 0 && m.arrange === 0 && m.reset === 0, `the member (Ranger) has no ⚙, no ⇅ and no Reset order — his top row reads ${m.row.join(' · ')}`)
  check('M-2', same(await order(page), hand), 'the member sees the admin\'s hand order (one order for the whole squadron)')
  await page.locator('.card-hd').first().scrollIntoViewIfNeeded()
  await shotView(w, 'd-M-1-member-no-gear')
  await w.close('M')
}

/* =========================================================================================================== P: the phone */
async function P() {
  const w = await world({ phone: true }); const { page } = w
  await lw(page)
  const base = await order(page)
  await shotView(w, 'p-P-0-leavewar-top-row')
  await openSettings(w)
  let s = await lineState(page)
  check('P-0a', s && s.disabled && GREY_HINT.test(s.hint), `phone: the sheet's Roster order line is there, greyed, hint "${s && s.hint}"`)
  check('P-0b', s && s.box.x >= 0 && s.box.x + s.box.w <= s.vw && s.box.y >= 0 && s.box.y + s.box.h <= s.vh && s.onTop, `phone: the button sits wholly on screen and nothing covers it (${JSON.stringify(s && s.box)}, window ${s && s.vw}×${s && s.vh})`)
  await shotView(w, 'p-P-0-settings-roster-line-greyed')
  await closeSettings(w)
  /* a finger drag in Rearrange: Ranger below Saber */
  await arrange(w, true)
  await shotView(w, 'p-P-1a-arranging')
  const e = await dragRow(w, 'bane', 'stiff', 'after')
  const o1 = await order(page)
  check('P-1', !e && before(o1, 'stiff', 'bane'), `phone: a finger drag in Rearrange puts Ranger below Saber ${e || ''}`)
  await shotRows(w, 'p-P-1b-finger-drag-ranger-below-saber', 'group-SXO', 'row-freak', 'row-slipway')
  await arrange(w, false)
  await openSettings(w)
  s = await lineState(page)
  check('P-2a', !s.disabled && HAND_HINT.test(s.hint) && s.onTop, `phone: the line lights ("${s.hint.slice(0, 50)}…"), tappable`)
  await shotView(w, 'p-P-2a-line-enabled')
  await press(w, '[data-testid="roster-reset-order"]')
  s = await lineState(page)
  check('P-2b', s.armed && s.text === 'Really reset?' && !s.counterArmed, `phone: one tap arms it ("${s.text}"), Reset counters untouched`)
  await shotView(w, 'p-P-2b-armed')
  await press(w, '[data-testid="roster-reset-order"]')
  s = await lineState(page)
  check('P-2c', s.disabled && GREY_HINT.test(s.hint) && same(await order(page), base), 'phone: the second tap resets — default order, the line greyed')
  await shotView(w, 'p-P-2c-after-reset')
  await closeSettings(w)
  await shotRows(w, 'p-P-2d-grid-after-reset', 'group-SXO', 'row-freak', 'row-slipway')
  await toasts(page)
  await press(w, '[data-testid="lw-undo"]')
  const t = await toasts(page)
  check('P-3', same(await order(page), o1), `phone: the Leave War's Undo brings the hand order back`)
  note('P-3b', `phone Undo words: ${t.length ? t.map(x => '"' + x + '"').join(', ') : '(no toast)'}`)
  await shotView(w, 'p-P-3-after-undo')
  /* armed then closed → unarmed on reopen */
  await openSettings(w)
  await press(w, '[data-testid="roster-reset-order"]')
  const armed = (await lineState(page)).armed
  await press(w, '[data-testid="settings-close"]')
  await openSettings(w)
  s = await lineState(page)
  check('P-4', armed && !s.armed && same(await order(page), o1), 'phone: armed, closed with ✕, reopened unarmed; nothing reset')
  await shotView(w, 'p-P-4-reopened-unarmed')
  await closeSettings(w)
  /* Rearrange ON, then Reset order from the sheet: the phone's widened name column (92px) and the ⇅ state survive */
  await arrange(w, true)
  const whoW0 = await page.evaluate(() => document.querySelector('.mx tbody.mxbody tr[data-testid^="row-"] .who')?.getBoundingClientRect().width || 0)
  await openSettings(w); await press(w, '[data-testid="roster-reset-order"]'); await press(w, '[data-testid="roster-reset-order"]'); await closeSettings(w)
  const g5 = await page.evaluate(() => ({ arranging: !!document.querySelector('.mx-outer.mx-arranging'), w: document.querySelector('.mx tbody.mxbody tr[data-testid^="row-"] .who')?.getBoundingClientRect().width || 0, grips: document.querySelectorAll('.mx [data-testid^="drag-"]').length }))
  check('P-5', g5.arranging && Math.abs(g5.w - whoW0) < 1 && same(await order(page), base), `phone: Reset order while rearranging — still rearranging, the name column ${Math.round(g5.w)}px (was ${Math.round(whoW0)}px), ${g5.grips} grips, the default order`)
  await shotRows(w, 'p-P-5-reset-while-arranging', 'group-SXO', 'row-freak', 'row-slipway')
  await arrange(w, false)
  /* reload on the phone keeps the reset */
  await reload(w)
  check('P-6', same(await order(page), base), 'phone: a reload after the reset keeps the default order')
  await shotRows(w, 'p-P-6-after-reload-default', 'group-SXO', 'row-freak', 'row-slipway')
  await w.close('P')
  /* the member at the phone width: no ⚙ */
  const m = await world({ phone: true, who: 'us' })
  await lw(m.page)
  const g = await m.page.evaluate(() => document.querySelectorAll('[data-testid="settings-open"], [data-testid="roster-arrange"], [data-testid="roster-reset-order"]').length)
  check('P-M', g === 0, 'phone member (Ranger): no ⚙, no ⇅, no Reset order')
  await shotView(m, 'p-P-M-member-no-gear')
  await m.close('PM')
}

/* ------------------------------------------------------------------ run */
const plan = {
  desktop: { F10, F11, F12, F18, G, M },
  phone: { P },
}
const widths = WIDTH === 'all' ? ['desktop', 'phone'] : [WIDTH]
for (const wd of widths) for (const [k, fn] of Object.entries(plan[wd] || {})) {
  if (ONLY && ONLY !== k) continue
  console.log(`\n===== ${wd} ${k} =====`)
  try { await fn() } catch (e) { check(`${wd}-${k}-CRASH`, false, String(e && e.stack || e).split('\n').slice(0, 4).join(' | ')) }
}
const f = RESULTS.filter(r => r.ok === false), p = RESULTS.filter(r => r.ok === true)
console.log(`\n=== W2: ${p.length} PASS, ${f.length} FAIL, ${RESULTS.filter(r => r.ok === null).length} NOTE ===`)
f.forEach(r => console.log('  FAIL ' + r.id + (r.detail ? ' — ' + r.detail : '')))
if (ALL_ERRORS.length) console.log('ERRORS:\n' + ALL_ERRORS.join('\n'))
