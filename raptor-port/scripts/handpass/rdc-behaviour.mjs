/* BEHAVIOUR recorder of the react-doctor clean-up (31 Oct 26, D1534: nothing a person sees or does may change).
   usage:  node scripts/handpass/rdc-behaviour.mjs <distFolder> <label> [only]        run every scenario on one build
           node scripts/handpass/rdc-behaviour.mjs compare before after              compare the two result sets row by row
     `only` (optional): a comma list of scenario ids, e.g. "L1,T10". A part re-run replaces only its rows.
   Writes docs/img/handpass/2026-10-31-react-doctor/behaviour/<label>/<size>/<id>-<step>.png, <label>/results.json and
   <label>/files/ (T10's exports and saved storage). The SAME script runs on both builds, same origin, same clock, seeded
   random. Every row: id, size, status (PASS / FAIL / INFO / NOT WALKED), the measured values (m), the pictures.
   A row marked `expect: 'differs'` (T3 focus order, T8 caption click) is recorded and never failed.
   T10 spans both builds: run on `before` it does the work and saves the storage; run on `after` it opens THIS build with
   the BEFORE build's saved storage (it must have been run first).
   Method: docs/walk-scripts.md §4 (steps assert the RIGHT behaviour), §5 (a phone tap gets a picture right after it),
   §7 (a FAIL is read on its picture first). */
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { launch, newWorld, login, settle, toPage, SIZES, OUTROOT } from './rdc-lib.mjs'

const BH = resolve(OUTROOT, 'behaviour')

/* ============================== compare mode ============================== */
if (process.argv[2] === 'compare') {
  const [a, b] = [process.argv[3] || 'before', process.argv[4] || 'after']
  const A = JSON.parse(readFileSync(resolve(BH, a, 'results.json'), 'utf8')).rows
  const B = JSON.parse(readFileSync(resolve(BH, b, 'results.json'), 'utf8')).rows
  const key = r => r.id + '|' + r.size
  const mb = new Map(B.map(r => [key(r), r]))
  const seen = new Set()
  const out = []
  const strip = (m, volatile = []) => JSON.stringify(m, (k, v) => volatile.includes(k) ? undefined : v)
  let diffs = 0, afterFails = 0
  for (const r of A) {
    const o = mb.get(key(r)); seen.add(key(r))
    if (!o) { out.push({ id: r.id, size: r.size, before: r.status, after: '(missing)', same: 'MISSING' }); diffs++; continue }
    const same = r.status === o.status && strip(r.m, r.volatile) === strip(o.m, r.volatile)
    const expected = r.expect === 'differs'
    if (!same && !expected) diffs++
    if (o.status === 'FAIL') afterFails++
    out.push({ id: r.id, size: r.size, before: r.status, after: o.status, same: same ? 'same' : (expected ? 'differs (expected)' : 'DIFFERENT'),
      detail: same ? undefined : { before: r.m, after: o.m } })
  }
  for (const r of B) if (!seen.has(key(r))) { out.push({ id: r.id, size: r.size, before: '(missing)', after: r.status, same: 'MISSING' }); diffs++ }
  for (const o of out) console.log(`${o.id.padEnd(16)} ${o.size.padEnd(8)} ${String(o.before).padEnd(11)} ${String(o.after).padEnd(11)} ${o.same}`)
  for (const o of out) if (o.detail) console.log('\n' + o.id + ' ' + o.size + '\n  BEFORE ' + JSON.stringify(o.detail.before) + '\n  AFTER  ' + JSON.stringify(o.detail.after))
  console.log(`\n${out.length} rows, unexpected differences: ${diffs}, FAIL on AFTER: ${afterFails}`)
  writeFileSync(resolve(BH, 'compare.json'), JSON.stringify(out, null, 1))
  process.exit(0)
}

/* ============================== run mode ============================== */
const dist = process.argv[2], label = process.argv[3], only = (process.argv[4] || '').split(',').filter(Boolean)
if (!dist || !label) { console.error('usage: node scripts/handpass/rdc-behaviour.mjs <distFolder> <label> [ids]'); process.exit(2) }
if (!existsSync(resolve(dist, 'index.html'))) { console.error('no index.html in ' + dist); process.exit(2) }
const OUT = resolve(BH, label)
const RESF = resolve(OUT, 'results.json')
const FILES = resolve(OUT, 'files')
let rows = [], ERRS = []
const mine = id => only.some(o => id === o || id.startsWith(o + '.'))
if (only.length && existsSync(RESF)) { const old = JSON.parse(readFileSync(RESF, 'utf8')); rows = old.rows.filter(r => !mine(r.id)); ERRS = (old.errors || []).filter(e => !mine(e.id)) }
else rmSync(OUT, { recursive: true, force: true })
for (const s of Object.keys(SIZES)) mkdirSync(resolve(OUT, s), { recursive: true })
mkdirSync(FILES, { recursive: true })

const T = id => `[data-testid="${id}"]`
const V = sel => `${sel} >> visible=true`
const phone = p => p.viewportSize().width < 600
async function click(p, sel, o = {}) { await p.locator(V(sel)).first().click({ timeout: 6000, ...o }); await settle(p, 350) }
async function tap(p, sel, o = {}) { await p.locator(V(sel)).first().tap({ timeout: 6000, ...o }); await settle(p, 350) }
const press = (p, sel, o) => phone(p) ? tap(p, sel, o) : click(p, sel, o)
async function esc(p, n = 1) { for (let i = 0; i < n; i++) { await p.keyboard.press('Escape'); await settle(p, 250) } }
async function noSaving(p) { await p.waitForFunction(() => !/Saving/.test(document.body.innerText), null, { timeout: 4000 }).catch(() => {}) }
const count = (p, sel) => p.locator(V(sel)).count()
const text = async (p, sel) => (await p.locator(V(sel)).first().innerText().catch(() => null))?.trim() ?? null
const active = p => p.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return 'body'; return a.tagName.toLowerCase() + (a.dataset && a.dataset.testid ? '[' + a.dataset.testid + ']' : '') + (a.id ? '#' + a.id : '') })
const r1 = n => Math.round(n * 10) / 10
const centre = async loc => { const b = await loc.boundingBox(); return b ? { x: b.x + b.width / 2, y: b.y + b.height / 2, b } : null }

const browser = await launch()
/** a fresh world (a new browser context, the demo world on first boot), signed in; `path` goes to that page */
async function world(kind, { who = 'a', path = null, storageState = null, signIn = true } = {}) {
  const w = await newWorld(browser, dist, SIZES[kind], { touch: kind === 'phone', storageState })
  w.kind = kind; w.p = w.page
  /* a save goes to the browser's own download (headless Chromium would otherwise wait on a native save picker) */
  await w.ctx.addInitScript(() => { window.showSaveFilePicker = undefined })
  await w.page.evaluate(() => { window.showSaveFilePicker = undefined })
  if (signIn) { await login(w.page, who); await noSaving(w.page) }
  if (path) await toPage(w.page, path)
  return w
}
let CUR = null
const pic = async (w, name) => {
  const f = `${CUR.id}-${name}.png`
  await w.p.screenshot({ path: resolve(OUT, w.kind, f) })
  CUR.pics.push(`${w.kind}/${f}`)
  return f
}
/** on a phone: a picture right after the tap (the finger lifted, the pointer left where it pressed), then settle */
async function tapShot(w, sel, name) {
  await w.p.locator(V(sel)).first().tap({ timeout: 6000 })
  await w.p.waitForTimeout(80)
  await pic(w, name + '-tap')
  await settle(w.p, 350)
}
/** record one row. ok: true PASS, false FAIL, 'INFO' recorded only, 'NW' NOT WALKED (the set-up could not act) */
function rec(id, size, ok, m, { expect, volatile, note, pics } = {}) {
  const status = ok === 'INFO' ? 'INFO' : ok === 'NW' ? 'NOT WALKED' : ok ? 'PASS' : 'FAIL'
  const row = { id, size, status, m, pics: pics || CUR.pics.slice(), ...(expect ? { expect } : {}), ...(volatile ? { volatile } : {}), ...(note ? { note } : {}) }
  rows.push(row)
  console.log(`[${size}] ${id}: ${status}  ${JSON.stringify(m).slice(0, 300)}`)
  CUR.pics = []
  return row
}
const SCEN = []
const scenario = (id, kind, fn) => SCEN.push({ id, kind, fn })
const finish = async w => { ERRS.push(...w.errors.map(e => ({ id: CUR.id, ...e }))); await w.ctx.close() }

/* ================================================================ LEAVE WAR ================================================================ */
const cell = (id, iso) => T(`cell-${id}-${iso}`)
const chipOf = (p, id, iso) => p.locator(cell(id, iso) + ' .c').count()
const cellCls = (p, id, iso) => p.locator(cell(id, iso)).evaluate(e => e.className).catch(() => '?')

/* L1 phone: the Manning fold, folded and open, remembered over a reload */
scenario('L1', 'phone', async kind => {
  const w = await world(kind, { path: 'leavewar' }); const p = w.p
  const st = () => p.evaluate(() => document.querySelector('[data-testid="counts-toggle"]')?.getAttribute('aria-expanded') ?? null)
  const rowsShown = () => p.evaluate(() => Math.round(document.querySelector('#page-leavewar tr.grp')?.getBoundingClientRect().top ?? -1))   // where the first group heading stands: lower when the Manning rows are open
  const s0 = await st(), n0 = await rowsShown(); await pic(w, 'start')
  await tapShot(w, T('counts-toggle'), 'toggled1')
  const s1 = await st(), n1 = await rowsShown(); await pic(w, 'toggled1')
  await tapShot(w, T('counts-toggle'), 'toggled2')
  const s2 = await st(), n2 = await rowsShown(); await pic(w, 'toggled2')
  /* leave it in the OTHER state than the first one, reload, and read */
  const target = s0 === 'true' ? 'false' : 'true'
  if (s2 !== target) await tap(p, T('counts-toggle'))
  const sBefore = await st(), nBefore = await rowsShown()
  await p.reload(); await p.waitForSelector('#luser, #vWeek .day', { state: 'attached' })
  if (await p.locator('#luser').count()) await login(p, 'a')
  await toPage(p, 'leavewar'); await settle(p, 700)
  const sAfter = await st(), nAfter = await rowsShown(); await pic(w, 'after-reload')
  rec('L1', kind, s0 !== s1 && s1 !== s2 && s0 === s2 && sBefore === sAfter && sAfter === target && (n1 > n0) === (s1 === 'true') && n2 === n0 && nAfter === nBefore,
    { start: s0, afterTap1: s1, afterTap2: s2, firstGroupTop: [n0, n1, n2], setBeforeReload: sBefore, topBeforeReload: nBefore, afterReload: sAfter, topAfterReload: nAfter })
  await finish(w)
})

/* L2 Approvals: approve lights, a second tap sends it back, Undo restores, the decided line stays until the dates change */
scenario('L2', 'desktop', async kind => {
  const w = await world(kind, { path: 'leavewar' }); const p = w.p
  await click(p, T('lw-tab-approvals')); await settle(p, 600)
  const lines = () => p.evaluate(() => [...document.querySelectorAll('[data-testid^="appr-line-"]')].map(e => e.dataset.testid.slice(10) + '@' + (e.querySelector('[data-testid="appr-dates"]')?.innerText || '').replace(/\s+/g, ' ').trim()))
  const ok = i => p.locator('[data-testid^="appr-line-"]').nth(i).locator(T('appr-approve'))
  const state = async i => ({ pressed: await ok(i).getAttribute('aria-pressed'), word: (await ok(i).innerText()).trim().replace(/\s+/g, ' ') })
  const sub = () => text(p, T('appr-sub'))
  const l0 = await lines(), sub0 = await sub(), st0 = await state(0); await pic(w, 'start')
  await ok(0).click(); await settle(p, 500); await pic(w, 'approved')
  const l1 = await lines(), st1 = await state(0), sub1 = await sub()
  await ok(0).click(); await settle(p, 500); await pic(w, 'back-to-pending')
  const l2 = await lines(), st2 = await state(0), sub2 = await sub()
  await ok(0).click(); await settle(p, 500)
  const st3 = await state(0)
  await click(p, '#undoBtn'); await settle(p, 500); await pic(w, 'after-undo')
  const l4 = await lines(), st4 = await state(0), sub4 = await sub()
  /* decide it again, then change the month and back: the decided line stays while the dates are the same and leaves when they change */
  await ok(0).click(); await settle(p, 500)
  const l5 = await lines(), st5 = await state(0)
  await click(p, T('appr-m-2026-02')); await settle(p, 500); await pic(w, 'february')
  const febN = (await lines()).length
  await click(p, T('appr-all')); await settle(p, 500); await pic(w, 'all-again')
  const l6 = await lines(), sub6 = await sub()
  const lit6 = await p.locator('[data-testid^="appr-line-"] ' + T('appr-approve') + '[aria-pressed="true"]').count()
  const good = st0.pressed === 'false' && st1.pressed === 'true' && /Approved/.test(st1.word) && sub0 !== sub1 && JSON.stringify(l0) === JSON.stringify(l1) &&
    st2.pressed === 'false' && sub2 === sub0 && JSON.stringify(l2) === JSON.stringify(l0) && st3.pressed === 'true' &&
    st4.pressed === 'false' && sub4 === sub0 && JSON.stringify(l4) === JSON.stringify(l0) &&
    st5.pressed === 'true' && JSON.stringify(l5) === JSON.stringify(l0) && l6.length === l0.length - 1 && lit6 === 0 && febN > 0 && febN < l0.length
  rec('L2', kind, good, { lines0: l0.length, first: l0[0], sub: [sub0, sub1, sub2, sub4, sub6], states: [st0, st1, st2, st3, st4, st5], sameOrderWhileDeciding: [l1, l2, l5].every(l => JSON.stringify(l) === JSON.stringify(l0)), febLines: febN, linesAfterDatesChanged: l6.length, litAfterDatesChanged: lit6, firstAfterDatesChanged: l6[0] })
  await finish(w)
})

/* L3 a cell's bid window: place a bid, Move it (desktop: hover preview then click; phone: the two-step Confirm), Delete it */
for (const kind of ['desktop', 'phone']) scenario('L3', kind, async () => {
  const w = await world(kind, { path: 'leavewar' }); const p = w.p
  const A = '2026-07-15', B2 = '2026-07-20', ph = kind === 'phone'
  const m = {}
  await press(p, cell('bane', A)); await p.waitForSelector(T('bid-picker')); m.pickerOpened = true; await pic(w, 'picker')
  if (ph) await tapShot(w, T('bid-LL'), 'place'); else await click(p, T('bid-LL'))
  await settle(p, 400); await pic(w, 'placed')
  m.dialogAfterPlace = await p.locator('[role=dialog]').count()
  if (m.dialogAfterPlace) { await esc(p); }
  m.placedChip = await chipOf(p, 'bane', A); m.placedCls = await cellCls(p, 'bane', A)
  /* Move */
  await press(p, cell('bane', A)); await p.waitForSelector(T('bid-picker'))
  await press(p, T('decide-shift')); await settle(p, 400)
  m.banner = await text(p, T('move-banner')); await pic(w, 'move-banner')
  if (!ph) {
    await p.locator(cell('bane', B2)).hover(); await settle(p, 350)
    m.hoverCls = await cellCls(p, 'bane', B2); m.hoverPreview = /mvland/.test(m.hoverCls); await pic(w, 'hover-preview')
    await p.locator(cell('bane', B2)).click(); await settle(p, 600)
    m.confirmShown = await count(p, T('move-confirm'))
  } else {
    await tapShot(w, cell('bane', B2), 'target')
    m.stagedCls = await cellCls(p, 'bane', B2); m.staged = /mvland/.test(m.stagedCls)
    m.confirmShown = await count(p, T('move-confirm')); await pic(w, 'staged')
    await tapShot(w, T('move-confirm'), 'confirm'); await settle(p, 400)
  }
  await pic(w, 'moved')
  m.fromChip = await chipOf(p, 'bane', A); m.toChip = await chipOf(p, 'bane', B2); m.toCls = await cellCls(p, 'bane', B2)
  m.bannerGone = (await count(p, T('move-banner'))) === 0
  /* Delete */
  await press(p, cell('bane', B2)); await p.waitForSelector(T('bid-picker'))
  m.hasDelete = await count(p, T('bid-clear')); await pic(w, 'delete-window')
  if (ph) await tapShot(w, T('bid-clear'), 'delete'); else await click(p, T('bid-clear'))
  await settle(p, 400); await pic(w, 'deleted')
  if (await p.locator('[role=dialog]').count()) { m.dialogAfterDelete = 1; await esc(p) }
  m.toChipAfterDelete = await chipOf(p, 'bane', B2); m.fromChipAfterDelete = await chipOf(p, 'bane', A)
  const ok = m.pickerOpened && m.placedChip === 1 && /Tap a day to move/.test(m.banner || '') && (ph ? m.staged && m.confirmShown === 1 : m.hoverPreview && m.confirmShown === 0) &&
    m.fromChip === 0 && m.toChip === 1 && m.bannerGone && m.hasDelete === 1 && m.toChipAfterDelete === 0 && m.fromChipAfterDelete === 0
  rec('L3', kind, ok, m)
  await finish(w)
})

/* L4 a Required row cell: type a number, press outside -> saved; type again, Escape -> the old value back */
scenario('L4', 'desktop', async kind => {
  const w = await world(kind, { path: 'leavewar' }); const p = w.p
  const C = T('req-p-2026-07-15'), m = {}
  m.initial = await text(p, C)
  await click(p, C); m.inputOpened = await count(p, T('fly-edit-input')); await pic(w, 'box-open')
  await p.keyboard.type('9'); m.typedValue = await p.locator(T('fly-edit-input')).inputValue()
  await p.mouse.click(900, 90); await settle(p, 500); await pic(w, 'after-outside-press')
  m.afterOutside = await text(p, C); m.inputGone1 = (await count(p, T('fly-edit-input'))) === 0
  await click(p, C); await p.keyboard.type('7'); m.typedSecond = await p.locator(T('fly-edit-input')).inputValue()
  await pic(w, 'typed-seven')
  await p.keyboard.press('Escape'); await settle(p, 450); await pic(w, 'after-escape')
  m.afterEscape = await text(p, C); m.inputGone2 = (await count(p, T('fly-edit-input'))) === 0
  rec('L4', kind, m.inputOpened === 1 && m.typedValue === '9' && m.afterOutside === '9' && m.inputGone1 && m.typedSecond === '7' && m.afterEscape === '9' && m.inputGone2, m)
  await finish(w)
})

/* L5 Open for bidding: drag across two month buttons; the exact-days calendar closes on Escape and the window stays */
scenario('L5', 'desktop', async kind => {
  const w = await world(kind, { path: 'leavewar' }); const p = w.p, m = {}
  await click(p, T('open-chip')); await p.waitForSelector(T('open-dates')); await settle(p, 400)
  const st = () => p.evaluate(() => [...document.querySelectorAll('[data-testid^="od-month-"]')].map(e => e.dataset.testid.slice(-2) + '=' + e.dataset.state).join(' '))
  m.before = await st(); await pic(w, 'window')
  const a = await centre(p.locator(T('od-month-2026-07'))), c = await centre(p.locator(T('od-month-2026-08')))
  await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move(c.x, c.y, { steps: 8 }); await p.mouse.up(); await settle(p, 500)
  m.afterDrag = await st(); m.line = await text(p, '[data-testid^="od-line-2026-07"]'); await pic(w, 'after-drag')
  await click(p, T('od-more')); m.calendarOpen = await count(p, T('od-new-picker')); await pic(w, 'calendar-open')
  await p.keyboard.press('Escape'); await settle(p, 450); await pic(w, 'after-escape')
  m.calendarAfterEsc = await count(p, T('od-new-picker')); m.windowAfterEsc = await count(p, T('open-dates')); m.monthsAfterEsc = await st()
  rec('L5', kind, /07=open 08=open/.test(m.afterDrag) && /09=closed/.test(m.afterDrag) && /07=closed 08=closed/.test(m.before) && m.calendarOpen === 1 && m.calendarAfterEsc === 0 && m.windowAfterEsc === 1 && m.monthsAfterEsc === m.afterDrag, m)
  await finish(w)
})

/* L6 My leave: open with the keyboard, close with Escape, the keyboard back on the My leave button */
scenario('L6', 'desktop', async kind => {
  const w = await world(kind, { path: 'leavewar' }); const p = w.p, m = {}
  await p.locator(T('my-leave')).focus(); m.focusedBefore = await active(p)
  await p.keyboard.press('Enter'); await settle(p, 500); await p.waitForSelector(T('person-window')); await pic(w, 'open')
  m.opened = await count(p, T('person-window')); m.focusInside = await p.evaluate(() => !!document.activeElement?.closest('[data-testid="person-window"]'))
  await p.keyboard.press('Escape'); await settle(p, 500); await pic(w, 'closed')
  m.closed = (await count(p, T('person-window'))) === 0; m.focusAfter = await active(p)
  rec('L6', kind, m.opened === 1 && m.closed && m.focusAfter === 'button[my-leave]' && m.focusedBefore === 'button[my-leave]', m)
  await finish(w)
})

/* L7 phone: a bid window open, a tap on the grid behind closes it */
scenario('L7', 'phone', async kind => {
  const w = await world(kind, { path: 'leavewar' }); const p = w.p, m = {}
  await tap(p, cell('bane', '2026-07-15')); await p.waitForSelector(T('bid-picker')); await pic(w, 'open')
  const b = await p.locator(T('bid-picker')).boundingBox(); m.sheetTopBand = b.y > 100
  const y = Math.max(60, Math.min(Math.round(b.y / 2), Math.round(b.y - 20)))
  m.tapY = y
  await p.touchscreen.tap(200, y); await p.waitForTimeout(80); await pic(w, 'after-tap-tap'); await settle(p, 500); await pic(w, 'after-tap')
  m.pickerAfter = await count(p, T('bid-picker'))
  rec('L7', kind, m.pickerAfter === 0 && m.sheetTopBand, m)
  await finish(w)
})

/* L8 Balances: type into a figure box and, without leaving it, switch to Grid: a good figure is saved, a refused one is told by a note naming the box */
scenario('L8', 'desktop', async kind => {
  const w = await world(kind, { path: 'leavewar' }); const p = w.p, m = {}
  await p.evaluate(() => { window.__t = []; new MutationObserver(() => { const t = document.getElementById('toastEl'); if (t && t.innerText) window.__t.push(t.innerText) }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true }) })
  await click(p, T('lw-tab-balances')); await settle(p, 600)
  const B = T('bal-PL-bane')
  m.label = await p.locator(B).getAttribute('aria-label'); m.start = await p.locator(B).inputValue()
  await p.locator(B).click(); await p.keyboard.press('Control+A'); await p.keyboard.type('7'); await pic(w, 'typed-7')
  /* no blur: the tab is pressed by a script click, as an iPhone's tap leaves the box focused */
  await p.locator(T('lw-tab-grid')).evaluate(e => e.click()); await settle(p, 600); await pic(w, 'grid-tab')
  m.toastsAfterGood = await p.evaluate(() => window.__t.length)
  await click(p, T('lw-tab-balances')); await settle(p, 600)
  m.savedGood = await p.locator(B).inputValue(); await pic(w, 'reopened')
  await p.locator(B).click(); await p.keyboard.press('Control+A'); await p.keyboard.type('99.3')
  await p.locator(T('lw-tab-grid')).evaluate(e => e.click()); await settle(p, 500); await pic(w, 'refused-toast')
  m.toasts = await p.evaluate(() => [...new Set(window.__t)])
  await click(p, T('lw-tab-balances')); await settle(p, 600)
  m.afterRefused = await p.locator(B).inputValue()
  rec('L8', kind, m.start !== '7' && m.savedGood === '7' && m.toastsAfterGood === 0 && m.toasts.length === 1 && m.toasts[0].startsWith(m.label + ' not saved:') && m.afterRefused === '7', m)
  await finish(w)
})

/* L9 phone: two fingers pinch the grid; the zoom changes and the names column stays at the left edge */
scenario('L9', 'phone', async kind => {
  const w = await world(kind, { path: 'leavewar' }); const p = w.p, m = {}
  const cdp = await w.ctx.newCDPSession(p)
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x: Math.round(x), y: Math.round(y), id: i + 1 })) })
  const read = () => p.evaluate(() => {
    const q = s => document.querySelector(s), wrap = q('#page-leavewar .mx-wrap'), tbl = q('#page-leavewar .mx-wrap > table.mx')
    const corner = q('#page-leavewar .mx-wrap > table.mx > tbody.mxhead th.who'), band = q('#page-leavewar [data-testid="frozen-cols"]')
    const wr = wrap.getBoundingClientRect(), cr = corner.getBoundingClientRect(), bandR = band && getComputedStyle(band).visibility !== 'hidden' ? band.getBoundingClientRect() : null
    return { zoom: parseFloat(tbl.style.zoom || '1'), transformed: !!tbl.style.transform, cornerOff: Math.round((cr.left - wr.left) * 10) / 10, bandOff: bandR ? Math.round((bandR.left - wr.left) * 10) / 10 : null, scrollLeft: Math.round(wrap.scrollLeft) }
  })
  const pinch = async (name, cx, cy, d0, d1) => {
    const at = i => { const d = d0 + (d1 - d0) * i / 10, dy = i * 3; return [[cx - d / 2, cy + dy], [cx + d / 2, cy + dy * 1.3]] }
    await touch('touchStart', [at(0)[0]]); await p.waitForTimeout(30)
    await touch('touchStart', at(0)); await p.waitForTimeout(30)
    for (let i = 1; i <= 10; i++) { await touch('touchMove', at(i)); await p.waitForTimeout(20) }
    await p.waitForTimeout(120)
    const mid = await read(); await pic(w, name + '-mid')
    await touch('touchEnd', []); await p.waitForTimeout(90); await pic(w, name + '-lift-tap'); await p.waitForTimeout(700)
    const after = await read(); await pic(w, name + '-lift')
    return { mid, after }
  }
  await settle(p, 1500)
  m.start = await read()
  const out = await pinch('pinch-out', 200, 420, 100, 230); m.out = out
  const inn = await pinch('pinch-in', 200, 420, 230, 90); m.in = inn
  const okOut = out.after.zoom > m.start.zoom && Math.abs(out.after.cornerOff) < 1.5 && Math.abs(out.mid.cornerOff) < 1.5 && (out.after.bandOff === null || Math.abs(out.after.bandOff) < 1.5)
  const okIn = inn.after.zoom < out.after.zoom && Math.abs(inn.after.cornerOff) < 1.5 && (inn.after.bandOff === null || Math.abs(inn.after.bandOff) < 1.5)
  rec('L9', kind, okOut && okIn, m)
  await finish(w)
})

/* ================================================================ SCHEDULER ================================================================ */
/* S1 leave the Tracker and come back: the same chart node, the same balls; the Leave War grid's scroll kept */
scenario('S1', 'desktop', async kind => {
  const w = await world(kind, { path: 'tracker' }); const p = w.p, m = {}
  await p.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await settle(p, 600)
  await p.evaluate(() => { document.getElementById('flowSvg').dataset.keep = 'x1' })
  m.balls0 = await p.locator('#flowSvg .ball').count(); await pic(w, 'tracker-first')
  await toPage(p, 'editsched'); await pic(w, 'edit-schedule')
  await toPage(p, 'tracker'); await settle(p, 500); await pic(w, 'tracker-back')
  m.balls1 = await p.locator('#flowSvg .ball').count(); m.sameNode = await p.evaluate(() => document.getElementById('flowSvg')?.dataset.keep === 'x1')
  /* the Leave War grid's scroll position */
  await toPage(p, 'leavewar'); await settle(p, 600)
  await p.evaluate(() => { const w = document.querySelector('#page-leavewar .mx-wrap'); w.scrollLeft = 3000 }); await settle(p, 400)
  m.lwScroll1 = await p.evaluate(() => Math.round(document.querySelector('#page-leavewar .mx-wrap').scrollLeft)); await pic(w, 'lw-scrolled')
  await toPage(p, 'editsched'); await toPage(p, 'leavewar'); await settle(p, 700)
  m.lwScroll2 = await p.evaluate(() => Math.round(document.querySelector('#page-leavewar .mx-wrap').scrollLeft)); await pic(w, 'lw-back')
  rec('S1', kind, m.balls0 > 100 && m.balls0 === m.balls1 && m.sameNode && m.lwScroll1 > 2000 && m.lwScroll2 === m.lwScroll1, m)
  await finish(w)
})

/* S2 Quals: the heading row pins when scrolled to, unpins at the top, still pinned and as wide as the table after a resize */
scenario('S2', 'desktop', async kind => {
  const w = await world(kind, { path: 'quals' }); const p = w.p, m = {}
  const pinned = () => p.evaluate(() => { const e = document.querySelector('[data-testid="qsticky-head"]'); if (!e || e.offsetWidth === 0) return null; const r = e.getBoundingClientRect(); const t = document.querySelector('#page-quals table'); let wr = t && t.parentElement; while (wr && wr !== document.body && getComputedStyle(wr).overflowX === 'visible') wr = wr.parentElement; const wb = wr && wr.getBoundingClientRect(); return { top: Math.round(r.top), left: Math.round(r.left), width: Math.round(r.width), wrapLeft: wb ? Math.round(wb.left) : null, wrapWidth: wb ? Math.round(wr.clientWidth) : null } })
  m.atTop = await pinned(); await pic(w, 'top')
  await p.mouse.move(700, 500); await p.mouse.wheel(0, 700); await settle(p, 500)
  m.scrolled = await pinned(); m.scrollY1 = await p.evaluate(() => Math.round(scrollY)); await pic(w, 'scrolled')
  await p.setViewportSize({ width: 1200, height: 900 }); await settle(p, 700)
  m.afterResize = await pinned(); m.scrollY2 = await p.evaluate(() => Math.round(scrollY)); await pic(w, 'resized')
  await p.mouse.wheel(0, -3000); await settle(p, 600)
  m.backUp = await pinned(); m.scrollY3 = await p.evaluate(() => Math.round(scrollY)); await pic(w, 'back-up')
  rec('S2', kind, m.atTop === null && m.scrolled !== null && m.scrollY1 > 100 && m.afterResize !== null && Math.abs(m.afterResize.width - m.afterResize.wrapWidth) <= 2 && Math.abs(m.afterResize.left - m.afterResize.wrapLeft) <= 2 && Math.abs(m.scrolled.width - m.scrolled.wrapWidth) <= 2 && m.backUp === null && m.scrollY3 === 0, m)
  await finish(w)
})

/* S3 a floating window stays inside a narrowing screen */
scenario('S3', 'desktop', async kind => {
  const w = await world(kind, { path: 'editsched' }); const p = w.p, m = {}
  const inside = sel => p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom), vw: innerWidth, vh: innerHeight, ok: b.left >= 0 && b.top >= 0 && b.right <= innerWidth && b.bottom <= innerHeight } }, sel)
  await click(p, '#histBtn'); await p.waitForSelector('.chgwin:not([hidden])'); await settle(p, 500)
  m.opened = await inside('.chgwin:not([hidden])'); await pic(w, 'open')
  await p.setViewportSize({ width: 900, height: 600 }); await settle(p, 700); await pic(w, 'narrow')
  m.narrow = await inside('.chgwin:not([hidden])')
  await p.setViewportSize({ width: 520, height: 520 }); await settle(p, 700); await pic(w, 'narrower')
  m.narrower = await inside('.chgwin:not([hidden])')
  await p.setViewportSize({ width: 1440, height: 900 }); await settle(p, 500); await click(p, '.chgwin:not([hidden]) .win-x'); await settle(p, 300)
  /* the Board's changes window, its panel beside it */
  await click(p, '#eWeek [data-sbday="0"]'); await p.waitForSelector('#schedBoard'); await settle(p, 500)
  await click(p, '#sbHist'); await p.waitForSelector('.chgwin:not([hidden])'); await settle(p, 500)
  m.boardOpened = await inside('.chgwin:not([hidden])'); await pic(w, 'board-open')
  await p.setViewportSize({ width: 900, height: 600 }); await settle(p, 700); await pic(w, 'board-narrow')
  m.boardNarrow = await inside('.chgwin:not([hidden])'); m.boardStillThere = await count(p, '#schedBoard')
  rec('S3', kind, m.opened?.ok && m.narrow?.ok && m.narrower?.ok && m.boardOpened?.ok && m.boardNarrow?.ok && m.boardStillThere === 1, m)
  await finish(w)
})

/* S4 Inputs medical: a saved new input wears the just-added mark on its card */
scenario('S4', 'desktop', async kind => {
  const w = await world(kind, { path: 'inputs' }); const p = w.p, m = {}
  await click(p, '#inMedBtn'); await settle(p, 600)
  m.cardsBefore = await p.locator('.medcard').count(); m.freshBefore = await p.locator('.medcard.innew').count(); await pic(w, 'before')
  await click(p, '#medNew'); await p.waitForSelector('#inpEditSave'); await settle(p, 400)
  await click(p, T('inpEdCal-day-2026-07-13')); await pic(w, 'new-input')
  m.person = await p.locator('#inpEditPerson').evaluate(e => e.options[e.selectedIndex].text)
  await click(p, '#inpEditSave'); await settle(p, 700)
  if (await count(p, 'button:has-text("No document")')) { await pic(w, 'no-document-ask'); await click(p, 'button:has-text("No document")'); await settle(p, 600) }
  await pic(w, 'after-save')
  m.cardsAfter = await p.locator('.medcard').count(); m.fresh = await p.locator('.medcard.innew').count()
  m.freshText = (await p.locator('.medcard.innew').first().innerText().catch(() => '')).replace(/\s+/g, ' ').trim()
  m.freshAttr = await p.locator('.medcard.innew').first().getAttribute('data-fresh').then(v => !!v).catch(() => false)
  rec('S4', kind, m.freshBefore === 0 && m.cardsAfter === m.cardsBefore + 1 && m.fresh === 1 && m.freshAttr && /13 Jul/.test(m.freshText), m)
  await finish(w)
})

/* S5 Inputs calendar: expand, reload, still expanded */
scenario('S5', 'desktop', async kind => {
  const w = await world(kind, { path: 'inputs' }); const p = w.p, m = {}
  const st = () => p.locator(T('ib-expand')).getAttribute('aria-pressed')
  m.before = await st(); await pic(w, 'compact')
  await click(p, T('ib-expand')); m.afterPress = await st(); await pic(w, 'expanded')
  m.glyph = await text(p, T('ib-expand'))
  await p.reload(); await p.waitForSelector('#luser, #vWeek .day', { state: 'attached' })
  if (await p.locator('#luser').count()) await login(p, 'a')
  await toPage(p, 'inputs'); await settle(p, 600)
  m.afterReload = await st(); m.glyphAfterReload = await text(p, T('ib-expand')); await pic(w, 'after-reload')
  rec('S5', kind, m.before === 'false' && m.afterPress === 'true' && m.afterReload === 'true', m)
  await finish(w)
})

/* S6 Logic: change a setting, press its Reset: the keyboard is back on that row's box */
scenario('S6', 'desktop', async kind => {
  const w = await world(kind, { path: 'logic' }); const p = w.p, m = {}
  await click(p, '#lgEdit'); await settle(p, 500)
  const inp = p.locator('input[data-lgset]').first()
  m.key = await inp.getAttribute('data-lgset'); m.standard = await inp.inputValue()
  await inp.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('10h'); await p.keyboard.press('Enter'); await settle(p, 600)
  m.changed = await p.locator(`input[data-lgset="${m.key}"]`).inputValue(); await pic(w, 'changed')
  m.resets = await p.locator('.lgreset1').count()
  await p.locator('.lgreset1').first().click(); await settle(p, 700); await pic(w, 'after-reset')
  m.after = await p.locator(`input[data-lgset="${m.key}"]`).inputValue()
  m.focus = await p.evaluate(() => { const a = document.activeElement; return a.tagName.toLowerCase() + '[' + (a.dataset.lgset || '') + ']' })
  rec('S6', kind, m.changed === '10h' && m.after === m.standard && m.focus === `input[${m.key}]`, m)
  await finish(w)
})

/* S7 the Scheduler Board: opened from a place the keyboard stood, closed by Escape or ✓ Done: the keyboard goes back there */
scenario('S7', 'desktop', async kind => {
  const w = await world(kind, { path: 'editsched' }); const p = w.p, m = {}
  const act = () => p.evaluate(() => { const a = document.activeElement; return a.tagName.toLowerCase() + '|air=' + (a.dataset.air || '') })
  for (const how of ['escape', 'done']) {
    await p.locator('#eWeek [data-air]').first().focus(); m[how + 'Focus'] = await act()
    await p.locator('#eWeek [data-sbday="0"]').first().evaluate(e => e.click()); await settle(p, 700)
    m[how + 'BoardOpen'] = await p.locator('#schedBoard').isVisible(); await pic(w, how + '-board')
    if (how === 'escape') await p.keyboard.press('Escape'); else await p.locator('#sbDone').click()
    await settle(p, 700)
    m[how + 'BoardClosed'] = !(await p.locator('#schedBoard').isVisible()); m[how + 'FocusAfter'] = await act(); await pic(w, how + '-closed')
  }
  rec('S7', kind, m.escapeBoardOpen && m.escapeBoardClosed && m.escapeFocusAfter === m.escapeFocus && m.doneBoardOpen && m.doneBoardClosed && m.doneFocusAfter === m.doneFocus && /air=\d/.test(m.escapeFocus), m)
  await finish(w)
})

/* S8 phone: the menu drawer, the day templates window and the drafts / plans window open and close */
scenario('S8', 'phone', async kind => {
  const w = await world(kind, {}); const p = w.p, m = {}
  const drawerOn = () => p.evaluate(() => { const d = document.querySelector('#drawer'); if (!d) return null; const r = d.getBoundingClientRect(); return r.width > 0 && r.right > 5 && r.left < innerWidth - 5 })
  m.drawerBefore = await drawerOn()
  await tapShot(w, '#burger', 'drawer'); m.drawerOpen = await drawerOn(); await pic(w, 'drawer-open')
  await p.mouse.click(380, 420); await settle(p, 500); m.drawerClosed = !(await drawerOn()); await pic(w, 'drawer-closed')
  await toPage(p, 'editsched')
  await tapShot(w, '#eWeek [data-daytplopen="0"]', 'templates-menu')
  await tapShot(w, 'text=Manage templates', 'manage')
  m.tplWindow = await count(p, '#daytplModal'); await pic(w, 'templates-window')
  await tapShot(w, '#daytplModal button:has-text("Done")', 'tpl-done'); m.tplClosed = (await count(p, '#daytplModal')) === 0
  await tapShot(w, '#eWeek [data-planmenu="0"]', 'plans-menu'); await tapShot(w, '[data-plandup]', 'plandup')
  await tapShot(w, '#eWeek [data-planmenu="0"]', 'plans-menu2'); await tapShot(w, '[data-planmanage]', 'planmanage')
  m.dialogs = await p.evaluate(() => [...document.querySelectorAll('[role=dialog], .modal')].filter(e => e.offsetWidth > 0).map(e => e.id || e.className.toString().slice(0, 30)))
  await pic(w, 'drafts-window'); await esc(p); await pic(w, 'drafts-closed')
  m.dialogsAfter = await p.evaluate(() => [...document.querySelectorAll('[role=dialog], .modal')].filter(e => e.offsetWidth > 0).map(e => e.id || e.className.toString().slice(0, 30)))
  rec('S8', kind, m.drawerBefore === false && m.drawerOpen === true && m.drawerClosed === true && m.tplWindow === 1 && m.tplClosed && m.dialogs.length > 0 && m.dialogsAfter.length < m.dialogs.length, m)
  await finish(w)
})

/* ================================================================ TRACKER ================================================================ */
async function trk(kind, opts = {}) {
  const w = await world(kind, { path: 'tracker', ...opts })
  await w.p.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await settle(w.p, 800)
  return w
}
const ball = (p, id) => p.locator('#flowSvg .ball').filter({ hasText: id }).first()
async function pickDay(p, boxSel, iso) {
  await p.locator(boxSel).click(); await settle(p, 400)
  await p.locator(T('dcal-day-' + iso)).click(); await settle(p, 500)
}
async function closePop(p) { if (await p.locator('#pop').isVisible().catch(() => false)) { await p.locator('#pop button:has-text("Close")').click(); await settle(p, 300) } }
/** mark an event done (a grade), with the day it was done on */
async function markDone(p, id, grade, iso) {
  await ball(p, id).click(); await settle(p, 500)
  await p.locator(`#pop [data-g="${grade}"]`).click(); await settle(p, 500)
  if (iso) { await ball(p, id).click(); await settle(p, 500); await pickDay(p, '#popDoneDate', iso); await closePop(p) }
}
async function addFailure(p, id) { await ball(p, id).click(); await settle(p, 500); await p.locator('#popFailPlus').click(); await settle(p, 500); const n = await text(p, '#failCount'); await closePop(p); return n }
async function setLull(p, a, b) { await p.locator('#setLullBtn').click(); await settle(p, 500); await lullDay(p, a).click(); await settle(p, 300); await lullDay(p, b).click(); await settle(p, 600) }
/** a day cell of the lull calendar, by its number (the cells of the month shown; the greyed ends of other months are not it) */
const lullDay = (p, iso) => p.locator('.lullcal .day:not(.out)').filter({ hasText: new RegExp('^' + Number(iso.slice(8)) + '$') }).first()
async function trkSummary(p) {
  return p.evaluate(() => ({
    students: [...document.querySelectorAll('#side .c-students .chip')].map(e => e.innerText.replace(/\s+/g, ' ').trim()),
    overall: [...document.querySelectorAll('#side .card')].find(c => /OVERALL/i.test(c.innerText))?.innerText.replace(/\s+/g, ' ').slice(0, 200) ?? null,
    fails: document.getElementById('failChips')?.innerText.replace(/\s+/g, ' ').trim() ?? null,
    lulls: document.getElementById('lullChips')?.innerText.replace(/\s+/g, ' ').trim() ?? null,
    crew: document.getElementById('activeSel')?.innerText.replace(/\s+/g, ' ').trim() ?? null,
  }))
}
async function drag(p, from, dx, dy, steps = 8) {
  await p.mouse.move(from.x, from.y); await p.mouse.down()
  for (let i = 1; i <= steps; i++) await p.mouse.move(from.x + dx * i / steps, from.y + dy * i / steps)
  await p.waitForTimeout(60); await p.mouse.up(); await settle(p, 400)
}
const sideTop = p => p.evaluate(() => Math.round(document.getElementById('side').scrollTop))

/* T6 the marking pop-up on a ball: Done with a date, a failure, − takes it back */
scenario('T6', 'desktop', async kind => {
  const w = await trk(kind); const p = w.p, m = {}
  m.overall0 = (await trkSummary(p)).overall
  await markDone(p, 'ST-01', 'dco', '2026-07-08'); await pic(w, 'marked')
  await ball(p, 'ST-01').click(); await settle(p, 500)
  m.doneDate = await p.locator('#popDoneDate').getAttribute('data-value'); await pic(w, 'popup-done-date')
  m.fail0 = await text(p, '#failCount')
  await p.locator('#popFailPlus').click(); await settle(p, 500); m.fail1 = await text(p, '#failCount'); await pic(w, 'one-failure')
  m.chipAfterPlus = (await trkSummary(p)).fails
  await p.locator('#popFailMinus').click(); await settle(p, 500); m.fail2 = await text(p, '#failCount'); await pic(w, 'failure-taken-back')
  m.chipAfterMinus = (await trkSummary(p)).fails
  await closePop(p)
  m.overall1 = (await trkSummary(p)).overall
  rec('T6', kind, m.doneDate === '2026-07-08' && m.fail0 === '0' && m.fail1 === '1' && m.fail2 === '0' && /ST-01/.test(m.chipAfterPlus || '') && /none/i.test(m.chipAfterMinus || '') && m.overall0 !== m.overall1, m)
  await finish(w)
})

/* T4 the lull calendar: two days set a period; its day cells (a crop, same on both builds) */
scenario('T4', 'desktop', async kind => {
  const w = await trk(kind); const p = w.p, m = {}
  await p.locator('#setLullBtn').scrollIntoViewIfNeeded(); await p.locator('#setLullBtn').click(); await settle(p, 500)
  m.cells = await p.locator('.lullcal .day').count(); m.step1 = await text(p, '#lullStep')
  const cal = p.locator('.lullcal').first(); await cal.screenshot({ path: resolve(OUT, kind, 'T4-calendar-crop.png') }); CUR.pics.push(kind + '/T4-calendar-crop.png')
  await lullDay(p, '2026-07-06').click(); await settle(p, 400); m.step2 = await text(p, '#lullStep')
  await cal.screenshot({ path: resolve(OUT, kind, 'T4-first-picked-crop.png') }); CUR.pics.push(kind + '/T4-first-picked-crop.png')
  await lullDay(p, '2026-07-10').click(); await settle(p, 700); await pic(w, 'after-second-day')
  m.calendarOpenAfter = await p.locator('.lullcal.on').count()
  m.lull = (await trkSummary(p)).lulls
  rec('T4', kind, m.cells === 42 && /first day/i.test(m.step1 || '') && (m.lull || '').includes('06/07/26') && (m.lull || '').includes('10/07/26'), m)
  await finish(w)
})

/* T1 the Info panel's chips: a mouse drag that starts on one scrolls the panel and opens nothing; a plain click opens it */
scenario('T1', 'desktop', async kind => {
  const w = await trk(kind); const p = w.p, m = {}
  await addFailure(p, 'ST-02'); await setLull(p, '2026-07-06', '2026-07-10'); await settle(p, 400)
  const sum = await trkSummary(p); m.setup = { fails: sum.fails, lulls: sum.lulls }
  const kinds = [
    { id: 'event', loc: () => p.locator('#side .evchip').first(), opened: async () => ({ search: await p.locator('#hSearch').inputValue() }), reset: async () => { await p.locator('#hSearchClear').click(); await settle(p, 300) } },
    { id: 'failure', loc: () => p.locator('#failChips .failchip').first(), opened: async () => ({ bubble: await p.evaluate(() => { const b = document.getElementById('detailBubble'); return !!b && b.style.display !== 'none' && b.offsetWidth > 0 && /failure/.test(b.innerText) }) }), reset: async () => { await p.mouse.click(700, 500); await settle(p, 300) } },
    { id: 'lull', loc: () => p.locator('#lullChips .lullchip b').first(), opened: async () => ({ calendar: await p.locator('.lullcal.on').count() }), reset: async () => { await p.keyboard.press('Escape'); await settle(p, 400) } },
  ]
  m.rows = {}
  for (const k of kinds) {
    const r = {}
    await p.evaluate(() => { document.getElementById('side').scrollTop = 0 })
    const loc = k.loc(); await loc.scrollIntoViewIfNeeded(); await settle(p, 300)
    const c = await centre(loc)
    r.chipFound = !!c; if (!c) { m.rows[k.id] = r; continue }
    const top0 = await sideTop(p), room = await p.evaluate(() => { const s = document.getElementById('side'); return Math.round(s.scrollHeight - s.clientHeight - s.scrollTop) })
    r.roomBelow = room > 60
    const dy = room > 60 ? -60 : 60   // a drag up scrolls the half down; at the foot the drag goes the other way
    await drag(p, c, 0, dy); await pic(w, k.id + '-after-drag')
    const top1 = await sideTop(p); r.scrolled = top1 !== top0; r.delta = top1 - top0
    r.afterDrag = await k.opened()
    await k.reset()
    await p.evaluate(() => { document.getElementById('side').scrollTop = 0 })
    const loc2 = k.loc(); await loc2.scrollIntoViewIfNeeded(); await settle(p, 300)
    const c2 = await centre(loc2), topC = await sideTop(p)
    await p.mouse.move(c2.x, c2.y); await p.mouse.down(); await p.mouse.up(); await settle(p, 500); await pic(w, k.id + '-after-click')
    r.afterClick = await k.opened(); r.clickScrolled = (await sideTop(p)) !== topC
    await k.reset()
    m.rows[k.id] = r
  }
  const R = m.rows
  const dragOK = k => R[k].chipFound && R[k].scrolled
  const noOpenAfterDrag = (R.event.afterDrag?.search === '') && (R.lull.afterDrag?.calendar === 0)
  const clickOpens = R.event.afterClick?.search && R.lull.afterClick?.calendar === 1 && R.failure.afterClick?.bubble === true
  rec('T1', kind, dragOK('event') && dragOK('failure') && dragOK('lull') && noOpenAfterDrag && clickOpens && !R.event.clickScrolled && !R.lull.clickScrolled, m)
  await finish(w)
})

/* T2 a mouse drag that starts on a student's ✕ does not scroll the panel; a click asks to remove (cancelled) */
scenario('T2', 'desktop', async kind => {
  const w = await trk(kind); const p = w.p, m = {}
  const x = p.locator('[data-rm]').first()
  await x.scrollIntoViewIfNeeded(); const c = await centre(x)
  await p.evaluate(() => { document.getElementById('side').scrollTop = 0 })
  /* a spot inside the panel that DOES scroll it, to prove the panel can scroll here at all */
  const top0 = await sideTop(p)
  await drag(p, c, 0, -60); const top1 = await sideTop(p); await pic(w, 'after-drag')
  m.scrollDeltaFromX = top1 - top0; m.dialogAfterDrag = await count(p, '#dlgModal')
  await p.evaluate(() => { document.getElementById('side').scrollTop = 0 })
  const blank = await centre(p.locator('#side h3').nth(1))
  await drag(p, { x: blank.x, y: blank.y }, 0, -60); m.scrollDeltaFromBlank = (await sideTop(p)) - 0; await pic(w, 'control-drag-from-blank')
  await p.evaluate(() => { document.getElementById('side').scrollTop = 0 })
  await settle(p, 300)
  const c2 = await centre(p.locator('[data-rm]').first())
  await p.mouse.move(c2.x, c2.y); await p.mouse.down(); await p.mouse.up(); await settle(p, 500); await pic(w, 'after-click')
  m.dialog = await count(p, '#dlgModal'); m.dialogMsg = await text(p, '#dlgMsg')
  if (m.dialog) await p.locator('#dlgCancel').click(); await settle(p, 400)
  m.studentsAfterCancel = (await trkSummary(p)).students.length
  rec('T2', kind, m.scrollDeltaFromX === 0 && m.dialogAfterDrag === 0 && m.scrollDeltaFromBlank > 0 && m.dialog === 1 && /remove/i.test(m.dialogMsg || '') && m.studentsAfterCancel === 2, m)
  await finish(w)
})

/* T3 Tab from the chart: the order of the stops, recorded (EXPECTED to differ: the new build has new Tab stops) */
scenario('T3', 'desktop', async kind => {
  const w = await trk(kind); const p = w.p, m = {}
  await addFailure(p, 'ST-02'); await setLull(p, '2026-07-06', '2026-07-10')
  await p.evaluate(() => { const b = document.getElementById('board'); b.setAttribute('tabindex', b.getAttribute('tabindex') ?? '-1'); b.focus() })
  m.start = await active(p)
  const list = []
  for (let i = 0; i < 70; i++) {
    await p.keyboard.press('Tab')
    const d = await p.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return 'body'; const t = (a.innerText || a.value || a.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 18); return a.tagName.toLowerCase() + (a.id ? '#' + a.id : '') + (a.className && typeof a.className === 'string' ? '.' + a.className.split(' ')[0] : '') + (t ? '(' + t + ')' : '') })
    list.push(d)
    if (d === 'body') break
  }
  m.list = list; m.stops = list.length
  await pic(w, 'last-stop')
  rec('T3', kind, 'INFO', m, { expect: 'differs' })
  await finish(w)
})

/* T5 + Add: pick a man from the roster, OK -> added; + Add again opens with its own default (empty search) */
scenario('T5', 'desktop', async kind => {
  const w = await trk(kind); const p = w.p, m = {}
  m.studentsBefore = (await trkSummary(p)).students.length
  await p.locator('#addStu').click(); await p.waitForSelector('#dlgModal'); await settle(p, 400)
  m.filter0 = await p.locator('#dlgFilter').inputValue(); await pic(w, 'add-open')
  await p.locator('#dlgFilter').fill('Tal'); await settle(p, 300)
  m.items = await p.locator('.dlg-item').count(); await pic(w, 'filtered')
  await p.locator('.dlg-item').first().click(); await settle(p, 700); await pic(w, 'picked-and-added')
  m.dialogAfterPick = await count(p, '#dlgModal')
  const sum = await trkSummary(p); m.studentsAfter = sum.students.length; m.students = sum.students
  await p.locator('#addStu').click(); await p.waitForSelector('#dlgModal'); await settle(p, 400)
  m.filterSecond = await p.locator('#dlgFilter').inputValue(); m.itemsSecond = await p.locator('.dlg-item').count(); await pic(w, 'add-again')
  m.dateSecond = await text(p, '#dlgDate'); m.focusSecond = await active(p)
  await p.locator('#dlgFilter').fill('Zed Test'); await settle(p, 300); await pic(w, 'free-text')
  await p.locator('#dlgOk').click(); await settle(p, 700); await pic(w, 'free-text-added')
  m.dialogClosed = (await count(p, '#dlgModal')) === 0
  m.studentsFree = (await trkSummary(p)).students
  /* prompts back to back: rename pencil then cancel, then + Add again */
  await p.locator('.c-students .ren').first().click(); await p.waitForSelector('#dlgModal'); await settle(p, 400)
  m.promptInput = await p.locator('#dlgInput').inputValue().catch(() => null); await pic(w, 'rename-prompt')
  await p.keyboard.press('Escape'); await settle(p, 400)
  await p.locator('#addStu').click(); await p.waitForSelector('#dlgModal'); await settle(p, 400)
  m.filterThird = await p.locator('#dlgFilter').inputValue(); await p.locator('#dlgCancel').click(); await settle(p, 300)
  rec('T5', kind, m.dialogAfterPick === 0 && m.studentsAfter === m.studentsBefore + 1 && m.studentsFree.length === m.studentsBefore + 2 && m.filter0 === '' && m.filterSecond === '' && m.itemsSecond > 1 && m.dialogClosed && m.filterThird === '', m)
  await finish(w)
})

/* T7 Info panel captions: pressing the caption of a date box does nothing */
scenario('T7', 'desktop', async kind => {
  const w = await trk(kind); const p = w.p, m = {}
  for (const [name, re] of [['lastFlown', /^Last Flown/i], ['courseStart', /^Course start/i]]) {
    const cap = p.locator('#side').getByText(re).first()
    const n = await cap.count(); const c = n ? await centre(cap) : null
    if (!c) { m[name] = { found: false }; continue }
    await cap.scrollIntoViewIfNeeded()
    const cc = await centre(cap)
    await p.mouse.click(cc.x, cc.y); await settle(p, 500); await pic(w, name)
    m[name] = { found: true, tag: await cap.evaluate(e => e.tagName.toLowerCase()), calendar: await p.locator(T('dcal-card')).count(), focus: await active(p) }
    if (m[name].calendar) await esc(p)
  }
  rec('T7', kind, m.lastFlown.found && m.courseStart.found && m.lastFlown.calendar === 0 && m.courseStart.calendar === 0, m, { volatile: ['tag'], note: 'the caption is a label on the BEFORE build and a span on the AFTER build (intended); its tag is kept out of the comparison' })
  await finish(w)
})

/* T8 the ball editor: a caption click puts the cursor in its field (NEW on the new build; recorded, expected to differ) */
scenario('T8', 'desktop', async kind => {
  const w = await trk(kind); const p = w.p, m = {}
  await click(p, '#sylMenuBtn'); await p.locator('#sylMenuPanel >> text=Edit chart layout').click(); await settle(p, 800)
  await ball(p, 'ST-01').dblclick(); await p.waitForSelector('#editModal'); await settle(p, 500); await pic(w, 'editor')
  m.captions = await p.locator('#editModal .field > label, #editModal .field > span').evaluateAll(es => es.map(e => e.tagName.toLowerCase() + ':' + e.innerText.trim()).filter(s => s.length > 5))
  m.focusOnOpen = await active(p)
  for (const [cap, id] of [['Number (badge)', 'edNum'], ['Crew', 'edCrew'], ['Text', 'edText']]) {
    await p.locator('#edType').focus()
    await p.locator('#editModal .field').filter({ hasText: new RegExp('^' + cap.replace(/[()]/g, '\\$&')) }).first().locator('label, span').first().click(); await settle(p, 300)
    m['focusAfterCaption:' + cap] = await active(p)
  }
  await pic(w, 'after-captions')
  rec('T8', kind, 'INFO', m, { expect: 'differs' })
  await finish(w)
})

/* T9 Legend and the flex settings: open, Escape closes, a click on the backdrop closes */
scenario('T9', 'desktop', async kind => {
  const w = await trk(kind); const p = w.p, m = {}
  const legendOn = () => p.evaluate(() => { const e = document.getElementById('trkLegend'); return !!e && e.offsetWidth > 0 })
  m.legendBefore = await legendOn()
  await click(p, '#legendBtn'); m.legendOpen = await legendOn(); await pic(w, 'legend-open')
  await p.keyboard.press('Escape'); await settle(p, 400); m.legendEsc = !(await legendOn())
  await click(p, '#legendBtn'); m.legendOpen2 = await legendOn()
  await p.mouse.click(40, 500); await settle(p, 450); m.legendBackdrop = !(await legendOn()); await pic(w, 'legend-after-backdrop')
  const flexOn = () => p.evaluate(() => { const e = document.getElementById('trkFlexWin'); return !!e && e.offsetWidth > 0 })
  m.flexBefore = await flexOn()
  await click(p, '#flexBtn'); m.flexOpen = await flexOn(); m.flexFocus = await active(p); await pic(w, 'flex-open')
  await p.keyboard.press('Escape'); await settle(p, 400); m.flexEsc = !(await flexOn())
  await click(p, '#flexBtn'); m.flexOpen2 = await flexOn()
  await p.mouse.click(40, 500); await settle(p, 450); m.flexBackdrop = !(await flexOn()); await pic(w, 'flex-after-backdrop')
  rec('T9', kind, m.legendBefore === false && m.legendOpen && m.legendEsc && m.legendOpen2 && m.legendBackdrop && m.flexBefore === false && m.flexOpen && m.flexEsc && m.flexOpen2 && m.flexBackdrop, m)
  await finish(w)
})

/* ---- T10 STORAGE CARRY-OVER ---- */
let lastExportNote = null, lastExportFile = null
async function exportJson(w, name) {
  const p = w.p
  await p.locator('#fileMenuBtn').click(); await settle(p, 400)
  await p.locator('button:has-text("Export…")').first().click(); await settle(p, 600)
  const modal = p.locator('[role=dialog], .modal').filter({ hasText: 'Students & courses' }).first()
  const stu = modal.getByText('Students & courses')
  if (!(await modal.locator('input[type=checkbox]').nth(1).isChecked())) await stu.click()
  await modal.getByRole('button', { name: 'All', exact: true }).click(); await settle(p, 300)
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 10000 }), modal.getByRole('button', { name: 'Export', exact: true }).click()])
  const f = resolve(FILES, name + '.json'); await dl.saveAs(f); await settle(p, 600)
  /* the app answers an export with a note that must be pressed away (its words are part of what is compared) */
  lastExportNote = null
  if (await p.locator('#dlgModal').isVisible().catch(() => false)) { lastExportNote = ((await p.locator('#dlgMsg').innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim(); await p.locator('#dlgOk').click(); await settle(p, 400) }
  lastExportFile = dl.suggestedFilename()
  return JSON.parse(readFileSync(f, 'utf8'))
}
function diffPaths(a, b, path = '', out = []) {
  if (JSON.stringify(a) === JSON.stringify(b)) return out
  if (a && b && typeof a === 'object' && typeof b === 'object' && Array.isArray(a) === Array.isArray(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    for (const k of keys) diffPaths(a[k], b[k], path + '/' + k, out)
  } else out.push({ path, a: typeof a === 'string' ? a.slice(0, 60) : a, b: typeof b === 'string' ? b.slice(0, 60) : b })
  return out
}
const trkKeys = s => (s.origins?.[0]?.localStorage || []).filter(e => /tracker|ocu/i.test(e.name))
/** the real work, through the controls */
async function doTrackerWork(w) {
  const p = w.p
  await p.locator('#addStu').click(); await p.waitForSelector('#dlgModal'); await settle(p, 300)
  await p.locator('#dlgFilter').fill('Tal'); await settle(p, 300); await p.locator('.dlg-item').first().click(); await settle(p, 800)
  await markDone(p, 'ST-01', 'dco', '2026-07-08')
  await markDone(p, 'ACG-01', 'dpco', '2026-07-09')
  m_failure = await addFailure(p, 'ST-02')
  await ball(p, 'ST-01').click(); await settle(p, 500); await p.locator('#popEditInfo').click(); await p.waitForSelector('#infoModal'); await settle(p, 300)
  await p.locator('#ifName').fill('Walk welcome detail'); await p.locator('#ifHrs').fill('2.5 Hrs'); await p.locator('#ifSave').click(); await settle(p, 800)
  await closePop(p)
  await setLull(p, '2026-07-06', '2026-07-10')
  await settle(p, 800)
}
let m_failure = null
async function uiSummary(w) {
  const p = w.p
  const s = await trkSummary(p)
  await ball(p, 'ST-01').click(); await settle(p, 500)
  const detail = await p.locator('#popInfo').innerText().then(t => t.replace(/\s+/g, ' ').trim()).catch(() => null)
  const doneDate = await p.locator('#popDoneDate').getAttribute('data-value').catch(() => null)
  await closePop(p)
  await ball(p, 'ACG-01').click(); await settle(p, 500)
  const doneDate2 = await p.locator('#popDoneDate').getAttribute('data-value').catch(() => null)
  await closePop(p)
  return { ...s, detail, doneDate, doneDate2 }
}
scenario('T10', 'desktop', async kind => {
  const m = {}
  const stateFile = resolve(FILES, 'state.json'), beforeState = resolve(BH, label.startsWith('before') ? label : 'before', 'files', 'state.json')
  const beforeUi = resolve(BH, 'before', 'files', 'ui.json'), beforeExp = resolve(BH, 'before', 'files', 'export1.json')
  if (label.startsWith('before')) {
    const w = await trk(kind); const p = w.p
    await doTrackerWork(w); await pic(w, 'after-work')
    m.work = await uiSummary(w); writeFileSync(resolve(FILES, 'ui.json'), JSON.stringify(m.work, null, 1))
    const exp1 = await exportJson(w, 'export1'); m.export1Keys = Object.keys(exp1); m.exportNote = lastExportNote; m.exportFile = lastExportFile
    await p.waitForTimeout(500)
    await w.ctx.storageState({ path: stateFile, indexedDB: true })
    await finish(w)
    m.stateKeys = trkKeys(JSON.parse(readFileSync(stateFile, 'utf8'))).length
    /* the control: THIS build reopened on its own saved storage (shows what an export differs by from a reload alone) */
    const w2 = await world(kind, { path: 'tracker', storageState: stateFile }); const p2 = w2.p
    await p2.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await settle(p2, 800); await pic(w2, 'reopened-same-build')
    m.reopened = await uiSummary(w2)
    const exp1b = await exportJson(w2, 'export1b')
    await p2.reload(); await p2.waitForSelector('#luser, #vWeek .day', { state: 'attached' }); if (await p2.locator('#luser').count()) await login(p2, 'a'); await toPage(p2, 'tracker'); await p2.waitForSelector('#flowSvg .ball'); await settle(p2, 800)
    const exp1c = await exportJson(w2, 'export1c')
    m.controlDiff_1_vs_1b = diffPaths(exp1, exp1b); m.controlDiff_1b_vs_1c = diffPaths(exp1b, exp1c)
    m.uiSame = JSON.stringify(m.work) === JSON.stringify(m.reopened)
    await finish(w2)
    rec('T10', kind, m.uiSame && !!m.work.detail && /Walk welcome detail/.test(m.work.detail) && m.work.students.length === 3 && m.work.doneDate === '2026-07-08' && m.work.doneDate2 === '2026-07-09' && /ST-02/.test(m.work.fails) && m.work.lulls.includes('06/07/26'), { ui: m.work, exportNote: m.exportNote, exportFile: m.exportFile, detail: m }, { volatile: ['detail'] })
  } else {
    if (!existsSync(beforeState)) { rec('T10', kind, 'NW', { error: 'run the BEFORE build first (its saved storage is missing)' }); return }
    const exp1 = JSON.parse(readFileSync(beforeExp, 'utf8')), ui1 = JSON.parse(readFileSync(beforeUi, 'utf8'))
    const stBefore = JSON.parse(readFileSync(beforeState, 'utf8'))
    /* 1. THIS build opened on the BEFORE build's saved storage */
    const w = await world(kind, { path: 'tracker', storageState: beforeState }); const p = w.p
    await p.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await settle(p, 800); await pic(w, 'carried-over')
    console.log('   T10: carried-over world is up'); m.carried = await uiSummary(w); console.log('   T10: carried summary read'); m.carriedSameUi = JSON.stringify(m.carried) === JSON.stringify(ui1)
    const exp2 = await exportJson(w, 'export2'); m.exportNote = lastExportNote; m.exportFile = lastExportFile
    m.diff_export1_vs_export2 = diffPaths(exp1, exp2)
    /* the storage this build wrote while only looking: the Tracker's keys against what it was handed */
    await p.waitForTimeout(500)
    const stNow = await w.ctx.storageState({ indexedDB: true })
    const A = new Map(trkKeys(stBefore).map(e => [e.name, e.value])), B2 = new Map(trkKeys(stNow).map(e => [e.name, e.value]))
    m.trackerKeysBefore = A.size; m.trackerKeysAfter = B2.size
    m.trackerKeysChanged = [...new Set([...A.keys(), ...B2.keys()])].filter(k => A.get(k) !== B2.get(k)).sort()
    /* 2. reload this build and export a third time */
    await p.reload(); await p.waitForSelector('#luser, #vWeek .day', { state: 'attached' }); if (await p.locator('#luser').count()) await login(p, 'a'); await toPage(p, 'tracker'); await p.waitForSelector('#flowSvg .ball'); await settle(p, 800)
    console.log('   T10: reloaded'); await pic(w, 'reloaded'); const exp3 = await exportJson(w, 'export3')
    m.diff_export2_vs_export3 = diffPaths(exp2, exp3)
    m.reloadedSameUi = JSON.stringify(await uiSummary(w)) === JSON.stringify(ui1)
    await finish(w)
    /* 3. the same work done afresh on THIS build: its export against the BEFORE build's */
    const wf = await trk(kind); await doTrackerWork(wf); await pic(wf, 'fresh-work')
    m.fresh = await uiSummary(wf); m.freshSameUi = JSON.stringify(m.fresh) === JSON.stringify(ui1)
    const exp4 = await exportJson(wf, 'export4-fresh')
    m.diff_export1_vs_fresh = diffPaths(exp1, exp4)
    await finish(wf)
    const only = d => d.map(x => x.path)
    rec('T10', kind, m.carriedSameUi && m.reloadedSameUi && m.freshSameUi && m.diff_export1_vs_export2.length === 0 && m.diff_export2_vs_export3.length === 0 && m.trackerKeysChanged.length === 0, { ui: m.carried, exportNote: m.exportNote, exportFile: m.exportFile, detail: m }, { volatile: ['detail'] })
  }
})

/* ===================== run ===================== */
const wanted = s => !only.length || mine(s.id)
for (const s of SCEN) {
  if (!wanted(s)) continue
  CUR = { id: s.id, pics: [] }
  const t0 = Date.now()
  try { await s.fn(s.kind) } catch (e) {
    const msg = String(e.message).replace(/\u001b\[[0-9;]*m/g, '').split('\n').filter(l => l.trim()).slice(0, 14).join(' | ').slice(0, 1800)
    rec(s.id, s.kind, 'NW', { error: msg })
  }
  console.log(`   (${s.id} ${s.kind}: ${Math.round((Date.now() - t0) / 1000)}s)`)
}
await browser.close()
rows.sort((a, b) => (a.id + a.size).localeCompare(b.id + b.size, 'en', { numeric: true }))
writeFileSync(RESF, JSON.stringify({ label, dist, errors: ERRS, rows }, null, 1))
console.log(`done: ${rows.length} rows, PASS ${rows.filter(r => r.status === 'PASS').length}, FAIL ${rows.filter(r => r.status === 'FAIL').length}, NOT WALKED ${rows.filter(r => r.status === 'NOT WALKED').length}, INFO ${rows.filter(r => r.status === 'INFO').length} -> ${RESF}`)
console.log('console/page errors: ' + ERRS.length)
