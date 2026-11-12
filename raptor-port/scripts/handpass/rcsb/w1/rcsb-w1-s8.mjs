/* rcsb-w1-s8 v1 — S8 the plain-user round: every opener and closer on Logic, the board's OIL Earn, the Leave War's windows, View-only Sched.
   usage (from raptor-port/): node scripts/handpass/rcsb/w1/rcsb-w1-s8.mjs [pc|phone] */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { rmSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
const WORLD = process.argv[2] === 'phone' ? 'phone' : 'pc'
process.env.HP_URL ||= 'http://localhost:4193'
process.env.HP_SHOTS ||= resolve(HERE, '../../../../docs/img/handpass/2026-11-13-rules-check-small-batch/w1/s8-' + WORLD)
rmSync(process.env.HP_SHOTS, { recursive: true, force: true })
console.log('rcsb-w1-s8 v1', WORLD, process.env.HP_SHOTS)
const C = await import('./rcsb-w1-common.mjs')
const { R, X, L, sleep, j, W4 } = C
const w = await R.world(WORLD)
const { page } = w
const SAT = 5, SUN = 6, ISO = X.ISO[SAT], ISOSUN = X.ISO[SUN]
const ranger = w.ID('Ranger')
const tp = async loc => { if (w.phone) await loc.tap(); else await loc.click() }
const log = (k, v) => console.log('S8 ' + k + ' | ' + (typeof v === 'string' ? v : j(v)))
const step = async (name, fn) => { try { const r = await fn(); log(name, r === undefined ? 'done' : r); return r } catch (e) { log(name + ' ERROR', String(e.message).slice(0, 300)); return null } }
const lwState = () => page.evaluate(() => {
  const vis = id => [...document.querySelectorAll(`[data-testid="${id}"]`)].some(e => e.offsetWidth)
  const tab = ['grid', 'balances', 'requests', 'approvals'].map(t => { const e = document.querySelector(`[data-testid="lw-tab-${t}"]`); return e && e.offsetWidth ? t + (e.getAttribute('aria-selected') === 'true' || /active|on|sel/.test(String(e.className)) ? '*' : '') : null }).filter(Boolean)
  const title = (document.querySelector('[data-testid="bid-picker"] .bidsheet-hd, [data-testid="bid-picker"]') || document.querySelector('[data-testid="daylist-sheet"]') || { innerText: '' }).innerText.replace(/\s+/g, ' ').trim().slice(0, 90)
  return { person: vis('pw-close'), tracker: vis('oil-close') || vis('oil-tracker-panel'), bid: vis('bid-picker'), daylist: vis('daylist-sheet'), scrim: vis('sheet-scrim'), balancesRows: vis('bal-row-' + (window.__rg || '')) , tabs: tab.join(' '), title }
})
const lwStateNamed = async () => { const s = await lwState(); const t = await page.evaluate(() => { const b = document.querySelector('[data-testid="lw-tab-balances"]'); const g = document.querySelector('[data-testid="lw-tab-grid"]'); const sel = e => e ? (e.getAttribute('aria-selected') || e.getAttribute('aria-pressed') || e.getAttribute('data-active') || String(e.className).slice(0, 40)) : '-'; const grid = !!document.querySelector('[data-testid^="cell-"]'); const bal = !!document.querySelector('[data-testid^="bal-oil-"]'); return { gridDrawn: grid, balancesDrawn: bal, gTab: sel(g), bTab: sel(b) } }); return { ...s, ...t } }

const closeAll = async () => {
  for (let i = 0; i < 3; i++) {
    const x = page.locator('[data-testid="pw-close"]:visible, [data-testid="oil-close"]:visible, [data-testid="bid-cancel"]:visible, [data-testid="daylist-close"]:visible').first()
    if (await x.count()) { await tp(x); await sleep(400) } else break
  }
  for (let i = 0; i < 2 && await page.locator('[data-testid="sheet-scrim"]:visible').count(); i++) { await page.keyboard.press('Escape'); await sleep(300) }
}
const gridTab = async () => { const g = page.locator('[data-testid="lw-tab-grid"]:visible').first(); if (await g.count()) { await tp(g); await sleep(700) } }
const overlays = () => page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => e.offsetWidth && getComputedStyle(e).position === 'fixed' && !/topbar|hamb/.test(String(e.className)) && e.innerText && e.innerText.length > 8 && e.innerText.length < 900).map(e => (e.getAttribute('data-testid') || String(e.className).slice(0, 25)) + ' :: ' + e.innerText.replace(/\s+/g, ' ').trim().slice(0, 260)).slice(0, 6))

// ---- the world: Ranger flies Sat 10:00-10:30 (HO*) and Sun 10:00-11:30 (FO*), both published
await step('build Sat', async () => { const r = await C.build(w, SAT, '10:00', '10:30', ranger); await C.publish(w, SAT); return r })
await step('build Sun', async () => { const r = await C.build(w, SUN, '10:00', '11:30', ranger); await C.publish(w, SUN); return r })

// ---- 1. Logic: ✎ Edit and Done; "abc"; Undo / Redo of a Logic change
await step('logic open', async () => { await L.go(page, 'logic'); await sleep(700); await R.shot(page, 'a01-logic-closed'); return { edit: await page.locator('#lgEdit:visible').count(), done: await page.locator('#lgDone:visible').count() } })
await step('logic press Edit', async () => { await X.press(w, '#lgEdit', { scope: 'page' }); await sleep(600); await R.shot(page, 'a02-logic-edit-open'); return { inputs: await page.locator('#lgBody input[data-lgset]:visible').count(), done: await page.locator('#lgDone:visible').count(), edit: await page.locator('#lgEdit:visible').count() } })
await step('abc typed in Full day of OIL', async () => {
  const inp = page.locator('#lgBody input[data-lgset="oilFullMin"]').first()
  await inp.scrollIntoViewIfNeeded()
  const before = await inp.inputValue()
  await tp(inp); await inp.fill('abc'); await R.shot(page, 'a03-abc-typed')
  await inp.press('Tab'); await sleep(500)
  const afterTab = await inp.inputValue()
  const note1 = await page.evaluate(() => [...document.querySelectorAll('#lgBody .lgnote, #lgBody .lgerr, #lgBody [role=alert], #toast, .toast, .note')].filter(e => e.offsetWidth).map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 4))
  await R.shot(page, 'a04-abc-after-tabaway')
  // tap away to a plain spot, then tap the box again
  await page.mouse.click(w.phone ? 200 : 900, w.phone ? 120 : 140); await sleep(400)
  await tp(inp); await sleep(400)
  const again = await inp.inputValue()
  await R.shot(page, 'a05-abc-box-tapped-again')
  const vconf = await page.evaluate(() => window.VCONF.oilFullMin)
  await inp.press('Tab'); await sleep(300)
  return { before, typed: 'abc', afterTab, note1, valueWhenTappedAgain: again, vconfOilFullMin: vconf }
})
await step('logic press Done', async () => { await X.press(w, '#lgDone', { scope: 'page' }); await sleep(600); await R.shot(page, 'a06-logic-done'); return { inputsVisible: await page.locator('#lgBody input[data-lgset]:visible').count(), edit: await page.locator('#lgEdit:visible').count() } })
await step('Logic change then top-bar Undo', async () => {
  const lg = await R.setLogic(w, 'oilFullMin', '5h', 'a07-logic-5h')
  const ub = await page.locator('#undoBtn:visible').count()
  const rb = await page.locator('#redoBtn:visible').count()
  const dis = await page.evaluate(() => ({ u: (document.querySelector('#undoBtn') || {}).disabled, r: (document.querySelector('#redoBtn') || {}).disabled }))
  let u = null, v1 = null
  if (ub) { u = await X.undoBtn(w, 'undo'); await sleep(500); v1 = await page.evaluate(() => window.VCONF.oilFullMin); await R.shot(page, 'a08-after-undo') }
  const t1 = await L.takeToasts(page)
  let r = null, v2 = null
  if (rb) { r = await X.undoBtn(w, 'redo'); await sleep(500); v2 = await page.evaluate(() => window.VCONF.oilFullMin); await R.shot(page, 'a09-after-redo') }
  const t2 = await L.takeToasts(page)
  return { setTo: lg.after, appValue: lg.vconf, undoButtons: { undo: ub, redo: rb, disabled: dis }, afterUndoVconf: v1, undoResult: u, toastUndo: t1, afterRedoVconf: v2, redoResult: r, toastRedo: t2 }
})
await step('reset to standard', async () => { await L.go(page, 'logic'); await sleep(500); if (!(await page.locator('#lgBody input[data-lgset]:visible').count())) { await X.press(w, '#lgEdit', { scope: 'page' }); await sleep(400) } const b = page.getByRole('button', { name: /Reset (to standard|all)/i }).first(); if (await b.count()) { await tp(b); await sleep(600) } if (await page.locator('#lgDone:visible').count()) { await X.press(w, '#lgDone', { scope: 'page' }); await sleep(500) } return { vconf: await page.evaluate(() => window.VCONF.oilFullMin) } })

// ---- 2. the board: OIL Earn on and off, ✓ Done
await step('board OIL Earn on / off / Done', async () => {
  await L.board(page, SAT); await sleep(500)
  await R.shot(page, 'b01-board-open')
  const sel = '#schedBoard #sbOil:visible, #schedBoard [data-oilmode]:visible'
  const b = page.locator(sel).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  const lbl0 = await b.innerText()
  await tp(b); await sleep(800); await R.shot(page, 'b02-oil-earn-on')
  const on = await page.evaluate(() => { const e = document.querySelector('#sbOil'); return e ? { text: e.innerText.replace(/\s+/g, ' ').trim(), cls: String(e.className).slice(0, 60), pressed: e.getAttribute('aria-pressed') } : null })
  await tp(b); await sleep(800); await R.shot(page, 'b03-oil-earn-off')
  const off = await page.evaluate(() => { const e = document.querySelector('#sbOil'); return e ? { text: e.innerText.replace(/\s+/g, ' ').trim(), cls: String(e.className).slice(0, 60), pressed: e.getAttribute('aria-pressed') } : null })
  const doneBtn = await page.locator('#sbDone:visible').count()
  await L.closeBoard(page); await sleep(600)
  await R.shot(page, 'b04-after-done')
  return { label: lbl0, on, off, doneButton: doneBtn, boardGone: (await page.locator('#schedBoard:visible').count()) === 0 }
})

// ---- 3. the Leave War
const closeWays = async (name, openFn, isOpenFn, picTag) => {
  const out = {}
  for (const way of ['X', 'Escape', 'Outside']) {
    await openFn(); await sleep(500)
    out[way + '-opened'] = await isOpenFn()
    if (way === 'X') await R.shot(page, picTag + '-open')
    if (way === 'X') { const x = page.locator('[data-testid="pw-close"]:visible, [data-testid="oil-close"]:visible').first(); if (await x.count()) await tp(x); else out.noX = true }
    if (way === 'Escape') { await page.keyboard.press('Escape') }
    if (way === 'Outside') { await page.mouse.click(w.phone ? 20 : 12, w.phone ? 200 : 300) }
    await sleep(600)
    out[way + '-closed'] = !(await isOpenFn())
    await R.shot(page, `${picTag}-after-${way}`)
    // clean up whatever stayed
    if (await isOpenFn()) await closeAll()
  }
  return out
}
await step('LW open', async () => { await W4.lwOpen(page, ISO); await R.shot(page, 'c01-lw-grid'); return await lwStateNamed() })
await step('LW person window: close by X / Escape / outside', () => closeWays('person', async () => { await W4.lwOpen(page, ISO); const p = page.locator(`[data-testid="person-${ranger}"]:visible`).first(); await p.scrollIntoViewIfNeeded(); await tp(p) }, async () => (await lwState()).person, 'c02-person'))
await step('LW tracker from his OIL figure: close ways', () => closeWays('tracker', async () => {
  await W4.lwOpen(page, ISO); const p = page.locator(`[data-testid="person-${ranger}"]:visible`).first(); await p.scrollIntoViewIfNeeded(); await tp(p); await sleep(500)
  const f = page.locator('[data-testid="pw-oil"]:visible').first(); await tp(f); await sleep(900)
}, async () => (await lwState()).tracker, 'c03-tracker'))
await step('state after tracker from person window', async () => { await closeAll(); return await lwStateNamed() })
await step('Balances OIL figure and back', async () => {
  await W4.lwOpen(page, ISO)
  await tp(page.locator('[data-testid="lw-tab-balances"]').first()); await sleep(900)
  await page.evaluate(id => { window.__rg = id }, ranger)
  const row = page.locator(`[data-testid="bal-row-${ranger}"]`).first(); if (await row.count()) { await row.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300) }
  const before = await lwStateNamed()
  await R.shot(page, 'c04-balances-as-left')
  const fig = page.locator(`[data-testid="bal-oil-${ranger}"]`).first()
  const figText = (await fig.count()) ? (await fig.innerText()).replace(/\s+/g, ' ').trim() : 'NO FIGURE'
  if (await fig.count()) await tp(fig); await sleep(1000)
  const trk = await lwState()
  await R.shot(page, 'c05-balances-tracker-open')
  const x = page.locator('[data-testid="oil-close"]:visible').first()
  if (await x.count()) await tp(x); else { await page.keyboard.press('Escape') }
  await sleep(800)
  const after = await lwStateNamed()
  await R.shot(page, 'c06-balances-after-tracker-closed')
  const rowBack = await page.locator(`[data-testid="bal-row-${ranger}"]`).count()
  return { figText, trackerOpened: trk.tracker, before: { tabs: before.tabs, grid: before.gridDrawn, bal: before.balancesDrawn }, after: { tabs: after.tabs, grid: after.gridDrawn, bal: after.balancesDrawn, tracker: after.tracker }, ranger_row_visible_again: rowBack }
})
const tapBox = async (iso, tag, label) => {
  await gridTab(); await W4.lwOpen(page, iso)
  const cell = await W4.lwCell(page, ranger, iso)
  await W4.lwShot(page, tag + '-grid', ranger, iso)
  const t = await W4.lwTap(page, ranger, iso)
  const win = await page.evaluate(() => { const hd = document.querySelector('[data-testid="daylist-sheet"] h1,[data-testid="daylist-sheet"] h2,[data-testid="daylist-sheet"] h3,[data-testid="daylist-sheet"] .hd, [data-testid="daylist-sheet"] header'); const s = document.querySelector('[data-testid="daylist-sheet"]') || document.querySelector('[data-testid="bid-picker"]'); return { title: hd ? hd.innerText.replace(/\s+/g, ' ').trim() : '(no heading element)', text: s ? s.innerText.replace(/\s+/g, ' ').trim().slice(0, 400) : '(no window)', kind: document.querySelector('[data-testid="daylist-sheet"]') ? 'daylist' : document.querySelector('[data-testid="bid-picker"]') ? 'bid-picker' : 'none' } })
  await R.shot(page, tag + '-window')
  const ov = await overlays()
  await closeAll()
  return { who: label, overlays: ov, box: cell.box, boxTitle: cell.title, opened: t.opened, lines: t.lines, window: win }
}
await step('admin: tap Sat box', () => tapBox(ISO, 'd1-admin-sat', 'admin'))
await step('admin: tap Sun box', () => tapBox(ISOSUN, 'd2-admin-sun', 'admin'))

// ---- 4. View-only Sched as the admin
await step('View-only Sched', async () => { const r = await C.viewFace(w, SAT, 'e1-view'); return r })

// ---- 5. the member
await step('member relogin', async () => { await W4.relogin(page, 'm'); await sleep(900); return 'signed in as member' })
await step('member: tap Sat box', () => tapBox(ISO, 'f1-member-sat', 'member'))
await step('member: tap Sun box', () => tapBox(ISOSUN, 'f2-member-sun', 'member'))
await step('member: person window and tracker', async () => {
  await W4.lwOpen(page, ISO)
  const p = page.locator(`[data-testid="person-${ranger}"]:visible`).first(); await p.scrollIntoViewIfNeeded(); await tp(p); await sleep(500)
  await R.shot(page, 'f3-member-person')
  const s1 = await lwState()
  const f = page.locator('[data-testid="pw-oil"]:visible').first(); const ftxt = (await f.count()) ? (await f.innerText()).replace(/\s+/g, ' ').trim() : 'NO OIL FIGURE'
  if (await f.count()) { await tp(f); await sleep(900) }
  await R.shot(page, 'f4-member-tracker')
  const s2 = await lwState()
  await closeAll(); await sleep(300)
  return { personOpen: s1.person, oilFigure: ftxt, trackerOpenAfterTap: s2.tracker }
})
await step('member: View-only Sched', async () => { await L.go(page, 'viewsched').catch(() => {}); await sleep(600); await R.shot(page, 'f5-member-view'); return 'pictured' })
R.finish(w, 's8-' + WORLD)
await w.browser.close()
